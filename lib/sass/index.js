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
    var SassHelpers = require('./lib/sass-functions');

    async.eachSeries(project.tasks.sass, function each(taskMeta, done) {
        var includes = [],
            globSelector = path.join(taskMeta.input, '/*.{scss,sass}'),
            activeSassHelper = taskMeta.options.useLegacy ? SassHelpers.legacy : SassHelpers;

        if (taskMeta.options.useBourbon) includes = includes.concat(require('bourbon').includePaths);
        if (taskMeta.options.useCompassMixins) includes.push(path.join(process.cwd(), '/node_modules/compass-mixins/lib'));
        activeSassHelper.clear();
        gulp.src(globSelector)
            .pipe(sourcemaps.init())
            .pipe(sass({
                includePaths: includes,
                outputStyle: 'expanded', //nested, expanded, compact, compressed,
                indentedSyntax: false,
                functions: activeSassHelper.functions
            }).on('error', sass.logError))
            .pipe(sourcemaps.write())
            .on('error', function () {
                done.apply(null, arguments);
            })
            .pipe(gulp.dest(taskMeta.output))
            .on('end', function () {
                done();
            })
    }, onCompilationComplete);
}

function debugSass(onCompilationComplete) {
    var includes = [path.resolve(project.tasks.sass[0], './external/compass-mixins')],
        SassHelpers = require('./lib/sass-functions');

    async.eachSeries(project.tasks.sass, function each(taskMeta, done) {
        var activeSassHelper = taskMeta.options.useLegacy ? SassHelpers.legacy : SassHelpers;
        libsass.render({
            includePaths: includes,
            file: path.join(taskMeta.input, 'style.scss'),
            functions: activeSassHelper.functions
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
