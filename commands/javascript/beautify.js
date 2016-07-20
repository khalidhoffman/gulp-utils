var fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    async = require('async'),
    gulp = require('gulp'),
    through2 = require('through2'),
    glob = require('glob'),
    beautifyJS = require('js-beautify'),

    project = require('../project');

function compile(onCompilationComplete) {

    async.each(project.tasks['js'], function each(taskMeta, onGlobBeautified) {
        glob(path.join(taskMeta.input, '/!(vendors|node_modules)/**/*.js'), function (err, fileList) {
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
        onCompilationComplete();
    })
}

module.exports = {
    compile: compile
};
