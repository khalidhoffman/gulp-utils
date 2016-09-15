var _ = require('lodash'),
    dump = require('../../dump'),

    cache = {};

    function buildKeyFromProp(prop) {
        return sanitizeProp(prop['val']);
    }

    function sanitizeProp(str) {
        return str.replace(':', ' ').replace(' ', '');
    }

    function toLowerCase(str) {
        str['val'] = str['val'].toLowerCase();
        return str;
    }


    function cacheSave(prop, val) {
        var _prop = buildKeyFromProp(prop);
        debugLog('cacheSave(%j) <- %s', arguments, _prop);
        if (_prop) cache[_prop] = val;
        return val;
    }

    function cacheLoad(prop) {
        var _prop = buildKeyFromProp(prop);
        debugLog('cacheLoad(%j) <- %s', arguments, _prop);
        if (_prop) return cache[_prop];
        return null;
    }

    function debugLog() {
        console.log.apply(console, _.map(Array.prototype.slice.call(arguments), function (val, index) {
            return val['string'] || val
        }));
        return arguments[0];
    }

    function dumpObj(arg1) {
        console.log.apply(console, ['dump: %s', dump(arg1)]);
        return arg1;
    }

    function extendProps(arg1, arg2) {
        var args = _.concat([{}], arguments),
            extendArgs = args.map(function(arg){
                return arg.vals || {};
            });
        arg1.vals = _.extend.apply(null, extendArgs);
        return arg1;
    }

function initStylusFunctions(style) {
    style.define('cacheSave', cacheSave);
    style.define('debugLog', debugLog);
    style.define('extendProps', extendProps);
    style.define('dumpObj', dumpObj);
    style.define('logger', debugLog);
    style.define('cacheLoad', cacheLoad);
    style.define('toLowerCase', toLowerCase);
}


module.exports = {
    hookFunc: initStylusFunctions
};