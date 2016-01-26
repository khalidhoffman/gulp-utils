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
    /**
     *
     * @param {Object} options
     * @param {String} [options.projectName]
     * @param {String} [options.srcDirectory]
     * @param {String} [options.themeDirectory]
     * @param {String} [options.filename='views.json']
     * @param {Object} [options.context]
     */
    build: function (options) {
        var _options = _.extend({
                srcDirectory: path.resolve('src/', 'pages'),
                themeDirectory: path.resolve('wp-content/themes/', (options && options.projectName) ? options.projectName : 'dp-boilerplate/'),
                writeDirectory: path.resolve('src/', 'modules/'),
                filename: 'views.json'
            }, options),
            scriptsList = [],
            pagesList = [],
            definedPages = [],
            isPageListComplete = false,
            isScriptListComplete = false;

        function onFilesRead() {
            //console.log('Finding intersection between:', scriptsList, pagesList);
            console.log('Finding intersection...');
            definedPages = _.intersection(scriptsList, pagesList);
            var jsonPath = path.resolve(_options.writeDirectory, _options.filename),
                rjsFixPath = path.resolve(_options.writeDirectory, 'pages-stub.js'),
                productionPages = _.without(definedPages, 'page-debug');

            productionPages = productionPages.map(function (pageName) {
                return 'pages/' + pageName
            });
            var rjsFix = 'define(' + JSON.stringify(productionPages) + ', function(){});';
            fs.writeFile(jsonPath, JSON.stringify(productionPages), function () {
                console.log('Saved to ' + jsonPath);
            });
            fs.writeFile(rjsFixPath, rjsFix, function () {
                console.log('Saved to ' + jsonPath);
            });
        }

        Walker.recursePath(_options.themeDirectory, {
            each: function (err, filepath) {
                if (err) throw err;
                var filename = path.basename(filepath);
                if (isPHP(filename)) pagesList.push(path.basename(filepath, '.php'));
            },
            done: function (err, fileList) {
                if (err) throw err;
                isPageListComplete = true;
                if (isScriptListComplete) onFilesRead.apply(_options.context, fileList);
            }
        });
        Walker.recursePath(_options.srcDirectory, {
            each: function (err, filepath) {
                if (err) throw err;
                var filename = path.basename(filepath);
                if (isScript(filename)) scriptsList.push(path.basename(filepath, '.js'));
            },
            done: function (err, fileList) {
                if (err) throw err;
                isScriptListComplete = true;
                if (isPageListComplete) onFilesRead.apply(_options.context, fileList);
            }
        });
    }
};