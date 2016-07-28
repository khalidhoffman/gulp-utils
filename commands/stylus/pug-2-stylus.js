var fs = require('fs'),
    path = require('path'),
    util = require('util'),

    async = require('async'),
    glob = require('glob'),
    _ = require('lodash'),
    prompt = require('prompt'),
    colors = require("colors/safe"),
    argv = require('yargs').argv,

    projectUtils = require('../utils'),
    project = require('../project');

function StylusBuilder(pugStr, options) {
    var _options = _.extend({}, options),
        lex = require('pug-lexer'),
        parse = require('pug-parser'),
        tree = parse(lex(pugStr)),
        bemData = require('./lib/pug-2-bem')(tree.nodes),
        cssText = require('./lib/bem-2-stylus')(bemData, function (stylusText) {
            fs.writeFile(_options.writePath, stylusText, {encoding: 'utf8'}, function (err) {
                console.log('%s -> %s', _options.readPath, _options.writePath);
                if (_options.done) _options.done.apply(_options.context, [err, cssText])
            })
        }, {useLib: _options.useLib});
}

function pug2Stylus(onCompilationComplete) {

    function convertPugFileToStylus(filename, callback, options) {
        var _options = _.extend({useLib: true}, options),
            isFileExistent = false,
            filePathMeta;
        async.each(project.tasks.pug, function each(taskMeta, done) {
            glob(path.join(taskMeta.input, '/**/*.pug'), function (err, fileList) {
                _.forEach(fileList, function (filePath, index, arr) {
                    filePathMeta = path.parse(filePath);
                    if (filePathMeta.base.indexOf(filename) > -1 || (filename.toLowerCase() == 'all')) {
                        isFileExistent = true;
                        fs.readFile(filePath, {encoding: 'utf8'}, function (err, pugText) {
                            if (err) throw err;
                            // console.log('reading: ', filePath);
                            // console.log("checking...", parsedPath);
                            StylusBuilder(pugText, {
                                readPath: filePath,
                                writePath: path.resolve(project.config.paths.tmp, '_' + filePathMeta.name + '.styl'),
                                done: function () {
                                    done();
                                },
                                useLib: _options.useLib
                            });
                        });
                        return false;
                    }
                });
                if(!isFileExistent) done(new Error(util.format("No file by name of '%s' was not found.", filename)));
            });
        }, function complete(err) {
            if(err) console.error(err);
            callback();
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
            convertPugFileToStylus(specifiedFilename, function () {
                prompt.stop();
                console.log('done');
                onCompilationComplete();
            }, {useLib: (/^\s*(yes|y)\s*$/.test(result.isV2Style))});
        });
    } else {
        convertPugFileToStylus(specifiedFilename, function () {
            console.log('done');
            onCompilationComplete();
        });
    }
}

module.exports = pug2Stylus;
