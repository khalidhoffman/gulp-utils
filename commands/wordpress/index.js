var path = require('path'),
    fs = require('fs'),
    util = require('util'),
    request = require('request'),
    config = require('../project/config'),
    themeDirectory = path.join(config.rootDirectory, util.format('wp-content/themes/dp-%s', config.projectName)),
    dbPrefix = 'chcf';

function initWPConfig() {
    var wpConfigPath = path.resolve(config.rootDirectory, 'wp-config.php');
    fs.readFile(wpConfigPath, function(err, data) {
        var databaseRegex = /database_name_here/,
            saltRegex = /\/\/SALT_KEYS_HERE/,
            prefixRegex = /prefix_/,
            saltContent = String(data);
        saltContent = saltContent.replace(databaseRegex, 'hugoazz_' + config.projectName.toLocaleLowerCase());
        saltContent = saltContent.replace(prefixRegex, dbPrefix + '_');
        request({
            url: 'https://api.wordpress.org/secret-key/1.1/salt/',
            method: 'GET'
        }, function(error, response, body) {
            if (response.statusCode == 200) {
                saltContent = saltContent.replace(saltRegex, body);
                fs.writeFile(wpConfigPath, saltContent, function(err) {
                    if (err) throw err;
                    console.log('successfully updated %s', wpConfigPath);
                });
            } else {
                console.error('received: %s\nerror: %s', body, response.statusCode);
            }
        });
    });
}



module.exports = {
    root: config.rootDirectory,
    dbPrefix: dbPrefix,
    theme: {
        path: themeDirectory,
        paths: {
            css: path.resolve(themeDirectory, 'stylesheets/'),
            jade: path.resolve(themeDirectory, 'jade/'),
            js: path.resolve(themeDirectory, 'js/src/'),
            sass: path.resolve(themeDirectory, 'sass/'),
            stylus: path.resolve(themeDirectory, 'stylus/'),
            tmp: path.resolve(config.rootDirectory, 'tmp/')
        }
    },
    init : initWPConfig
};
