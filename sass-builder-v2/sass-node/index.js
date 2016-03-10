var _ = require('lodash'),
    jsDOM = require("jsdom"),
    jQuery = require('jquery'),
    isWindowed = require('../../advanced-dev/isWindowed');

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

    this.isRoot = function () {
        return (!!this.getClassName().match(/^\.container/i) || this.$el[0].classList.length > 1);
    };

    this.$el.children().each(function (index, el) {
        var childState = {
            depth: self.isRoot() ? 0 : self._state.depth + 1
        };
        console.log('SassNode.constructor() - adding el: %O', el);
        self.children.push(new SassNode(el, childState));
    });


    this._generateSiblings = function(){
        var _self = this;
        this.siblings = _.remove(_self.children, function (node) {
            if (node.isRoot()) {
                console.log('SassNode._optimize() - resetting @ %O in %O', node, _self);
            }
            return node.isRoot()
        });
        return this.siblings;
    };

    this._optimizeSiblings = function(siblings){

        var currentSiblings = siblings || this.siblings,
            classlistCache = {};

        _.forEach(currentSiblings, function (node) {
            var mainClassName = node.getMainClassName();
            classlistCache[mainClassName] = _.isObject(classlistCache[mainClassName]) ? classlistCache[mainClassName] : {
                nodes: [],
                classList: []
            };
            classlistCache[mainClassName].classList = classlistCache[mainClassName].classList.concat(node.getClassVariations());
            classlistCache[mainClassName].nodes.push(node);
        });

        var _optimizedSiblings = [];
        _.forEach(classlistCache, function (classNameCache, mainClassName) {
            classlistCache[mainClassName].nodes[0].merge(_.rest(classNameCache.nodes));
            _.remove(currentSiblings, _.rest(classNameCache.nodes));
            classlistCache[mainClassName].classList = _.uniq(classNameCache.classList);
            classlistCache[mainClassName].nodes[0].$el.addClass(classNameCache.classList);
            _optimizedSiblings.push(classlistCache[mainClassName].nodes[0]);
        });

        this.siblings = this.siblings.concat(_optimizedSiblings);
    };

    this._optimize = function () {
        var _self = this,
            childNode;
        console.log('SassNode._optimize() - optimizing %O + %d', this, _self.children.length);
        for (var index = 0; index < this.children.length; index++) {
            childNode = this.children[index];
            console.log('SassNode._optimize() - optimizing %O @ %O', this, childNode);
            childNode._optimize();
        }
        this._generateSiblings();
        this._optimizeSiblings();
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

    this.getClassVariations = function () {
        return _.rest(this.getClassList());
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

    this.merge = function (node) {

        _.forEach(this.children, function(childNode, index){
            childNode._optimize();
        });
        var self = this;
        var mergedNode = this;
        _.merge(mergedNode, node, function (a, b, key) {
            if (_.isArray(a) && _.isArray(b)) {
                return a.concat(b) ;
            } else if (_.isFunction(a) && _.isFunction(b)) {
                return a;
            }
        });

        _.forIn(mergedNode, function(val, prop){
            self[prop] = val;
        });

        this._generateSiblings();
        this._optimizeSiblings();

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
