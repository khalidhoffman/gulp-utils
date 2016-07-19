var path = require('path'),

    _ = require('lodash'),

    wordpress = require('./wordpress'),
    dump = require('../dump'),
    config = require('./project').config,

    joinArrays = _.union, // in case we need to override with custom function

    basePath = path.normalize(config.paths.basePath || wordpress.theme.path),
    paths = {
        basePath: basePath,
        inputs: {
            pug: joinArrays(config.paths.inputs.pug, [path.resolve(basePath, 'pug/')]),
            pugjs: joinArrays(config.paths.inputs.pugjs, [path.resolve(basePath, 'js/src/modules/views/html/')]),
            js: joinArrays(config.paths.inputs.js, [path.resolve(basePath, 'js/src/')]),
            jsx: joinArrays(config.paths.inputs.jsx, [path.resolve(basePath, 'js/src/')]),
            sass: joinArrays(config.paths.inputs.sass, [path.resolve(basePath, 'sass/')]),
            less: joinArrays(config.paths.inputs.less, [path.resolve(basePath, 'less/')]),
            stylus: joinArrays(config.paths.inputs.stylus, [path.resolve(basePath, 'stylus/')])
        },
        outputs: {
            pugjs : config.paths.outputs.pugjs || path.resolve(basePath, 'js/src/modules/views/html/'),
            php : config.paths.outputs.php || basePath,
            js : config.paths.outputs.js || path.resolve(basePath, 'js/'),
            css : config.paths.outputs.css || path.resolve(basePath, 'stylesheets/'),
            tmp : config.paths.tmp || path.resolve(config.rootDirectory, 'tmp/')
        }
    };

console.log(dump(paths));

module.exports = paths;