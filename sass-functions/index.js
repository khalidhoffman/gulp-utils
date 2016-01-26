var global = [],
    sass = require('node-sass'),
    SassCache = require("../sass-cache"),
    Logger = require("../logger"),
    sassCache = new SassCache();

module.exports = {
    clear : function(){
        Logger('SassCache.clear()');
        sassCache = new SassCache();
    },
    functions : {

        "save-cache($selector: '#root', $namespace: 'default', $data: 0)": function (selector, namespace, data) {
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
        },

        "load-cache($selector: '#root', $namespace: 'default')": function (selector, namespace) {
            var _selector = (selector.getValue) ? selector.getValue() : selector,
                _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

            Logger("\nSassFunctions.load-cache('%s', '%s')", _selector, _namespace);

            var parentSelector = sassCache.getParentSelector(_selector),
                parentData = sassCache.load(parentSelector);

            if (typeof parentData == 'undefined') {
                Logger("SassFunctions.load-cache('%s', '%s') = NULL", _selector, _namespace);
                return sass.types.Null.NULL;
            } else {
                Logger("SassFunctions.load-cache('%s', '%s') = '%s'", _selector, _namespace, parentData[_namespace].getValue());
                return parentData[_namespace];
            }
        },

        "load-parent-cache($selector: '#root', $namespace: 'default')": function (selector, namespace) {
            var _selector = (selector.getValue) ? selector.getValue() : selector,
                _namespace = (namespace.getValue) ? namespace.getValue() : namespace;

            Logger("\nSassFunctions.load-parent-cache('%s', '%s')", _selector, namespace.getValue());
            var parentSelector = sassCache.getParentSelector(_selector, {parentLevel: 1}),
                parentData = sassCache.load(parentSelector);

            if (typeof parentData == 'undefined') {
                Logger("SassFunctions.load-parent-cache('%s', '%s') = NULL", _selector, _namespace);
                return sass.types.Null.NULL;
            } else {
                Logger("SassFunctions.load-parent-cache('%s', '%s') = '%s'", _selector, _namespace, parentData[_namespace].getValue());
                return parentData[_namespace];
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