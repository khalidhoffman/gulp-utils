var Backbone = require('backbone'),
    _ = require('lodash'),
    lex = require('pug-lexer'),
    parse = require('pug-parser'),
    compileFuncBuilder = require('pug-code-gen'),
    path = require('path'),
    logger = require('../../../../../logger'),
    DOMDiff = require('diff-dom'),
    domDiff = new DOMDiff(),
    cheerio = require('cheerio'),
    cssParser = require('css-what'),
    SassCache = Backbone.Model.extend({

        initialize: function () {
            this.$ = cheerio.load("<div id='root'></div>");
            this.$root = this.$('#root').append("<div id='main'></div>");
            //this._printDOM();
            return this;
        },

        /**
         *
         * @param {String} selector
         * @param {Object} [options]
         * @param {Boolean} [options.isEntireSelector = false]
         * @returns {boolean}
         */
        contains: function (selector, options) {
            var _options = _.extend({
                    isEntireSelector: false
                }, options),
                baseSelector = (_options.isEntireSelector) ? this._parseSelector(selector).join(' ') : this._parseSelector(selector)[0],
                result = this.$root.find(baseSelector);
            return (result != null && typeof result != 'undefined' && result.length > 0);
        },

        /**
         *
         * @param {String} selector
         * @param {Object} [options]
         * @param {String} [options.rootSelector='#main']
         * @param {Number} [options.parentLevel= 0] How many levels above match should be returned as parent
         * @returns {String}
         */
        get$parentSelector: function (selector, options) {

            var _options = _.extend({
                    rootSelector: '#main',
                    parentLevel: 0
                }, options),
                selectorNodes = this._parseSelector(selector),
                nestDepth = selectorNodes.length,
                foundSelector = _options.rootSelector,
                resultSelector = '';
            for (var i = 0; i < (nestDepth - _options.parentLevel); i++) {
                // compile selectors from most specific to most general
                resultSelector = '';
                for (var j = 0; j < (i + 1); j++) {
                    if (j == 0) {
                        resultSelector += selectorNodes[j];
                    } else {
                        resultSelector += (' ' + selectorNodes[j]);
                    }
                }

                //logger('SassCache.get$parentSelector("%s")[%d] | [nestDepth: %d][available: %j] | looking for selector: "%s"', selector, i, nestDepth, selectorNodes, resultSelector);
                if (resultSelector.length == 0) {
                    logger('SassCache.get$parentSelector("%s")[%d](no selector passed) = "%s"', selector, i, _options.rootSelector);
                    return _options.rootSelector;
                } else if (this.contains(resultSelector, {isEntireSelector: true})) {
                    foundSelector = resultSelector;
                } else {
                    logger('SassCache.get$parentSelector("%s")[%d](portion of selector found) = "%s"', selector, i, foundSelector);
                    return foundSelector;
                }
            }

            logger('SassCache.get$parentSelector("%s")(entire selector already defined) = "%s"', selector, foundSelector);
            return foundSelector;
        },

        /**
         *
         * @param {String} selector
         * @returns {boolean}
         */
        within: function (selector) {
            return this.contains(selector, {isEntireSelector: true})
        },

        /**
         *
         * @param {String} selector
         * @returns {boolean}
         */
        hasSelector: function (selector) {
            var result = this.$root.find(selector);
            return (result != null && typeof result != 'undefined' && result.length > 0);
        },

        /**
         *
         * @param {String} selector
         * @returns {Object}
         */
        load: function (selector) {
            if (typeof this.$ == 'undefined') throw new Error('Initialization failed. $root is undefined.');
            if (this.$ === null) throw new Error('Cheerio not initialized correctly. $root not found.');
            var _selector = this.get$parentSelector(selector);

            logger('SassCache.load("%s")', _selector);
            //this._printDOM();
            return this.$(_selector).first().data('sass');
        },

        _printDOM: function () {
            logger('\ndom:\n%s', this.$.html());
            logger('root element:\n%s\n', this.$root.html());
            return;
        },

        /**
         *
         * @param {String} selector
         * @returns {Array}
         * @private
         */
        _parseSelector: function (selector) {
            if (!_.isString(selector)) throw new Error("Provided selector is not a string");
            //if (selector.length == 0) throw new Error("Provided selector is invalid: "+selector);
            var formattedSelector = selector
                .replace(/[\[]/gi, ' ')
                .replace(/[\*]/gi, ' ALL ')
                .replace(/['"=\]]/gi, '')
                .replace(/\s+|>|:/gi, '|'),
                selectorNodes = formattedSelector.split('|');

            //logger('SassCache._parseSelector.cssParser("%s") = %J', selector, cssParser(selector));
            //var selectorNodes = cssParser(selector)[0].map(function(cssNode, index, collection){
            //    return cssNode['value'] || cssNode['name'] || cssNode['descendant'];
            //});
            logger('SassCache._parseSelector("%s") = %j', selector, selectorNodes);
            return selectorNodes;
        },

        /**
         *
         * @param {String} selector
         * @returns {jQuery}
         * @private
         */
        _create$elFromSelector: function (selector) {
            eval(compileFuncBuilder(parse(lex(selector))));
            var elHTML = template(); // per jade-code-gen example: https://github.com/pugjs/jade-code-gen

            return this.$(elHTML);

        },

        /**
         *
         * @param {String} selector
         * @param {Object} data
         * @param {Object} [options]
         * @returns {SassCache}
         */
        push: function (selector, data, options) {
            var self = this,
                _data = _.extend({}, data),
                _options = _.extend({}, options),
                parentSelector = this.get$parentSelector(selector),
                $parent = self.$root.find(parentSelector),
                newSelectors = self._parseSelector(selector),
                parentSelectors = self._parseSelector(parentSelector),
                newChildSelectors = [],
                newNodeCount,
                $el;

            for (var i = 0; i < newSelectors.length; i++) {
                if (newSelectors[i] != parentSelectors[i]) {
                    newChildSelectors.push(newSelectors[i])
                }
            }
            logger("SassCache.push('%s', %j, %j) - diff '%s' with '%s' = '%s'", selector, data, _options, newSelectors.join(' '), parentSelectors.join(' '), newChildSelectors.join(' ') );

            newNodeCount = newChildSelectors.length;
            if (newNodeCount == 0) {
                logger("SassCache.push('%s', %j, %j) - found node", selector, data, _options);
                $el = self.$root.find(selector);
            } else {
                // start appending new nodes

                var appendedElements = [];
                for (var index = 0; index < newNodeCount; index++) {
                    var nodeSelector = newChildSelectors[index];
                    $el = self._create$elFromSelector(nodeSelector);
                    if (index === 0) {
                        logger("SassCache.push('%s', %j, %j) - generating new node", selector, data, _options);
                        $parent.append($el);
                    } else {
                        appendedElements[index - 1].append($el);
                    }
                    appendedElements.push($el);
                }
            }
            logger("SassCache.push('%s', %j, %j) - set['%s'] to %j", selector, data, _options, selector, data);
            //$el.data('sass', _.extend({}, $el.data('sass'), _data));
            $el.data('sass', _data);

            //this._printDOM();
            return this;
        }
    });

module.exports = SassCache;
