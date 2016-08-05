var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    glob = require('glob');

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
     * @param {String} options.srcDirectory path is relative to gulpfile
     * @param {String} options.themeDirectory path is relative to gulpfile
     * @param {String} options.writeDirectory path is relative to gulpfile
     * @param {String} options.filename
     * @param {Function} options.done
     * @param {Object} options.context
     */
    build: function (options) {
        var defaults = {
                srcDirectory: './',
                themeDirectory: './wp-content/themes/dp-*',
                writeDirectory: './wp-content/themes/dp-*/js/src/modules',
                filename: 'views.json',
                prefix: 'pages/',
                suffix: ''
            },
            scriptsList = [],
            pagesList = [],
            definedPages = [],
            isPageListComplete = false,
            isScriptListComplete = false,
            settings = _.assign({}, defaults, options);

        function onFilesRead() {
            //console.log('Finding intersection between:', scriptsList, pagesList);
            console.log('\nFinding intersection of:\nPages: %j\nScripts: %j\n', pagesList, scriptsList);
            definedPages = _.intersection(scriptsList, pagesList);
            var jsonPath = path.resolve(settings.writeDirectory, settings.filename),
                rjsFixPath = path.resolve(settings.writeDirectory, 'pages-stub.js'),
                productionPages = _.without(definedPages, 'pages/page-debug'),
                rjsFix = 'define(' + JSON.stringify(productionPages) + ', function(){});';
            fs.writeFile(jsonPath, JSON.stringify(productionPages), function () {
                console.log('Saved to %s', jsonPath);
                fs.writeFile(rjsFixPath, rjsFix, function () {
                    console.log('Saved to %s', rjsFixPath);
                    if(settings.done) settings.done.apply(settings.context);
                });
            });
        }

        glob(path.join(settings.themeDirectory, '**/*.php'), function (err, filelist) {
            if (err) throw err;
            pagesList = filelist.map(function (filename, index, arr) {
                return settings.prefix + path.parse(filename).name + settings.suffix;
            });
            isPageListComplete = true;
            if (isScriptListComplete) onFilesRead.apply();
        });
        glob(path.join(settings.srcDirectory, '**/*.js'), {
            cwd: path.resolve(process.cwd(), 'js/src/pages/')
        }, function (err, filelist) {
            if (err) throw err;
            scriptsList = filelist.map(function (filename, index, arr) {
                return settings.prefix + path.parse(filename).name + settings.suffix;
            });
            isScriptListComplete = true;
            if (isPageListComplete) onFilesRead.apply();
        });
    }
};
