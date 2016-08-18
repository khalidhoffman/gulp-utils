var path = require('path'),

    _ = require('lodash');
module.exports = {
    findFile : function(filename, fileList){
        var result = false,
            fileMatchRegex = new RegExp(path.sep + filename + '(.pug|.jade)?$');
        _.forEach(fileList, function (filePath, index, arr) {
            if (!result) {
                if(filePath.match(fileMatchRegex)){
                    result = filePath;
                }
            } else {
                return false;
            }
        })
        return result;
    }
}
