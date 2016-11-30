#!/usr/bin/env node

var path = require('path'),
    fs = require('fs'),

    prompt = require('prompt'),
    colors = require("colors/safe");

fs.readFile(path.resolve(__dirname, '../', '_gulpfile.js'), {encoding: 'utf8'}, function (err, gulpSrc) {
    if (err) throw err;
    fs.writeFile(path.resolve(process.cwd(), 'gulpfile.js'), gulpSrc, function (err) {
        if (err) throw err;
    })
});

prompt.message = '';
prompt.start();
prompt.get({
    properties: {
        isMainConfigOverwrite: {
            description: colors.red('Create a new dp-project-config.json file?'),
            default: (function () {
                try {
                    fs.accessSync(path.join(process.cwd(), 'dp-project-config.json'));
                    return 'no';
                } catch (err) {
                    return 'yes';
                }
            })()
        },
        isFTPConfigOverwrite: {
            description: colors.red('Create a new dp-ftp-config.json file? (necessary for ftp tasks)'),
            default: 'no'
        }
    }
}, function (err, result) {
    prompt.stop();
    if (err) throw err;
    if (/^\s*(yes|y)\s*$/.test(result.isMainConfigOverwrite)) {
        fs.readFile(path.resolve(__dirname, '../', '_dp-project-config.json'), {encoding: 'utf8'}, function (err, configSrc) {
            if (err) throw err;
            fs.writeFile(path.resolve(process.cwd(), 'dp-project-config.json'), configSrc, function (err) {
                console.log('created new dp-project-config.json file.');
                if (err) throw err;
            })
        });
    }
    if (/^\s*(yes|y)\s*$/.test(result.isFTPConfigOverwrite)) {
        require('child_process').exec("dp-ftp-setup");
        console.log('created new dp-ftp-config.json file.');
    }
});
