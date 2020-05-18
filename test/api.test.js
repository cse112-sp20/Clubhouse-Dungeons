const api = require('../src/api/api');
const testAPIToken = "5ec07d9a-f9a8-4541-a2fe-d2aae53169e1";
const memberID = "5ec07aaf-30c2-42ab-a9ee-7e1214f2e2d4";


it('1 is 1', () => {
    /* Need to setup the API variables first
     * Chase mentioned that we need to set up a test method in api
     * So I went ahead and defined a method called setupTest in api.js
     */
    api.setupTest(testAPIToken, memberID);

    // Then we will be testing this
    //api.getMyIncompleteStories();
    
    
    expect(1).toBe(1); // placeholder
});