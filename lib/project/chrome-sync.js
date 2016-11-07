var path = require('path'),
    server = require('http').createServer(),
    glob = require('glob'),
    io = require('socket.io')(server),
    gulp = require('gulp'),
    prompt = require('prompt'),
    colors = require('colors/safe'),
    _ = require('lodash'),
    async = require('async'),

    project = require('../project');

io.on('connection', function (socket) {
    var tasks = project.tasks['chrome-sync'] || [{
            input: '/**/*.php'
        }];
    console.log('testing communication with chrome...');
    socket.emit('test');


    async.each(tasks, function (taskMeta, done) {
        var _options = _.defaults(taskMeta.options, {
            tabRegex: "localhost|192.168.",
            ignoreTabRegex: "wp-admin|phpmyadmin",
            basePath: project.config.paths.basePath
        });
        glob(path.join(_options.basePath, _options.unfiltered.input), {}, function (err, files) {
            gulp.watch(files, function (evt) {
                //console.log('file change: ', evt.path);
                socket.emit('refresh', {
                    tabRegex: _options.tabRegex,
                    ignoreTabRegex: _options.ignoreTabRegex
                });
            });
        });
    });

    socket.on('event', function (data) {
        console.log('event: ', data);
    });

    socket.on('received:test', function (data) {
        console.log('successfully connected with chrome');
    });

    socket.on('disconnect', function () {
        console.warn('disconnected: ', arguments);
    });
});

module.exports = {
    start: function (done) {

        prompt.message = '';
        prompt.start();

        prompt.get({
            properties: {
                useChromeSync: {
                    description: colors.red('Use Chrome-Sync to refresh pages?'),
                    default: 'yes'
                }
            }
        }, function (err, result) {
            if (err) {
                if (done) return done(err);
            } else {
                prompt.stop();
                if (/^\s*(yes|y)\s*$/.test(result.useChromeSync)) {
                    server.listen(3000);
                    if (done) return done();
                }
            }
        });

    }
};
