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
            if(sassCache.get('domReady')){

                var _selector = (selector.getValue) ? selector.getValue() : selector,
                    _namespace = (namespace.getValue) ? namespace.getValue() : namespace,
                    _data = (data.getValue) ? data.getValue() : data;

                Logger("\nSassFunctions.save-cache('%s', '%s', '%j')", _selector, _namespace, _data);

                // reuse data object.
                // TODO _data object usage could probably be written better
                _data = {};
                _data[_namespace] = data;
                sassCache.push(_selector, _data);
                return data;
            } else {
                sassCache.once('dom:ready', function(){
                    saveCache.apply(this, arguments);
                })
            }
        },

        "load-cache($selector: '#root', $namespace: 'default')": function loadCache(selector, namespace) {
            if(sassCache.get('domReady')){
                var _selector = (selector.getValue) ? selector.getValue() : selector,
                    _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

                Logger("\nSassFunctions.load-cache('%s', '%s')", _selector, _namespace);

                var parentSelector = sassCache.get$parentSelector(_selector),
                    parentData = sassCache.load(parentSelector);

                if (typeof parentData == 'undefined') {
                    Logger("SassFunctions.load-cache('%s', '%s') = NULL", _selector, _namespace);
                    return sass.types.Null.NULL;
                } else {
                    Logger("SassFunctions.load-cache('%s', '%s') = '%s'", _selector, _namespace, parentData[_namespace].getValue());
                    return parentData[_namespace];
                }
            } else {
                sassCache.once('dom:ready', function(){
                    loadCache.apply(this, arguments);
                });
            }
        },

        "load-parent-cache($selector: '#root', $namespace: 'default')": function loadParentCache(selector, namespace) {
            if(sassCache.get('domReady')){
                var _selector = (selector.getValue) ? selector.getValue() : selector,
                    _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

                Logger("\nSassFunctions.load-parent-cache('%s', '%s')", _selector, namespace.getValue());
                var parentSelector = sassCache.get$parentSelector(_selector, {parentLevel: 1}),
                    parentData = sassCache.load(parentSelector);

                if (typeof parentData == 'undefined') {
                    Logger("SassFunctions.load-parent-cache('%s', '%s') = NULL", _selector, _namespace);
                    return sass.types.Null.NULL;
                } else {
                    Logger("SassFunctions.load-parent-cache('%s', '%s') = '%s'", _selector, _namespace, parentData[_namespace].getValue());
                    return parentData[_namespace];
                }
            } else {
                sassCache.once('dom:ready', function(){
                    loadParentCache.apply(this, arguments);
                });
            }
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

SassFunctions.clear();
module.exports = SassFunctions;