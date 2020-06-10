# Testing Guide

## Prerequisites

### Windows

+ [Git for Windows](https://gitforwindows.org/)
+ [Node.js](https://nodejs.org/en/)

### Linux

+ [Node.js](https://nodejs.org/en/download/package-manager/)

### Mac

+ [Node.js](https://nodejs.org/en/download/package-manager/)

## Setup

1. Open the terminal (CMD for Windows), and navigate to your working directory.
2. Create the repository by entering

```shell
> git clone https://github.com/cse112-sp20/Quaranteam-8.git
```

3. Navigate into the newly created directory.
4. [Puppeteer](https://developers.google.com/web/tools/puppeteer/) and [Jest](https://jestjs.io/) are needed to test the program. Download and install them by entering

```shell
> npm install puppeteer jest
```

5. Set up the program environment by entering

```shell
> npm install
> npm run build
```

## Repo Testing Structure
All tests are written in the `test/` directory within the base directory. Each test file is named respective to the feature being tested and has the format name of `[feature_name].test.js`.

All tests not yet on the master or develop branch should be in a branch with the format name of `test/[feature_to_be_tested]`.

Please follow these formats when creating branches for testing.

## Creating Unit Tests

1. Navigate to the test folder. This is where the testing files are.
2. Find the `.test.js` file for the feature to be tested. If there is no file, create a new one named `[feature_name].test.js`.
3. Write some unit tests in these formats.
	1. An empty unit test looks like
	
		```javascript
		it('[One line summary of the test]', done => {
		    // TODO: Test functionality
		    done();
		});
		```
	
		+ The function `it` specifies that this code is a unit test.
		+ The first parameter is the descriptive string for the test's name.
		+ The second parameter is the callback to be called when testing completes. Without the callback this unit test will either be skipped or run into errors.
		+ The `TODO` line is where the unit test's functionality needs to be implemented.
	2. The primary testing function `expect()`
		+ Think of `expect()` as conditional functions. If one condtion fails, the test fails. If one condition passes, then the test continues. If all conditions pass, then the test passes.
		+ Sample `expect()` usages
			
			+ using `.toBe()` to check for equality.
			
			```javascript
			expect(incompleteStories.length).toBe(allIncompleteIDs.length);
			```
			
			+ using `.toContain()` to check if `story['id']` is an element of `myIncompleteIDs`.
			
			```javascript
			expect(myIncompleteIDs).toContain(story['id']);
			```
			
		+ Look at the [`expect()`](https://jestjs.io/docs/en/expect) documentation for more options.

## Creating Integration/End-to-End Tests

1. Navigate to the test folder. This is where the testing files are.
2. Find the `.test.js` file for the feature to be tested. If there is no file, create a new file named `[feature_name].test.js`.
3. Copy the constants to maintain extension ID and import puppeteer instructions.
	```javascript
	const extensionID = `cngkocoehccomngohodhpmlpekpdjppj`;
	const extensionLoginHtml = `login.html`;
	const extensionPopupHtml = `popup.html`;
	const puppeteer = require('puppeteer');
	```
4. Copy the variables to access the extension page and browser for testing.
	```javascript
	var extensionPage;
	var browser;
	```
5. Create a describe block with the `beforeAll` and `afterAll` blocks.
	```javascript
	describe('[feature_name]', () => {
	    beforeAll(async () => {
	        // Path to our extension
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
	    // TODO: Test functionality
	});
	```
	1. The function `describe` blocks group tests into suites to provide the option of implementing any code prior to and post test execution. Remember to rename `[feature_name]` to the respective functionality test.
	2. In the sample, the `beforeAll` block starts a browser to open the extension in a new webpage, and the `afterAll` block closes the browser once all tests complete.
	3. Add new tests using the `it` function `it('[test_name]', test_execution_function)` at the `TODO` line.
		+ Look at the [Getting Started](https://jestjs.io/docs/en/getting-started) documentation for examples of simple tests.
		+ Look at [Puppeteer's API](https://pptr.dev/) documentation for details on UI interaction commands.
		+ Sample `it` usage
		
		```javascript
		it(' test for correct URL"', async () => {
		    await expect(extensionPage.url()).toMatch('chrome-extension://${extensionID}/${extensionPopupHtml}`);
		});
		```

## Running Tests

Run all tests by entering

```shell
> npm run test
```

This will output how many tests have passed and failed, and how the failed tests failed.
