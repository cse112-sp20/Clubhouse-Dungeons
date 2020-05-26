const puppeteer = require('puppeteer');
const assert = require('assert');

const extensionPath = '../../../../../'; // This is the path to the manifext.json file
const extensionID = `kggoidbofmfjedcmnincmhlefijkpgej`; // This extension ID might not work for you, but if it does, feel free to remove this comment :)
const extensionPopupHtml = `popup.html`; // The main page of our extension

// Puppeteer object variables here
let extensionPage = null;
let browser = null;

/**
 * Calling the testing function here.  It is an async method.
 * We are defining the async function and immediately calling it
 */
/*
(async () => {

  // Open a new browser with puppeteer and load the extension
  browser = await puppeteer.launch({
    headless: false, // extension are allowed only in head-full mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });


  // Open the extension in its own tab
  extensionPage = await browser.newPage();
  await extensionPage.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
})();
*/