var path = require('path'),
    gulp = require('gulp'),
    compass = require('gulp-compass'),
    config = require('../project').config,

    projectUtils = require('../utils'),
    paths = require('../paths');

function compileCompass() {
    var configPath = path.resolve(config.rootDirectory, 'config.rb');
    return gulp.src(projectUtils.buildGlob(paths.inputs.sass, '/**/[!_]*[(compass)].scss'))
        .pipe(compass({
            config_file: configPath,
            css: paths.outputs.css,
            sass: paths.inputs.sass[0]
        }))
        .on('error', function onError(err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(gulp.dest(paths.outputs.css));
};

module.exports = compileCompass;
