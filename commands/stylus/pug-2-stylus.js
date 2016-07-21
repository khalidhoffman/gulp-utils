var fs = require('fs'),
    path = require('path'),

    async = require('async'),
    glob = require('glob'),
    _ = require('lodash'),
    prompt = require('prompt'),
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
        }, {useLib: true});
}

function pug2Stylus(onCompilationComplete) {

    function convertPugFileToStylus(filename, callback) {
        var filePathMeta;
        async.each(project.tasks.pug, function each(taskMeta, done){
            glob(path.join(taskMeta.input, '/**/*.pug'), function (err, fileList) {
                _.forEach(fileList, function (filePath, index, arr) {
                    filePathMeta = path.parse(filePath);
                    if (filePathMeta.name.indexOf(filename) > -1 || (filename.toLowerCase() == 'all')) {
                        fs.readFile(filePath, {encoding: 'utf8'}, function (err, pugText) {
                            if (err) throw err;
                            // console.log('reading: ', filePath);
                            // console.log("checking...", parsedPath);
                            StylusBuilder(pugText, {
                                readPath: filePath,
                                writePath: path.resolve(project.config.paths.tmp, '_' + filePathMeta.name + '.styl'),
                                done: function () {
                                    done();
                                }
                            });
                        });
                        return false;
                    }
                });
            });
        }, function complete(){
            callback();
        });
    }
    var specifiedFilename = argv['index'];

    if (!specifiedFilename) {
        prompt.start();

        prompt.get(['filename'], function (err, result) {
            //
            // Log the results.
            //
            specifiedFilename = result.filename;
            convertPugFileToStylus(specifiedFilename, function(){
                prompt.stop();
                console.log('done');
                onCompilationComplete();
            });
        });
    } else {
        convertPugFileToStylus(specifiedFilename, function(){
            console.log('done');
            onCompilationComplete();
        });
    }
}

module.exports = pug2Stylus;
