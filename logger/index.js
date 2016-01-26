//module.exports = ((typeof jasmine != 'undefined') ? function () {} : console.log);
var _ = require('lodash'),
    history = [];

//process.stdin.resume();//so the program will not close instantly

function printLog(){
   for(var i = 0; i < history.length; i++){
       console.log.apply(null, history[i]);
   }
}

function exitHandler(options, err) {
    printLog();
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true, exit:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

module.exports = function () {
    history.push(arguments);
};
