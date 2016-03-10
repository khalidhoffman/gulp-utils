module.exports = function(text) {
    return text.replace(/(.+)[\{:,]/g, function(match, capture) {
        return match.toLowerCase();
    });
};