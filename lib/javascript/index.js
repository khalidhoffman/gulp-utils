var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    exec = require('child_process').exec,

    _ = require('lodash'),
    async = require('async'),
    prompt = require('prompt'),
    colors = require('colors/safe'),

    project = require('../project'),
    wordpress = require('../wordpress');

function buildRequireJSConfig(done) {
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
            shouldConfigWPPages: {
                description: colors.red('Is this a dp-boilerplate project? (yes or no)'),
                default: 'no'
            },
            isWebpackProject: {
                description: colors.red('Is this a webpack project? (yes or no)'),
                default: 'yes'
            }
        }
    }, function (err, result) {
        if (err){
            return done(err);
        } else {
            prompt.stop();
            if (/^\s*(yes|y)\s*$/.test(result.shouldConfigWPPages)){
                buildRequireJSConfig(function (err) {
                    if (err) return done(err);
                    buildRjsProjects(done);
                });
            } else if(result.isWebpackProject.match(/^\s*(yes|y)\s*$/)){
                buildWebpackProjects(function(err){
                    if (err) return done(err);
                });
            } else {
                buildRjsProjects(done);
            }
        }
    });

}

function buildWebpackProjects(done){
    console.log('building webpack...');

    async.each(project.tasks['js-webpack'], function each(taskMeta, onBuildComplete) {
        bundleWebpack(onBuildComplete, {buildPath: taskMeta.input});
    }, function complete(err) {
        done(err)
    });
}

function buildRjsProjects(done){
    console.log('building requirejs...');

    async.each(project.tasks['js-bundle'], function each(taskMeta, onBuildComplete) {
        bundleRequireJS(onBuildComplete, {buildPath: taskMeta.input});
    }, function complete(err) {
        done(err)
    });
}

function bundleRequireJS(done, options) {
    var _options = _.extend({
            buildPath: path.join(project.config.paths.basePath, 'js/src/build.js')
        }, options),
        rjsCmd = (require('os').platform() == 'linux') ? 'r.js' : 'r.js.cmd';
    console.log('starting build...');
    exec(rjsCmd + ' -o ' + _options.buildPath, function (err, stdout, stderr) {
        if(err) console.error('error:\n%s', err);
        if(stderr) console.error('std-error:\n%s', stderr);
        console.log('results:\n%s', stdout);
        if (done) done(err);
    });
}

function bundleWebpack(done, options) {
    var _options = _.extend({
            buildPath: path.join(project.config.paths.basePath, 'js/src/webpack.config.js')
        }, options),
        webpackCmd = util.format('webpack --config %s', _options.buildPath);
    console.log('starting build...');
    exec(webpackCmd + ' --display-reasons ', function (err, stdout, stderr) {
        if(err) console.error('error:\n%s', err);
        if(stderr) console.error('std-error:\n%s', stderr);
        console.log('results:\n%s', stdout);
        if (done) done(err);
    });
}

module.exports = {
    config: buildRequireJSConfig,
    test: testJS,
    build: buildJSProduction,
    buildWebpack: buildWebpackProjects,
    buildRequireJS: buildRjsProjects,
    beautify: require('./beautify').compile
};
