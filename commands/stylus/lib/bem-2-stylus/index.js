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
function bem2Stylus(data, callback, options) {
    var _options = _.extend({
        useLib: false
    }, options);

    function tab(depth) {
        var _tab = '',
            tabSize = 2;
        for (var i = 0; i < depth * tabSize; i++) {
            _tab += ' ';
        }
        return _tab;
    }

    function render(bemClassList) {

        var rootText = '',
            text = '',
            selectorDepth = 0;

        _.forEach(bemClassList, function(bemNode, className) {
            var blockSelectorText = util.format(_options.useLib ? "+block('%s')" : ".%s", className),
                elementSelectorText;

            // add block selector
            if (selectorDepth === 0) {
                rootText += util.format('\n%s', blockSelectorText);
            } else {
                text += util.format(_options.useLib ? '\n%s%s\n%sempty()' : '\n%s%s\n%sempty()', tab(selectorDepth), blockSelectorText, tab(1 + selectorDepth));
            }



            // add element selectors
            _.forEachRight(bemNode.elements, function(className, index, collection) {
                elementSelectorText = util.format( _options.useLib ? "+element('%s', -1)" : "\&__%s", className);
                text += util.format('\n%s%s\n%sempty()', tab(1 + selectorDepth), elementSelectorText, tab(2 + selectorDepth), tab(1 + selectorDepth));
            });

            // add element selectors that are scoped with modifiers
            var scopedChildrenSelectorText;

            _.forEachRight(bemNode.modifiers, function(className, index) {

                // if not using BEM mixins, add selector to reset `&` selector to block
                scopedChildrenSelectorText = util.format(_options.useLib ? '' : '\n%s& ^[-2..-2]', tab(2 + selectorDepth));

                // a fix for stylus compilation. selectors without css code cause errors
                if (bemNode.elements.length === 0) scopedChildrenSelectorText += util.format("\n%sempty()", tab(3 + selectorDepth));

                // build children elements that are scoped by a modifier
                _.forEachRight(bemNode.elements, function(childClassName, index, collection) {
                    var scopedChildSelectorText = util.format( _options.useLib ? "+element('%s')" : "\&__%s", childClassName);
                    scopedChildrenSelectorText += util.format('\n%s%s\n%sempty()', tab(3 + selectorDepth), scopedChildSelectorText, tab(4 + selectorDepth));
                });

                // join the modifier and children elements
                var modifierSelectorText = util.format( _options.useLib ? "+modifier('%s')" : "\&--%s", className);
                text += util.format('\n%s%s%s%s',
                    tab(1 + selectorDepth),
                    modifierSelectorText,
                    (_options.useLib && bemNode.elements.length  > 0) ? "" : util.format("\n%sempty()", tab(2 + selectorDepth)),
                    scopedChildrenSelectorText);
            });

            // we have already processed the root selector. so now the depth will start at 1
            selectorDepth = 1;
        });

        var result = rootText + text + '\n';

        callback.call(null, result);
        return result;
    }

    return render(data);
}


module.exports = bem2Stylus;
