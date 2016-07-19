var path = require('path'),
    util = require('util'),

    through2 = require('through2'),
    gulp = require('gulp'),
    insert = require('gulp-insert'),
    customPug = require('pug'),
    pug = require('gulp-pug'),
    _ = require('lodash'),
    rename = require('gulp-rename'),
    argv = require('yargs').argv,

    projectUtils = require('../utils'),
    project = require('../project'),
    paths = require('../paths');

customPug.filters.php = function(text) {
    return '<?php ' + text + ' ?>';
};

customPug.filters.ejs = function(text) {
    return '<% ' + text + ' %>';
};

function compilePugEJS() {
    var pugJSGlob = projectUtils.buildGlob(paths.inputs.js, '/[^(vendors)]*/**/[^_]*.pug');
    return gulp.src(pugJSGlob)
	.pipe(insert.prepend(util.format("include %s\n", path.resolve(__dirname, "helpers/_-all"))))
        .pipe(pug({
            pretty: (argv['pretty']) ? true : false,
            doctype: 'html',
            locals : {
                util : util,
                namespace : require('../project').config.projectName
            },
            pug: customPug,
            basedir: paths.outputs.pug
        }))
        .on('error', project.onError)
        .pipe(rename({
            extname: ".ejs"
        }))
        .pipe(gulp.dest(paths.outputs.js));
    //console.log('Saved php files from '+pugFilesPattern + ' to '+saveDirectory);
}

function compilePugEJSAuto() {
    gulp.watch(projectUtils.buildGlob(paths.inputs.js, '/**/*.pug'), ['pug-js']);
}

function compilePugPHP() {
    var pugPHPGlob = projectUtils.buildGlob(paths.inputs.pug, '/**/[^_]*.pug');
    return gulp.src(pugPHPGlob)
        .pipe(insert.prepend(util.format("include %s\n", path.resolve(__dirname, "helpers/_-all"))))
        .pipe(pug({
            pretty: (argv['pretty']) ? true : false,
            locals : {
                util : util,
                namespace : require('../project').config.projectName
            },
            pug: customPug,
            basedir : path.resolve('/') 
        }))
        .on('error', project.onError)
        .pipe(rename({
            extname: ".php"
        }))
        .pipe(gulp.dest(paths.outputs.php));
    //console.log('Saved php files from '+pugFilesPattern + ' to '+saveDirectory);
}

function compilePugPHPDebug() {
    var pugFilesPattern = projectUtils.buildGlob(paths.inputs.pug, '/**/[^_]*.pug');
    console.log('Pug: %j', customPug);
    return gulp.src(pugFilesPattern)
        .pipe(through2.obj({
                allowHalfOpen: false
            },
            function(file, encoding, done) {

                //console.log('chunk.path: %j', chunk.path);
                var html = customPug.render(file.contents.toString(), {
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
        .pipe(gulp.dest(paths.outpus.php));
    //console.log('Saved php files from '+pugFilesPattern + ' to '+saveDirectory);
}

function compilePugPHPAuto() {
    gulp.watch(projectUtils.buildGlob(paths.inputs.pug, '/**/*.pug'), ['pug-php']);
}

module.exports = {
    js : compilePugEJS,
    jsAuto : compilePugEJSAuto,
    php : compilePugPHP,
    phpDebug : compilePugPHPDebug,
    phpAuto : compilePugPHPAuto
};
