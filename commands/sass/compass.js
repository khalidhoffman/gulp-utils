var path = require('path'),

    async = require('async'),
    gulp = require('gulp'),
    compass = require('gulp-compass'),

    project = require('../project'),
    config = project.config;

function compileCompass(onCompilationComplete) {
    var configPath = path.resolve(config.paths.basePath, 'config.rb');
    async.each(project.tasks.compass, function each(taskMeta, done) {
        gulp.src(path.join(taskMeta.input, '/**/[!_]*[(compass)].scss'))
            .pipe(compass({
                config_file: configPath,
                css: taskMeta.output,
                sass: taskMeta.input
            }))
            .on('error', function onError(err) {
                console.log(err);
                this.emit('end');
            })
            .pipe(gulp.dest(taskMeta.output))
            .on('end', function () {
                done();
            });
    }, function complete() {
        onCompilationComplete.apply(null, arguments);
    });
}

module.exports = compileCompass;
