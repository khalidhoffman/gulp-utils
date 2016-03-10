var selectorRegex = /(.+)\{/g,
    $ = require('../../jquery');

module.exports = function(text) {
    return text.replace(selectorRegex, function(match, capture) {
        return capture.split(', ').map(function(s) {
            return $.trim(s);
        }).join(",\n") + " {";
    });
};