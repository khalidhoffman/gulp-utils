var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    _ = require('lodash'),
    config = require('./config'),
    wordpress = require('../wordpress');

function updateReferences() {
    // changes all instances of boilerplate to projectName
    var defaultProjectNamespaceRegex = /boilerplate/gi;

    var themeFilesGlobRegex = path.join(wordpress.theme.path, '/**/*');
    glob(themeFilesGlobRegex, function(err, files) {
        _.forEachRight(files, function(filePath, index, arr) {
            // executes on each file path
            fs.readFile(filePath, function(err, data) {
                var fileContent = String(data);
                if (defaultProjectNamespaceRegex.test(fileContent)) {
                    fs.writeFile(filePath, fileContent.replace(defaultProjectNamespaceRegex, config.root), function(err) {
                        if (err) throw err;
                        console.log('updated %s', filePath);
                    });
                }
            });
        });
    });
}

module.exports = {
    update : updateReferences
};
