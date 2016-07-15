var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    
    glob = require('glob'),
    stylus = require('stylus'),
    _ = require('lodash'),
    postcss = require('postcss'),
    
    dump = require('../../dump'),
    paths = require('../paths');

var precision = postcss.plugin('postcss-precision', function () {
    var longTest = /(\d+?\.\d{3,})(%|em|px)/i;

    return function (style) {
        style.walkDecls(function (decl) {

            if (decl.value && longTest.test(decl.value)) {
                // Grab array of matches.
                var matches = longTest.exec(decl.value);

                // We'll assume there's one.
                var value = matches[1];

                // Round two decimal places.
                // var rounded = _.round(parseFloat(value), 2 );
                var rounded = Math.round(parseFloat(value) * 100) / 100;

                // Change the value in the tree.
                decl.value = decl.value.replace(value, rounded.toString());
            }
        });
    };
});

function compileStylus(done) {
    var stylusFunctions = require('./functions').hookFunc;


    glob(path.join(paths.stylus, '**/!(_)*.styl'), function (err, files) {
        _.forEach(files, function (filename, index) {
            // console.log('stylus - rendering %s', filename);
            fs.readFile(filename, {encoding: 'utf8'}, function (err, str) {
                if (err) {
                    console.error(err);
                    done();
                } else {
                    stylus(str)
                        .set('filename', filename)
                        .use(stylusFunctions)
                        .use(require('nib')())
                        .use(new require('stylus-type-utils')())
                        .import('nib')
                        .import(path.resolve(__dirname, '../../node_modules/stylus-type-utils'))
                        .import(path.resolve(__dirname, 'lib/stylus/*'))
                        .render(function (err, css) {
                            if (err) {
                                console.error(err);
                                done();
                            } else {
                                var filenameMeta = path.parse(filename),
                                    srcCSSPath = path.format({
                                        dir: paths.css,
                                        base: filenameMeta.name + '.src.css'
                                    }),
                                    mapCSSPath = path.format({
                                        dir: paths.css,
                                        base: filenameMeta.name + '.css.map'
                                    }),
                                    prodCSSPath = path.format({
                                        dir: paths.css,
                                        base: filenameMeta.name + '.css'
                                    });

                                // console.log("stylus - %s -> %s", srcCSSPath, prodCSSPath);
                                
                                fs.writeFile(srcCSSPath, css, {encoding: 'utf8'}, function (err) {
                                    if (err) throw err;
                                    postcss([precision(), require('postcss-discard-duplicates')])
                                        .process(css, {from: srcCSSPath, to: prodCSSPath})
                                        .then(function (result) {
                                            if (result.map) fs.writeFileSync(mapCSSPath, result.map);

                                            fs.writeFile(prodCSSPath, result.css, {encoding: 'utf8'}, function (err) {
                                                if (err) throw err;
                                                console.log("stylus - successfully saved %s", prodCSSPath);
                                                done();
                                            })
                                        })
                                        .catch(function (error) {
                                            console.error(error);
                                    done();
                                        });
                                })
                            }
                        });
                }

            })
        })
    })
}

module.exports = {
    compile: compileStylus,
    jade2Stylus : require('./jade-2-stylus')
};