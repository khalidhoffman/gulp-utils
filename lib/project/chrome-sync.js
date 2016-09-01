var path = require('path'),
    server = require('http').createServer(),
    glob = require('glob'),
    io = require('socket.io')(server),
    gulp = require('gulp'),
    prompt = require('prompt'),
    colors = require('colors/safe'),

    projectUtils = require('../utils'),
    project = require('../project');

io.on('connection', function(socket) {
    console.log('testing communication with chrome...');
    socket.emit('test');

    glob(path.join(project.config.paths.basePath, '/**/*.php'), {}, function(err, phpFiles) {

        gulp.watch(phpFiles, function(evt) {
            //console.log('file change: ', evt.path);
            socket.emit('refresh');
        });

    });

    socket.on('event', function(data) {
        console.log('event: ', data);
    });

    socket.on('received:test', function(data) {
        console.log('successfully connected with chrome');
    });

    socket.on('disconnect', function() {
        console.warn('disconnected: ', arguments);
    });
});

module.exports = {
    start : function(done){

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
            if (err){
                if(done) return done(err);
            } else {
                prompt.stop();
                if (/^\s*(yes|y)\s*$/.test(result.useChromeSync)){
                    server.listen(3000);
                    if(done) return done();
                }
            }
        });
        
    }
};
