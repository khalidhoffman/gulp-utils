var orderContent = require('./order-rule-content');
var bracketRegex = /\{([^\{\}]+);/ig;

module.exports = function (text) {
    return text.replace(bracketRegex, function (match, capture) {
            return "{\n" +
                orderContent(capture)
                    .map(function (el) {
                        if(el && el[el.length-1] !== ';') {
                            el += ';';
                        }

                        return el;
                    })
                    .join('\n');
        }
    );
};