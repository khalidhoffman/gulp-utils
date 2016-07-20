var path = require('path'),
    util = require('util'),

    async = require('async'),
    through2 = require('through2'),
    gulp = require('gulp'),
    insert = require('gulp-insert'),
    customPug = require('pug'),
    pug = require('gulp-pug'),
    _ = require('lodash'),
    rename = require('gulp-rename'),
    argv = require('yargs').argv,

    projectUtils = require('../utils'),
    project = require('../project');

customPug.filters.php = function (text) {
    return '<?php ' + text + ' ?>';
};

customPug.filters.ejs = function (text) {
    return '<% ' + text + ' %>';
};

function compilePugEJS(onCompilationComplete) {
    async.each(project.tasks['pugjs'], function each(taskMeta, done) {
        gulp.src(path.join(taskMeta.input, '**/[^_]*.pug'))
            .pipe(insert.prepend(util.format("include %s\n", path.resolve(__dirname, "helpers/_-all"))))
            .pipe(pug({
                pretty: (argv['pretty']) ? true : false,
                doctype: 'html',
                locals: {
                    util: util,
                    namespace: require('../project').config.projectName
                },
                pug: customPug,
                basedir: path.resolve('/')
            }))
            .on('error', project.onError)
            .pipe(rename({
                extname: ".ejs"
            }))
            .pipe(gulp.dest(taskMeta.output || function (file) {
                    return file.base;
                }))
            .on('end', function () {
                done()
            });
    }, function complete() {
        onCompilationComplete();
    });

}

function compilePugPHP(onCompilationComplete) {
    async.each(project.tasks['pug'], function each(taskMeta, done) {
        gulp.src(path.join(taskMeta.input, '/**/[^_]*.pug'))
            .pipe(insert.prepend(util.format("include %s\n", path.resolve(__dirname, "helpers/_-all"))))
            .pipe(pug({
                pretty: (argv['pretty']) ? true : false,
                locals: {
                    util: util,
                    namespace: require('../project').config.projectName
                },
                pug: customPug,
                basedir: path.resolve('/')
            }))
            .on('error', project.onError)
            .pipe(rename({
                extname: ".php"
            }))
            .pipe(gulp.dest(taskMeta.output))
            .on('end', function () {
                done()
            });
    }, function complete() {
        onCompilationComplete();
    });
}

function compilePugPHPDebug() {
    async.each(project.tasks['pug'], function each(taskMeta, done) {
        gulp.src(path.join(taskMeta.input, '/**/[^_]*.pug'))
            .pipe(through2.obj({
                    allowHalfOpen: false
                },
                function (file, encoding, done) {

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
            .pipe(gulp.dest(taskMeta.output))
            .on('end', function () {
                done()
            });
    }, function complete() {
        onCompilationComplete();
    });
}


module.exports = {
    js: compilePugEJS,
    php: compilePugPHP,
    phpDebug: compilePugPHPDebug,
};
