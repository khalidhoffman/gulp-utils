var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    isWindowed = require(path.resolve(process.cwd(), './gulp-utils/advanced-dev/isWindowed'));

/**
 *
 * @param jadeStr
 * @param options
 * @param options.readPath
 */
function parseJade(jadeStr, options) {
    var jade = require('jade'),
        _options = _.extend({}, options),
        jadeOptions = {};

    if (_options.readPath) jadeOptions.filename = _options.readPath;

    jade.filters.php = function (text) {
        return '';
    };

    jade.filters.ejs = function (text) {
        return '';
    };


    var html = jade.render(jadeStr, jadeOptions);
    console.log('Parsing %s', html);
    return parseHTML(html, options)
}

function parseHTML(htmlStr, options) {

    var jsdom = require("jsdom").jsdom,
        doc = jsdom(htmlStr, options),
        _window = doc.defaultView,
        jQuery = require('jquery'),
        SassNode = require('./sass-node'),
        $ = (isWindowed) ? jQuery : jQuery(_window);
    console.log('$: %O', $);
    var $pageContent = $(htmlStr);

    var bodyNode = new SassNode($pageContent);
    return bodyNode.compile();
}

module.exports = {
    parse: parseHTML,
    parseJade: parseJade,
    /**
     *
     * @param {String} jadeStr
     * @param {Object} options
     * @param {String} options.writePath
     * @param {String} options.readPath
     */
    jadeToSass: function (jadeStr, options) {
        var _options = _.extend({

        }, options),
            output = parseJade(jadeStr, options);
        fs.writeFile( _options.writePath, output, function (err) {
            if (err) throw err;
            console.log('saved @ %s', _options.writePath);
        })
    }
};