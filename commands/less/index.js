var fs = require('fs'),
    path = require('path'),
    util = require('util'),

    glob = require('glob'),
    less = require('less'),
    async = require('async'),

    project = require('../project'),
    paths = require('../paths'),

    mainFileName = 'custom.less';

function compileLess(onComplete) {
    glob(path.join(paths.less, util.format('**/%s', mainFileName)), function (err, files) {
        if (err || files.length == 0) return onComplete(err);
        async.each(files, function each(filename, done) {
            // console.log('less - reading %s', filename);
            fs.readFile(filename, {encoding: 'utf8'}, function (err, str) {
                if (err) {
                    console.error(err);
                    done();
                } else {
                    // console.log('less - rendering %s', filename);
                    less.render(str,
                        {
                            paths: [paths.less],  // Specify search paths for @import directives
                            filename: mainFileName, // Specify a filename, for better error messages
                            compress: true          // Minify CSS output
                        },
                        function (err, output) {
                            if (err) return done(err);
                            // console.log('less - compiled %s', filename);
                            var filenameMeta = path.parse(filename),
                                outputPath = path.format({
                                    dir: path.normalize(paths.css),
                                    base: filenameMeta.name + '.css'
                                });
                            fs.writeFile(outputPath, output.css, {encoding: 'utf8'}, function (err) {
                                if (err) console.error(err);
                                console.log('%s -> %s', filename, outputPath);
                                done();
                            });
                        });
                }

            })
        }, function complete(err) {
            onComplete(err);
        })
    });
}

module.exports = {
    compile: compileLess
};