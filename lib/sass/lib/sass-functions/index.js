const fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),

    global = {
        _json: {}
    },
    sass = require('node-sass'),
    log = require('../../../../logger');

/**
 *
 * @param {Object} [options]
 * @param {Boolean} [options.useLegacy=false]
 */
function SassFunctionLib(options) {

    var useLegacy = options && options.useLegacy,
        SassCache = useLegacy ? require('../sass-cache/legacy') : require("../sass-cache");
    sassCache = new SassCache();

    return {
        clear: function () {
            log('SassCache.clear()');
            sassCache = new SassCache();
        },
        functions: {

            "save-cache($selector: '#root', $namespace: 'default', $data: 0)": function (selector, namespace, data) {
                const _selector = (selector.getValue) ? selector.getValue() : selector,
                    _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

                let _data = (data.getValue) ? data.getValue() : data;

                log("\nSassFunctions.save-cache('%s', '%s', '%j')", _selector, _namespace, _data);

                // reuse data object.
                // TODO _data object usage could probably be written better
                _data = {};
                _data[_namespace] = data;
                sassCache.push(_selector, _data);
                return data;
            },

            "load-cache($selector: '#root', $namespace: 'default')": function (selector, namespace) {
                const _selector = (selector.getValue) ? selector.getValue() : selector,
                    _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

                let data = sassCache.load(_selector);

                if (data && data[_namespace]) {
                    //log("SassFunctions.load-parent-cache('%s', '%s') = '%s'", _selector, _namespace, parentData[_namespace].getValue());
                    return data[_namespace];
                } else {
                    //log("SassFunctions.load-parent-cache('%s', '%s') = NULL", _selector, _namespace);
                    return sass.types.Null.NULL;
                }
            },

            "load-parent-cache($selector: '#root', $namespace: 'default')": function (selector, namespace) {
                const _selector = (selector.getValue) ? selector.getValue() : selector,
                    _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

                let data = sassCache.load(_selector);

                if (data && data[_namespace]) {
                    //log("SassFunctions.load-parent-cache('%s', '%s') = '%s'", _selector, _namespace, parentData[_namespace].getValue());
                    return data[_namespace];
                } else {
                    //log("SassFunctions.load-parent-cache('%s', '%s') = NULL", _selector, _namespace);
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
        }
    };
}

var sassHelperLib = new SassFunctionLib();
sassHelperLib.legacy = new SassFunctionLib({useLegacy: true});

module.exports = sassHelperLib;
