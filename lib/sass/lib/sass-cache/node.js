var _ = require('lodash');

class SassCacheNode {
    /**
     *
     * @param {String} selector
     * @param {Object} val
     */
    constructor(selector, val) {
        this.value = val;
        this.selector = selector;
        if (!_.isString(selector)) throw new Error("Provided namespace is not a string");

        this.children = [];
    }

    /**
     *
     * @param {SassCacheNode} node
     */
    addChild(node) {
        this.children.push(node);
        this.children = _.uniqBy(this.children, (node) => {
            return node.getSelector();
        });
    }

    setValue(value) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    getSelector() {
        return this.selector;
    }

    getChildren() {
        return this.children;
    }

    /**
     *
     * @param {SassCacheNode} node
     */
    find(node) {
        for (var childNode of this.children) {
            if (node.getSelector() == childNode.getSelector()) {
                return childNode;
            }
        }
        return false
    }
}

module.exports = SassCacheNode;
