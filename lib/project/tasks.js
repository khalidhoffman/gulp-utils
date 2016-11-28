var path = require('path'),
    util = require('util'),

    _ = require('lodash'),

    config = require('./config'),
    projectUtils = require('../utils'),


    _config = config.raw,
    inputBasePath = config.paths.workingDir,
    outputBasePath = config.paths.workingDir,
    tasks = {};

_.forEach(_config['tasks'], function (taskMeta) {
    switch (taskMeta.name) {
        case 'ftp':
            outputBasePath = '';
            break;
        default:
    }
    tasks[taskMeta.name] = tasks[taskMeta.name] || [];
    tasks[taskMeta.name].push({
        input: path.join(inputBasePath, taskMeta.input),
        output: (taskMeta.output) ? path.join(outputBasePath, taskMeta.output) : false,
        ignore: (taskMeta.ignore) ? taskMeta.ignore : false,
        options: _.defaults(taskMeta.options, {
            unfiltered: {
                input: taskMeta.input,
                output: taskMeta.output
            }
        })
    })
});
module.exports = tasks;
