const fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    async = require('async'),
    glob = require('glob'),
    gulp = require('gulp'),
    postcss = require('postcss'),
    cssnano = require('cssnano'),

    project = require('../project');

function minifyFile(filepath, output, options, done) {
    const _options = _.defaults(options, {}),
        filenameMeta = path.parse(filepath),
        mapCSSPath = path.join(output, filenameMeta.name + '.css.map'),
        prodCSSPath = path.join(output, filenameMeta.name + '.min.css'),
        cssnanoOptions = (_options.cssnano && _.isPlainObject(_options.cssnano)) ? _options.cssnano : {};

    let postCSSPlugins = [require('./lib/precision')(), require('postcss-discard-duplicates')];

    if (_options.cssnano) {
        postCSSPlugins.push(cssnano(_.defaults(cssnanoOptions, {
            zindex: false,
            discardUnused: {
                keyframes: false
            },
            reduceIdents: {
                keyframes: false
            }
        })));
    }
    fs.readFile(filepath, 'utf8', function (err, fileSrc) {
        if (err) return onFileRendered(err);
        postcss(postCSSPlugins)
            .process(fileSrc, {from: filepath, to: prodCSSPath})
            .then(function (result) {
                if (result.map) fs.writeFileSync(mapCSSPath, result.map);
                fs.writeFile(prodCSSPath, result.css, {encoding: 'utf8'}, function (err) {
                    // console.log("stylus - successfully saved %s", prodCSSPath);
                    done();
                })
            })
            .catch(function (error) {
                done(error);
            });
    });
}
function minifyCSS(onCompilationComplete) {
    async.eachSeries(project.tasks['css'],
        function each(taskMeta, done) {
            const globSelector = taskMeta.input.match(/css$/) ? taskMeta.input : path.join(taskMeta.input, '/*.css'),
                _options = _.defaults(taskMeta.options, {
                    input: taskMeta.input,
                    output: taskMeta.output,
                    cssnano: true
                });

            glob(globSelector, (globError, files) => {
                if (globError) return done(globError);
                async.eachSeries(files,
                    function each(filepath, onFileRendered) {
                        minifyFile(filepath, taskMeta.output, _options, done);
                    },
                    function complete(fileRenderError) {
                        done(fileRenderError);
                    });
            });
        }, function complete() {
            onCompilationComplete.apply(null, arguments);
        })
}
module.exports = {
    minify: minifyCSS
};
