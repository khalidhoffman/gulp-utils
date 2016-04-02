var path = require('path'),

    through2 = require('through2'),
    gulp = require('gulp'),
    customJade = require('jade'),
    jade = require('gulp-jade'),
    _ = require('lodash'),
    rename = require('gulp-rename'),
    argv = require('yargs').argv,

    project = require('../project'),
    paths = require('../paths');

customJade.filters.php = function(text) {
    return '<?php ' + text + ' ?>';
};

customJade.filters.ejs = function(text) {
    return '<% ' + text + ' %>';
};

function compileJadeEJS() {
    var jadeJSGlob = path.join(paths.js, '/[^(vendors)]*/**/[^_]*.jade');
    return gulp.src(jadeJSGlob)
        .pipe(jade({
            pretty: (argv['pretty']) ? true : false,
            doctype: 'html',
            jade: customJade,
            basedir: path.resolve(__dirname, 'jade/')
        }))
        .on('error', project.onError)
        .pipe(rename({
            extname: ".ejs"
        }))
        .pipe(gulp.dest('./js/src/'));
    //console.log('Saved php files from '+jadeFilesPattern + ' to '+saveDirectory);
}

function compileJadeEJSAuto() {
    gulp.watch(path.join(paths.js, '/**/*.jade'), ['jade-js']);
}

function compileJadePHP() {
    var jadePHPGlob = path.join(paths.jade, '/**/[^_]*.jade');
    return gulp.src(jadePHPGlob)
        .pipe(jade({
            pretty: (argv['pretty']) ? true : false,
            jade: customJade
        }))
        .on('error', project.onError)
        .pipe(rename({
            extname: ".php"
        }))
        .pipe(gulp.dest(paths.baseAssetsPath));
    //console.log('Saved php files from '+jadeFilesPattern + ' to '+saveDirectory);
}

function compileJadePHPDebug() {
    var jadeFilesPattern = path.join(paths.jade, '/**/[^_]*.jade');
    console.log('Jade: %j', customJade);
    return gulp.src(jadeFilesPattern)
        .pipe(through2.obj({
                allowHalfOpen: false
            },
            function(file, encoding, done) {

                //console.log('chunk.path: %j', chunk.path);
                var html = customJade.render(file.contents.toString(), {
                    filename: file.path,
                    pretty: (argv['pretty']) ? true : false
                });
                //console.log('html: %s', html);
                file.contents = new Buffer(html, encoding);
                done(null, file); // note we can use the second argument on the callback
                // to provide data as an alternative to this.push('wut?')
            }
        ))
        .on('error', project.onError)
        .pipe(rename({
            extname: ".php"
        }))
        .pipe(gulp.dest(paths.baseAssetsPath));
    //console.log('Saved php files from '+jadeFilesPattern + ' to '+saveDirectory);
}

function compileJadePHPAuto() {
    gulp.watch(path.join(paths.jade, '/**/*.jade'), ['jade-php']);
}

module.exports = {
    js : compileJadeEJS,
    jsAuto : compileJadeEJSAuto,
    php : compileJadePHP,
    phpDebug : compileJadePHPDebug,
    phpAuto : compileJadePHPAuto
};