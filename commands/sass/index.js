var path = require('path'),
    
    glob = require('glob'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    libsass = require('node-sass'),
    
    paths = require('../paths');

function compileSass() {
    var sassWatchGlobRegex = path.join(paths.sass, '/[!_]*[!(compass)].scss'),
        includes = [path.resolve(paths.sass, 'external/compass-mixins')],
        SassCache = require('./lib/sass-functions');

    SassCache.clear();

    return gulp.src(sassWatchGlobRegex)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: includes,
            outputStyle: 'expanded', //nested, expanded, compact, compressed,
            indentedSyntax: false,
            functions: SassCache.functions
        }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .on('error', function () {
            done();
        })
        .pipe(gulp.dest(paths.css));
}

function debugSass(done) {
    var sassWatchGlobRegex = path.join(paths.sass, 'style.scss'),
        includes = [path.resolve(paths.sass, './external/compass-mixins')],
        SassCache = require('./lib/sass-functions');
    console.log('includes:', includes);

    libsass.render({
        includePaths: includes,
        file: sassWatchGlobRegex,
        functions: SassCache.functions
    }, function (err, result) {
        console.log(arguments);
        if(done) done();
    });
}

module.exports = {
    debug: debugSass,
    compile: compileSass,
    compass : require('./compass'),
    jade2Sass : require('./jade-2-sass')
};