var path = require('path'),
    util = require('util'),

    _ = require('lodash'),

    config = require('./config'),
    projectUtils = require('../utils'),


    _config = require('./config').raw,
    defaultBasePath = path.join(config.rootDirectory, util.format('wp-content/themes/dp-%s', config.projectName)),
    basePath = (_config['basePath'] && _config['basePath'] == 'default') ? defaultBasePath : _config['basePath'] || '/',
    tasks = {};


_.forEach(_config['tasks'], function (taskMeta) {
    tasks[taskMeta.name] = tasks[taskMeta.name] || [];
    tasks[taskMeta.name].push({
        input: path.join(basePath, taskMeta.input),
        output: (taskMeta.output) ? path.join(basePath, taskMeta.output) : false
    })
});

module.exports = tasks;