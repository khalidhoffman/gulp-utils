const fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),

    global = {
        _json: {}
    },
    sass = require('node-sass'),
    log = require('../../../../logger');

class SassFunctionLib {

    /**
     *
     * @param {Object} [options]
     * @param {Boolean} [options.useLegacy=false]
     */
    constructor(options) {
        let self = this;

        this.config = _.defaults(options, {
            useLegacy: false
        });

        this.Cache = this.config.useLegacy ? require('../sass-cache/legacy') : require("../sass-cache");

        this.resetCache();

        this.functions = {

            "save-cache($selector: '#root', $namespace: 'default', $data: 0)": function (selector, namespace, data) {
                const _selector = (selector.getValue) ? selector.getValue() : selector,
                    _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

                self.sassCache.push(_selector, {
                    [_namespace]: data
                });

                return data;
            },

            "load-cache($selector: '#root', $namespace: 'default')": function (selector, namespace) {
                const _selector = (selector.getValue) ? selector.getValue() : selector,
                    _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

                let data = self.sassCache.load(_selector);

                if (data && data[_namespace]) {
                    return data[_namespace];
                } else {
                    return sass.types.Null.NULL;
                }
            },

            "save-global($namespace, $data)": function (namespace, data) {
                const _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

                let _data = (data.getValue) ? data.getValue() : data;

                log("\nSassFunctions.save-global(%s, %j)", _namespace, _data);
                global[_namespace] = data;
                return data;
            },

            "load-global($namespace)": function (namespace) {
                const _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

                let _data = (global[namespace].getValue) ? global[namespace].getValue() : global[namespace];

                log("\nSassFunctions.load-global(%s) = %j", _namespace, _data);
                return global[namespace];
            },

            "jsonStore($key, $value)": function ($key, $value) {
                var key = $key.getValue(),
                    value = $value;
                switch ($value.__proto__.constructor.name) {
                    case 'SassColor':
                        value = {
                            r: $value.getR(),
                            g: $value.getG(),
                            b: $value.getB(),
                            a: $value.getA()
                        };
                        break;
                    default:
                        value = $value.getValue();
                }
                _.set(global._json, key, value);
                return $value;
            },

            "jsonWrite($writePath)": function ($writePath) {
                const baseWritePath = path.parse(this.options.file).dir,
                    relWritePath = $writePath.getValue();

                try {
                    fs.writeFileSync(path.join(baseWritePath, relWritePath), JSON.stringify(global._json));
                } catch (err) {
                    console.error(err);
                }
                return $writePath;
            },

            "log($data)": function (data) {
                log('\nlog: "%s"', data.getValue());
                return data;
            }
        };
    }

    resetCache() {
        this.sassCache = new this.Cache();
    }

    clear() {
        log('SassCache.clear()');
        this.resetCache();
    }
}

let sassFunctionLib = new SassFunctionLib();
sassFunctionLib.legacy = new SassFunctionLib({useLegacy: true});
module.exports = sassFunctionLib;
