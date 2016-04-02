var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    _ = require('lodash'),
    babel = require('babel-core'),
    paths = require('../paths');

function compile() {
    var searchPath = path.join(paths.js, './!(node_modules|vendors)/**/*.jsx');
    console.log('reading glob: %s', searchPath);
    glob(searchPath, function (err, fileList) {
        var babelOptions = {
            "presets": ["es2015"],
            "plugins": [
                "transform-react-jsx"
            ]
        };

        _.forEach(fileList, function (filename, index, arr) {
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
                    });
                }
            });
        });
    });
    
}

module.exports = {
    compile : compile
};