
test('1 is 1', () => {
    expect(1).toBe(1);
});


const myMock = jest.fn();
myMock.mockReturnValueOnce(true).mockReturnValueOnce(false);
const expectPuppeteer = require('expect-puppeteer');
const puppeteer = require('puppeteer');
var browser;
/*
describe('extension', () => {
    beforeAll(async () => {
        // describe path to our extension
        const pathToExtension = require('path').join(__dirname, '../src');
        browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`
            ]
        });
    });

    it('browser opens and url == "about:blank"', async () => {

        const targets = await browser.targets();


        // ONLY TESTS BACKGROUND PROCESS
        //const BackgroundPage = targets.find(target => target.type() === 'background_page');
        //const page = await BackgroundPage.page();

        //returns page of the browser - not the extension
        const page = targets.find(target => target.type() === 'page');

        await expect(page.url()).toMatch('about:blank');
        // CANT TEST EXTENSION POPUPS!!!
        // Can test background processes only

        //await expect(page).toContain('Quaranteam - 8')
        //await expect(page.title()).resolves.toMatch('Quaranteam - 8');
        //await expect(browser).toMatch('')

        browser.close();
    });
})
*/

//test('clicks the button', () => {
//    buttonClick(myMock);
//    expect(myMock).toHaveBeenCalled();
//});
