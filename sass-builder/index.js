var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    pugLexer = require('pug-lexer'),
    SassNode = require('./sass-node'),
    SassNodeSet = require('./sass-node-set');


function jadeToSass(jadeText, writePath) {
    var jadeData = pugLexer(jadeText, path.resolve('./', 'jade.txt')),
        numOfNodes = jadeData.length,
        sassOutputPath = writePath,
        sassOutput = "",
        sassDataSet = new SassNodeSet();

    //_.forEach(jadeData, function (node) {
    //    switch(node.type) {
    //        case 'class':
    //        case 'tag':
    //        case 'id':
    //
    //            if (sassDataSet.hasLine(node.line)) {
    //                // additional data at line
    //                console.log('Updating line ['+node.line+']... '+ node.type);
    //                sassDataSet.atLine(node.line).set(node.type, node.val);
    //            } else {
    //                // new line
    //                console.log('Adding line ['+node.line+']... '+ node.type);
    //                var nodeMeta = {
    //                    lineNumber : node.line
    //                };
    //                nodeMeta[node.type] = node.val;
    //                sassDataSet.push(new SassNode(nodeMeta));
    //            }
    //            break;
    //        default:
    //            console.log('Bypassing '+node.type);
    //    }
    //});
    //
    //console.log('sassDataSet: %j', sassDataSet);
    //for( var lineIndex = 0; lineIndex < numOfNodes; lineIndex++) {
    //    if(sassDataSet.hasLine(lineIndex)){
    //        var sassNode = sassDataSet.atLine(lineIndex);
    //        console.log('printing: ', sassNode.getNode());
    //        sassOutput += sassNode.compileCSS();
    //    }
    //}
    //
    //if (sassOutput.length > 1) {
    //    fs.writeFile(sassOutputPath, sassOutput, function (err) {
    //        if (err) throw err;
    //        console.log('sass saved to %s.', sassOutputPath)
    //    })
    //}

    var pugParser = require('pug-parser');
    var pugWalk = require('pug-walk');

    var ast = pugWalk(pugParser(pugLexer(jadeText)), function before(node, replace) {
        // called before walking the children of `node`
        // to replace the node, call `replace(newNode)`
        // return `false` to skip descending
    }, function after(node, replace) {
        // called after walking the children of `node`
        // to replace the node, call `replace(newNode)`
        if (node.type === 'Text') {
            replace({type: 'Text', val: 'bar', line: node.line});
        }
        switch (node.type) {
            case 'class':
            case 'tag':
            case 'id':

                if (sassDataSet.hasLine(node.line)) {
                    // additional data at line
                    console.log('Updating line [' + node.line + ']... ' + node.type);
                    sassDataSet.atLine(node.line).set(node.type, node.val);
                } else {
                    // new line
                    console.log('Adding line [' + node.line + ']... ' + node.type);
                    var nodeMeta = {
                        lineNumber: node.line
                    };
                    nodeMeta[node.type] = node.val;
                    sassDataSet.push(new SassNode(nodeMeta));
                }
                break;
            default:
                console.log('Bypassing ' + node.type);
        }
    }, {includeDependencies: true});
}

module.exports = {
    jadeToSass: jadeToSass
};
