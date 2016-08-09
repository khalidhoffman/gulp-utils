

/**
 *
 * @param {String|RegExp} projectIdentifier
 * @param {Object} [options]
 * @param {Object} options.documentsPath
 * @constructor
 */
function Avocode(projectIdentifier, options) {
    var fs = require('fs'),
        path = require('path'),
        util = require('util'),

        async = require('async'),
        _ = require('lodash'),
        color = require('onecolor'),

        utils = require('./utils'),
        dump = require('../dump'),

        self = this,
        _avcdOptions = _.defaults(options, {
            documentsPath: (function () {
                var state = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.avocode/state.json')));

                return path.join(process.env.HOME, util.format('.avocode/userdata/%s/documents/', state['user']['id']));
            })(),
            useJSONCache: false,
            cachePath: path.join(__dirname, '.cache')
        });

    this.state = {
        allFilesParsed: false
    };

    this.data = {
        _colorCount: {},
        project: {
            index: -1,
            id: -1
        },
        colors: []
    };

    this.config = {
        namespaces: {
            project: {
                settings: 'project_settings',
                read: 'user_data.projects'
            }
        },
        backup: {
            filename: 'avocode.config.json',
            dir: path.join(__dirname, '.cache')
        },
        state: {
            path: path.join(process.env.HOME, '.avocode/state.json')
        },
        documents: {
            path: _avcdOptions.documentsPath
        },
        defaults: (function () {
            try {
                var defaultsStr = fs.readFileSync(path.join(__dirname, '/defaults.json'), {encoding: 'utf8'}),
                    defaults = JSON.parse(defaultsStr);
                if (!_.isArray(defaults.replaces)) throw new Error("replaces field is incorrectly formatted");
                if (!_.isArray(defaults.colors)) throw new Error("colors field is incorrectly formatted");
                return defaults;
            } catch (err) {
                console.error(err);
                return {}
            }
        })()

    };

    this._stateLocation = this.config.state.path;
    this._backupPath = path.join(this.config.backup.dir, this.config.backup.filename);
    this._selector = projectIdentifier;

    if (_avcdOptions.useJSONCache) {

        fs.access(_avcdOptions.cachePath, fs.W_OK, function (err) {
            if (err) throw err;
        });

        fs.mkdir(_avcdOptions.cachePath, function (err, file) {
            if (err) throw err;
            fs.writeFile(path.join(_avcdOptions.cachePath, 'var.json'), JSON.stringify(self.data), function () {

            })
        });
    }

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
        }) || [];

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
                    return done();
                }
                var docData = JSON.parse(docJSON);
                utils.recurseObject(docData, {
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
                        _parseDoc(path.join(self.config.documents.path, singleDocMeta['latest_revision_id'], 'data.json'), function () {
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

                self.data.fonts = _.chain(fonts)
                    .uniqWith(_.isEqual)
                    .reduce(function (fontData, fontMeta, index) {
                        var _name = fontMeta['name'];
                        if (_.isString(_name) && _name.length > 0) {
                            var _camelName = _.camelCase(_name),
                                _kebabName = _.kebabCase(_name);
                            fontData[_camelName] = {
                                value: util.format("font-family:[\\s]*%s;", _name),
                                name: (function () {
                                    return util.format(self.config.defaults.font.mixin, _kebabName)
                                })(),
                                type: 'replace'
                            };
                            fontData[_camelName + '_safe'] = _.extend(
                                {},
                                fontData[_camelName],
                                {value: util.format("font-family:[\\s]*\"%s\";", _name)}
                            );
                        }
                        return fontData;
                    }, {})
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
            _writePath = this._stateLocation || path.join(process.cwd(), 'state.json');
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