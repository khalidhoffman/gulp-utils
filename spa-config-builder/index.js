var through = require('through2'),    // npm install --save through2
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    Walker = require('../fs-walk');

/**
 *
 * @param {String} fileName
 * @returns {boolean}
 */
function isScript(fileName) {
    var jsRegex = /.*\.js$/;
    return jsRegex.test(fileName);
}

/**
 *
 * @param {String} fileName
 * @returns {boolean}
 */
function isPHP(fileName) {
    var phpRegex = /.*\.php$/;
    return phpRegex.test(fileName);
}

module.exports = {
    /**
     *
     * @param {Object} options
     * @param {String} [options.projectName]
     * @param {String} [options.srcDirectory] Directory of javascript views. These should match the appropriate theme files
     * @param {String} [options.themeDirectory] Directory of WordPress themes files. These should match the appropriate javascript view filename
     * @param {String} [options.filename='views.json']  for legacy support
     * @param {String} [options.stubFilename='pages-stub.js']   filename of requirejs javascript file to server as a stub for all dynamic views so that requirejs includes them during compilation
     * @param {String} [options.debugModuleName='pages-debug']  requirejs module name to ignore. This is used to prevent a debug module from being included in a production build
     * @param {Object} [options.context]
     */
    build: function (options) {
        var _options = _.extend({
                context: null,
                srcDirectory: path.resolve('src/', 'pages'),
                themeDirectory: path.resolve('wp-content/themes/', (options && options.projectName) ? options.projectName : 'dp-boilerplate/'),
                writeDirectory: path.resolve('src/', 'modules/'),
                filename: 'views.json',
                stubFilename: 'pages-stub.js',
                debugModuleName: 'page-debug'
            }, options),
            scriptsList = [],
            pagesList = [],
            definedModules = [],
            isPageListComplete = false,
            isScriptListComplete = false;

        function onFileScanComplete() {
            //console.log('Finding intersection between:', scriptsList, pagesList);
            console.log('Finding intersection...');
            definedModules = _.intersection(scriptsList, pagesList);
            var jsonPath = path.resolve(_options.writeDirectory, _options.filename),
                rjsFixPath = path.resolve(_options.writeDirectory, _options.stubFilename),
                productionPages = _.without(definedModules, _options.debugModuleName);

            productionPages = productionPages.map(function (pageName) {
                return 'pages/' + pageName
            });
            var rjsFixOutput = 'define(' + JSON.stringify(productionPages) + ', function(){});';
            fs.writeFile(jsonPath, JSON.stringify(productionPages), function () {
                console.log('Saved to ' + jsonPath);
            });
            fs.writeFile(rjsFixPath, rjsFixOutput, function () {
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
                if (isScriptListComplete) onFileScanComplete.apply(_options.context, fileList);
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
                if (isPageListComplete) onFileScanComplete.apply(_options.context, fileList);
            }
        });
    }
};