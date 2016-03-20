jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * 1000;

describe('SassCache', function () {
    var SassCache = require('../../sass-cache'),
        sassCache;

    beforeAll(function () {
        sassCache = new SassCache();
    });
    
    afterAll(function () {
        sassCache._printDOM();
    });

    it('has tests setup correctly', function () {
        expect(SassCache).toBeDefined('Class should exist');
        expect(sassCache).toBeDefined();
    });

    it('creates a namespace for a given selector', function () {
        var selector = '.test1',
            value = 44;
        sassCache.push(selector, {someNumber: value});
        expect(sassCache.hasSelector(selector)).toBe(true);
    });

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

    it('can find the most specific parent selector for a given child selector', function () {
        var selector = '.container .test3',
            childSelector = '.test3 .child',
            invalidSelector = '.a-container .test3',
            invalidChildSelector = '.fail',
            value = 44;

        sassCache.push(selector, {someNumber: value});
        expect(sassCache.get$parentSelector(selector)).toBe(selector, 'sassCache should return duplicate cached selector of itself');
        expect(sassCache.get$parentSelector(childSelector)).toBe('.test3', 'sassCache should contain child of pushed get$parentSelector selector');
        expect(sassCache.get$parentSelector(invalidSelector)).toBe('#main');
        expect(sassCache.get$parentSelector(invalidChildSelector)).toBe('#main');
    });

    it('can find the parent of the most specific parent selector for a given child selector', function () {
        var selector = '.container .grandparent .parent .test4',
            parentSelector = '.container .grandparent .parent',
            grandparentSelector = '.container .grandparent',
            value = 44;

        sassCache.push(selector, {someNumber: value});
        expect(sassCache.get$parentSelector(parentSelector, {parentLevel: 1})).toBe(grandparentSelector);
        expect(sassCache.get$parentSelector(selector, {parentLevel: 1})).toBe(parentSelector);
    });

    it('returns a previously saved value per given namespace', function () {
        var selector = '.test5',
            value = 28;
        sassCache.push(selector, {someNumber: value});
        expect(sassCache.load(selector)['someNumber']).toBe(value);

    });

});