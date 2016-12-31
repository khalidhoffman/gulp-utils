var path = require('path'),

    _ = require('lodash'),
    async = require('async'),
    glob = require('glob'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    libsass = require('node-sass'),
    SassCache = require('sass-cache'),

    project = require('../project'),

    sassHelper = SassCache,
    sassLegacyHelper = require('./lib/sass-functions').legacy;

function compileSass(onCompilationComplete) {

    async.eachSeries(project.tasks.sass, function each(taskMeta, done) {
        var includes = _.map(taskMeta.options.includePaths || [], function (includePath) {
                return path.join(project.config.paths.workingDir, includePath);
            }),
            globSelector = path.join(taskMeta.input, '/*.{scss,sass}'),
            activeSassHelper = taskMeta.options.useLegacy ? sassLegacyHelper : sassHelper;

        if (taskMeta.options.useBourbon) includes = includes.concat(require('bourbon').includePaths);
        if (taskMeta.options.useCompassMixins) includes.push(path.join(process.cwd(), '/node_modules/compass-mixins/lib'));
        activeSassHelper.clear();
        gulp.src(globSelector)
            .pipe(sourcemaps.init())
            .pipe(sass({
                includePaths: includes,
                outputStyle: taskMeta.options.outputStyle || 'expanded', //nested, expanded, compact, compressed,
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

    async.eachSeries(project.tasks.sass, function each(taskMeta, done) {
        var includes = _.map(taskMeta.options.includePaths || [], function (includePath) {
                return path.join(project.config.working, includePath);
            }),
            globSelector = path.join(taskMeta.input, '/*.{scss,sass}'),
            activeSassHelper = taskMeta.options.useLegacy ? sassLegacyHelper : sassHelper;

        glob(globSelector, function (globError, files) {
            if (globError) return done(globError);
            async.eachSeries(files,
                function each(filepath, onFileRendered) {
                    libsass.render({
                        file: filepath,
                        includePaths: includes,
                        outputStyle: taskMetak.options.outputStyle || 'expanded', //nested, expanded, compact, compressed,
                        indentedSyntax: false,
                        functions: activeSassHelper.functions
                    }, function (renderError, result) {
                        if (renderError) console.error(renderError);
                        console.log(result);
                        onFileRendered();
                    });
                },
                function complete(fileRenderError) {
                    done(fileRenderError);
                });
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
