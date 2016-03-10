var _ = require('lodash');
function json2Sass(data) {

    function print(node) {

        var result = '';

        result += '\n' + node['tag'] + node['id'] + node['className'] + '{';

        _.forEachRight(node.variations, function(className, index, collection){
            result += '\n&.'+className+'{}';
        });

        _.forEach(node['children'], function (childNode, index, collection) {
            result += print(childNode);
        });

        result += '}';


        _.forEach(node['siblings'], function (childNode, index, collection) {
            result += print(childNode);
        });

        return result;
    }

    console.log('json-2-sass(%O)', data);
    return print(data);
}

module.exports = json2Sass;