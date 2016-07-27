var fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    async = require('async'),
    FTPSync = require('ftp-sync'),
    gulp = require('gulp'),

    project = require('../project');

function ftpSync(onSyncComplete){
    fs.readFile(path.resolve(process.cwd(), 'dp-ftp-config.json'), {encoding: 'utf8'}, function(err, ftpConfigSrc){
        if (err) throw err;
        var ftpConfig = JSON.parse(ftpConfigSrc);

        async.each(project.tasks['ftp'], function each(taskMeta, done) {
            var ftpSync = new FTPSync(_.extend(ftpConfig, {
                local : taskMeta.input,
                remote : taskMeta.output
            }));
            ftpSync.start(function(){
                done()
            })
        }, function complete() {
            onSyncComplete()
        });
    })

}

module.exports = {
    sync : ftpSync
};