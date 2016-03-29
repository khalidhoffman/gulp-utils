var path = require('path'),
    fs = require('fs'),

    config = (function(){
        try {
            var configStr = fs.readFileSync(path.resolve(process.cwd(), 'dp-project.config'));
            return JSON.parse(configStr);
        } catch(err){
            console.error(err);
            return {};
        }
    }),
    dbPrefix = config.prefix || 'boilerplate',
    projectName = config.name || 'boilerplate';

module.exports = {
    projectName : projectName,
    prefix: dbPrefix,
    rootDirectory : process.cwd()
};