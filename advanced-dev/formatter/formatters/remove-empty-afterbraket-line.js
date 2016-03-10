module.exports = function(text) {
    return text.replace(/\{.*\n{2,}/gi, '{\n');
}