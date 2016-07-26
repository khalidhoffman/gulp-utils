var path = require('path'),
    util = require('util'),
    fs = require('fs'),

    config = (function(){
        try {
            var configStr = fs.readFileSync(path.resolve(process.cwd(), 'dp-project-config.json'));
            return JSON.parse(configStr);
        } catch(err){
            console.error(err);
            return {};
        }
    })(),
    dbNamePrefix = config.dbNamePrefix || 'boilerplate_',
    dbTablePrefix = config.dbTablePrefix || 'boilerplate',
    avocodeSelector = config.avocodeSelector || 'boilerplate',
    projectName = config.name || 'boilerplate',
    rootDirectory = process.cwd(),
    defaultWordPressBasePath = path.join(rootDirectory, util.format('wp-content/themes/dp-%s', projectName)),
    basePath = (function(){
        switch(config.basePath){
            case 'default':
                return process.cwd();
                break;
            case 'wordpress':
                return defaultWordPressBasePath;
                break;
            default:
                path.normalize(config.basePath || process.cwd());
                break;
        }
    })(),
    paths = {
        basePath: basePath,
        tmp : config.tmp || path.resolve(rootDirectory, 'tmp/')
    };

module.exports = {
    projectName : projectName,
    dbTablePrefix: dbTablePrefix,
    dbNamePrefix: dbNamePrefix,
    avocodeSelector : avocodeSelector,
    rootDirectory : rootDirectory,
    paths : paths,
    raw: config
};