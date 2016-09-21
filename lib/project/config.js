var path = require('path'),
    util = require('util'),
    fs = require('fs'),

    jsonConfig = (function(){
        try {
            var configStr = fs.readFileSync(path.resolve(process.cwd(), 'dp-project-config.json'));
            return JSON.parse(configStr);
        } catch(err){
            console.error(err);
            return {};
        }
    })(),
    dbNamePrefix = jsonConfig.dbNamePrefix || 'boilerplate_',
    dbTablePrefix = jsonConfig.dbTablePrefix || 'boilerplate',
    avocodeSelector = jsonConfig.avocodeSelector || 'boilerplate',
    projectName = jsonConfig.name || 'boilerplate',
    rootDirectory = process.cwd(),
    wpThemePrefix = (jsonConfig.wordpressThemePrefix == null || jsonConfig.wordpressThemePrefix == undefined) ? 'dp-' : jsonConfig.wordpressThemePrefix,
    getWordPressBasePath = function(){
        return  path.join(rootDirectory, util.format('wp-content/themes/%s%s', wpThemePrefix, projectName));
    },
    basePath = (function(){
        switch(jsonConfig.basePath){
            case 'default':
                return process.cwd();
                break;
            case 'wordpress':
                return getWordPressBasePath();
                break;
            default:
                path.normalize(jsonConfig.basePath || process.cwd());
                break;
        }
    })(),
    paths = {
        basePath: basePath,
        tmp : jsonConfig.tmp || path.resolve(rootDirectory, 'tmp/')
    };

module.exports = {
    projectName : projectName,
    dbTablePrefix: dbTablePrefix,
    dbNamePrefix: dbNamePrefix,
    wpThemePrefix: wpThemePrefix,
    avocodeSelector : avocodeSelector,
    rootDirectory : rootDirectory,
    paths : paths,
    raw: jsonConfig,
    getWordPressBasePath : getWordPressBasePath
};