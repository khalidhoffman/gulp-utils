module.exports = function(text) {
    var $ = require('../../jquery');
    return text.replace(/.+/gi, function(match) {
        return $.trim(match);
    });
}