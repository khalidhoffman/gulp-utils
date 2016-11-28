var SassCacheNode = require('./node');

class SassCacheParser {

    /**
     *
     * @param {String} namespace
     * @returns {SassCacheNode[]}
     */
    parseSelector(namespace) {
        return namespace
            .replace(/[\[]/gi, ' ')
            .replace(/[\*]/gi, ' ALL ')
            .replace(/['"=\]]/gi, '')
            .replace(/\s+|>|:/gi, '|')
            .split('|')
            .map((selectorComponent) => {
                return new SassCacheNode(selectorComponent);
            })
    }
}

module.exports = SassCacheParser;
