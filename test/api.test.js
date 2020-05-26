const api = require('../src/api/api');
const testAPIToken = "5ec07d9a-f9a8-4541-a2fe-d2aae53169e1";
const memberID = "5ec07aaf-30c2-42ab-a9ee-7e1214f2e2d4";
const fetch =  require("isomorphic-fetch").fetch;
const resolve = require("isomorphic-fetch").resolve;

const myIncompleteCount = 2;
const myIncompleteIDs = [56, 90];
const allIncompleteIDs = [56, 90, 93];
const myName = '_Test User_';
const myIcon = 'https://cdn.patchcdn.com/assets/layout/contribute/user-default.png'


/**
 * Unit Test 1
 * Testing for api.getMyIncompleteStories()
 * Checks if the count of test stories are correct and that they are the correct ids
 */
it('Test MY Incomplete Stories', done => {
    /* Need to setup the API variables first
    * Chase mentioned that we need to set up a test method in api
    * So I went ahead and defined a method called setupTest in api.js
    */
    api.setupTest(testAPIToken, memberID, () => {
        // The only story that has been assigned to this test user as of right now is story 56
        incompleteStories = api.getMyIncompleteStories();
        expect(incompleteStories.length).toBe(myIncompleteCount);  // Make sure the number of incomplete is correct
        expect(myIncompleteIDs).toContain(incompleteStories[0]['id']);  // Then check if the values for these incomplete stories are also correct
        expect(myIncompleteIDs).toContain(incompleteStories[1]['id']);  
        done();
    });
});

/**
 * Unit Test 2
 * Testing for api.getAllIncompleteStories()
 * Checks if the count of test stories are correct and that they are the correct ids
 */
it('Test ALL Incomplete Stories', done => {
    /* Need to setup the API variables first
    * Chase mentioned that we need to set up a test method in api
    * So I went ahead and defined a method called setupTest in api.js
    */
    api.setupTest(testAPIToken, memberID, () => {
        // The only story that has been assigned to this test user as of right now is story 56
        incompleteStories = api.getAllIncompleteStories();
        
        let allStories = [];

        // Try to find all test stories
        incompleteStories.forEach(element => {
            allStories.push(element['id']);
        });

        // Now let's check if all of the stories of our test list is within this list
        allIncompleteIDs.forEach(id => {
            expect(allStories).toContain(id);
        });

        done();
    });
});


/**
 * Testing suite for api.js unit tests
 * Copied Arren's format
 * 
 */
describe('api simple unit tests', () => {

    /**
     * Unit Test 3:
     * Checks if getMemberName returns correct name
     */
    it('Testing getMemberName', () => {
        var name;
        // test setup - tried in beforeAll/beforeEach block, can't get it to work
        api.setupTest(testAPIToken, memberID, () => {
            name = api.getMemberName();
            expect(name).toMatch(myName);
            done();
        })

    });

    /**
     * Unit Test 4:
     * Checks if getMemberProfile returns a correct default profile
     */
    it('Testing default getMemberProfile', () => {
        var name;
        var icon;
        var profile;

        api.setupTest(testAPIToken, memberID, () => {
            profile = api.getMemberProfile();
            expect(profile.name).toMatch(myName);
            expect(profile.icon).toContain(myIcon);
            done();
        });

    });

});
