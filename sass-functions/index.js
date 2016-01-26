var global = [],
    url = require('url'),
    sass = require('node-sass'),
    SassCache = require("../sass-cache"),
    Logger = require("../logger"),
    projectPackage = require('../package.json'),
    sassCache;

SassFunctions = {
    clear : function(){
        Logger('SassCache.clear()');
        sassCache = new SassCache({
            pages: [
                url.resolve(projectPackage['homepage'], '#functions') // hash included for debugging purposes. This typically has no effect on requests
            ],
            paths : projectPackage['paths']
        });
    },
    functions : {

        "save-cache($selector: '#root', $namespace: 'default', $data: 0)": function saveCache(selector, namespace, data) {
            var result = sass.types.Null.NULL,
                _selector = (selector.getValue) ? selector.getValue() : selector,
                _namespace = (namespace.getValue) ? namespace.getValue() : namespace,
                _data = (data.getValue) ? data.getValue() : data;
            if(sassCache.get('domReady')){

                Logger("\nSassFunctions.save-cache('%s', '%s', '%j')", _selector, _namespace, _data);

                // reuse data object.
                // TODO _data object usage could probably be written better
                _data = {};
                _data[_namespace] = data;
                sassCache.push(_selector, _data);
                result = data;
            } else {
                var args = arguments;
                Logger("\nSassFunctions.save-cache('%s', '%s', '%j') - waiting", _selector, _namespace, _data);
                sassCache.once('dom:ready', function(){
                    result = saveCache.apply(null, args);
                    Logger("\nSassFunctions.save-cache('%s', '%s', '%j')  = %j", _selector, _namespace, _data, result);
                })
            }
            return result;
        },

        "load-cache($selector: '#root', $namespace: 'default')": function loadCache(selector, namespace) {
            var result = sass.types.Null.NULL,
                _selector = (selector.getValue) ? selector.getValue() : selector,
                _namespace = (namespace.getValue) ? namespace.getValue() : namespace;
            if(sassCache.get('domReady')){

                Logger("\nSassFunctions.load-cache('%s', '%s')", _selector, _namespace);

                var parentSelector = sassCache.get$parentSelector(_selector),
                    parentData = sassCache.load(parentSelector);

                if (typeof parentData == 'undefined') {
                    Logger("SassFunctions.load-cache('%s', '%s') = NULL", _selector, _namespace);
                } else {
                    Logger("SassFunctions.load-cache('%s', '%s') = '%s'", _selector, _namespace, parentData[_namespace].getValue());
                    result = parentData[_namespace];
                }
            } else {
                var args = arguments;
                Logger("SassFunctions.load-cache('%s', '%s') - waiting", _selector, _namespace);
                sassCache.once('dom:ready', function(){
                    result = loadCache.apply(null, args);
                    Logger("SassFunctions.load-cache('%s', '%s') = %j", _selector, _namespace, result);
                });
            }
            return result;
        },

        "load-parent-cache($selector: '#root', $namespace: 'default')": function loadParentCache(selector, namespace) {
            var result = sass.types.Null.NULL,
                _selector = (selector.getValue) ? selector.getValue() : selector,
                _namespace = (namespace.getValue) ? namespace.getValue() : namespace;
            if(sassCache.get('domReady')){

                Logger("\nSassFunctions.load-parent-cache('%s', '%s')", _selector, namespace.getValue());
                var parentSelector = sassCache.get$parentSelector(_selector, {parentLevel: 1}),
                    parentData = sassCache.load(parentSelector);

                if (typeof parentData == 'undefined') {
                    Logger("SassFunctions.load-parent-cache('%s', '%s') = NULL", _selector, _namespace);
                } else {
                    Logger("SassFunctions.load-parent-cache('%s', '%s') = '%s'", _selector, _namespace, parentData[_namespace].getValue());
                    result = parentData[_namespace];
                }
            } else {
                var args = arguments;
                Logger("SassFunctions.load-parent-cache('%s', '%s') - waiting", _selector, _namespace);
                sassCache.once('dom:ready', function(){
                    result = loadParentCache.apply(null, args);
                    Logger("SassFunctions.load-parent-cache('%s', '%s') = %j", _selector, _namespace, result);
                });
            }
            return result;
        },

        "save-global($namespace, $data)": function (namespace, data) {
            var _namespace = (namespace.getValue) ? namespace.getValue() : namespace,
                _data = (data.getValue) ? data.getValue() : data;

            Logger("\nSassFunctions.save-global(%s, %j)", _namespace, _data);
            global[_namespace] = data;
            return data;
        },

        "load-global($namespace)": function (namespace) {
            var _namespace = (namespace.getValue) ? namespace.getValue() : namespace,
                _data = (global[namespace].getValue) ? global[namespace].getValue() : global[namespace];

            Logger("\nSassFunctions.load-global(%s) = %j", _namespace, _data);
            return global[namespace];
        },

        "log($data)": function (data) {
            Logger('\nlog: "%s"', data.getValue());
            return data;
        }
    }
};

//SassFunctions.clear();
module.exports = SassFunctions;