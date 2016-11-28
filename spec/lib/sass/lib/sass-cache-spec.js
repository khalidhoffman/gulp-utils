describe('SassCache', function () {

    var SassCache = require('../../../../lib/sass/lib/sass-cache'),
        sassCache = new SassCache();

    describe("load()", function () {

        it('returns a previously saved value per given namespace', function () {
            var selector = '.test5 .test3 .test1',
                selector2 = '.test5 .test3.1 .test0',
                selector3 = '.test5 .test3.1',
                childSelector = selector + ' .testX',
                value = 28,
                value2 = -1;
            sassCache.push(selector, {someNumber: value});
            sassCache.push(selector2, {someNumber: value2});
            expect(sassCache.load(childSelector)).not.toBeUndefined();
            expect(sassCache.load(childSelector)['someNumber']).toBe(value);
            expect(sassCache.load(selector3)).toBeNull();
        });

    });

    describe("contains()", function () {

        it('can determine whether a selector is contained within another', function () {
            var selector = '.container .test2',
                childSelector = '.test2 .child',
                invalidSelector = '.a-container .test2',
                invalidChildSelector = '.fail',
                value = 44;

            sassCache.push(selector, {someNumber: value});
            expect(sassCache.contains(selector)).toBe(true, 'sassCache should contain previously pushed parent selector');
            expect(sassCache.contains(childSelector)).toBe(true, 'sassCache should contain child of pushed parent selector');
            expect(sassCache.contains(invalidSelector)).toBe(false);
            expect(sassCache.contains(invalidChildSelector)).toBe(false);
        });

    });
});