var _ = require('lodash'),
    util = require('util');

function bem2Stylus(data, callback) {

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

            if (level === 0) {
                parentText += util.format('\n.%s', className);
            } else {
                text += util.format('\n%s.%s\n%sempty()', tab(level), className, tab(1 + level));
            }

            _.forEachRight(bemNode.elements, function(className, index, collection) {
                text += util.format('\n%s\&__%s\n%sempty()', tab(1 + level), className, tab(2 + level), tab(1 + level));
            });

            var childrenSelectors,
                iterationCount = 0;
            _.forEachRight(bemNode.modifiers, function(className, index, collection) {
                childrenSelectors = util.format('\n%s^[-2..-2]', tab(2 + level));
                if (bemNode.elements.length === 0) childrenSelectors += util.format("\n%sempty()", tab(3 + level));
                _.forEachRight(bemNode.elements, function(childClassName, index, collection) {
                    childrenSelectors += util.format('\n%s\&__%s\n%sempty()', tab(3 + level), childClassName, tab(4 + level));
                });

                text += util.format('\n%s\&--%s\n%sempty()%s', tab(1 + level), className, tab(2 + level), childrenSelectors);
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
