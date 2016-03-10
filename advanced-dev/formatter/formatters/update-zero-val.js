module.exports = function(text) {
    return text.replace(/\D0(px|em|rm|%);/gi, function(match, capture) {
        return "$10;";
    });
};