var path = require('path'),
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
    dbNamePrefix = config.prefix || 'boilerplate_',
    dbPrefix = config.prefix || 'boilerplate',
    avocodeSelector = config.avocodeSelector || 'boilerplate',
    projectName = config.name || 'boilerplate';

module.exports = {
    projectName : projectName,
    prefix: dbPrefix,
    dbNamePrefix: dbNamePrefix,
    avocodeSelector : avocodeSelector,
    rootDirectory : process.cwd()
};