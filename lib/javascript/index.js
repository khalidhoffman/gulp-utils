var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,

    _ = require('lodash'),
    async = require('async'),
    gulp = require('gulp'),
    prompt = require('prompt'),
    colors = require('colors/safe'),

    project = require('../project'),
    wordpress = require('../wordpress');

function buildJSConfig(done) {
    var defaultCSSPath = path.join(wordpress.theme.path, 'stylesheets/');

    async.each(project.tasks['js-config'], function each(taskMeta, onConfigComplete) {
        require('./spa-config-builder').build({
            themeDirectory: wordpress.theme.path,
            writeDirectory: taskMeta.output,
            srcDirectory: taskMeta.input,
            done: function () {
                fs.readFile(path.resolve(taskMeta.css || defaultCSSPath, 'config.css'), function (err, data) {
                    if (err) return onConfigComplete(err);
                    var JSONRegex = /%(.*)%/,
                        cssConfigContent = String(data),
                        cssConfig = cssConfigContent.replace(/\\a|\s/g, ''),
                        cssConfigJSONStr = JSONRegex.exec(cssConfig)[1],
                        cssConfigJSONPath = path.resolve(taskMeta.output, "config.json");

                    fs.writeFile(
                        cssConfigJSONPath,
                        cssConfigJSONStr,
                        function (err) {
                            onConfigComplete(err);
                        })

                });
            }
        });

    }, function complete(err) {
        done(err)
    });
}


function testJS(done) {
    exec('jasmine', function (err, stdout, stderr) {
        console.log('results:\n %s\nerror:\n%s', stdout, stderr);
        if (done) done(err);
    });
}

function buildJSProduction(done) {

    prompt.message = '';
    prompt.start();

    prompt.get({
        properties: {
            isWordPressConfig: {
                description: colors.red('Is this a dp-boilerplate project? (yes or no)'),
                default: 'yes'
            }
        }
    }, function (err, result) {
        if (err){
            return done(err);
        } else {
            prompt.stop();
            if (/^\s*(yes|y)\s*$/.test(result.isWordPressConfig)){
                buildJSConfig(function (err) {
                    if (err) return done(err);
                    buildProjects();
                });
            } else {
                buildProjects();
            }
        }
    });

    function buildProjects(){

        async.each(project.tasks['js-bundle'], function each(taskMeta, onBuildComplete) {
            bundleJS(onBuildComplete, {buildPath: taskMeta.input});
        }, function complete(err) {
            done(err)
        });
    }

}

function bundleJS(done, options) {
    var _options = _.extend({
            buildPath: path.resolve(wordpress.theme.path, 'js/src/build.js')
        }, options),
        rjsCmd = (require('os').platform() == 'linux') ? 'r.js' : 'r.js.cmd';
    exec(rjsCmd + ' -o ' + _options.buildPath, function (err, stdout, stderr) {
        console.log('err:\n%s\n\nresults:\n%s\n\nstderr:\n%s', err, stdout, stderr);
        if (done) done(err);
    });
}

module.exports = {
    config: buildJSConfig,
    test: testJS,
    build: buildJSProduction,
    beautify: require('./beautify').compile
};
