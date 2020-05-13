const puppeteer = require('puppeteer');
const assert = require('assert');

const extensionPath = '../../../../../src';
const extensionID = `najinbkanbgciaaboeggmbaencfmcpjh`; // Right now , this extension id works for me, but I wonder if it will change 
const extensionPopupHtml = `popup.html`;

let extensionPage = null;
let browser = null;



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