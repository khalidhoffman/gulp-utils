var sassFunctions = require('../../commands/sass/lib/sass-functions').functions;

describe('Sass Functions', function(){



    it('saves cached value', function(){
        var selector = '.container .long .test',
            sassSelector = {
                getValue : function(){
                    return selector;
                }
            },
            namespace = 'test',
            sassNamespaceStr = {
                getValue : function(){
                    return namespace;
                }
            },
            value = 44,
            valueObj = {someNumber: value},
            sassValueObj = {
                getValue : function(){
                    return valueObj;
                }
            };
        sassFunctions["save-cache($selector: '#root', $namespace: 'default', $data: 0)"].call(null, sassSelector, sassNamespaceStr, sassValueObj);
        expect(sassFunctions["load-cache($selector: '#root', $namespace: 'default')"].call(null, sassSelector, sassNamespaceStr)).toEqual(sassValueObj);
    });

});