// template gulpfile
// working gulpfile should be in root of project

var gulp = require('gulp'),
    pathTo = function(moduleName){ return './gulp-utils/commands/'+moduleName; };

// dev task that watches and executes appropriate tasks as necessary
gulp.task('auto', require(pathTo('project')).auto);

// Babel tasks
gulp.task('babel', require(pathTo('babel')).compile);


// Sass tasks
gulp.task('sass', require(pathTo('sass')).compile);

gulp.task('sass-debug', require(pathTo('sass')).debug);

gulp.task('compass', require(pathTo('sass')).compass);

gulp.task('jade-2-sass', require(pathTo('sass')).jade2Sass);


// Jade tasks
gulp.task('jade-js', require(pathTo('jade')).js);

gulp.task('jade-js-auto', require(pathTo('jade')).jsAuto);

gulp.task('jade-php', require(pathTo('jade')).php);

gulp.task('jade-php-debug', require(pathTo('jade')).phpDebug);

gulp.task('jade-php-auto', function(){
    gulp.watch(require('path').join(require(pathTo('wordpress')).theme.paths.jade, '/**/*.jade'), ['jade-php']);
});


// Javascript tasks
gulp.task('build-js-config', require(pathTo('javascript')).config);

gulp.task('build-js-config-auto', require(pathTo('javascript')).configAuto);

gulp.task('beautify-js', require(pathTo('javascript')).beautify);

gulp.task('beautify-js-auto', require(pathTo('javascript')).beautifyAuto);

gulp.task('test-js', require(pathTo('javascript')).test);

gulp.task('test-js', require(pathTo('javascript')).test);

gulp.task('build-js', require(pathTo('javascript')).build);


//WordPress tasks
gulp.task('init-wp-config', require(pathTo('wordpress')).init);

gulp.task('init-project',  require(pathTo('project')).init);