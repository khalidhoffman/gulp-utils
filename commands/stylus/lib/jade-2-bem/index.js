var _ = require('lodash'),
    util = require('util');

function build(data) {

    var classes = [];

    _.forEach(data, function(rootNode){



        function read(node){
            // console.log('reading %O', node);

            if (node.type == 'Tag') {
                // console.log('parsing %O', node);
                _.forEach(node.attrs, function(attr){
                    if(attr.name == 'class') {
                        // console.log('adding %O', node);
                        classes.push(_.trim(attr.val, "'"));
                        // classes.push(attr.val);
                    }
                });

                if(node.block && node.block.nodes){
                    _.forEach(node.block.nodes, function(childNode){
                        read(childNode);
                    });
                }
            }
        }

        read(rootNode);

    });

    function optimizeClassList(classList){
        var _optimizedClassList = {};
        _.forEach(classList, function(className){
            var parts;
            if(/__/.test(className)){
                parts = className.split('__');
                _optimizedClassList[parts[0]] = _optimizedClassList[parts[0]] || { modifiers: [], elements: []};
                _optimizedClassList[parts[0]].elements.push(parts[1]);
            } else if(/\-\-/.test(className)){
                parts = className.split('--');
                _optimizedClassList[parts[0]] = _optimizedClassList[parts[0]] || { modifiers: [], elements: []};
                _optimizedClassList[parts[0]].modifiers.push(parts[1]);
            } else {
                _optimizedClassList[className] = _optimizedClassList[className] || { modifiers: [], elements: []};
            }
        });

        _.forEach(_optimizedClassList, function(baseClassData, baseClass){
            _optimizedClassList[baseClass].elements = _.uniq(baseClassData.elements);
            _optimizedClassList[baseClass].modifiers = _.uniq(baseClassData.modifiers);
        });

        return _optimizedClassList;
    }

    var optimizedClassList = optimizeClassList(classes);
    // console.log('%s', util.inspect(optimizedClassList, {colors: true}));
    return optimizedClassList;
}

module.exports = build;
