var path = require('path'),
    util = require('util'),

    _ = require('lodash'),

    config = require('./config'),
    projectUtils = require('../utils'),


    _config = config.raw,
    inputBasePath = config.paths.workingDir,
    outputBasePath = config.paths.workingDir,
    tasks = _.reduce(_config['tasks'], function (tasksCollection, taskMeta) {
        switch (taskMeta.name) {
            case 'ftp':
                outputBasePath = '';
                break;
            default:
                outputBasePath = config.paths.workingDir;
        };
        tasksCollection[taskMeta.name] = tasksCollection[taskMeta.name] || [];
        tasksCollection[taskMeta.name].push({
            ignore: (taskMeta.ignore) ? taskMeta.ignore : false,
            input: path.join(inputBasePath, taskMeta.input),
            output: (taskMeta.output) ? path.join(outputBasePath, taskMeta.output) : false,
            options: _.defaults(taskMeta.options, {
                unfiltered: {
                    input: taskMeta.input,
                    output: taskMeta.output
                }
            })
        });
        return tasksCollection;
    }, {});

module.exports = tasks;
