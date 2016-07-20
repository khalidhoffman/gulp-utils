var fs = require('fs'),
    path = require('path'),

    async = require('async'),
    glob = require('glob'),
    _ = require('lodash'),
    babel = require('babel-core'),

    project = require('../project'),
    projectUtils = require('../utils');

function compile(onCompilationComplete) {

    async.each(project.tasks['jsx'], function each(taskMeta, done){

        glob(path.resolve(taskMeta.input, './!(node_modules|vendors)/**/*.jsx'), function (err, fileList) {
            var babelOptions = {
                "presets": ["es2015"],
                "plugins": [
                    "transform-react-jsx"
                ]
            };

            async.each(fileList, function each (filename, onFileWritten) {
                var originalPathOptions = path.parse(filename),
                    writePath = path.format({
                        dir: originalPathOptions.dir,
                        name: originalPathOptions.name,
                        base: originalPathOptions.name + '.js'
                    });
                babel.transformFile(filename, babelOptions, function (err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        fs.writeFile(writePath, result.code, function (err) {
                            //console.log('%s -> %s', filename, writePath);
                            onFileWritten();
                        });
                    }
                });
            }, function complete(){
                done()
            });
        });
    }, function complete(){
        onCompilationComplete()
    })
    
}

module.exports = {
    compile : compile
};