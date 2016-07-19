var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,

    gulp = require('gulp'),

    wordpress = require('../wordpress'),
    paths = require('../paths');

function buildJSConfig(done) {

    require('./spa-config-builder').build({
        themeDirectory: wordpress.theme.path,
        writeDirectory: path.resolve(paths.inputs.js[0], 'modules/'),
        srcDirectory: path.resolve(paths.inputs.js[0], 'pages/'),
        done: function () {
            fs.readFile(path.resolve(paths.outputs.css, 'config.css'), function (err, data) {
                if (err) throw err;
                var JSONRegex = /%(.*)%/,
                    cssConfigContent = String(data),
                    cssConfig = cssConfigContent.replace(/\\a|\s/g, ''),
                    cssConfigJSONStr = JSONRegex.exec(cssConfig)[1],
                    cssConfigJSONPath = path.resolve(paths.inputs.js[0], "modules/config.json");

                fs.writeFile(
                    cssConfigJSONPath,
                    cssConfigJSONStr,
                    function (err) {
                        if (err) throw err;
                        console.log('successfully saved css config to %s', cssConfigJSONPath);
                        if (done) done();
                    })
            });
        }
    });
}

function buildJSConfigAuto() {
    gulp.watch(path.resolve(paths.outputs.css, 'config.css'), ['build-json']);
}


function testJS(done) {
    exec('jasmine', function (err, stdout, stderr) {
        console.log('results:\n %s\nerror:\n%s', stdout, stderr);
        if (done) done();
    });
}

function buildJSProduction(done) {
    var rjsCmd = (require('os').platform() == 'linux') ? 'r.js' : 'r.js.cmd';
    require('./spa-config-builder').build({
        themeDirectory: wordpress.theme.path,
        writeDirectory: path.resolve(paths.inputs.js[0], 'modules/'),
        srcDirectory: path.resolve(paths.inputs.js[0], 'pages/'),
        done: function () {
            fs.readFile(path.resolve(paths.outputs.css, 'config.css'), function (err, data) {
                if (err) throw err;
                var JSONRegex = /%(.*)%/,
                    cssConfigContent = String(data),
                    cssConfig = cssConfigContent.replace(/\\a|\s/g, ''),
                    cssConfigJSONStr = JSONRegex.exec(cssConfig)[1],
                    cssConfigJSONPath = path.resolve(paths.inputs.js[0], "modules/config.json");

                fs.writeFile(
                    cssConfigJSONPath,
                    cssConfigJSONStr,
                    function (err) {
                        if (err) throw err;
                        console.log('successfully saved css config to %s', cssConfigJSONPath);
                        exec(rjsCmd + ' -o ' + path.resolve(paths.inputs.js[0], 'build.js'), function (err, stdout, stderr) {
                            console.log('err:\n%s\n\nresults:\n%s\n\nstderr:\n%s', err, stdout, stderr);
                            if (done) done();
                        });
                    })
            });
        }
    });
}

module.exports = {
    config: buildJSConfig,
    configAuto: buildJSConfigAuto,
    test: testJS,
    build: buildJSProduction,
    beautify: require('./beautify').compile,
    beautifyAuto: require('./beautify').watch
};