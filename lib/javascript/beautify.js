var fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    async = require('async'),
    gulp = require('gulp'),
    through2 = require('through2'),
    glob = require('glob'),
    beautifyJS = require('js-beautify'),

    project = require('../project');

function compile(onCompilationComplete, options) {
    var _options = _.defaults(
            _.isFunction(onCompilationComplete) ? options : onCompilationComplete,
            {
                tasks : project.tasks['js'],
                globSuffix : '/**/*.js',
                ignore: ["**/node_modules/**", "**/vendors/**"]
            }
        ),
        tasks = _options.tasks.map(function(taskMeta, index){
            taskMeta.suffix = taskMeta.suffix || _options.globSuffix;
            taskMeta.ignore = taskMeta.ignore || _options.ignore;
            return taskMeta;
        });


    async.each(tasks, function each(taskMeta, onGlobBeautified) {
        glob(path.join(taskMeta.input, taskMeta.suffix), {ignore: taskMeta.ignore}, function (err, fileList) {
            async.each(fileList, function each(filename, onFileBeautified) {
                fs.readFile(filename, {encoding: 'utf8'}, function (err, str) {
                    fs.writeFile(filename, beautifyJS(str), {encoding: 'utf8'}, function (err) {
                        console.log("beautified %s", filename);
                        onFileBeautified();
                    })
                });
            }, function complete() {
                onGlobBeautified();
            })
        });
    }, function complete() {
        if (onCompilationComplete.call) onCompilationComplete();
    })
}

module.exports = {
    compile: compile
};
