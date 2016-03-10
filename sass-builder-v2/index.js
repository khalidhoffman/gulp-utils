var _ = require('lodash'),
    isWindowed = require('../advanced-dev/isWindowed');

function parseJade(jadeStr, options){
    var jade = require('jade'),
        _options = _.extend({

        }, options),
        jadeOptions = {};

    if(_options.filename) jadeOptions.filename = _options.filename;

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

function parseHTML(htmlStr, options){

    var jsdom = require("jsdom").jsdom,
        doc = jsdom(htmlStr, options),
        _window = doc.defaultView,
        jQuery = require('jquery'),
        SassNode = require('./sass-node'),
        $ = (isWindowed)?jQuery:jQuery(_window);
    console.log('$: %O', $);
    var $pageContent = $(htmlStr);

    var bodyNode = new SassNode($pageContent);
    return bodyNode.compile();
}

module.exports = {
    parse : parseHTML,
    parseJade : parseJade
};