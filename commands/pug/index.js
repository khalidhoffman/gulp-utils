var path = require('path'),
    util = require('util'),
    fs = require('fs'),

    async = require('async'),
    through2 = require('through2'),
    gulp = require('gulp'),
    insert = require('gulp-insert'),
    customPug = require('pug'),
    pug = require('gulp-pug'),
    _ = require('lodash'),
    rename = require('gulp-rename'),
    argv = require('yargs').argv,

    projectUtils = require('../utils'),
    project = require('../project');

customPug.filters.php = function (text) {
    return '<?php ' + text + ' ?>';
};

customPug.filters.ejs = function (text) {
    return '<% ' + text + ' %>';
};


function compilePug(onCompilationComplete, options) {
    var _options = _.extend({fileExtension: 'php', taskName: 'pug'}, options),
        devIncludesRegex = /(^|\n)[\W]*include\s+.*helpers\/_-all[\W\-]*\n/;

    /**
     *
     * @param dir
     * @param onInitComplete
     * @param options
     */
    function initPugEnvironment(dir, onInitComplete, options){
        var localHelpersDir = path.resolve(__dirname, "helpers/"),
            helpersDir =path.join(dir, "helpers/");

        checkDestDirectory(function(){
            copyPugDevFiles(onInitComplete);
        });

        function checkDestDirectory(callback, options){
            fs.stat(helpersDir, function(err, dirStat){
                if(err || !dirStat.isDirectory()){
                    fs.mkdir(helpersDir, function(){
                        if(callback) callback.call()
                    })
                } else {
                    if(callback) callback.call()
                }
            });
        }


        function copyPugDevFiles(callback, options) {
            fs.readdir(localHelpersDir, function(err, files){
                async.eachLimit(files, 10, function each(fileName, done){
                    fs.readFile(path.resolve(localHelpersDir, fileName), {encoding: 'utf8'}, function(err, str){
                        if(err) return done(err);

                        if(fileName == '_functions.pug'){
                            // prepend dev util.format function
                            str = util.format("-\n    var namespace = '%s';\n    var util={format: %s}\n%s", require('../project').config.projectName, util.format.toString().replace(/\n/g, "\n    "), str);
                        }
                        fs.writeFile(path.join(helpersDir, fileName), str, function(err){
                            return done(err);
                        })
                    })
                }, function complete(err){
                    if(err) throw err;
                    if(callback) callback.call()
                })
            })
        }
    }

    async.each(project.tasks[_options.taskName], function each(taskMeta, done) {
        initPugEnvironment(taskMeta.input, function(){
            gulp.src(path.join(taskMeta.input, '**/[^_]*.pug'))
                .pipe(through2.obj({
                        allowHalfOpen: false
                    },
                    function (file, encoding, done) {

                        if(!devIncludesRegex.test(file.contents.toString())) {
                            console.log('"%s" dev include reference not found. Reference will be prepended.',file.path);
                            var referencedContent = util.format("include %s\n%s", path.relative(path.dirname(file.path), path.resolve(taskMeta.input, "helpers/_-all")), file.contents.toString());
                            file.contents = new Buffer(referencedContent, encoding);
                            fs.writeFile(file.path, referencedContent, function(err){
                                done(err, file);
                            })
                        } else {
                            done(null, file); // note we can use the second argument on the callback
                        }
                    }
                ))
                .pipe(pug({
                    pretty: (argv['pretty']) ? true : false,
                    doctype: 'html',
                    pug: customPug,
                    basedir: path.resolve('/')
                }))
                .on('error', project.onError)
                .pipe(rename({
                    extname: util.format(".%s", _options.fileExtension)
                }))
                .pipe(gulp.dest(taskMeta.output || function (file) {
                        return file.base;
                    }))
                .on('end', function () {
                    done()
                });
        })

    }, function complete() {
        onCompilationComplete();
    });
}

function compilePugPHPDebug() {
    async.each(project.tasks['pug'], function each(taskMeta, done) {
        gulp.src(path.join(taskMeta.input, '/**/[^_]*.pug'))
            .pipe(through2.obj({
                    allowHalfOpen: false
                },
                function (file, encoding, done) {

                    //console.log('chunk.path: %j', chunk.path);
                    var html = customPug.render(file.contents.toString(), {
                        filename: file.path,
                        pretty: (argv['pretty']) ? true : false
                    });
                    //console.log('html: %s', html);
                    file.contents = new Buffer(html, encoding);
                    done(null, file); // note we can use the second argument on the callback
                    // to provide data as an alternative to this.push('wut?')
                }
            ))
            .on('error', project.onError)
            .pipe(rename({
                extname: ".php"
            }))
            .pipe(gulp.dest(taskMeta.output))
            .on('end', function () {
                done()
            });
    }, function complete() {
        onCompilationComplete();
    });
}


module.exports = {
    js: function(callback){
        compilePug(callback, {fileExtension: 'ejs', taskName: 'pugjs'})
    },
    php: function(callback){
        compilePug(callback, {fileExtension: 'php', taskName: 'pug'})
    },
    phpDebug: compilePugPHPDebug
};
