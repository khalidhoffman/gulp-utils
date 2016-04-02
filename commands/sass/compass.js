var path = require('path'),
    gulp = require('gulp'),
    compass = require('gulp-compass'),
    config = require('../project').config,
    paths = require('../paths');

function compileCompass() {
    var configPath = path.resolve(config.rootDirectory, 'config.rb');
    return gulp.src(path.join(paths.sass, '/**/[!_]*[(compass)].scss'))
        .pipe(compass({
            config_file: configPath,
            css: paths.css,
            sass: paths.sass
        }))
        .on('error', function onError(err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(gulp.dest(paths.css));
};

module.exports = compileCompass;
