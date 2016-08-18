var fs = require('fs'),

    pugBeautify = require('pug-beautify'),
    _ = require('lodash');


module.exports = {

    beautify : function(filename, callback, options){
        var _options = _.defaults(options, {
            fill_tab: false,
            omit_div: false,
            tab_size: 4
        });
        fs.readFile(filename, {encoding: 'utf8'}, function(err, src){
           if (err) return callback(err);
           try {
                return callback(null, pugBeautify(src, _options));
           } catch (err){
                return callback(err)
           }
        });
    }
}
