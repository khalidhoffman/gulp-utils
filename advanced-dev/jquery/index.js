var jsDOM = require('jsdom'),
    jQuery = require('jquery'),
    jsdom = jsDOM.jsdom,
    isWindowed = require('../isWindowed'),
    doc = jsdom(''),
    _window = doc.defaultView,
    $ = (isWindowed)?jQuery:jQuery(_window);

module.exports = $;