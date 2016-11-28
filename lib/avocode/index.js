var util = require('util'),
    fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    prompt = require('prompt'),
    async = require('async'),
    Q = require('q'),

    config = require('../project').config,
    AvocodeProjectToolkit = require('avocode-toolkit'),

    defaultProjectName = config.avocode ? config.avocode.projectSelector : false;

function init() {
    return new Q.Promise(function (resolve, reject) {
        var promptConfig = {
            userName: {
                properties: {
                    userName: {
                        type: 'string',
                        description: 'Avocode user full name:',
                        required: false
                    }

                }
            },
            projectName: {
                properties: {
                    projectName: {
                        type: 'string',
                        description: 'AvocodeProject project name:',
                        required: false,
                        default: defaultProjectName
                    }
                }
            }
        };

        fs.readFile(path.join(process.cwd(), 'avocode.config.json'), function (err, configText) {
            var localConfig = {};
            if (err) {
                console.error(err.toString());
            } else {
                localConfig = JSON.parse(configText)
            }

            var defaults = {
                    projectName: config.avocode ? config.avocode.projectSelector : null,
                    userName: config.avocode ? config.avocode.userSelector : null
                },
                avcdConfig = _.defaults(localConfig, defaults);

            async.eachOf(avcdConfig, function (configVal, configPropName, done) {
                if (!avcdConfig[configPropName]) {
                    prompt.start();
                    prompt.get(promptConfig[configPropName], function (err, result) {
                        prompt.stop();
                        avcdConfig[configPropName] = result[configPropName];
                        done();
                    });
                } else {
                    done();
                }
            }, function complete() {
                var avcdProject = new AvocodeProjectToolkit(avcdConfig['projectName'], {
                    userName: avcdConfig['userName']
                });
                console.log('loading %s', avcdConfig['projectName']);
                avcdProject.autofill({
                    done: function (colors, fonts) {
                        console.log('done loading %s', avcdConfig['projectName']);
                        resolve();
                    }
                })
            });

        });
    });
}

module.exports = {
    init: init
};