var fs = require('fs'),
    path = require('path'),
    util = require('util'),

    async = require('async'),
    glob = require('glob'),
    _ = require('lodash'),
    prompt = require('prompt'),
    colors = require("colors/safe"),

    projectUtils = require('../../utils'),
    project = require('../../project');

function convertPugToStylus(pugStr, options) {
    var _options = _.defaults(options, {});

    require('pug').render(pugStr, {
        filename: options.readPath,
        doctype: 'html',
        basedir: path.resolve('/'),
        filters: require('../filters'),
        plugins: [{
            preCodeGen: function (ast, options) {
                var bemParser = new require('./pug-2-bem')(),
                    bemData = bemParser.parse(ast.nodes),
                    bemRender = new require('./bem-2-stylus')({
                        useLib: _options.useLib,
                        stylusEmptyText: _options.emptyText
                    });

                bemRender.render(bemData, function (stylusText) {
                    if (_options.done) _options.done.apply(_options.context, [null, stylusText])
                });
                return ast;
            }
        }]
    });

}

function pug2Stylus(onCompilationComplete) {

    function convertPugFileToStylus(readFileName, onPugFilesWritten, options) {
        var _options = _.defaults(options, {useLib: true}),
            isFileExistent = false;
        async.each(project.tasks.pug, function each(taskMeta, done) {
            var globSelector = path.join(taskMeta.input, '/**/*.+(pug|jade)');
            glob(globSelector, function (err, fileList) {
                if (err) return done(err);
                var srcFilePath = require('./utils').findFile(readFileName, fileList);
                if (srcFilePath){
                    fs.readFile(srcFilePath, {encoding: 'utf8'}, function (err, pugText) {
                        if (err) return done(err);
                        var writePath = path.resolve(project.config.paths.tmp, '_' + path.parse(srcFilePath).name + '.styl');
                        convertPugToStylus(pugText, {
                            readPath: srcFilePath,
                            writePath: writePath,
                            done: function (err, stylusText) {
                                fs.writeFile(writePath, stylusText, {encoding: 'utf8'}, function (err) {
                                    if (!err) console.log('%s -> %s', srcFilePath, writePath);
                                    done(err);
                                })
                            },
                            useLib: _options.useLib,
                            emptyText: _options.emptyText
                        });
                    });
                } else {
                    done(new Error(util.format("No file by name of '%s' was not found.", readFileName)));
                }
            });
        }, function complete(err) {
            onPugFilesWritten(err);
        });
    }


    prompt.message = '';
    prompt.start();

    prompt.get({
        properties: {
            filename: {
                description: colors.red('Filename of the pug file to convert to styl:'),
                required: true
            },
            isV2Style: {
                description: colors.red('Use custom mixins (ie. +block, +modifier, +element) for selectors? (yes or no)'),
                default: 'yes'
            },
            emptyText: {
                description: colors.red('What should be used a placeholder for empty selector rules? (this is a formatting fix for IntelliJ)'),
                default: 'empty()'
            }
        }
    }, function (err, result) {
        if (err){
            onCompilationComplete(err);
        } else {
            prompt.stop();
            specifiedFilename = result.filename;
            convertPugFileToStylus(specifiedFilename, function (err) {
                onCompilationComplete(err);
            }, {
                useLib: (/^\s*(yes|y)\s*$/.test(result.isV2Style)),
                emptyText: result.emptyText
            });
        }
    });
}

module.exports = pug2Stylus;
