module.exports = function(text) {
    return text.replace(/\}\n([^\n])/ig, function(match, capture) {
        return "}\n\n" + capture;
    });
};
