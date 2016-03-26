var _ = require('lodash'),
    jsDOM = require("jsdom"),
    jQuery = require('jquery'),
    path = require('path'),
    isWindowed = require(path.resolve(process.cwd(), 'gulp-utils/advanced-dev/isWindowed'));

/**
 *
 * @param {HTMLElement} el
 * @param state
 * @constructor
 */
var SassNode = function (el, state) {
    var self = this;

    this._state = _.extend({
        depth: 0
    }, state);

    this.children = [];
    this.siblings = [];
    if (!el) throw new Error('SassNode.constructor() - attempting to create without a defined HTMLelement');
    console.log('SassNode(%O, %O)', el, state);
    if (!el.jquery) {
        var jsdom = jsDOM.jsdom,
            doc = jsdom(el.outerHTML),
            _window = doc.defaultView,
            $ = (isWindowed) ? jQuery : jQuery(_window);

        this.$el = $(el);
    } else {
        this.$el = el;
    }

    this.getClassName = function () {
        return (this.$el[0].classList.length > 0) ? '.' + Array.prototype.join.call(this.$el[0].classList, '.') : '';
    };

    this.getClassList = function () {
        return this.$el[0].classList;
    };

    this.getClassVariations = function () {
        return _.tail(this.getClassList());
    };


    this.isRoot = function () {
        return (!!this.getClassName().match(/^\.container/i) || this.getClassVariations() > 0);
    };

    this.$el.children().each(function (index, el) {
        var childState = {
            depth: self.isRoot() ? 0 : self._state.depth + 1
        };
        console.log('SassNode.constructor() - adding el: %O', el);
        self.children.push(new SassNode(el, childState));
    });


    this.shallowMerge = function (node) {

        var self = this;
        var mergedNode = this;
        console.log("SassNode.shallowMerge() - adding classes '%s' to %s", node.$el.attr('class'), self.$el.attr('class'));
        _.mergeWith(mergedNode, node, function (a, b, key, obj, src, stack) {
            switch(key){
                case '$el':
                    a.addClass(b.attr('class'));
                    return a;
                case 'siblings':
                    console.log('SassNode.shallowMerge() - optimizing siblings: %O', a.concat(b));
                    return self._optimizeCollection(a.concat(b));
                case 'children':
                    console.log('SassNode.shallowMerge() - optimizing children: %O', a.concat(b));
                    return self._optimizeCollection(a.concat(b));
                default:
                    if (_.isArray(a) && _.isArray(b)) {
                        console.log('SassNode.shallowMerge() - @ %s.%s: merging %O && %O', self.getMainClassName(), key, a, b);
                        return a.concat(b);
                    } else if (_.isFunction(a) && _.isFunction(b)) {
                        return a;
                    }
                    break;
            }
        });

        _.forOwn(mergedNode, function (val, prop) {
            self[prop] = val;
        });
    };

    this._generateSiblings = function () {
        var _self = this;
        this.siblings = this.siblings.concat(_.remove(_self.children, function (node) {
            if (node.isRoot()) {
                console.log('SassNode._generateSiblings() - resetting @ %O in %O', node, _self);
            }
            return node.isRoot()
        }));
        return this.siblings;
    };

    this._optimizeCollection = function (siblings) {

        var _siblings = siblings || this.siblings,
            cacheCollection = {};

        _.forEach(_siblings, function cacheByMainClassName(node) {
            var cacheIndex = node.getMainClassName();
            cacheCollection[cacheIndex] = (_.isArray(cacheCollection[cacheIndex]) ? cacheCollection[cacheIndex] : []);
            cacheCollection[cacheIndex].push(node);
        });

        var _optimizedSiblings = [];
        _.forEach(cacheCollection, function mergeCacheByMainClassName(nodeCache, cacheIndex) {
            _.forEach(_.tail(nodeCache), function (node, nodeIndex, collection) {
                cacheCollection[cacheIndex][0].shallowMerge(node);
            });
            _optimizedSiblings.push(cacheCollection[cacheIndex][0]);
        });
        console.log('SassNode._optimizeCollection() = %O', _optimizedSiblings);
        return _optimizedSiblings;
    };

    this._optimize = function () {
        var _self = this,
            childNode;
        console.log('SassNode._optimize() - optimizing %O + %d', this, _self.children.length);
        _.forEach(this.children, function(childNode, nodeIndex) {
            console.log('SassNode._optimize() - optimizing %O @ %O', _self, childNode);
            childNode._optimize();
        });
        this._generateSiblings();
        this.siblings = this._optimizeCollection(this._generateSiblings());
        console.log('SassNode._optimize() - optimized %O', this);
    };

    this.compile = function () {
        this._optimize();
        if (this._state.depth == 0) console.log('SassNode.compile() - Topmost node: %O', this);
        return require('../json-2-sass')(this.toJSON());
    };

    this.getMainClassName = function () {
        return '.' + this.getClassList()[0];
    };
    this.toJSON = function () {
        return {
            tag: this.getTag(),
            id: this.getId(),
            className: this.getMainClassName(),
            variations: this.getClassVariations(),
            children: this.children.map(function (node, index, collection) {
                return node.toJSON();
            }),
            siblings: this.siblings.map(function (node, index, collection) {
                return node.toJSON();
            })
        };
    };

    this.getTag = function () {
        if (!this.$el[0]) throw new Error("SassNode.getTag() - $el has no context");
        var tagName = this.$el[0].tagName.toLowerCase();
        return (tagName == 'div') ? '' : tagName;
    };

    this.getId = function () {
        return this.$el.attr('id') || '';
    };
};

module.exports = SassNode;
