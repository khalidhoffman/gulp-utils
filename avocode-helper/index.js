var fs = require('fs'),
    path = require('path'),
    backbone = require('backbone'),
    cachePath = path.resolve(__dirname, '.cache');

function Avocode(){

    fs.access(cachePath, fs.W_OK, function(err){
        if(err) throw err;

        fs.mkdir(cachePath, function(err, file){
            if(err) throw err;
        })
    });

}

/**
 *
 * @param {Object} options
 * @param {String} options.value
 * @param {String} options.name
 */
Avocode.prototype.addColor  = function(options){

};

/**
 *
 * @param {Object} options
 * @param {String} options.regex
 * @param {String} options.replacement
 */
Avocode.prototype.addRegex = function(options){

};

/**
 *
 */
Avocode.prototype.backup = function(){

};

/**
 *
 * @param {String} restoreFilePath
 */
Avocode.prototype.restore = function(restoreFilePath){

};

module.exports = {

};