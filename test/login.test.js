const extensionPath = '../dist'; // This is the path to the manifext.json file
const extensionID = `cngkocoehccomngohodhpmlpekpdjppj`; // This extension ID might not work for you, but if it does, feel free to remove this comment :)
const extensionLoginHtml = `login.html`; // The main page of our extension
const extensionPopupHtml = `popup.html`;
const expectPuppeteer = require('expect-puppeteer');
const puppeteer = require('puppeteer');
var extensionPage;
var browser;


/*
 * Testing Suite for login.js
 */
describe('extension', () => {

    // Before anything open a new browser with our extension enabled
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
        //extensionPage = await browser.newPage();
        //await extensionPage.goto(`chrome-extension://${extensionID}/${extensionLoginHtml}`);
    });

    // Before each test, open our extension in a new page
    beforeEach(async () => {
        extensionPage = await browser.newPage();
        await extensionPage.goto(`chrome-extension://${extensionID}/${extensionLoginHtml}`);
    });

    // After each test, close the page
    afterEach(async () => {
        await extensionPage.close();
        // NEED TO CLEAR CHROME STORAGE
    });

    // After all tests are done, close the browser
    afterAll(async () => {
       browser.close();

    });


    /**
    * Unit Test 0
    * Testing opened page in browser
    * Checks if the page created is in the correct url
    */
    it('test for correct URL"', async () => {

        await expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionLoginHtml}`);
        //await expect(extensionPage.url()).toMatch('wrong');

    });

    /**
    * Unit Test 1
    * Testing intended login behavior
    * Writes correct API into apiEntry and clicks 'enter' button
    */
    it('API correct input', async () => {
        await extensionPage.type('#apiEntry', '5ed2b278-d7a6-4344-b33f-94b8901aa75a');

        // click the button then wait for navigation
        await Promise.all([
            extensionPage.waitForNavigation(), // The promise resolves after navigation has finished
            extensionPage.click('#button')
        ]).catch((error) => {
            fail('Login button not correctly redirecting')
        });
        expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
        //expect(extensionPage.url()).toMatch(`wrong`);

    })

    /**
     * Unit Test 2
     * Testing when apiEntry is empty
     */
    it('API empty input', async () => {
        // click the button then wait for navigation
        await Promise.all([
            extensionPage.waitForNavigation(), // The promise resolves after navigation has finished
            extensionPage.click('#button')
        ]).catch((error) => {
            //fail('Login button not correctly redirecting')
        });

        //expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionLoginHtml}`);
        //expect(extensionPage.url()).toMatch(`wrong`);

    })
})


//test('clicks the button', () => {
//    buttonClick(myMock);
//    expect(myMock).toHaveBeenCalled();
//});
