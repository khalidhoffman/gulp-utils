var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    stylus = require('stylus'),
    _ = require('lodash'),
    wordpress = require('../wordpress');

function compileStylus() {
    var stylusFunctions = require('./functions').hookFunc;


    glob(path.join(wordpress.theme.paths.stylus, '**/!(_)*.styl'), function (err, files) {
        _.forEach(files, function (filename, index) {
            console.log('stylus - rendering %s', filename);
            fs.readFile(filename, {encoding: 'utf8'}, function (err, str) {
                stylus(str)
                    .set('filename', filename)
                    .use(new require('stylus-type-utils')())
                    .use(stylusFunctions)
                    .include(require('nib').path)
                    .render(function (err, css) {
                        if (err) {
                            console.error(err);
                        } else {
                            var filenameMeta = path.parse(filename),
                                writeFilenamePath = path.format({
                                    root: filenameMeta.root,
                                    dir: path.join(wordpress.theme.path, 'stylesheets'),
                                    base: filenameMeta.name + '.css',
                                    ext: '.css',
                                    name: filenameMeta.name
                                });
                            fs.writeFile(writeFilenamePath, css, {encoding: 'utf8'}, function () {
                                console.log("Successfully updated %s", writeFilenamePath);
                            })
                        }
                    });

            })
        })
    })
}

module.exports = {
    compile : compileStylus
};