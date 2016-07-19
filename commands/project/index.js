var path = require('path'),
    util = require('util'),
    fs = require('fs'),

    fsExt = require('fs-extra'),
    _ = require('lodash'),
    async = require('async'),
    gulp = require('gulp'),

    config = require('./config'),
    projectUtils = require('../utils'),
    dump = require('../../dump');


function initProject(onInitializationComplete) {
    var wordpress = require('../wordpress'),
        submodules = [];


    function updateRefs() {

        require('./references').update({
            done: function () {
                require('../wordpress').init();
                if (onInitializationComplete) onInitializationComplete.apply();
            }
        });
    }

    function updateGitSubmodules() {
        async.eachSeries(submodules, function each(submodulePath, done) {
            var gitProcess = require('child_process').exec,
                newSubmodulePath = submodulePath.replace('dp-boilerplate', 'dp-' + config.projectName),
                gitCommand = util.format("git mv %s %s", submodulePath, newSubmodulePath);
            if(submodulePath != newSubmodulePath){
                console.log("executing '%s'", gitCommand);
                gitProcess(gitCommand, function (err, stdout, stderr) {
                    if (err) throw err;
                    console.log(stdout);
                    if (stderr) console.error(stderr);
                    done();
                });
            } else {
                console.log('ignoring move of git submodule %s', newSubmodulePath);
                done();
            }
        }, function complete(err) {
            updateRefs();
        });
    }

    function createNewTheme() {

        console.log('found git submodules: %s', dump(submodules));
        fsExt.copy(
            path.join(wordpress.theme.path, '../dp-boilerplate'),
            wordpress.theme.path, {
                preserveTimestamps: true,
                filter: function (filePath) {
                    var isSubmodule = (submodules.indexOf(filePath) > -1);
                    // if (isSubmodule) console.log('skipping copy of %s', filePath);
                    return !isSubmodule; // ignore git submodules
                }
            },
            function (err) {
                if (err) {
                    console.error('failed to create new theme folder...\n%s', dump(err));
                } else {
                    console.log('successfully created theme folder...');
                }

                updateGitSubmodules();
            });
    }

    fs.readFile(path.resolve(config.rootDirectory, '.gitmodules'), {encoding: 'utf8'}, function (err, content) {
        var submoduleContentPathRegex = /path\s=\s([^\s]+)\n/g,
            submoduleLinePathRegex = /path\s=\s([^\s]+)\n/;

        submodules = content.match(submoduleContentPathRegex).map(function (str) {
            return path.resolve(config.rootDirectory, submoduleLinePathRegex.exec(str)[1]);
        });
        createNewTheme();
    });

}

function watchProject() {
    var paths = require('../paths');
    gulp.watch(projectUtils.buildGlob(paths.inputs.jade, '/**/*.jade'), ['jade-php']);
    gulp.watch(projectUtils.buildGlob(paths.inputs.js, '/**/*.jade'), ['jade-js']);
    gulp.watch(projectUtils.buildGlob(paths.inputs.js, '!(node_modules|vendors)/**/*.jsx'), ['babel']);
    gulp.watch(projectUtils.buildGlob(paths.inputs.sass, '/**/*.scss'), ['sass']);
    gulp.watch(projectUtils.buildGlob(paths.inputs.stylus, '/**/*.styl'), ['stylus']);
    //gulp.watch(cssConfigPath, ['build-json']);
    require('./chrome-sync').start();
}

function onError(err) {
    console.log(err);
    this.emit('end');
}


module.exports = {
    init: initProject,
    auto: watchProject,
    onError: onError,
    config: config
};
