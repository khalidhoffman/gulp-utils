var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    _ = require('lodash'),
    prompt = require('prompt'),
    argv = require('yargs').argv,
    wordpress = require('../wordpress');

function jade2Sass (done) {

    console.log("Reading ", wordpress.theme.paths.jade);
    glob(path.join(wordpress.theme.paths.jade, '/**/*.jade'), function(err, fileList) {
        var sassBuilder = require('./lib/sass-builder-v2'),
            specifiedFilename = argv['index'];

        if (!specifiedFilename) {
            prompt.start();

            prompt.get(['filename'], function(err, result) {
                //
                // Log the results.
                //
                specifiedFilename = result.filename;
                convertSassFileToJade(specifiedFilename);
            });
        } else {
            convertSassFileToJade(specifiedFilename);
        }

        function convertSassFileToJade(filename) {

            _.forEach(fileList, function(filePath, index, arr) {
                var filePathMeta = path.parse(filePath);
                if (filePathMeta.name.indexOf(filename) > -1 || (filename.toLowerCase() == 'all')) {
                    fs.readFile(filePath, function(err, data) {
                        if (err) throw err;
                        //console.log('reading: ', filePath);
                        //console.log("checking...", parsedPath);
                        sassBuilder.jadeToSass(String(data), {
                            readPath: filePath,
                            writePath: path.resolve(wordpress.theme.paths.tmp, '_' + filePathMeta.name + '.scss'),
                            done : function(){
                                if(done) done();
                            }
                        });
                    });
                }
            });
            prompt.stop();
        }
    });
}

module.exports = jade2Sass;