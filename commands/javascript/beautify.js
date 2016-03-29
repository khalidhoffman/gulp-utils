var fs = require('fs'),
    path = require('path'),

    gulp = require('gulp'),
    through2 = require('through2'),
    beautifyJS = require('js-beautify'),

    wordpress = require('../wordpress');

function compile() {
    var writePath = './',
        beautifyJSGlobRegex = path.join(wordpress.theme.paths.js, '/!(vendors)/**/*.js');

    console.log('Searching %s for js files', beautifyJSGlobRegex);
    return gulp.src(beautifyJSGlobRegex)
        .pipe(through2.obj({
                allowHalfOpen: false
            },
            function (file, encoding, done) {
                //console.log('reading %s', file.path);
                if (file && file.contents) {
                    console.log('beautifying %s', file.path);
                    var jsContent = beautifyJS(file.contents.toString());
                    writePath = file.path;
                    //console.log('js: %s', jsContent);
                    file.contents = new Buffer(jsContent, encoding);
                }
                done(null, file); // note we can use the second argument on the callback
                // to provide data as an alternative to this.push('wut?')
            }
        ))
        .on('error', console.error)
        .pipe(gulp.dest(writePath));
}

function watch() {
    var writePath = './',
        watchPath = path.join(wordpress.theme.paths.js, '/!(node_modules|vendors)/**/*.js');

    console.log('Search %s for javascript files', watchPath);
    gulp.watch(watchPath, function (event) {

        if (event.type == 'changed') {

            fs.readFile(event.path, 'utf8', function (err, data) {
                if (err) {
                    throw err;
                }
                console.log('updating %s', event.path);
                fs.writeFileSync(event.path, beautifyJS(data));
                console.log('successfully updated %s', event.path);
            });
        }
    });
}

module.exports = {
    compile: compile,
    watch: watch
};
