var fs = require('fs'),
    path = require('path'),

    gulp = require('gulp'),

    dump = require('../../dump');


function initProject(done) {
    var wordpress = require('../wordpress');
    fs.rename(
        path.join(wordpress.theme.path, '../dp-boilerplate'),
        wordpress.theme.path,
        function(err) {
            if (err) {
                console.error('failed to rename theme folder...\n%s', dump(err));
            } else {
                console.log('successfully renamed theme folder...');
            }
            require('./references').update({
                done : function(){
                    require('../wordpress').init();
                }
            });
        });
}

function watchProject() {
    var wordpress = require('../wordpress');
    gulp.watch(path.join(wordpress.theme.paths.jade, '/**/*.jade'), ['jade-php']);
    gulp.watch(path.join(wordpress.theme.paths.js, '/**/*.jade'), ['jade-js']);
    gulp.watch(path.join(wordpress.theme.paths.js, '!(node_modules|vendors)/**/*.jsx'), ['babel']);
    gulp.watch(path.join(wordpress.theme.paths.sass, '/**/*.scss'), ['sass']);
    //gulp.watch(cssConfigPath, ['build-json']);
    require('./chrome-sync').start();
}

function onError(err) {
    console.log(err);
    this.emit('end');
}


module.exports = {
    init : initProject,
    auto : watchProject,
    onError : onError,
    config : require('./config')
};
