var util = require('util'),
    fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    prompt = require('prompt'),
    Q = require('q'),

    dump = require('../../dump'),
    config = require('../project').config,
    AvocodeProject = require('../../avocode-helper'),

    defaultDocsPath = path.resolve(process.env.HOME, '.avocode/userdata/25347/documents/'),
    defaultProjectName = config.avocodeSelector;

function init() {
    return new Q.Promise(function (resolve, reject) {
        var promptConfig = {
            properties: {
                projectName: {
                    type: 'string',
                    description: 'Avocode project name:',
                    required: false,
                    default: defaultProjectName
                },
                docLocation: {
                    type: 'string',
                    description: 'location for Avocode documents:',
                    required: false,
                    default: defaultDocsPath
                }
            }
        };

        fs.access(defaultDocsPath, fs.W_OK, function (err) {
            if (err || !defaultProjectName || defaultProjectName == 'boilerplate') {
                prompt.start();
                prompt.get(promptConfig, function (err, result) {
                    prompt.stop();
                    initAvocode(result['projectName'], result['docLocation']);
                });
            } else {
                initAvocode(defaultProjectName, defaultDocsPath);
            }
        });

        function initAvocode(projectName, docsPath) {
            console.log('loading %s @ %s', projectName, docsPath);
            var avcdProject = new AvocodeProject(projectName.toString());
            avcdProject.parse({
                done: function (colors, fonts) {
                    var tempPath = path.resolve(process.cwd(), 'tmp/');
                    try{
                        fs.mkdirSync(tempPath);
                    } catch(e){
                        // ignore if folder exists
                    }
                    fs.writeFile(path.resolve(tempPath, 'avcd.colors.parsed.json'),
                        JSON.stringify(colors),
                        {encoding: 'utf8'},
                        function (err) {
                            if (err) {
                                reject();
                            } else {

                                fs.writeFile(path.resolve(tempPath, 'avcd.fonts.parsed.json'),
                                    JSON.stringify(fonts),
                                    {encoding: 'utf8'},
                                    function (err) {
                                        if (err) {
                                            reject(err);
                                        } else {

                                            avcdProject.save(function (err) {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resolve();
                                                }
                                            });
                                        }
                                    });
                            }
                        });
                }
            });
        }
    });
}

module.exports = {
    init: init
};