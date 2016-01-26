var _ = require('lodash'),
    fs = require('fs'),
    path = require('path');
/**
 *
 * @param rootDir
 * @param options {object} fields: each, done
 */
function recursePath(rootDir, options) {
    var results = [],
        remainingPathsCount = 0,
        args = _.extend({}, options);

    function readPath(fsPath, settings) {
        fs.stat(fsPath, function (err, pathMeta) {
            if (err) {
                console.error(err);
                if (_.isFunction(settings.done)) settings.done.call(null, err);
                if (_.isFunction(settings.each)) settings.each.call(null, err);
            } else if (pathMeta.isDirectory()) {
                fs.readdir(fsPath, function (err, fileList) {
                    if (err) return done(err);
                    remainingPathsCount += fileList.length;
                    fileList.forEach(function (fileName) {
                        var childPath = path.resolve(fsPath, fileName);
                        readPath(childPath, settings);
                    });
                });
                remainingPathsCount--;
            } else if (pathMeta.isFile()) {
                results.push(fsPath);
                if (_.isFunction(settings.each)) settings.each.call(null, null, fsPath);
                remainingPathsCount--;
                if (remainingPathsCount < 0 && _.isFunction(settings.done)) settings.done.call(null, null, results);
            }
        });
    }

    readPath(rootDir, args);
};

module.exports = {
    recursePath : recursePath,
    walk : recursePath
}