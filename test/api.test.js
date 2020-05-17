import { fetchMemberInfoAsync } from '../src/api/api';
const testAPIToken = "5ec07d9a-f9a8-4541-a2fe-d2aae53169e1";
const memberID = "";


test('1 is 1', () => {
    
    console.log(fetchMemberInfoAsync(testAPIToken));
    expect(1).toBe(1);
});