var _ = require('lodash'),
    util = require('util');

/**
 *
 * @param data
 * @param callback
 * @param [options]
 * @param {Boolean} options.useLib whether to use block, element, modifier mixins
 * @returns {*}
 */
function BemRenderer(options) {
    var self = this,
        _options = _.defaults(options, {
            useLib: false,
            rootSelector: 'page-content',
            stylusEmptyText: '//',
            tabSize: 2
        });

    this.depth = 0;
    this._buffer = '';
    this.stylusText = '';

    this.buffer = function (str) {
        return this._buffer += str;
    };

    /**
     *
     * @param {Number} charCount
     * @returns {String}
     */
    this.popBuffer = function (charCount) {
        if (charCount) {
            return this._buffer = this._buffer.substr(0, this._buffer.length - charCount)
        }
        return this._buffer = '';
    };

    this.print = function () {
        this.stylusText += this._buffer;
        this.popBuffer();
    };

    this.indent = function (depth) {
        var _depth = depth || this.depth,
            _tab = '',
            tabSize = _options.tabSize;
        for (var i = 0; i < _depth * tabSize; i++) {
            _tab += ' ';
        }
        return this.buffer(_tab);
    };

    this.increaseIndent = function (depth) {
        this.depth = (depth || this.depth) + 1;
    };

    this.decreaseIndent = function (depth) {
        this.depth = (depth || this.depth) - 1;
    };

    this.selector = function (selector) {
        return this.buffer(selector);
    };

    this.emptyText = function () {
        return this.buffer(_options.stylusEmptyText);
    };

    this.block = function (selector) {
        return this.buffer(util.format(_options.useLib ? "+block('%s')" : ".%s", selector));
    };

    this.modifier = function (selector) {
        return this.buffer(util.format(_options.useLib ? "+mod('%s')" : "\&--%s", selector));
    };

    this.element = function (selector) {
        return this.buffer(util.format(_options.useLib ? "+element('%s')" : "\&__%s", selector));
    };

    this.modElement = function (selector) {
        return this.buffer(util.format(_options.useLib ? "+mod-element('%s')" : "\&__%s", selector));
    };


    this.newLine = function () {
        var _newLine = "\n";
        return this.buffer(_newLine);
    };

    this.deleteLine = function () {
        this._buffer = this._buffer.replace(/\n.*$/, '');
        return this._buffer;
    };

    this.isRoot = function () {
        return this.depth == 0;
    };

    this.isCustomRoot = function (bemNode) {
        return this.depth == 0 && bemNode.name == _options.rootSelector && bemNode.modifiers.length > 0;
    };

    this.reset = function () {
        this.depth = 0;
        this.popBuffer();
    };

    this.printElements = function (elements) {
        var isModElements = depth > 2,
            self = this;
        if (elements.length == 0) {
            self.emptyText();
            self.newLine();
            self.indent();
            return
        }

        // if not using BEM mixins, add selector to reset `&` selector to block
        if (isModElements && !_options.useLib) {
            self.selector('& ^[-2..-2]');
            self.newLine();
            self.increaseIndent();
            self.indent();
        }

        _.forEachRight(elements, function (selector) {
            if (isModElements) {
                self.modElement(selector)
            } else {
                self.element(selector);
            }

            self.newLine();
            self.increaseIndent();
            self.indent();

            self.emptyText();

            self.newLine();
            self.decreaseIndent();
            self.indent();
        });

        // pop indentation of `&` reset selector
        if (isModElements && !_options.useLib) {
            self.deleteLine();
            self.newLine();
            self.decreaseIndent();
            self.indent();
        }
    };

    this.render = function (bemData, callback) {

        _.forEach(bemData, function (bemNode) {
            var isRoot = false;
            if (self.isCustomRoot(bemNode)) {
                var rootBemNodeName = util.format('%s--%s', bemNode.name, bemNode.modifiers.splice(0, 1));
                self.block(rootBemNodeName);
                self.newLine();
                self.increaseIndent();
                self.indent();
                isRoot = true;
            } else if (self.isRoot()) {
                self.block(bemNode.name);
                self.newLine();
                self.increaseIndent();
                self.indent();
                isRoot = true;
            } else {
                self.block(bemNode.name);
                self.newLine();
                self.increaseIndent();
                self.indent();
            }

            self.printElements(bemNode.elements);

            _.forEachRight(bemNode.modifiers, function (selector) {
                self.modifier(selector);

                self.newLine();
                self.increaseIndent();
                self.indent();

                self.printElements(bemNode.elements);

                self.deleteLine();
                self.newLine();
                self.decreaseIndent();
                self.indent();
            });

            if (!isRoot) {
                self.deleteLine();
                self.newLine();
                self.decreaseIndent();
                self.indent();
            }
            self.print();
        });

        if (callback) callback.call(null, this.stylusText);
        return this.stylusText;
    };

    return this;
}

module.exports = BemRenderer;
