var isNwjs = false;
try {isNwjs = (typeof require('nw.gui') !== 'undefined');  } catch(e) { console.log(e) ;}
module.exports = isNwjs;