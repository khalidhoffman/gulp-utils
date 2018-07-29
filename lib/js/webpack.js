const path = require('path');

const webpack = require('webpack');

const config = require('../../config');
const Task = require('../task');

class WebpackTask extends Task {

    run (){
        const defaults = {
            buildPath: this.input || path.join(config.paths.workingDir, 'js/src/webpack.config.js')
        };
        const opts = Object.assign({}, defaults, this.options);
        const webpackConfig = require(opts.buildPath);

        console.log('starting build...');

        return new Promise((resolve, reject) => {
            const handler = (err, stats) => {
                if (err) {
                    console.error(err.stack || err);
                    if (err.details) {
                        console.error(err.details);
                    }
                    reject(err);
                    return;
                }

                console.log(stats.toString({colors: true}));
                resolve();
            };

            if (opts.watch) {
                webpack(webpackConfig).watch(opts.watch, handler)
            } else {
                webpack(webpackConfig).run(handler)
            }
        });
    }
}

module.exports = WebpackTask;
