/* eslint-disable */
const puppeteer = require('puppeteer')
const assert = require('assert')

const extensionPath = '../../../../../dist'; // This is the path to the manifext.json file
const extensionID = `cngkocoehccomngohodhpmlpekpdjppj`; // This extension ID might not work for you, but if it does, feel free to remove this comment :)
const extensionPopupHtml = `login.html`; // The main page of our extension

// Puppeteer object variables here
const extensionPage = null
const browser = null

/**
 * Calling the testing function here.  It is an async method.
 * We are defining the async function and immediately calling it
 */
async function testFunc(){
  console.log("test")
  // Open a new browser with puppeteer and load the extension
  browser = await puppeteer.launch({
    headless: false, // extension are allowed only in head-full mode
    executablePath: process.env.PUPPETEER_EXEC_PATH,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox'
    ]
  });

  // Open the extension in its own tab
  extensionPage = await browser.newPage();
  await extensionPage.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
}

testFunc();