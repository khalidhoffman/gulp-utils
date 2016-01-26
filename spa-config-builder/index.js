var through = require('through2'),    // npm install --save through2
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    Walker = require('../fs-walk');

function isScript(fileName) {
    var jsRegex = /.*\.js$/;
    return jsRegex.test(fileName);
}

function isPHP(fileName) {
    var phpRegex = /.*\.php$/;
    return phpRegex.test(fileName);
}

module.exports = {
    build: function (options) {
        var defaults = {
                srcDirectory: path.resolve('src/', 'pages'),
                themeDirectory: path.resolve('wp-content/themes/', (options && options.projectName) ? options.projectName : 'dp-boilerplate/'),
                writeDirectory: path.resolve('src/', 'modules/'),
                filename: 'views.json'
            },
            scriptsList = [],
            pagesList = [],
            definedPages = [],
            isPageListComplete = false,
            isScriptListComplete = false,
            settings = _.assign({}, defaults, options);

        function onFilesRead() {
            //console.log('Finding intersection between:', scriptsList, pagesList);
            console.log('Finding intersection...');
            definedPages = _.intersection(scriptsList, pagesList);
            var jsonPath = path.resolve(settings.writeDirectory, settings.filename),
                rjsFixPath = path.resolve(settings.writeDirectory, 'pages-stub.js'),
                productionPages = _.without(definedPages, 'page-debug');

            productionPages = productionPages.map(function(pageName){
                return 'pages/'+pageName
            });
            var rjsFix = 'define(' + JSON.stringify(productionPages) + ', function(){});';
            fs.writeFile(jsonPath, JSON.stringify(productionPages), function () {
                console.log('Saved to ' + jsonPath);
            });
            fs.writeFile(rjsFixPath, rjsFix, function () {
                console.log('Saved to ' + jsonPath);
            });
        }

        Walker.recursePath(settings.themeDirectory, {
            each: function (err, filepath) {
                if (err) throw err;
                var filename = path.basename(filepath);
                if (isPHP(filename)) pagesList.push(path.basename(filepath, '.php'));
            },
            done: function (err, filelist) {
                if (err) throw err;
                isPageListComplete = true;
                if (isScriptListComplete) onFilesRead.apply();
            }
        });
        Walker.recursePath(settings.srcDirectory, {
            each: function (err, filepath) {
                var filename = path.basename(filepath);
                if (isScript(filename)) scriptsList.push(path.basename(filepath, '.js'));
            },
            done: function (err, filelist) {
                isScriptListComplete = true;
                if (isPageListComplete) onFilesRead.apply();
            }
        });
    }
};