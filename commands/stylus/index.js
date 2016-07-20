var fs = require('fs'),
    path = require('path'),
    util = require('util'),

    async = require('async'),
    glob = require('glob'),
    stylus = require('stylus'),
    _ = require('lodash'),
    postcss = require('postcss'),

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

function compileStylusString(filename, options, callback) {
    var _options = _.extend({
            output: project.config.paths.tmp
        }, options),
        onComplete = callback || function () {
            },
        stylusFunctions = require('./functions').hookFunc;

    fs.readFile(filename, {encoding: 'utf8'}, function (err, str) {
        if (err) {
            console.error(err);
            onSingleFileComplete();
        } else {
            // console.log('stylus - rendering %s', filename);
            stylus(str)
                .set('filename', filename)
                .use(stylusFunctions)
                .use(require('nib')())
                .use(new require('stylus-type-utils')())
                .import('nib')
                .import(path.resolve(__dirname, '../../node_modules/stylus-type-utils'))
                .import(path.resolve(__dirname, 'lib/stylus/*'))
                .render(function (err, css) {
                    if (err) {
                        console.error(err);
                        onComplete();
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
                            if (err) throw err;
                            postcss([precision(), require('postcss-discard-duplicates')])
                                .process(css, {from: srcCSSPath, to: prodCSSPath})
                                .then(function (result) {
                                    if (result.map) fs.writeFileSync(mapCSSPath, result.map);

                                    fs.writeFile(prodCSSPath, result.css, {encoding: 'utf8'}, function (err) {
                                        if (err) throw err;
                                        // console.log("stylus - successfully saved %s", prodCSSPath);
                                        onComplete();
                                    })
                                })
                                .catch(function (error) {
                                    console.error(error);
                                    onComplete();
                                });
                        })
                    }
                });
        }

    })

}

function compileStylus(onCompilationComplete) {

    async.each(project.tasks.stylus, function each(taskMeta, done) {
        glob(path.join(taskMeta.input, '**/!(_)*.styl'), function (err, files) {
            if (err) return onCompilationComplete();
            async.each(files, function each(filename, onSingleFileComplete) {
                compileStylusString(filename, {output : taskMeta.output}, function () {
                    onSingleFileComplete();
                })
            }, function complete() {
                done();
            })
        })
    }, function complete() {
        onCompilationComplete();
    });

}

module.exports = {
    compile: compileStylus,
    jade2Stylus: require('./jade-2-stylus')
};