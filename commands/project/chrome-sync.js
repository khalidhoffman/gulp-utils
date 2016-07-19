var path = require('path'),
    server = require('http').createServer(),
    glob = require('glob'),
    io = require('socket.io')(server),
    gulp = require('gulp'),

    projectUtils = require('../utils'),
    paths = require('../paths');

io.on('connection', function(socket) {
    console.log('testing communication with chrome...');
    socket.emit('test');

    glob(path.join(paths.basePath, '/**/*.php'), {}, function(err, phpFiles) {

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
    start : function(){
        server.listen(3000);
    }
};