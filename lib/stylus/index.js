var fs = require('fs'),
    path = require('path'),
    util = require('util'),

    async = require('async'),
    glob = require('glob'),
    stylus = require('stylus'),
    stylusBEM = require('stylus-bem'),
    _ = require('lodash'),
    postcss = require('postcss'),
    cssnano = require('cssnano'),

    project = require('../project'),
    projectUtils = require('../utils');

var precision = postcss.plugin('postcss-precision', function () {
    var longTest = /(\d+?\.\d{3,})(%|em|px)/i;

    return function (style) {
        style.walkDecls(function (decl) {

            if (decl.value && longTest.test(decl.value)) {
                // Grab array of matches.
                var matches = longTest.exec(decl.value);

                // We'll assume there's one.
                var value = matches[1];

                // Round two decimal places.
                // var rounded = _.round(parseFloat(value), 2 );
                var rounded = Math.round(parseFloat(value) * 100) / 100;

                // Change the value in the tree.
                decl.value = decl.value.replace(value, rounded.toString());
            }
        });
    };
});

function initStylusEnv(dir, onInitComplete, options) {
    var localHelpersDir = path.resolve(__dirname, "src/stylus/"),
        helpersDir = path.join(dir, "_auto-generated/");

    checkDestDirectory(function () {
        copyStylusDevFiles(onInitComplete);
    });

    function checkDestDirectory(callback, options) {
        fs.stat(helpersDir, function (err, dirStat) {
            if (err || !dirStat.isDirectory()) {
                fs.mkdir(helpersDir, function () {
                    if (callback) callback.call()
                })
            } else {
                if (callback) callback.call()
            }
        });
    }


    function copyStylusDevFiles(callback, options) {
        fs.readdir(localHelpersDir, function (err, files) {
            if (err) {
                if (callback) callback(err)
            } else {
                async.eachLimit(files, 10, function each(fileName, done) {
                    fs.readFile(path.resolve(localHelpersDir, fileName), {encoding: 'utf8'}, function (err, str) {
                        if (err) return done(err);
                        fs.writeFile(path.join(helpersDir, fileName), str, function (err) {
                            return done(err);
                        })
                    })
                }, function complete(err) {
                    if (callback) callback.call(err)
                })
            }
        })
    }
}

function compileStylusString(filename, options, callback) {
    var _options = _.defaults(options, {
            useKoutoSwiss: true,
            useStylusBEM: false,
            useCompression: true,
            input: project.config.paths.stylus,
            output: project.config.paths.tmp,
            complete: function (err) {
                if (err) console.error(err)
            }
        }),
        stylusFunctions = require('./functions').hookFunc;

    fs.readFile(filename, {encoding: 'utf8'}, function (err, str) {
        if (err) {
            _options.complete(err);
        } else {
            // console.log('stylus - rendering %s', filename);
            var stylInstance = _options.useStylusBEM ? stylusBEM(str) : stylus(str);
            stylInstance.set('filename', filename);

            stylInstance
                .use(_options.useKoutoSwiss ? require('kouto-swiss')() : require('nib')())
                .use(new require('stylus-type-utils')())
                .use(stylusFunctions)
    
            stylInstance
                .import(_options.useKoutoSwiss ? 'kouto-swiss' : 'nib')
                .import("type-utils")
                .import(path.resolve(path.dirname(filename), "_auto-generated/*"));
        
            stylInstance.render(function (err, css) {
                if (err) {
                    console.error(err);
                    _options.complete();
                } else {
                    var filenameMeta = path.parse(filename),
                        srcCSSPath = path.format({
                            dir: _options.output,
                            base: filenameMeta.name + '.src.css'
                        }),
                        mapCSSPath = path.format({
                            dir: _options.output,
                            base: filenameMeta.name + '.css.map'
                        }),
                        prodCSSPath = path.format({
                            dir: _options.output,
                            base: filenameMeta.name + '.css'
                        });

                    // console.log("stylus - %s -> %s", srcCSSPath, prodCSSPath);

                    fs.writeFile(srcCSSPath, css, {encoding: 'utf8'}, function (err) {
                        if (err) {
                            console.error(err);
                            _options.complete();
                        } else {
                            var postCSSPlugins= [precision(), require('postcss-discard-duplicates')];
                            if (_options.useCompression) postCSSPlugins.push(cssnano());
                            postcss(postCSSPlugins)
                                .process(css, {from: srcCSSPath, to: prodCSSPath})
                                .then(function (result) {
                                    if (result.map) fs.writeFileSync(mapCSSPath, result.map);

                                    fs.writeFile(prodCSSPath, result.css, {encoding: 'utf8'}, function (err) {
                                        // console.log("stylus - successfully saved %s", prodCSSPath);
                                        _options.complete(err);
                                    })
                                })
                                .catch(function (error) {
                                    _options.complete(error);
                                });
                        }
                    })
                }
            });
        }

    })

}

function compileStylus(onCompilationComplete) {

    async.each(project.tasks.stylus, function each(taskMeta, done) {
        initStylusEnv(taskMeta.input, function () {
            glob(path.join(taskMeta.input, '**/!(_)*.styl'), {ignore: taskMeta.ignore || []}, function (err, files) {
                if (err) return onCompilationComplete();
                async.each(files, function each(filename, onSingleFileComplete) {
                    compileStylusString(filename, {
                        useKoutoSwiss : (taskMeta.options && taskMeta.options.useKoutoSwiss === false) ? false : true,
                        output: taskMeta.output,
                        complete: function (err) {
                            onSingleFileComplete(err);
                        }
                    })
                }, function complete(err) {
                    done(err);
                })
            })
        })
    }, onCompilationComplete);
}


function compileStylusBEM(onCompilationComplete){

    async.each(project.tasks['stylus-bem'], function each(taskMeta, done) {
        initStylusEnv(taskMeta.input, function () {
            glob(path.join(taskMeta.input, '**/!(_)*.styl'), {ignore: taskMeta.ignore || []}, function (err, files) {
                if (err) return onCompilationComplete();
                async.each(files, function each(filename, onSingleFileComplete) {
                    compileStylusString(filename, {
                        useKoutoSwiss : (taskMeta.options && taskMeta.options.useKoutoSwiss === false) ? false : true,
                        useStylusBEM : true,
                        output: taskMeta.output,
                        complete: function (err) {
                            onSingleFileComplete(err);
                        }
                    })
                }, function complete(err) {
                    done(err);
                })
            })
        })
    }, onCompilationComplete);

}

module.exports = {
    compile: compileStylus,
    compileBEM: compileStylusBEM
};
