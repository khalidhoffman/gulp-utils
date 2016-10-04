var _ = require('lodash'),
    util = require('util'),

    SelectorTemplate = require('./selector-template');

/**
 *
 * @param [options]
 * @param {String} options.selectorStyle method to use for block, element, modifier mixins. options include ('default', 'lib', 'stylus-bem')
 * @returns {*}
 */
function BemRenderer(options) {
    var self = this,
        _options = _.defaults(options, {
            selectorStyle: 'default',
            rootSelector: 'page-content',
            stylusEmptyText: 'empty()',
            tabSize: 2
        });

    this.templates = {
        block : SelectorTemplate.Block(_options.selectorStyle),
        mod : SelectorTemplate.Mod(_options.selectorStyle),
        element: SelectorTemplate.Element(_options.selectorStyle),
        modElement: SelectorTemplate.ModElement(_options.selectorStyle)
    };

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

    this.increaseIndentAmount = function (depth) {
        this.depth = (depth || this.depth) + 1;
    };

    this.decreaseIndentAmount = function (depth) {
        this.depth = (depth || this.depth) - 1;
    };

    this.selector = function (selector) {
        return this.buffer(selector);
    };

    this.emptyText = function () {
        return this.buffer(_options.stylusEmptyText);
    };

    this.block = function (selector) {
        return this.buffer(util.format(this.templates.block, selector));
    };

    this.modifier = function (selector) {
        return this.buffer(util.format(this.templates.mod, selector));
    };

    this.element = function (selector) {
        return this.buffer(util.format(this.templates.element, selector));
    };

    this.modElement = function (selector) {
        return this.buffer(util.format(this.templates.modElement, selector));
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
        if (isModElements && _options.selectorStyle == 'default') {
            self.selector('& ^[-2..-2]');
            self.newLine();
            self.increaseIndentAmount();
            self.indent();
        }

        _.forEachRight(elements, function (selector) {
            if (isModElements) {
                self.modElement(selector)
            } else {
                self.element(selector);
            }

            self.newLine();
            self.increaseIndentAmount();
            self.indent();

            self.emptyText();

            self.newLine();
            self.decreaseIndentAmount();
            self.indent();
        });

        // pop indentation of `&` reset selector
        if (isModElements && _options.selectorStyle == 'default') {
            self.deleteLine();
            self.newLine();
            self.decreaseIndentAmount();
            self.indent();
        }
    };

    this.render = function (bemData, callback) {

        _.forEach(bemData, function (bemNode) {
            var isRoot = false;
            if (self.isCustomRoot(bemNode)) {
                var rootBemTemplate = (_options.selectorStyle == 'stylus-bem') ? '%s/--%s' : '%s--%s',
                    rootBemNodeName = util.format(rootBemTemplate, bemNode.name, bemNode.modifiers.splice(0, 1));
                self.block(rootBemNodeName);
                self.newLine();
                self.increaseIndentAmount();
                self.indent();
                isRoot = true;
            } else if (self.isRoot()) {
                self.block(bemNode.name);
                self.newLine();
                self.increaseIndentAmount();
                self.indent();
                isRoot = true;
            } else {
                self.block(bemNode.name);
                self.newLine();
                self.increaseIndentAmount();
                self.indent();
            }

            self.printElements(bemNode.elements);

            _.forEachRight(bemNode.modifiers, function (selector) {
                self.modifier(selector);

                self.newLine();
                self.increaseIndentAmount();
                self.indent();

                self.printElements(bemNode.elements);

                self.deleteLine();
                self.newLine();
                self.decreaseIndentAmount();
                self.indent();
            });

            if (!isRoot) {
                self.deleteLine();
                self.newLine();
                self.decreaseIndentAmount();
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
