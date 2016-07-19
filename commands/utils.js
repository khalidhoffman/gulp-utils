var path = require('path');

module.exports = {
    buildGlob : function(arr, suffix){
        return arr.map(function(globPath){
            return path.join(globPath, suffix)
        }).join('|')
    },
    dump : function(obj) {
        return util.inspect(obj, { colors: true });
    }
}