var _ = require('lodash'),
    dump = require('../../dump'),

    cache = {};

function generateKey(prop) {
    return stripNonChars(prop['val']);
}

function stripNonChars(str) {
    return str.replace(/\W+/g, '');
}

function toLowerCase(str) {
    str['val'] = str['val'].toLowerCase();
    return str;
}


function cacheSave(prop, val) {
    var propKey = generateKey(prop);
    debugLog('cacheSave(%j)  @ \'%s\'', arguments, propKey);
    if (propKey) cache[propKey] = val;
    return val;
}

function cacheLoad(prop) {
    var propKey = generateKey(prop);
    debugLog('cacheLoad(%j) @ \'%s\'', arguments, propKey);
    if (propKey) return cache[propKey];
    return null;
}

function debugLog() {
    var logArgs = Array.prototype.slice.call(arguments).map(function (val, index) {
        return val['string'] || val
    });
    console.log.apply(console, logArgs);
    return arguments[0];
}

function dumpObj(arg1) {
    console.log.apply(console, ['dump: %s', dump(arg1)]);
    return arg1;
}

function extendProps(arg1, arg2) {
    var args = _.concat([{}], arguments),
        extendArgs = args.map(function (arg) {
            return arg.vals || {};
        });
    arg1.vals = _.extend.apply(null, extendArgs);
    return arg1;
}

function defaults(arg1, arg2) {
    var args = _.concat([{}], arguments),
        defaultsArgs = args.map(function (arg) {
            return arg.vals || {};
        });
    arg1.vals = _.defaults.apply(null, defaultsArgs);
    return arg1;
}

function initStylusFunctions(style) {
    style.define('cacheSave', cacheSave);
    style.define('debugLog', debugLog);
    style.define('extendProps', extendProps);
    style.define('defaults', defaults);
    style.define('dumpObj', dumpObj);
    style.define('logger', debugLog);
    style.define('cacheLoad', cacheLoad);
    style.define('toLowerCase', toLowerCase);
}


module.exports = {
    hookFunc: initStylusFunctions
};
