var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    Jlex = require('jade-lexer'),
    SassNode = require('./sass-node'),
    SassNodeSet = require('./sass-node-set');


function jadeToSass(jadeText, writePath, options) {
    var _options = _.extend({
            debug: false
        }, options),
        jadeData = Jlex(jadeText, path.resolve('./', 'jade.txt')),
        numOfNodes = jadeData.length,
        sassOutputPath = writePath,
        sassOutput = "",
        sassDataSet = new SassNodeSet();

    _.forEach(jadeData, function (node) {
        switch (node.type) {
            case 'class':
            case 'tag':
            case 'id':

                if (sassDataSet.hasLine(node.line)) {
                    // additional data at line
                    if(_options.debug) console.log('Updating line [' + node.line + ']... ' + node.type);
                    sassDataSet.atLine(node.line).set(node.type, node.val);
                } else {
                    // new line
                    if(_options.debug) console.log('Adding line [' + node.line + ']... ' + node.type);
                    var nodeMeta = {
                        lineNumber: node.line
                    };
                    nodeMeta[node.type] = node.val;
                    sassDataSet.push(new SassNode(nodeMeta));
                }
                break;
            default:
                if(_options.debug) console.log('Bypassing ' + node.type);
        }
    });

    if(_options.debug) console.log('sassDataSet: %j', sassDataSet);
    for (var lineIndex = 0; lineIndex < numOfNodes; lineIndex++) {
        if (sassDataSet.hasLine(lineIndex)) {
            var sassNode = sassDataSet.atLine(lineIndex);
            if(_options.debug) console.log('printing: ', sassNode.getNode());
            sassOutput += sassNode.compileCSS();
        }
    }

    if (sassOutput.length > 1) {
        fs.writeFile(sassOutputPath, sassOutput, function (err) {
            if (err) throw err;
            console.log('sass saved to %s.', sassOutputPath)
        })
    }
}

module.exports = {
    jadeToSass: jadeToSass
};
