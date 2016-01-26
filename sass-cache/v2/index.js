var Backbone = require('backbone'),
    path = require('path'),
    _ = require('lodash'),
    url = require('url'),
    lex = require('jade-lexer'),
    parse = require('jade-parser'),
    compileFuncBuilder = require('jade-code-gen'),
    logger = require('../../logger'),
    cheerio = require('cheerio'),
    request = require('request'),
    projectPackage = require('../../package.json'),
    SassCache = Backbone.Model.extend({

        defaults: {
            domReady: false,
            pages : [projectPackage['homepage']],
            sharedContentSelectors : ['header', 'footer'],
            pageContentSelector : ['header + div']
        },

        /**
         *
         * @param attrs
         * @param {Object} options an array of urls to load
         * @param {[String]} options.pages
         * @param {Object} [options.context]
         * @param {Function} [options.success]
         * @param {Boolean} [options.silent]
         * @param {Function} cb
         * @returns {SassCache}
         */
        initialize: function (attrs, options, cb) {

            var self = this,
                _options = _.extend({
                    success: cb,
                    context: self,
                    silent: (options && typeof options.success == 'function')
                }, options),
                _pages = self.get('pages'),
                _readCount = 0,
                isSharedParsed = false;
            this.$ = cheerio.load("<div id='root'></div>");
            this.$root = this.$('#root').append("<div id='main'></div>");
            this.$main = self.$root.find('#main');
            logger('SassCache.initialize() - w/ %j', _options);

            // add paths
            _.forEach(self.get('paths'), function(sitePath, index, arr){
                var pageUrl = url.resolve( projectPackage['homepage'], sitePath );
                if(_pages.indexOf(pageUrl) < 0){
                    _pages.push(pageUrl);
                }
            });

            function updateStatus(){

                if (_readCount == _pages.length && isSharedParsed) {
                    self.set('domReady', true);
                    if (!_options.silent) self.trigger('dom:ready');
                    if (_options.success) _options.success.apply(_options.context, [self]);
                }
            }

            request.get({
                url: projectPackage['homepage']
            }, function (error, response, body) {
                if (error) throw error;
                var $DOM = cheerio.load(body);

                _.forEach(self.get('sharedContentSelectors'), function(selector, index, arr){
                    // append shared html nodes
                    self.$main.append($DOM(selector));
                });

                isSharedParsed = true;
                updateStatus();

            });

            _.forEach(_pages, function (url, index, arr) {
                logger('SassCache.initialize() - loading DOM @ %s', url);

                request.get({
                    url: url
                }, function (error, response, body) {
                    if (error) throw error;
                    var $DOM = cheerio.load(body);

                    _.forEach(self.get('pageContentSelector'), function(selector, index, arr){
                        // append page specific html nodes
                        self.$main.append($DOM(selector));
                    });
                    _readCount++;
                    updateStatus();
                });

            });

            return self;
        },

        /**
         *
         * @param selector
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
         * @param selector
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

                logger('SassCache.get$parentSelector("%s")[%d] | [nestDepth: %d][available: %j] | looking for selector: "%s"', selector, i, nestDepth, selectorNodes, resultSelector);
                if (resultSelector.length == 0) {
                    logger('SassCache.get$parentSelector("%s")[%d][default] = "%s"', selector, i, _options.rootSelector);
                    return _options.rootSelector;
                } else if (this.contains(resultSelector, {isEntireSelector: true})) {
                    foundSelector = resultSelector;
                } else {
                    logger('SassCache.get$parentSelector("%s")[%d][last] = "%s"', selector, i, foundSelector);
                    return foundSelector;
                }
            }

            logger('SassCache.get$parentSelector("%s")[completed] = "%s"', selector, foundSelector);
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

        load: function (selector) {
            if (typeof this.$ == 'undefined') throw new Error('Initialization failed. $root is undefined.');
            if (this.$ === null) throw new Error('Cheerio not initialized correctly. $root not found.');
            logger('SassCache.load("%s")', selector);
            //this._printDOM();
            return this.$(selector).first().data('sass');
        },

        _printDOM: function () {
            //logger('\ndom:\n%s', this.$.html());
            //logger('root element:\n%s\n', this.$root.html());
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
            var formattedSelector = selector.replace(/\s|>|:/gi, '|');
            logger('SassCache._parseSelector("%s") = %j', selector, formattedSelector.split('|'));
            return formattedSelector.split('|');
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
         * @param selector
         * @param {Object} data
         * @param {Object} [options]
         * @param {Boolean} [options.global=false]
         * @param {Boolean} [options.propagate=true]
         * @returns {SassCache}
         */
        push: function (selector, data, options) {
            logger('SassCache.push("%s", %j, %j)', selector, data, options);
            var self = this,
                _data = _.extend({}, data),
                _options = _.extend({
                    global: false,
                    propagate: true
                }, options),
                selectors = this._parseSelector(selector),
                parentSelector = this.get$parentSelector(selector),
                $parent = self.$root.find(parentSelector),
                newChildSelectors = (parentSelector == '#main') ? selectors : _.drop(selectors, self._parseSelector(parentSelector).length),
                newNodeCount = newChildSelectors.length,
                $el;

            if (newNodeCount == 0) {
                logger("SassCache.push('%s', %j, %j) - setting['%s'] <- %j", selector, data, _options, selector, data);

                $el = self.$root.find(selector);

                $el.data('sass', _.extend({}, $el.data('sass'), _data));
            } else {
                // append new nodes
                var nodeCache = [];

                for (var index = 0; index < newNodeCount; index++) {
                    var nodeSelector = newChildSelectors[index];
                    $el = self._create$elFromSelector(nodeSelector);

                    logger('SassCache.push("%s", %j, %j)[%d]  - recursively pushing: [ps: "%s")][c: %d][ns: "%s"]', selector, data, options, index, parentSelector, newNodeCount, nodeSelector);

                    if (index === 0) {
                        if (_options.global) {
                            self.$root.data('sass', _.extend({}, self.$root.data('sass'), _data));
                        }
                        $parent.append($el);
                        if (newNodeCount == 1) $el.data('sass', _.extend({}, $el.data('sass'), _data));
                    } else {
                        if (index == (newNodeCount - 1) || _options.propagate) {
                            $el.data('sass', _.extend({}, $el.data('sass'), _data));
                        }
                        nodeCache[index - 1].append($el);
                    }
                    nodeCache.push($el);
                }
            }

            this._printDOM();
            return this;
        }
    });

module.exports = SassCache;