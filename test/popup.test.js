const extensionPath = '../dist'; // This is the path to the manifext.json file
const extensionID = `cngkocoehccomngohodhpmlpekpdjppj`; // This extension ID might not work for you, but if it does, feel free to remove this comment :)
const extensionLoginHtml = `login.html`; // The main page of our extension
const extensionPopupHtml = `popup.html`;

const testAPIToken = '5ed2b278-d7a6-4344-b33f-94b8901aa75a'
const memberID = '5ecdd3de-0125-4888-802a-5d3ba46ca0dc'
const workspace = 'quarantest8'
const myName = '_Test User_'
const waitForNavigationTimeout = 3000;
const expectPuppeteer = require('expect-puppeteer');
const puppeteer = require('puppeteer');
var extensionPage;
var browser;

describe('Login intended behavior', () => {

    // Before anything open a new browser with our extension enabled
    beforeAll(async () => {
        // describe path to our extension
        const pathToExtension = require('path').join(__dirname, '../dist');
        //open a new browser
        browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`
            ]
        });

        extensionPage = await browser.newPage();
        await extensionPage.goto(`chrome-extension://${extensionID}/${extensionLoginHtml}`);

        await extensionPage.type('#apiEntry', testAPIToken);

        // click the button then wait for navigation
        await Promise.all([
            extensionPage.waitForNavigation(), // The promise resolves after navigation has finished
            extensionPage.click('#button')
        ]).catch((error) => {
            fail('Login button not correctly redirecting')
        });

        await extensionPage.close();
    });

    // Before each test, open our extension in a new page
    beforeEach(async () => {
        extensionPage = await browser.newPage();
        await extensionPage.goto(`chrome-extension://${extensionID}/${extensionLoginHtml}`);
        await extensionPage.waitForNavigation();
    });

    // After each test, close the page
    afterEach(async () => {
        await extensionPage.close();
    });

    // After all tests are done, close the browser
    afterAll(async () => {
        browser.close();
    });

    /**
    * Unit Test 0
    * Testing opened page in browser
    * Checks if new page correctly redirects to PopupHTML
    */
    it('Test for correct URL/Redirect', async () => {

        expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
        //await expect(extensionPage.url()).toMatch('wrong');

    });

    /**
     * Unit Test 1
     */
    it('Test "All Stories" Tab button', async () => {
        await extensionPage.click('#profileContainer');
        const profileContainer = extensionPage.$('#profileContainer');
        expect(profileContainer).toContain('open');
    });

})
