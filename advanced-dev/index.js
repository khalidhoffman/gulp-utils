try {
    require('nw.gui').Window.get().showDevTools();
} catch (err) {
    console.log(err);
}

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    glob = require('glob'),
    gulp = require('gulp'),
    customJade = require('jade'),
    jade = require('gulp-jade'),
    _ = require('lodash'),
    argv = require('yargs').argv,
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    request = require('request'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    libsass = require('node-sass'),
    through2 = require('through2'),
    beautifyJS = require('js-beautify'),
    compass = require('gulp-compass'),
    babel = require('babel-core'),
    prompt = require('prompt'),
    projectName = 'customcanopies',
    __dirname = path.resolve('./'),
    themeDirectory = path.resolve(__dirname, './wp-content/themes/dp-' + projectName),
    wordpress = {
        root: __dirname,
        dbPrefix: 'ccanopies',
        theme: {
            path: themeDirectory,
            paths: {
                css: path.resolve(themeDirectory, 'stylesheets/'),
                jade: path.resolve(themeDirectory, 'jade/'),
                js: path.resolve(themeDirectory, 'js/src/'),
                sass: path.resolve(themeDirectory, 'sass/'),
                tmp: path.resolve(__dirname, 'tmp/')
            }
        }
    };

console.log('initializing w/ %O', wordpress);

glob(path.join(wordpress.theme.paths.jade, '/**/*.jade'), function (err, fileList) {
    var sassBuilder = require('../sass-builder-v2'),
        specifiedFilename = 'page-home';

    console.log('starting compilation');
    compileSass(specifiedFilename);
    console.log('compilation complete');

    function compileSass(filename) {

        _.forEach(fileList, function (filePath, index, arr) {
            var filePathMeta = path.parse(filePath);
            fs.readFile(filePath, function (err, data) {
                if (err) throw err;
                //console.log('reading: ', filePath);
                //console.log("checking...", parsedPath);
                if (filePathMeta.name.indexOf(filename) > -1 || (filename.toLowerCase() == 'all')) {
                    var result = sassBuilder.parseJade(String(data), {
                        filename: filePath
                    });

                    fs.writeFile(path.resolve(wordpress.theme.paths.tmp, '_' + filePathMeta.name + '.scss'), result, function (err) {
                        if (err) throw err;
                        console.log('parsed result @%O: %s', filePathMeta, result);
                    })
                }
                index++;
            });
        });
    }
});
