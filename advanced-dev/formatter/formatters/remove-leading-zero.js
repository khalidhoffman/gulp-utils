module.exports = function(text) {
    return text.replace(/(\D)0(\.\d)/gi, function(match, c1, c2) {
        return c1+c2;
    });
};