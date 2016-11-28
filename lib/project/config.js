var path = require('path'),
    util = require('util'),
    fs = require('fs'),

    _ = require("lodash"),

    jsonConfig = (function () {
        try {
            var configStr = fs.readFileSync(path.resolve(process.cwd(), 'dp-project-config.json'));
            return JSON.parse(configStr);
        } catch (err) {
            console.error(err);
            return {};
        }
    })(),

    avocodeConfig = _.defaults(jsonConfig.avocode, {
        userSelector: null,
        projectSelector: 'boilerplate'
    }),

    wordpressConfig = _.defaults(jsonConfig.wordpress, {
        dbNamePrefix: 'boilerplate_',
        dbTablePrefix: 'boilerplate',
        wpThemePrefix: 'dp-'
    }),

    projectName = jsonConfig.name || 'boilerplate',
    rootDirectory = process.cwd();

wordpressConfig.themeDir = path.join(rootDirectory, util.format('wp-content/themes/%s%s', wordpressConfig.wpThemePrefix, projectName));

var paths = {
    rootDir: rootDirectory,
    workingDir: (function () {
        switch (jsonConfig.workingDir) {
            case 'default':
                return rootDirectory;
                break;
            case 'wordpress':
                return wordpressConfig.themeDir;
                break;
            default:
                return path.normalize(jsonConfig.workingDir || rootDirectory);
                break;
        }
    })(),
    tmpDir: jsonConfig.tmp || path.resolve(rootDirectory, 'tmp/')
};

module.exports = {
    projectName: projectName,
    wordpress: wordpressConfig,
    avocode: avocodeConfig,
    paths: paths,
    raw: jsonConfig
};