var fs = require('fs'),
    path = require('path'),

    glob = require('glob'),
    _ = require('lodash'),
    prompt = require('prompt'),
    argv = require('yargs').argv,

    paths = require('../paths');

function StylusBuilder(jadeStr, options) {
    var _options = _.extend({}, options),
        lex = require('pug-lexer'),
        parse = require('pug-parser'),
        tree = parse(lex(jadeStr)),
        bemData = require('./lib/jade-2-bem')(tree.nodes),
        cssText = require('./lib/bem-2-stylus')(bemData, function (stylusText) {
            fs.writeFile(_options.writePath, stylusText, {encoding: 'utf8'}, function (err) {
                console.log('%s -> %s', _options.readPath, _options.writePath);
                if (_options.done) _options.done.apply(_options.context, [err, cssText])
            })
        }, {useLib: true});
}

function jade2Stylus(done) {

    console.log("Reading ", paths.jade);
    glob(path.join(paths.jade, '/**/*.jade'), function (err, fileList) {
        var specifiedFilename = argv['index'];

        if (!specifiedFilename) {
            prompt.start();

            prompt.get(['filename'], function (err, result) {
                //
                // Log the results.
                //
                specifiedFilename = result.filename;
                convertJadeFileToStylus(specifiedFilename);
            });
        } else {
            convertJadeFileToStylus(specifiedFilename);
        }

        function convertJadeFileToStylus(filename) {

            _.forEach(fileList, function (filePath, index, arr) {
                var filePathMeta = path.parse(filePath);
                if (filePathMeta.name.indexOf(filename) > -1 || (filename.toLowerCase() == 'all')) {
                    fs.readFile(filePath, {encoding: 'utf8'}, function (err, jadeText) {
                        if (err) throw err;
                        //console.log('reading: ', filePath);
                        //console.log("checking...", parsedPath);
                        StylusBuilder(jadeText, {
                            readPath: filePath,
                            writePath: path.resolve(paths.tmp, '_' + filePathMeta.name + '.styl'),
                            done: function () {
                                if (done) done();
                            }
                        });
                    });
                    return false;
                }
            });
            prompt.stop();
        }
    });
}

module.exports = jade2Stylus;
