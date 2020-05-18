const api = require('../src/api/api');
const testAPIToken = "5ec07d9a-f9a8-4541-a2fe-d2aae53169e1";
const memberID = "5ec07aaf-30c2-42ab-a9ee-7e1214f2e2d4";
const fetch =  require("isomorphic-fetch").fetch;
const resolve = require("isomorphic-fetch").resolve;

const myIncompleteCount = 2;
const myIncompleteIDs = [56, 90];


/**
 * Testing for api.getMyIncompleteStories()
 * Checks if the count of test stories are correct and that they are the correct ids
 */
it('Test Incomplete Stories', done => {
    /* Need to setup the API variables first
     * Chase mentioned that we need to set up a test method in api
     * So I went ahead and defined a method called setupTest in api.js
     */
    api.setupTest(testAPIToken, memberID, () => {
        // The only story that has been assigned to this test user as of right now is story 56
        incompleteStories = api.getMyIncompleteStories();
        expect(incompleteStories.length).toBe(myIncompleteCount);  // Make sure the number of incomplete is correct
        expect(myIncompleteIDs).toContain(incompleteStories[0]['id']);  // Then check if the values for these incomplete stories are also correct
        done();
    });
});