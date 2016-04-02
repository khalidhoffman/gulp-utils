var path = require('path'),
    
    wordpress = require('./wordpress'),
    config = require('./project').config,

    assetsBasePath = wordpress.theme.path;

module.exports = {
    assetsBasePath: assetsBasePath,
    css: path.resolve(assetsBasePath, 'stylesheets/'),
    jade: path.resolve(assetsBasePath, 'jade/'),
    js: path.resolve(assetsBasePath, 'js/src/'),
    sass: path.resolve(assetsBasePath, 'sass/'),
    stylus: path.resolve(assetsBasePath, 'stylus/'),
    tmp: path.resolve(config.rootDirectory, 'tmp/')
}