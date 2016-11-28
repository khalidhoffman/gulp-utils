var SassCacheNode = require('./node'),
    SassCacheParser = require('./parser');

class SassCacheTree {

    constructor() {
        this.root = new SassCacheNode("!", {root: true});
        this.parser = new SassCacheParser();
    }

    /**
     *
     * @param {String} selector
     * @returns {boolean}
     */
    contains(selector) {
        var nodes = this.parser.parseSelector(selector),
            parent = this._findValidParent(nodes[0]),
            result = false;

        nodes.forEach((node, index) => {
            var childNode = parent.find(node);
            if (childNode) {
                parent = childNode;
                if (index === nodes.length - 1 ) {
                    // found entire namespace
                    result = true;
                } else if(index === 0){
                    // root selector is found in tree
                    // TODO this requirement doesn't seem to make sense
                    result = true;
                }
            }
        });
        return result;
    }

    /**
     *
     * @param {String} namespace
     * @param {*} value
     */
    push(namespace, value) {
        var nodes = this.parser.parseSelector(namespace).map((node) => {
            return node;
        });

        var parent = this.root;

        nodes.forEach((node, index) => {
            var childNode = parent.find(node);
            if (childNode) {
                parent = childNode;
            } else {
                if (index === nodes.length - 1) {
                    // set value on last node
                    node.setValue(value);
                }
                parent.addChild(node);
                parent = node;
            }
        })
    }

    /**
     *
     * @param {SassCacheNode} node
     * @private
     */
    _findValidParent(node) {

        /**
         *
         * @param {SassCacheNode} node
         * @param {SassCacheNode} parentNode
         * @returns {*}
         */
        function recursiveMatch(node, parentNode) {
            var validParent = false;
            for (var childNode of parentNode.getChildren()) {
                if (!validParent) {
                    if (childNode.getSelector() === node.getSelector()) {
                        validParent = parentNode;
                    } else {
                        validParent = recursiveMatch(node, childNode);
                    }
                }
            }
            return validParent;
        }

        return recursiveMatch(node, this.root) || this.root;
    }


    /**
     *
     * @param {String} namespace
     * @returns {*}
     */
    load(namespace) {
        var nodes = this.parser.parseSelector(namespace),
            parent = this._findValidParent(nodes[0]),
            currentNodeValue,
            result = null;
        nodes.forEach((newNode, index) => {
            var childNode = parent.find(newNode);
            if (childNode) {
                parent = childNode;
                currentNodeValue = childNode.getValue();
                if (currentNodeValue !== undefined && currentNodeValue !== null) {
                    result = currentNodeValue;
                }
            }
        });
        return result;
    }
}

module.exports = SassCacheTree;
