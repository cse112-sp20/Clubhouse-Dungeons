const extensionPath = '../dist'; // This is the path to the manifext.json file
const extensionID = `cngkocoehccomngohodhpmlpekpdjppj`; // This extension ID might not work for you, but if it does, feel free to remove this comment :)
const extensionLoginHtml = `login.html`; // The main page of our extension
const extensionPopupHtml = `popup.html`;

const testAPIToken = '5ed2b278-d7a6-4344-b33f-94b8901aa75a'
const puppeteer = require('puppeteer');
var extensionPage;
var testContainer;
var browser;

describe('Login intended behavior', () => {

    // Before anything open a new browser with our extension enabled
    beforeAll(async () => {
        // describe path to our extension
        const pathToExtension = require('path').join(__dirname, extensionPath);
        //open a new browser
        browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`
            ]
        });

        // open our extension in a new page
        extensionPage = await browser.newPage();
        await extensionPage.goto(`chrome-extension://${extensionID}/${extensionLoginHtml}`);

        // type in API Token for our test Workspace
        await extensionPage.type('#apiEntry', testAPIToken);

        // click the button then wait for navigation
        await Promise.all([
            extensionPage.waitForNavigation(), // The promise resolves after navigation has finished
            extensionPage.click('#button')
        ]).catch((error) => {
            fail('Login button not correctly redirecting')
        });

        // close this page
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
     * Testing profileContainer Button when Open
     */
    it('Test "profileContainer" Tab button when Open', async (  ) => {
        await extensionPage.click('#profileContainer');
        await extensionPage.click('#profileContainer');

        testContainer = await extensionPage.$('#profileContainer');
        expect(testContainer['_remoteObject']['description']).toContain('closed');

    });

    /**
     * Unit Test 2
     * Testing profileContainer Button when Closed
     */
    it('Test "profileContainer" Tab button when Closed', async () => {
        await extensionPage.click('#profileContainer');

        testContainer = await extensionPage.$('#profileContainer');
        expect(testContainer['_remoteObject']['description']).toContain('open');

    });
    
    /**
     * Unit Test 3
     * Testing myStories Tab
     */
    it('Test "Stories" Tab button', async () => {
        await extensionPage.click('#teamTab')
        await extensionPage.click('#storiesTab');

        testContainer = await extensionPage.$('#storiesTab');
        expect(testContainer['_remoteObject']['description']).toContain('selected');

    });

    /**
     * Unit Test 4
     * Testing allStories Tab
     */
    it('Test "Team" Tab button', async (  ) => {
        await extensionPage.click('#teamTab');

        testContainer = await extensionPage.$('#teamTab');
        expect(testContainer['_remoteObject']['description']).toContain('selected');

    });

    /**
     * Unit Test 5
     * Testing battleLog Tab
     */
    it('Test "battleLog" Tab button', async (  ) => {
        await extensionPage.click('#battleLogTab');

        testContainer = await extensionPage.$('#battleLogTab');
        expect(testContainer['_remoteObject']['description']).toContain('selected');

    });

    /**
     * Unit Test 6
     * Testing Signout button
     * MUST BE LAST TEST
     */
    it('Test Sign out Button', async () => {
        await extensionPage.click('#profileContainer');

        await Promise.all([
            extensionPage.waitForNavigation(), // The promise resolves after navigation has finished
            extensionPage.click('#signoutButton')
        ]).catch((error) => {
            fail('Sign Out button not correctly redirecting')
        });

        expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionLoginHtml}`);
    });
})
