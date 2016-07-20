var path = require('path'),
    gulp = require('gulp'),
    compass = require('gulp-compass'),
    config = require('../project').config,

    project = require('../project');

function compileCompass() {
    var configPath = path.resolve(config.rootDirectory, 'config.rb');
    async.each(project.tasks.sass, function each(taskMeta, done) {

        return gulp.src(path.join(taskMeta.input, '/**/[!_]*[(compass)].scss'))
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
        .on('end', function(){
            done();
        });
    }, function complete() {
        onCompilationComplete.apply(null, arguments);
    });
};

module.exports = compileCompass;
