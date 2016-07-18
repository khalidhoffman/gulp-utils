// template gulpfile
// working gulpfile should be in root of project

var path = require('path'),

    gulp = require('gulp'),
    gulpModule = function(moduleName){ return require('./gulp-utils/commands/'+path.normalize(moduleName)); };

// dev task that watches and executes appropriate tasks as necessary
gulp.task('auto', function(){

    var paths = gulpModule('paths');
    gulp.watch(path.join(paths.pug, '/**/*.pug'), ['pug-php']);
    gulp.watch(path.join(paths.js, '/**/*.pug'), ['pug-js']);
    gulp.watch(path.join(paths.js, '!(node_modules|vendors)/**/*.jsx'), ['babel']);
    gulp.watch(path.join(paths.sass, '/**/*.scss'), ['sass']);
    gulp.watch(path.join(paths.stylus, '/**/*.styl'), ['stylus']);
    //gulp.watch(cssConfigPath, ['build-json']);
    gulpModule('project/chrome-sync').start();
});

// Babel tasks
gulp.task('babel', gulpModule('babel').compile);


// CSS tasks
gulp.task('less', gulpModule('less').compile);

gulp.task('sass', gulpModule('sass').compile);

gulp.task('sass-debug', gulpModule('sass').debug);

gulp.task('compass', gulpModule('sass').compass);

gulp.task('stylus', gulpModule('stylus').compile);

// Jade tasks

gulp.task('pug-2-stylus', gulpModule('stylus').pug2Stylus);

gulp.task('pug-js', gulpModule('pug').js);

gulp.task('pug-js-auto', gulpModule('pug').jsAuto);

gulp.task('pug-php', gulpModule('pug').php);

gulp.task('pug-php-debug', gulpModule('pug').phpDebug);

gulp.task('pug-php-auto', function(){
    gulp.watch(path.join(gulpModule('paths').pug, '/**/*.pug'), ['pug-php']);
});


// Javascript tasks
gulp.task('build-js-config', gulpModule('javascript').config);

gulp.task('build-js-config-auto', gulpModule('javascript').configAuto);

gulp.task('beautify-js', gulpModule('javascript').beautify);

gulp.task('beautify-js-auto', gulpModule('javascript').beautifyAuto);

gulp.task('test-js', gulpModule('javascript').test);

gulp.task('test-js', gulpModule('javascript').test);

gulp.task('build-js', gulpModule('javascript').build);


//WordPress tasks
gulp.task('init-wp-config', gulpModule('wordpress').init);

gulp.task('init-project',  gulpModule('project').init);

gulp.task('init-avocode', gulpModule('avocode').init);
