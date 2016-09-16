var path = require('path'),
    util = require('util'),
    fs = require('fs'),

    fsExt = require('fs-extra'),
    _ = require('lodash'),
    async = require('async'),
    prompt = require('prompt'),
    colors = require('colors/safe'),

    config = require('./config'),
    tasks = require('./tasks'),
    projectUtils = require('../utils'),
    dump = require('../../dump');


function initProject(onInitializationComplete, options) {
    var _options = _.defaults({
            originalProjectName : 'boilerplate', 
            originalThemeName : 'dp-boilerplate' 
        }, options),
        wordpress = require('../wordpress'),
        submodules = [];

    fs.readFile(path.resolve(config.rootDirectory, '.gitmodules'), {encoding: 'utf8'}, function (err, content) {
        var submoduleContentPathRegex = /path\s=\s([^\s]+)\n/g,
            submoduleLinePathRegex = /path\s=\s([^\s]+)\n/;

        submodules = content.match(submoduleContentPathRegex).map(function (str) {
            return path.resolve(config.rootDirectory, submoduleLinePathRegex.exec(str)[1]);
        });
        getCurrentThemePath(function(err){
            if(err){
                onInitializationComplete(err);
            } else {
                createNewTheme();
            }
        });
    });

    function getCurrentThemePath(done){

        prompt.message = '';
        prompt.start();

        prompt.get({
            properties: {
                isDPTheme: {
                    description: colors.red('Is this a dp theme? (yes or no)'),
                    default: 'yes'
                },
                originalProjectName: {
                    description: colors.red('What is the original project name?'),
                    default: 'boilerplate'
                }
            }
        }, function (err, result) {
            if (err){
                return done(err);
            } else {
                prompt.stop();
                _options.originalProjectName = result.originalProjectName;
            
                if (/^\s*(yes|y)\s*$/.test(result.isDPTheme)){
                    _options.originalThemeName = 'dp-'+_options.originalProjectName;
                } else{
                    _options.originalThemeName = _options.originalProjectName;
                }
                done();                
            }
        });
    }

    function createNewTheme() {

        console.log('found git submodules: %s', dump(submodules));
        fsExt.copy(
            path.join(wordpress.theme.path, util.format('../%s', _options.originalThemeName)),
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

    function updateGitSubmodules() {
        async.eachSeries(submodules, function each(submodulePath, done) {
            var gitProcess = require('child_process').exec,
                newSubmodulePath = submodulePath.replace(_options.originalThemeName, 'dp-' + config.projectName),
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


    function updateRefs() {

        require('./references').update({
            defaultProjectNamespaceRegex: new RegExp(_options.originalProjectName, 'ig'),
            done: function () {
                require('../wordpress').init();
                if (onInitializationComplete) onInitializationComplete.apply();
            }
        });
    }

}

function onError(err) {
    console.log(err);
    this.emit('end');
}


module.exports = {
    init: function(done){
        initProject(done);
    },
    onError: onError,
    config: config,
    tasks : tasks
};
