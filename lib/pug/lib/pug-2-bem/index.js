var _ = require('lodash'),
    util = require('util');

function BEMParser(options) {
    var self = this,
        _options = _.defaults(options, {
            includeMixins: true
        });
    this._classes = [];
    this.classData = {};
    this._mixinCache = {};


    this.parseTag = function (node) {
        _.forEach(node.attrs, function (attr) {
            switch (attr.name) {
                case 'class':
                    self._classes.push(attr.val.replace(/[\/\"\']/g, ''));
                    break;
                default:
                    break;
            }
        });
        self.read(node.block);
    };
    this.parseInterpolatedTag = this.parseTag;

    this.parseMixin = function (node) {
        if (node.call) {
            // write to classList
            var cachedNode = this._mixinCache[node.name];
            if (_options.includeMixins && cachedNode) self.read(cachedNode.block);
            if (node.block) self.read(node.block);
        } else {
            // save
            this._mixinCache[node.name] = node;
        }
    };

    this.parseConditional = function(node){
        if (node.consequent && node.consequent.nodes) {
            self.read(node.consequent);
        }
        if(node.alternate && node.alternate.nodes){
            self.read(node.alternate);
        }
    };

    this.read = function (node) {
        var parseFuncName = 'parse' + node.type;

        if (this[parseFuncName]) this[parseFuncName].call(this, node);

        if (node.nodes) {
            _.forEach(node.nodes, function (childNode) {
                self.read.call(self, childNode);
            });
        }
    };

    this.optimizeClassList = function () {
        var classData = {},
            classList = this._classes;
        _.forEach(classList, function (selector) {
            var selectorComponents,
                blockSelector,
                elementSelector,
                modifierSelector;
            if (/__/.test(selector)) {
                selectorComponents = selector.split('__');
                blockSelector = selectorComponents[0];
                elementSelector = selectorComponents[1];

                classData[blockSelector] = classData[blockSelector] || {modifiers: [], elements: []};
                classData[blockSelector].elements.push(elementSelector);
            } else if (/\-\-/.test(selector)) {
                selectorComponents = selector.split('--');
                blockSelector = selectorComponents[0];
                modifierSelector = selectorComponents[1];

                classData[blockSelector] = classData[blockSelector] || {
                        modifiers: [],
                        elements: []
                    };
                classData[blockSelector].modifiers.push(modifierSelector);
            } else {
                classData[selector] = classData[selector] || {modifiers: [], elements: []};
            }
        });

        _.forEach(classData, function (baseClassData, baseClass) {
            classData[baseClass].name = baseClass;
            classData[baseClass].elements = _.uniq(baseClassData.elements);
            classData[baseClass].modifiers = _.uniq(baseClassData.modifiers);
        });

        this.classData = classData;
        return this.classData;
    };

    this.parse = function (data) {
        _.forEach(data, function (node) {
            self.read.call(self, node);
        });
        return this.optimizeClassList();
    };

    return this;
}

module.exports = BEMParser;
