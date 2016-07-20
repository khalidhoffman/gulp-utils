var path = require('path'),
    util = require('util'),

    _ = require('lodash'),

    config = require('./config'),
    projectUtils = require('../utils'),


    _config = config.raw,
    basePath = config.paths.basePath,
    tasks = {};

_.forEach(_config['tasks'], function (taskMeta) {
    tasks[taskMeta.name] = tasks[taskMeta.name] || [];
    tasks[taskMeta.name].push({
        input: path.join(basePath, taskMeta.input),
        output: (taskMeta.output) ? path.join(basePath, taskMeta.output) : false
    })
});

module.exports = tasks;