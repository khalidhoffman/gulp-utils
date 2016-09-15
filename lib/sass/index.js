var path = require('path'),

    async = require('async'),
    glob = require('glob'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    libsass = require('node-sass'),

    projectUtils = require('../utils'),
    project = require('../project');

function compileSass(onCompilationComplete) {
    var SassCache = require('./lib/sass-functions');


    async.eachSeries(project.tasks.sass, function each(taskMeta, done) {
        var includes = [path.join(taskMeta.input, 'external/compass-mixins'), require('bourbon').includePaths];
        SassCache.clear();
        gulp.src(path.join(taskMeta.input, '/[!_]*.scss'))
            .pipe(sourcemaps.init())
            .pipe(sass({
                includePaths: includes,
                outputStyle: 'expanded', //nested, expanded, compact, compressed,
                indentedSyntax: false,
                functions: SassCache.functions
            }).on('error', sass.logError))
            .pipe(sourcemaps.write())
            .on('error', function () {
                done.apply(null, arguments);
            })
            .pipe(gulp.dest(taskMeta.output))
            .on('end', function () {
                done();
            })
    }, function complete() {
        onCompilationComplete.apply(null, arguments);
    });
}

function debugSass(onCompilationComplete) {
    var includes = [path.resolve(project.tasks.sass[0], './external/compass-mixins')],
        SassCache = require('./lib/sass-functions');

    async.eachSeries(project.tasks.sass, function each(taskMeta, done) {
        libsass.render({
            includePaths: includes,
            file: path.join(taskMeta.input, 'style.scss'),
            functions: SassCache.functions
        }, function (err, result) {
            console.log(arguments);
            if (done) done();
        });
    }, function complete() {
        onCompilationComplete.apply(null, arguments);
    })
}

module.exports = {
    debug: debugSass,
    compile: compileSass,
    compass: require('./compass')
};