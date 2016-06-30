var _ = require('lodash'),
    util = require('util');

/**
 *
 * @param data
 * @param callback
 * @param [options]
 * @param {Boolean} options.useLib
 * @returns {*}
 */
function bem2Stylus(data, callback, options) {
    var _options = _.extend({
        useLib: false
    }, options);

    function tab(repeat) {
        var _tab = '',
            tabSize = 2;
        for (var i = 0; i < repeat * tabSize; i++) {
            _tab += ' ';
        }
        return _tab;
    }

    function render(bemClassList) {

        var parentText = '',
            text = '',
            level = 0;

        _.forEach(bemClassList, function(bemNode, className) {
            var blockSelector = util.format(_options.useLib ? "+block('%s')" : ".%s", className),
                modifierSelector,
                elementSelector;


            if (level === 0) {
                parentText += util.format('\n%s', blockSelector);
            } else {
                text += util.format(_options.useLib ? '\n%s%s\n%sempty()' : '\n%s%s\n%sempty()', tab(level), blockSelector, tab(1 + level));
            }



            _.forEachRight(bemNode.elements, function(className, index, collection) {
                elementSelector = util.format( _options.useLib ? "+element('%s')" : "\&__%s", className)
                text += util.format('\n%s%s\n%sempty()', tab(1 + level), elementSelector, tab(2 + level), tab(1 + level));
            });

            var childrenSelectors,
                iterationCount = 0;
            _.forEachRight(bemNode.modifiers, function(className, index, collection) {

                childrenSelectors = util.format(_options.useLib ? '' : '\n%s& ^[-2..-2]', tab(2 + level));

                if (bemNode.elements.length === 0) childrenSelectors += util.format("\n%sempty()", tab(3 + level));

                _.forEachRight(bemNode.elements, function(childClassName, index, collection) {
                    var modifierElementSelector = util.format( _options.useLib ? "+element('%s')" : "\&__%s", childClassName);
                    childrenSelectors += util.format('\n%s%s\n%sempty()', tab(3 + level), modifierElementSelector, tab(4 + level));
                });

                var elementModifierSelector = util.format( _options.useLib ? "+modifier('%s')" : "\&--%s", className);
                text += util.format('\n%s%s%s%s', tab(1 + level), elementModifierSelector, (_options.useLib && bemNode.elements.length  > 0) ? "" : util.format("\n%sempty()", tab(2 + level)), childrenSelectors);
            });

            // if(level != 0) text += util.format('\n%s',tab(level));
            level = 1;
        });
        var result = parentText + text + '\n';
        // var Formatter = require('./pretty-styl');
        // var stylusFormatter = new Formatter('zen');
        // stylusFormatter.processString(result, function(sassText){
        // });
        callback.call(null, result);
        return result;
    }

    return render(data);
}


module.exports = bem2Stylus;
