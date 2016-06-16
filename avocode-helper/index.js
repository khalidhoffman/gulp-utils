var fs = require('fs'),
    path = require('path'),
    util = require('util'),

    async = require('async'),
    _ = require('lodash'),
    color = require('onecolor'),

    dump = require('../dump'),

    cachePath = path.resolve(__dirname, '.cache');

/**
 *
 * @param {Object} obj
 * @param {Object} [options]
 * @param {Function} [options.each]
 * @param {Function} [options.isBaseCase]
 * @param {Function} [options.done]
 */
function recurseSearch(obj, options) {
    var _options = options || {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] == "object" && obj[key] !== null) {
                if (_options.each) _options.each.apply(null, [obj[key], key]);
                recurseSearch(obj[key], _options);
            } else {

            }
        }
    }

}

/**
 *
 * @param {String|RegExp} projectIdentifier
 * @param {Object} [options]
 * @param {Object} options.documentsPath
 * @constructor
 */
function Avocode(projectIdentifier, options) {
    var self = this,
        _avcdOptions = _.extend({
            documentsPath: (function () {
                var state = JSON.parse(fs.readFileSync(path.resolve(process.env.HOME, '.avocode/state.json')));

                return path.resolve(process.env.HOME, util.format('.avocode/userdata/%s/documents/', state['user']['id']));
            })()
        }, options);
    this.state = {
        allFilesParsed: false
    };
    this.data = {
        _colorCount: {},
        project : {
            index : -1,
            id : -1
        },
        colors: []
    };
    this.config = {
        namespaces : {
            project : {
                settings : 'project_settings',
                read : 'user_data.projects'
            }
        },
        backup: {
            filename: 'avocode.config.json',
            dir: path.resolve(__dirname, '.cache')
        },
        state: {
            path: path.resolve(process.env.HOME, '.avocode/state.json')
        },
        documents: {
            path: _avcdOptions.documentsPath
        },
        defaults: {
            colors: [
                {
                    value: "white",
                    name: '$color-white',
                    type: 'color'
                },
                {
                    value: "black",
                    name: '$color-black',
                    type: 'color'
                }
            ],
            replaces: [
                {
                    value: "([0-9]+\.?[0-9]*)px",
                    name: "em-auto($1px)",
                    type: "replace"
                }
            ]
        }
    };

    this._stateLocation = this.config.state.path;
    this._backupPath = path.resolve(this.config.backup.dir, this.config.backup.filename);
    this._selector = projectIdentifier;

    // fs.access(cachePath, fs.W_OK, function(err){
    //     if(err) throw err;
    // });
    //
    // fs.mkdir(cachePath, function(err, file){
    //     if(err) throw err;
    //     fs.writeFile(path.resolve(cachePath, 'var.json'), JSON.stringify(this.data), function(){
    //
    //     })
    // });

    this.state = JSON.parse(fs.readFileSync(this._stateLocation, {encoding: 'utf8'}));
    this.projects = _.result(this.state, self.config.namespaces.project.read);
    this._project = _.find(this.projects, function (project, index, collection) {
        if (_.isRegExp(self._selector) ?
                (self._selector.test(project['slug']) ||
                self._selector.test(project['name']))
                :
                (project['slug'].toLowerCase().indexOf(self._selector.toLowerCase()) >= 0 ||
                project['name'].toLowerCase().indexOf(self._selector.toLowerCase()) >= 0)
        ) {
            self.data.project.index = index;
            self.data.project.id = project['id'];
            return true;
        }
        return false;
    });

    /**
     *
     * @param {Object} options
     * @param {Function} options.done
     * @param {Object} [options.context]
     */
    this.parse = function (options) {
        var _options = _.extend({}, options),
            fonts = [],
            colors = [],
            colorNamer = require('color-namer'),
            c2xterm = require('color2xterm');

        /**
         *
         * @param {String} docPath
         * @param {Function} done
         * @private
         */
        function _parseDoc(docPath, done) {
            fs.readFile(docPath, {encoding: 'utf8'}, function (err, docJSON) {
                if (err) {
                    console.log("ignoring '%s'", err.path);
                    done();
                    return;
                }
                var docData = JSON.parse(docJSON);
                recurseSearch(docData, {
                    each: function (value, key) {
                        switch (key) {
                            case 'color':
                                var newColor = color(util.format('rgba(%s, %s, %s)', value['r'], value['g'], value['b']));
                                colors.push({
                                    hex: newColor.hex(),
                                    rgba: value,
                                    safe: parseInt(c2xterm.hex2xterm(newColor.hex())),
                                    name: colorNamer(newColor.hex()).ntc[0]
                                });
                                break;
                            case 'font':
                                fonts.push(value);
                                break;
                            default:
                                break;
                        }
                    }
                });
                done();
            });
        }

        async.forEachOf(self._project['design_groups'],
            function each(docMeta, index, done) {
                async.forEachOf(docMeta['designs'],
                    function perDoc(singleDocMeta, docIndex, onDoneWithSingleDoc) {
                        _parseDoc(path.resolve(self.config.documents.path, singleDocMeta['latest_revision_id'], 'data.json'), function(){
                            console.log('%s/%s - design groups parsed', index + 1, self._project['design_groups'].length);
                            onDoneWithSingleDoc();
                        })
                    }, function onDoneWithGroup() {
                        done();
                    })
            },

            function onDone() {
                self.data.colors = _.chain(colors)
                    .uniqWith(_.isEqual)
                    .map(function (val, index, collection) {
                        return {
                            value: val.hex,
                            name: (function () {
                                var _name = _.kebabCase(val.name.name);
                                self.data._colorCount[_name] = (self.data._colorCount[_name]) ? self.data._colorCount[_name] + 1 : 1;
                                return util.format('$color-%s%s', _name, (self.data._colorCount[_name] > 1) ? '-v' + self.data._colorCount[_name] : '')
                            })(),
                            type: 'color'
                        };
                    })
                    .value();

                var _fonts = {};
                self.data.fonts = _.chain(fonts)
                    .uniqWith(_.isEqual)
                    .reduce(function (collection, fontMeta, index) {
                        var _name = fontMeta['name'];
                        if (_.isString(_name) && _name.length > 0) {
                            var _camelName = _.camelCase(_name),
                                _kebabName = _.kebabCase(_name);
                            _fonts[_camelName] = {
                                value: util.format("font-family:[\\s]*%s;", _name),
                                name: (function () {
                                    return util.format('font-%s();', _kebabName)
                                })(),
                                type: 'replace'
                            };
                            _fonts[_camelName + '_safe'] = _.extend(
                                {},
                                _fonts[_camelName],
                                {value: util.format("font-family:[\\s]*\"%s\";", _name)}
                            );
                        }
                        return _fonts;
                    })
                    .toArray()
                    .value();
                console.log('\nfonts: %s', dump(self.data.fonts));
                console.log('\ncolors: %s', dump(self.data.colors));
                if (_.isFunction(_options.done)) _options.done.apply(_options.context, [self.data.colors, self.data.fonts]);
            });
    };


    this.addColor = function (colorName, colorValue) {
        var newColor = color(colorValue);
        self.data.colors.push({
            value: newColor.hex(),
            name: (function () {
                var _name = colorNamer(newColor.hex()).basic[0];
                self.data._colorCount[_name] = (self.data._colorCount[_name]) ? self.data._colorCount[_name] + 1 : 1;
                return util.format('color-%s%s', _name, (self.data._colorCount[_name] > 1) ? '-v' + self.data._colorCount[_name] : '')
            })(),
            type: 'color'
        })

    };

    /**
     *
     * @param {Object} options
     * @param {String} options.regex
     * @param {String} options.replacement
     */
    this.addRegex = function (options) {

    };

    this.save = function (done, options) {
        var _options = _.extend({}, options),
            _writePath = this._stateLocation || path.resolve(process.cwd(), 'state.json');
        this.data.settings = _.toArray(_.union(this.config.defaults.colors, this.data.colors, this.config.defaults.replaces, this.data.fonts));
        var _settingsPath = util.format('%s.%s.variables', self.config.namespaces.project.settings, self.data.project.id);
        if (done) {
            fs.readFile(this._stateLocation, {encoding: 'utf8'}, function (readErr, stateStr) {
                self.state = JSON.parse(stateStr);
                _.setWith(self.state, _settingsPath, self.data.settings, Object);
                fs.writeFile(_writePath, JSON.stringify(self.state), {encoding: 'utf8'}, function (writeErr) {
                    console.log('successfully updated state.json @ %s', self._stateLocation);
                    done.apply(_options.context, [readErr || writeErr, self.state]);
                });
            });
        } else {
            this.state = JSON.parse(fs.readFileSync(this._stateLocation, {encoding: 'utf8'}));
            _.setWith(self.state, _settingsPath, self.data.settings, Object);
            fs.writeFileSync(_writePath, JSON.stringify(self.state), {encoding: 'utf8'});
        }
    };

    /**
     *
     * @param {Function} [done]
     * @param {Object} [options]
     * @param {Object} options.context
     */
    this.backup = function (done, options) {
        var _options = _.extend({}, options),
            _data = _.toPlainObject(this);
        fs.writeFile(this._backupPath, JSON.stringify(_data), {encoding: 'utf8'}, function (err) {
            done.apply(_options.context, [err, _data])
        });
    };

    /**
     *
     * @param {String} [restoreFilePath]
     */
    this.restore = function (restoreFilePath) {

    };

    // console.log(dump(this));

}

module.exports = Avocode;