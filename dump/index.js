var util = require('util');

/**
 * 
 * @param obj
 * @returns {String}
 */
module.exports = function(obj) {
    return util.inspect(obj, { colors: true });
};
