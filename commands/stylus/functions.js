var _ = require('lodash'),

    cache = {};


function initStylusFunctions(style) {
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

    style.define('cacheSave', cacheSave);
    style.define('debugLog', debugLog);
    style.define('logger', debugLog);
    style.define('cacheLoad', cacheLoad);
    style.define('toLowerCase', toLowerCase);
};


module.exports = {
    hookFunc: initStylusFunctions
};