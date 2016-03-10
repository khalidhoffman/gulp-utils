var window = module.exports,
    OrderProvider = function(text) {
    this._text = text;
};
OrderProvider.prototype.toString = function() {
    return this._text;
};
OrderProvider.prototype.format = function(ruleName) {
    this._text = this.formatters[ruleName](this._text);
    return this;
};
OrderProvider.prototype.formatters = {
    orderRules: require('./formatters/order-rules'),
    formatSelectorLines: require('./formatters/format-selector-lines'),
    updateZeroVal: require('./formatters/update-zero-val'),
    removeEmptyAfterbraketLine: require('./formatters/remove-empty-afterbraket-line'),
    trimLines: require('./formatters/trim-lines'),
    addLineAfterBraket: require('./formatters/add-line-after-braket'),
    removeLeadingZero: require('./formatters/remove-leading-zero'),
    lowercase: require('./formatters/lowercase')
    //addSpaceAfterPname: require('./formatters/add-space-after-pname')
};

window.formatScss = function(text) {
    var op = new OrderProvider(text);

    return op
        .format('lowercase')
        .format('orderRules')
        .format('formatSelectorLines')
        .format('updateZeroVal')
        .format('trimLines')
        .format('removeEmptyAfterbraketLine')
        .format('addLineAfterBraket')
        .format('removeLeadingZero')
        //.format('addSpaceAfterPname')
        .toString();
};