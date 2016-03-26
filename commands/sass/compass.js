var path = require('path'),
    gulp = require('gulp'),
    compass = require('gulp-compass'),
    config = require('../project').config,
    wordpress = require('../wordpress');

function compileCompass() {
    var configPath = path.resolve(config.rootDirectory, 'config.rb');
    gulp.src(path.join(wordpress.theme.paths.sass, '/**/[!_]*[(compass)].scss'))
        .pipe(compass({
            config_file: configPath,
            css: wordpress.theme.paths.css,
            sass: wordpress.theme.paths.sass
        }))
        .on('error', function onError(err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(gulp.dest(wordpress.theme.paths.css));
};

module.exports = compileCompass;
