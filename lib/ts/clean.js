const path = require('path');

const fs = require('mz/fs');

const Utils = require('../utils');
const Task = require('../task');

class CleanTscTask extends Task {
    run() {
        const tsGlobPattern = this.input.match(/\.ts$/) ? this.input : path.join(this.input, '/**/*.ts');

        return Utils.findFiles(tsGlobPattern, { ignore: this.options.ignore || ['**/node_modules/**'] })
            .then((tsFiles) => {
                return tsFiles.map((tsFilePath) => {
                    const tsFileExtRegexp = /(\.d\.ts|\.ts)$/;
                    const tsFileOutputExtPattern = '.{d.ts,js,js.map}';
                    const tsFileOutputGlobPattern = tsFilePath.replace(tsFileExtRegexp, tsFileOutputExtPattern);
                    return Utils.findFiles(tsFileOutputGlobPattern)
                        .then((tsOutputFiles) => {
                            return Promise.all(tsOutputFiles.map(tsOutputFilePath => {
                                return fs.unlink(tsOutputFilePath)
                                    .catch((err) => this.options.verbose ? console.error(err) : null);
                            }))
                        })
                })
            })
    }
}

module.exports = CleanTscTask;
