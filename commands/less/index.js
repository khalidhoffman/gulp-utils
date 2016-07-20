var fs = require('fs'),
    path = require('path'),
    util = require('util'),

    glob = require('glob'),
    less = require('less'),
    async = require('async'),

    projectUtils = require('../utils'),
    project = require('../project'),

    mainFileName = 'custom.less';

function compileLess(onComplete) {
    async.each(project.tasks.less, function each (taskMeta, done){
        glob(path.join(taskMeta.input, util.format('**/%s', mainFileName)), function (err, files) {
            if (err || files.length == 0) return done(err);
            async.each(files, function each(filename, onFileCompiled) {
                // console.log('less - reading %s', filename);
                fs.readFile(filename, {encoding: 'utf8'}, function (err, str) {
                    if (err) {
                        console.error(err);
                        onFileCompiled();
                    } else {
                        // console.log('less - rendering %s', filename);
                        less.render(str,
                            {
                                paths: taskMeta.input,  // Specify search paths for @import directives
                                filename: mainFileName, // Specify a filename, for better error messages
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
                                    if (err) console.error(err);
                                    console.log('%s -> %s', filename, outputPath);
                                    onFileCompiled();
                                });
                            });
                    }

                })
            }, function complete(err) {
                done(err);
            })
        });
    }, function complete(){
        onComplete()
    });

}

module.exports = {
    compile: compileLess
};