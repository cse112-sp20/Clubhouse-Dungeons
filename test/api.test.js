const api = require('../src/api/api');
const testAPIToken = "5ec07d9a-f9a8-4541-a2fe-d2aae53169e1";
const memberID = "5ec07aaf-30c2-42ab-a9ee-7e1214f2e2d4";


test('1 is 1', () => {
    // Need to setup the API variables first
    api.setup();

    // Then we will be testing this
    api.getMyIncompleteStories();
    expect(1).toBe(1);
});