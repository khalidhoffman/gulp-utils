var _ = require('lodash'),
    util = require('util');

function build(data) {

    var classes = [];

    _.forEach(data, function (rootNode) {


        function read(node) {
            // console.log('reading %O', node);

            if (node.type == 'Tag' || node.type == 'Mixin') {
                // console.log('parsing %s', util.inspect(node));
                _.forEach(node.attrs, function (attr) {
                    switch (attr.name) {
                        case 'class':
                            classes.push(attr.val.replace(/[\/\"\']/g, ''));
                            break;
                        case 'id':

                            break;
                        default:
                            break;
                    }
                });

                if (node.block && node.block.nodes) {
                    _.forEach(node.block.nodes, function (childNode) {
                        read(childNode);
                    });
                }
            }
        }

        read(rootNode);

    });

    function optimizeClassList(classList) {
        var rootsClasses = {};
        _.forEach(classList, function (selector) {
            var selectorComponents,
                blockSelector,
                elementSelector,
                modifierSelector;
            if (/__/.test(selector)) {
                selectorComponents = selector.split('__');
                blockSelector = selectorComponents[0];
                elementSelector = selectorComponents[1];

                rootsClasses[blockSelector] = rootsClasses[blockSelector] || {modifiers: [], elements: []};
                rootsClasses[blockSelector].elements.push(elementSelector);
            } else if (/\-\-/.test(selector)) {
                selectorComponents = selector.split('--');
                blockSelector = selectorComponents[0];
                modifierSelector = selectorComponents[1];

                rootsClasses[blockSelector] = rootsClasses[blockSelector] || {
                        modifiers: [],
                        elements: []
                    };
                rootsClasses[blockSelector].modifiers.push(modifierSelector);
            } else {
                rootsClasses[selector] = rootsClasses[selector] || {modifiers: [], elements: []};
            }
        });

        _.forEach(rootsClasses, function (baseClassData, baseClass) {
            rootsClasses[baseClass].name = baseClass;
            rootsClasses[baseClass].elements = _.uniq(baseClassData.elements);
            rootsClasses[baseClass].modifiers = _.uniq(baseClassData.modifiers);
        });

        return rootsClasses;
    }

    var optimizedClassList = optimizeClassList(classes);
    return optimizedClassList;
}

module.exports = build;
