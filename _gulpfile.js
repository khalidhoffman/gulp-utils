// template gulpfile
// working gulpfile should be in root of project

var gulp = require('gulp');

// dev task that watches and executes appropriate task as necessary
gulp.task('auto', require('./commands/project').auto);

// Babel tasks
gulp.task('babel', require('./commands/babel').compile);


// Sass tasks
gulp.task('sass', require('./commands/sass').compile);

gulp.task('sass-debug', require('./commands/sass').debug);

gulp.task('compass', require('./commands/sass').compass);

gulp.task('jade-2-sass', require('./commands/sass').jade2Sass);


// Jade tasks

gulp.task('jade-js', require('./commands/jade').js);

gulp.task('jade-js-auto', require('./commands/jade').jsAuto);

gulp.task('jade-php', require('./commands/jade').php);

gulp.task('jade-php-debug', require('./commands/jade').phpDebug);

gulp.task('jade-php-auto', require('./commands/jade').phpAuto);


// Javascript tasks
gulp.task('build-js-config', require('./commands/javascript').config);

gulp.task('build-js-config-auto', require('./commands/javascript').configAuto);

gulp.task('beautify-js', require('./commands/javascript').beautify);

gulp.task('beautify-js-auto', require('./commands/javascript').beautifyAuto);

gulp.task('test-js', require('./commands/javascript').test);

gulp.task('build-js', require('./commands/javascript').build);


//WordPress tasks
gulp.task('init-wp-config', require('./commands/wordpress').initConfig);

gulp.task('init-project',  require('./commands/project').init);
