var fs = require('fs'),
    path = require('path'),
    util = require('util'),

    async = require('async'),
    glob = require('glob'),
    _ = require('lodash'),
    prompt = require('prompt'),
    colors = require("colors/safe"),
    argv = require('yargs').argv,

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
                    bemRender = new require('./bem-2-stylus')({useLib: _options.useLib});

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
        var _options = _.extend({useLib: true}, options),
            isFileExistent = false;
        async.each(project.tasks.pug, function each(taskMeta, done) {
            glob(path.join(taskMeta.input, '/**/*.pug'), function (err, fileList) {
                if (err) return done(err);


                _.forEach(fileList, function (filePath, index, arr) {
                    if (!isFileExistent && filePath.match(new RegExp(path.sep + readFileName + '(.pug)?$')) || (readFileName.toLowerCase() == 'all')) {
                        isFileExistent = true;

                        fs.readFile(filePath, {encoding: 'utf8'}, function (err, pugText) {
                            if (err) return done(err);
                            var writePath = path.resolve(project.config.paths.tmp, '_' + path.parse(filePath).name + '.styl');
                            convertPugToStylus(pugText, {
                                readPath: filePath,
                                writePath: writePath,
                                done: function (err, stylusText) {
                                    fs.writeFile(writePath, stylusText, {encoding: 'utf8'}, function (err) {
                                        if (!err) console.log('%s -> %s', filePath, writePath);
                                        done(err);
                                    })
                                },
                                useLib: _options.useLib
                            });
                        });
                    }
                });
                if (!isFileExistent) done(new Error(util.format("No file by name of '%s' was not found.", readFileName)));
            });
        }, function complete(err) {
            onPugFilesWritten(err);
        });
    }

    var specifiedFilename = argv['index'];

    if (!specifiedFilename) {
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
                }
            }
        }, function (err, result) {
            //
            // Log the results.
            //
            specifiedFilename = result.filename;
            convertPugFileToStylus(specifiedFilename, function (err) {
                prompt.stop();
                onCompilationComplete(err);
            }, {useLib: (/^\s*(yes|y)\s*$/.test(result.isV2Style))});
        });
    } else {
        convertPugFileToStylus(specifiedFilename, function (err) {
            onCompilationComplete(err);
        });
    }
}

module.exports = pug2Stylus;
