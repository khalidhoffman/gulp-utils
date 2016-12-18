var path = require('path'),
    util = require('util'),
    fs = require('fs'),

    glob = require('glob'),
    async = require('async'),
    through2 = require('through2'),
    gulp = require('gulp'),
    insert = require('gulp-insert'),
    html2Pug = require('html2pug'),
    pug = require('pug'),

    _ = require('lodash'),
    rename = require('gulp-rename'),
    argv = require('yargs').argv,

    utils = require('../utils'),
    project = require('../project');

function compilePug(onCompilationComplete, options) {
    var _options = _.extend({fileExtension: 'php', taskName: 'pug-php'}, options),
        devIncludesRegex = /(^|\n)[\W]*include\s+.*_auto-generated\/_-all[\W\-]*\n/;

    /**
     *
     * @param dir
     * @param onInitComplete
     * @param options
     */
    function initPugEnvironment(dir, onInitComplete, options) {
        var localHelpersDir = path.resolve(__dirname, "helpers/"),
            helpersDir = path.join(dir, "_auto-generated/");

        checkDestDirectory(function () {
            copyPugDevFiles(onInitComplete);
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


        function copyPugDevFiles(callback, options) {
            fs.readdir(localHelpersDir, function (err, files) {
                async.eachLimit(files, 10, function each(fileName, done) {
                    fs.readFile(path.resolve(localHelpersDir, fileName), {encoding: 'utf8'}, function (err, str) {
                        if (err) return done(err);

                        if (fileName == '_functions.pug') {
                            // prepend dev util.format function
                            str = util.format("-\n    var namespace = '%s';\n    var util={format: %s}\n%s", require('../project').config.projectName, util.format.toString().replace(/\n/g, "\n    "), str);
                        }
                        fs.writeFile(path.join(helpersDir, fileName), str, function (err) {
                            return done(err);
                        })
                    })
                }, function complete(err) {
                    if (callback) callback.call(err)
                })
            })
        }
    }

    async.each(project.tasks[_options.taskName], function each(taskMeta, done) {
        initPugEnvironment(taskMeta.input, function () {
            gulp.src(path.join(taskMeta.input, '**/[^_]*.pug'))
                .pipe(through2.obj({
                        allowHalfOpen: false
                    },
                    function (file, encoding, done) {

                        if (!devIncludesRegex.test(file.contents.toString())) {
                            console.log('"%s" dev include reference not found. Reference will be prepended.', file.path);
                            var referencedContent = util.format("include %s\n%s", path.relative(path.dirname(file.path), path.resolve(taskMeta.input, "_auto-generated/_-all")), file.contents.toString());
                            file.contents = new Buffer(referencedContent, encoding);
                            fs.writeFile(file.path, referencedContent, function (err) {
                                done(err, file);
                            })
                        } else {
                            done(null, file); // note we can use the second argument on the callback
                        }
                    }
                ))
                .pipe(through2.obj({
                    allowHalfOpen: false
                }, function (file, encoding, done) {
                    pug.filters = _.defaults(pug.filters, require('./filters'));
                    var result = pug.render(file.contents.toString(), {
                        filename: file.path,
                        pretty: (argv['pretty']) ? true : false,
                        doctype: 'html',
                        plugins: [{
                            lex: require("pug-bem-lexer")
                        }],
                        basedir: path.resolve('/')
                    });
                    // console.log(result);
                    file.contents = new Buffer(result, encoding);
                    done(null, file)
                }))
                .on('error', project.onError)
                .pipe(rename(function (path) {
                    path.basename = path.basename.replace(/\.bem/i, '');
                    path.extname = util.format(".%s", _options.fileExtension);
                    return path;
                }))
                .pipe(gulp.dest(taskMeta.output || function (file) {
                        return file.base;
                    }))
                .on('end', function () {
                    done()
                });
        })

    }, function complete() {
        onCompilationComplete();
    });
}

function compilePugPHPDebug(onCompilationComplete) {
    async.each(project.tasks['pug-php'], function each(taskMeta, done) {
        gulp.src(path.join(taskMeta.input, '/**/[^_]*.pug'))
            .pipe(through2.obj({
                    allowHalfOpen: false
                },
                function (file, encoding, done) {

                    var html = pug.render(file.contents.toString(), {
                        filename: file.path,
                        pretty: (argv['pretty']) ? true : false
                    });
                    //console.log('html: %s', html);
                    file.contents = new Buffer(html, encoding);
                    done(null, file); // note we can use the second argument on the callback
                    // to provide data as an alternative to this.push('wut?')
                }
            ))
            .on('error', project.onError)
            .pipe(rename({
                extname: ".php"
            }))
            .pipe(gulp.dest(taskMeta.output))
            .on('end', function () {
                done()
            });
    }, function complete() {
        onCompilationComplete();
    });
}

/**
 *
 * @param {Function} onCompilationComplete
 * @param {Object} options
 */
function toPug(onCompilationComplete, options) {
    var _options = _.extend({
        fileExtension: 'html',
        taskName: 'html-2-pug'
    }, options);


    async.each(project.tasks[_options.taskName], function each(taskMeta, onFilesParsed) {
        var globPattern = path.join(taskMeta.input, util.format('/**/*.%s', _options.fileExtension));
        // console.log("searching '%s'", globPattern);
        glob(globPattern, {ignore: taskMeta.ignore || []},
            function (err, fileList) {
                async.eachLimit(fileList, 10, function each(filePath, done) {
                    fs.readFile(filePath, {encoding: 'utf8'}, function (err, str) {
                        var basePath = path.join(taskMeta.output, path.relative(taskMeta.input, path.dirname(filePath))),
                            pugDest = path.join(basePath, util.format('%s%s', path.basename(filePath, _options.fileExtension), 'pug'));
                        console.log('%s -> %s', filePath, pugDest);
                        html2Pug(str).then(
                            function onSuccess(str) {
                                // console.log('pug output: %s', utils.dump(str));
                                fs.writeFile(pugDest, str, function (err) {
                                    done(err);
                                })
                            },
                            function onError(err) {
                                done(err);
                            })
                    })
                }, function complete(err) {
                    onFilesParsed(err);
                })
            })

    }, function complete() {
        onCompilationComplete();
    });
}

function beautify(onBeautifyComplete, options) {
    var pugBeautify = require('./lib/beautify.js'),
        config = _.defaults(options, {
            taskName: 'pug',
            fileExtension: '?(jade|pug)',
        }),
        _options = _.defaults(
            _.isFunction(onBeautifyComplete) ? options : onBeautifyComplete,
            {
                tasks: project.tasks[config.taskName],
                globSuffix: util.format('/**/*.%s', config.fileExtension),
                ignore: []
            }
        ),
        tasks = _options.tasks.map(function (taskMeta) {
            taskMeta.suffix = taskMeta.suffix || _options.globSuffix;
            taskMeta.ignore = taskMeta.ignore || _options.ignore;
            return taskMeta;
        });


    async.each(tasks, function each(taskMeta, onGlobBeautified) {
        glob(path.join(taskMeta.input, taskMeta.suffix), {ignore: taskMeta.ignore},
            function (err, fileList) {
                async.eachLimit(fileList, 10, function each(filePath, onFileBeautified) {
                    pugBeautify.beautify(filePath, function (err, pugSrc) {
                        if (err) return onFileBeautified(err);
                        fs.writeFile(filePath, pugSrc, function (err) {
                            console.log("beautified %s", filePath);
                            onFileBeautified(err);
                        })
                    });
                }, function complete(err) {
                    onGlobBeautified(err);
                })
            })

    }, function complete() {
        if (onBeautifyComplete.call) onBeautifyComplete();
    });
}

module.exports = {
    ejs: function (callback) {
        compilePug(callback, {fileExtension: 'ejs', taskName: 'pug-ejs'})
    },
    php: function (callback) {
        compilePug(callback, {fileExtension: 'php', taskName: 'pug-php'})
    },
    html: function (callback) {
        compilePug(callback, {fileExtension: 'html', taskName: 'pug-html'})
    },
    html2Pug: function (callback) {
        toPug(callback, {fileExtension: 'html', taskName: 'html-2-pug'})
    },
    php2Pug: function (callback) {
        toPug(callback, {fileExtension: 'php', taskName: 'php-2-pug'})
    },
    phpDebug: compilePugPHPDebug,
    pug2Stylus: require('./lib/pug-2-stylus'),
    beautify: function (callback) {
        beautify(callback);
    }
};
