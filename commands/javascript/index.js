var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    gulp = require('gulp'),
    wordpress = require('../wordpress');

function buildJSConfig() {

    require('./spa-config-builder').build({
        themeDirectory: wordpress.theme.path,
        writeDirectory: path.resolve(wordpress.theme.paths.js, 'modules/'),
        srcDirectory: path.resolve(wordpress.theme.paths.js, 'pages/')
    });

    fs.readFile(path.resolve(wordpress.theme.paths.css, 'config.css'), function(err, data) {
        if (err) throw err;
        var JSONRegex = /%(.*)%/,
            cssConfigContent = String(data),
            cssConfig = cssConfigContent.replace(/\\a|\s/g, ''),
            cssConfigJSONStr = JSONRegex.exec(cssConfig)[1],
            cssConfigJSONPath = path.resolve(wordpress.theme.paths.js, "modules/config.json");

        fs.writeFile(
            cssConfigJSONPath,
            cssConfigJSONStr,
            function(err) {
                if (err) throw err;
                console.log('successfully saved css config to %s', cssConfigJSONPath);
            })
    });
}

function buildJSConfigAuto() {
    gulp.watch(path.resolve(wordpress.theme.paths.css, 'config.css'), ['build-json']);
}


function testJS() {
    exec('jasmine', function(err, stdout, stderr) {
        console.log('results:\n %s\nerror:\n%s', stdout, stderr);
    });
}

function buildJSProduction() {
    fs.readFile(
        path.resolve(wordpress.theme.paths.css, 'config.css'),
        function(err, data) {
            if (err) throw err;
            var configCSSRegex = /%(.*)%/,
                configCSS = String(data),
                formattedCSS = configCSS.replace(/\\a|\s/g, ''),
                configJSONStr = configCSSRegex.exec(formattedCSS)[1],
                configJSON = JSON.parse(configJSONStr);

            fs.writeFile(path.resolve(wordpress.theme.paths.js, 'modules/config.json'), configJSONStr, function(err) {
                if (err) throw err;
            });
        });
    var rjsCmd = (require('os').platform() == 'linux') ? 'r.js' : 'r.js.cmd';
    exec(rjsCmd + ' -o ' + path.resolve(wordpress.theme.paths.js, 'build.js'), function(err, stdout, stderr) {
        console.log('err:\n%s\n\nresults:\n%s\n\nstderr:\n%s', err, stdout, stderr);
    });
}

module.exports = {
    config : buildJSConfig,
    configAuto : buildJSConfigAuto,
    test : testJS,
    build : buildJSProduction,
    beautify : require('./beautify').compile,
    beautifyAuto : require('./beautify').watch
};