var path = require('path'),
    fs = require('fs'),
    util = require('util'),
    
    request = require('request'),

    project = require('../project'),
    config = project.config,
    themeDirectory = config.wordpress.themeDir,
    dbTablePrefix = config.wordpress.dbTablePrefix;

function initWPConfig(done) {
    var wpConfigPath = path.resolve(config.paths.rootDir, 'wp-config.php');
    fs.readFile(wpConfigPath, function(err, data) {
        var databaseRegex = /database_name_here/,
            saltRegex = /\/\/SALT_KEYS_HERE/,
            tablePrefixRegex = /prefix_/,
            saltContent = String(data);
        saltContent = saltContent.replace(databaseRegex, config.wordpress.dbNamePrefix + config.projectName.toLocaleLowerCase());
        saltContent = saltContent.replace(tablePrefixRegex, dbTablePrefix + '_');
        request({
            url: 'https://api.wordpress.org/secret-key/1.1/salt/',
            method: 'GET'
        }, function(error, response, body) {
            if (response.statusCode == 200) {
                saltContent = saltContent.replace(saltRegex, body);
                fs.writeFile(wpConfigPath, saltContent, function(err) {
                    if (err) throw err;
                    console.log('successfully updated %s', wpConfigPath);
                    if(done) done();
                });
            } else {
                console.error('received: %s\nerror: %s', body, response.statusCode);
                if(done) done();
            }
        });
    });
}



module.exports = {
    root: config.rootDirectory,
    theme: {
        path: themeDirectory
    },
    init : initWPConfig
};
