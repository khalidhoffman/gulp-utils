//module.exports = ((typeof jasmine != 'undefined') ? function () {} : console.log);
var _ = require('lodash'),
    history = [];

//process.stdin.resume();//so the program will not close instantly

function printLog() {
    console.log('\nlog:');
    for (var i = 0; i < history.length; i++) {
        if(_.isString(history[i][0])) history[i][0] = "\n"+history[i][0];
        console.log.apply(null, history[i]);
    }
}

function exitHandler(options, err) {
    if (options.cleanup) printLog();
    if (err) console.error(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true, exit: true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {cleanup: true,exit: true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {cleanup: true}));

module.exports = function () {
    if(history.length < 100){
        history.push(arguments);
    } else {
        history.pop();
        history.unshift(arguments);
    }
};
