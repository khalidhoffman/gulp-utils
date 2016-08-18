var path = require('path');
describe('pug-2-stylus task', function () {

    describe("regex filename matcher", function () {
        var utils = require(path.resolve(process.cwd(), 'lib/pug/lib/utils.js')),
            fileList = [
                'home/test/project/srcFileA.jade',
                'home/test/project/srcFileB.jade',
                'home/test/project/srcFileA.pug',
                'home/test/project/srcFileB.pug',
                'home/test/project/srcFileA.fail',
                'home/test/project/srcFileA.fail'
            ];

        it('recognizes jade files', function () {
            expect(utils.findFile('srcFileA.jade', fileList)).toEqual(fileList[0]);
        });

        it('recognizes pug files', function () {
            expect(utils.findFile('srcFileA.pug', fileList)).toEqual(fileList[2]);
        });

        it('recognizes files without an extension', function () {
            expect(utils.findFile('srcFileA', fileList)).toMatch(/srcFileA/);
        });

        it("does not recognize files that aren't provide in the fileList", function () {
            expect(utils.findFile('srcFileC.jade', fileList)).toEqual(false);
        });

    })
});
