const extensionPath = '../dist'; // This is the path to the manifext.json file
const extensionID = `cngkocoehccomngohodhpmlpekpdjppj`; // This extension ID might not work for you, but if it does, feel free to remove this comment :)
const extensionPopupHtml = `login.html`; // The main page of our extension

const expectPuppeteer = require('expect-puppeteer');
const puppeteer = require('puppeteer');
var extensionPage;
var browser;

describe('extension', () => {
    beforeAll(async () => {
        // describe path to our extension
        const pathToExtension = require('path').join(__dirname, '../dist');
        browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`
            ]
        });

        // Open the extension in its own tab
        extensionPage = await browser.newPage();
        await extensionPage.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
    });

    afterAll(async () => {
        browser.close();

    });


    it('test for correct URL"', async () => {

        await expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionPopupHtml}`);

    });
})


//test('clicks the button', () => {
//    buttonClick(myMock);
//    expect(myMock).toHaveBeenCalled();
//});
