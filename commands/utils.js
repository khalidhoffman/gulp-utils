var util = require('util'),
    path = require('path');

module.exports = {
    buildGlob: function (arr, suffix) {
        if (arr.length == 1) {
            return path.join(arr[0], suffix);
        } else {
            return "/{" + arr.map(function (globPath) {
                    return path.join(globPath, suffix)
                }).join(',') + "}"
        }
    },
    dump: function (obj) {
        return util.inspect(obj, {colors: true});
    }
}