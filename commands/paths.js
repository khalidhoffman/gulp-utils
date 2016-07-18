var path = require('path'),
    
    wordpress = require('./wordpress'),
    config = require('./project').config,

    assetsBasePath = path.normalize(config.paths.assestsBasePath || wordpress.theme.path);

module.exports = {
    assetsBasePath: assetsBasePath,
    css: path.normalize(config.paths.css || path.resolve(assetsBasePath, 'stylesheets/')),
    jade: path.normalize(config.paths.jade || path.resolve(assetsBasePath, 'jade/')),
    js: path.normalize(config.paths.js || path.resolve(assetsBasePath, 'js/src/')),
    sass: path.normalize(config.paths.sass || path.resolve(assetsBasePath, 'sass/')),
    less: path.normalize(config.paths.less || path.resolve(assetsBasePath, 'less/')),
    stylus: path.normalize(config.paths.stylus || path.resolve(assetsBasePath, 'stylus/')),
    php : path.normalize(config.paths.php || assetsBasePath),
    tmp: path.normalize(config.paths.tmp || path.resolve(config.rootDirectory, 'tmp/'))
};