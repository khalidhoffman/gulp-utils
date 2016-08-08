var fs = require('fs'),
    path = require('path'),
    util = require('util'),

    glob = require('glob'),
    less = require('less'),
    _ = require('lodash'),
    async = require('async'),

    projectUtils = require('../utils'),
    project = require('../project');

function compileLess(onComplete, options) {
    var _options = _.defaults(options, {
        mainFileName: 'custom.less'
    });
    async.each(project.tasks.less, function each(taskMeta, done) {
        glob(path.join(taskMeta.input, util.format('**/%s', _options.mainFileName)), {ignore: taskMeta.ignore || []}, function (err, files) {
            if (err || files.length == 0) return done(err);
            async.each(files, function each(filename, onFileCompiled) {
                // console.log('less - reading %s', filename);
                fs.readFile(filename, {encoding: 'utf8'}, function (err, str) {
                    if (err) {
                        onFileCompiled(err);
                    } else {
                        // console.log('less - rendering %s', filename);
                        less.render(str,
                            {
                                paths: taskMeta.input,  // Specify search paths for @import directives
                                filename: _options.mainFileName, // Specify a filename, for better error messages
                                compress: true          // Minify CSS output
                            },
                            function (err, output) {
                                if (err) return onFileCompiled(err);
                                // console.log('less - compiled %s', filename);
                                var filenameMeta = path.parse(filename),
                                    outputPath = path.format({
                                        dir: path.normalize(taskMeta.output),
                                        base: filenameMeta.name + '.css'
                                    });
                                fs.writeFile(outputPath, output.css, {encoding: 'utf8'}, function (err) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log('%s -> %s', filename, outputPath);
                                    }
                                    onFileCompiled(err);
                                });
                            });
                    }

                })
            }, function complete(err) {
                done(err);
            })
        });
    }, function complete(err) {
        onComplete(err)
    });

}

module.exports = {
    compile: function (done) {
        var prompt = require('prompt'),
            colors = require('colors/safe');
        prompt.message = '';
        prompt.start();

        prompt.get({
            properties: {
                filename: {
                    description: colors.red('Filename of the less file to compile:'),
                    default: 'custom.less'
                }
            }
        }, function (err, result) {
            prompt.stop();
            if (err) {
                done(err)
            } else {
                compileLess(function (err) {
                    done(err)
                }, {mainFileName: result.filename})
            }
        });
    }
};