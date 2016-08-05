module.exports = {
    php : function (text, attrs, ast) {
        return '<?php ' + text + ' ?>';
    },
    ejs : function (text) {
        return '<% ' + text + ' %>';
    }
};