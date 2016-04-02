var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    _ = require('lodash'),

    config = require('./config'),
    paths = require('../paths');

function updateReferences(options) {
    // changes all instances of boilerplate to projectName
    var _options = _.extend({
        defaultProjectNamespaceRegex: /boilerplate/gi
    }, options);

    var themeFilesGlobRegex = path.join(paths.baseAssestsPath, '/**/*');
    glob(themeFilesGlobRegex, function (err, files) {
        _.forEachRight(files, function (filePath, index, arr) {
            // executes on each file path
            fs.readFile(filePath, function (err, data) {
                var fileContent = String(data);
                if (_options.defaultProjectNamespaceRegex.test(fileContent)) {
                    fs.writeFile(filePath, fileContent.replace(_options.defaultProjectNamespaceRegex, config.projectName), function (err) {
                        if (err) throw err;
                        console.log('updated %s', filePath);
                        if(_options.done) _options.done.apply(_options.context, [filePath]);
                    });
                }
            });
        });
    });
}

module.exports = {
    update: updateReferences
};
