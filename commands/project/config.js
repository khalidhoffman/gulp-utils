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
    dbNamePrefix = config.dbNamePrefix || 'boilerplate_',
    dbTablePrefix = config.dbTablePrefix || 'boilerplate',
    avocodeSelector = config.avocodeSelector || 'boilerplate',
    projectName = config.name || 'boilerplate',
    pathOverrides = {
        basePath : (config.paths && config.paths.basePath) ? config.paths.basePath : false,
        inputs : (config.paths && config.paths.inputs) ? config.paths.inputs : [],
        outputs : (config.paths && config.paths.outputs) ? config.paths.outputs :[]
    };

module.exports = {
    projectName : projectName,
    dbTablePrefix: dbTablePrefix,
    dbNamePrefix: dbNamePrefix,
    avocodeSelector : avocodeSelector,
    rootDirectory : process.cwd(),
    paths : pathOverrides
};