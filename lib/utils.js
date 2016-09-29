var util = require('util'),
    path = require('path');

module.exports = {
    buildGlob: function (arr, suffix) {
        if (!arr) throw new Error('Task w/ suffix ' + suffix + ' is not defined');
        if (arr.length == 1) {
            return path.join(arr[0], suffix);
        } else {
            return "/{" + arr.map(function (globPath) {
                    return path.join(globPath, suffix)
                }).join(',') + "}"
        }
    },
    buildGlobArray: function (arr, suffix) {
        if (!arr) throw new Error('Task w/ suffix ' + suffix + ' is not defined');
        if (arr.length == 1) {
            return path.join(arr[0].input, suffix);
        } else {
            return arr.map(function (taskMeta) {
                    return path.join(taskMeta.input, suffix)
                })
        }
    },
    dump: function (obj) {
        return util.inspect(obj, {colors: true});
    }
}