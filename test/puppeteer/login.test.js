const extensionPath = '../../dist' // This is the path to the manifext.json file
const extensionID = 'cngkocoehccomngohodhpmlpekpdjppj' // This extension ID might not work for you, but if it does, feel free to remove this comment :)
const extensionLoginHtml = 'login.html' // The main page of our extension
const extensionPopupHtml = 'popup.html'

const testAPIToken = '5ed2b278-d7a6-4344-b33f-94b8901aa75a'
/* const memberID = '5ecdd3de-0125-4888-802a-5d3ba46ca0dc'
const workspace = 'quarantest8'
const myName = '_Test User_' */
const waitForNavigationTimeout = 3000
/* const expectPuppeteer = require('expect-puppeteer') */
const puppeteer = require('puppeteer')
var extensionPage
var browser

/*
 * Testing Suite for login.js
 */
describe('Login error handling', () => {
  // Before anything open a new browser with our extension enabled
  beforeAll(async () => {
    // describe path to our extension
    const pathToExtension = require('path').join(__dirname, extensionPath)
    browser = await puppeteer.launch({
      headless: false,
      args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`
      ]
    })
  })

  // Before each test, open our extension in a new page
  beforeEach(async () => {
    extensionPage = await browser.newPage()
    await extensionPage.goto(`chrome-extension://${extensionID}/${extensionLoginHtml}`)
  })

  // After each test, close the page
  afterEach(async () => {
    await extensionPage.close()
  })

  // After all tests are done, close the browser
  afterAll(async () => {
    browser.close()
  })

  /**
   * Unit Test 0
   * Testing opened page in browser
   * Checks if the page created is in the correct url
   */
  it('test for correct URL"', async () => {
    expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionLoginHtml}`)
    // await expect(extensionPage.url()).toMatch('wrong');
  })

  /**
   * Unit Test 1
   * Testing when apiEntry is empty
   */
  it('API empty input', async () => {
    // click the button then wait for navigation
    await Promise.all([
      extensionPage.waitForNavigation({ timeout: waitForNavigationTimeout }), // The promise resolves after navigation has finished
      extensionPage.click('#button')
    ]).catch((error) => {
      // Error expected
      console.log('Success: ' + error)
    })

    await expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionLoginHtml}`)
    // expect(extensionPage.url()).toMatch(`wrong`);
  })

  /**
   * Unit Test 2
   * Testing when apiEntry is empty
   */
  it('API incorrect input', async () => {
    await extensionPage.type('#apiEntry', 'This is not an API Key')

    // click the button then wait for navigation
    await Promise.all([
      extensionPage.waitForNavigation({ timeout: waitForNavigationTimeout }), // The promise resolves after navigation has finished
      extensionPage.click('#button')
    ]).catch((error) => {
      // Error expected
      console.log('Success: ' + error)
    })

    expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionLoginHtml}`)
    // expect(extensionPage.url()).toMatch(`wrong`);
  })

  /**
   * Unit Test 3
   * Correct length/format with a wrong API
   */
  it('API typo input', async () => {
    await extensionPage.type('#apiEntry', '5ed2b278-d7a6-4344-b33f-94b8901aa75z')

    // click the button then wait for navigation
    await Promise.all([
      extensionPage.waitForNavigation({ timeout: waitForNavigationTimeout }), // The promise resolves after navigation has finished
      extensionPage.click('#button')
    ]).catch((error) => {
      // Error expected
      console.log('Success: ' + error)
    })

    expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionLoginHtml}`)
    // expect(extensionPage.url()).toMatch(`wrong`);
  })

  /**
   * Unit Test 4
   * HTML Script Protection
   */
  it('HTML Scripting input', async () => {
    await extensionPage.type('#apiEntry', '<script>console.log(\'why hello there\')<script>')

    // click the button then wait for navigation
    await Promise.all([
      extensionPage.waitForNavigation({ timeout: waitForNavigationTimeout }), // The promise resolves after navigation has finished
      extensionPage.click('#button')
    ]).catch((error) => {
      // Error expected
      console.log('Success: ' + error)
    })

    expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionLoginHtml}`)
    // expect(extensionPage.url()).toMatch(`wrong`);
  })

  /**
   * Unit Test 5
   * UTF-8 input
   * NOT WORKING
   */
  // it('UTF-8 input', async () => {
  //    await extensionPage.type('#apiEntry', '');

  //    // click the button then wait for navigation
  //    await Promise.all([
  //        extensionPage.waitForNavigation({ timeout: waitForNavigationTimeout }), // The promise resolves after navigation has finished
  //        extensionPage.click('#button')
  //    ]).catch((error) => {
  //        //Error expected
  //    });

  //    expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionLoginHtml}`);
  //    //expect(extensionPage.url()).toMatch(`wrong`);

  // })
})

describe('Login intended behavior', () => {
  // Before anything open a new browser with our extension enabled
  beforeAll(async () => {
    // describe path to our extension
    const pathToExtension = require('path').join(__dirname, extensionPath)
    // open a new browser
    browser = await puppeteer.launch({
      headless: false,
      args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`
      ]
    })
  })

  // Before each test, open our extension in a new page
  beforeEach(async () => {
    extensionPage = await browser.newPage()
    await extensionPage.goto(`chrome-extension://${extensionID}/${extensionLoginHtml}`)
  })

  // After each test, close the page
  afterEach(async () => {
    await extensionPage.close()
  })

  // After all tests are done, close the browser
  afterAll(async () => {
    browser.close()
  })

  /**
   * Unit Test 0
   * Testing opened page in browser
   * Checks if the page created is in the correct url
   */
  it('test for correct URL"', async () => {
    expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionLoginHtml}`)
    // await expect(extensionPage.url()).toMatch('wrong');
  })

  /**
   * Unit Test 1
   * Testing intended login behavior
   * Writes correct API into apiEntry and clicks 'enter' button
   */
  it('API correct input', async () => {
    await extensionPage.type('#apiEntry', testAPIToken)

    // click the button then wait for navigation
    await Promise.all([
      extensionPage.waitForNavigation(), // The promise resolves after navigation has finished
      extensionPage.click('#button')
    ]).catch((error) => {
      throw new Error('Login button not correctly redirecting: ' + error)
    })
    await expect(extensionPage.url()).toMatch(`chrome-extension://${extensionID}/${extensionPopupHtml}`)
    // expect(extensionPage.url()).toMatch(`wrong`);
  })
})
