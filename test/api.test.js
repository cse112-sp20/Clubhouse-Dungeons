import {
  getMyIncompleteStories,
  getAllIncompleteStories,
  getBattleLog,
  getTopWarriors,
  getMemberName,
  getMemberProfile,
  getProgress,
  setup
} from '../src/popup-backend'
import * as realFetch from 'node-fetch'

/** FETCH MOCK */
/**
 * Like normal fetch, but if resource URL starts with Heroku CORS proxy address,
 * remove it; like normal fetch, but doesn't use CORS proxy.
 */
const fetchMock = jest.fn().mockImplementation((resource, init = {}) => {
  const corsProxyUrl = 'https://cors-anywhere.herokuapp.com'
  const corsPrefix = corsProxyUrl + '/'
  if (resource.startsWith(corsPrefix)) {
    resource = resource.substring(corsPrefix.length)
  }
  return realFetch(resource, init)
})

global.fetch = fetchMock
/** FETCH MOCK */

const testAPIToken = '5ed2b278-d7a6-4344-b33f-94b8901aa75a'
const memberID = '5ecdd3de-0125-4888-802a-5d3ba46ca0dc'
const workspace = 'quarantest8'
const myName = '_Test User_'

/** CHROME STORAGE MOCK */
/**
 * Local version of storage (mocking chrome.storage.sync) to be used by the get
 * and set mocks.
 */
const chromeStorage = {
  api_token: testAPIToken,
  member_id: memberID,
  workspace: workspace,
  name: myName
}

/**
 * Mocks a successful (no storage error) behavior of chrome.sync.storage.get
 */
const chromeStorageGetMock = jest.fn().mockImplementation((keys = null, callback) => {
  let items = null
  if (!keys) {
    // If keys is null, return everything in storage
    items = chromeStorage
  } else if (typeof keys === 'string') {
    // If keys is a string specifying one key, return only that key-value pair
    // If the key doesn't exist in storage, return empty object
    items = Object.prototype.hasOwnProperty.call(chromeStorage, keys)
      ? { [keys]: chromeStorage[keys] }
      : {}
  } else if (Array.isArray(keys)) {
    // If keys is an array, return all of the key-value pairs found in storage
    items = {}
    keys.map(k => {
      if (Object.prototype.hasOwnProperty.call(chromeStorage, k)) {
        items[k] = chromeStorage[k]
      }
    })
  }
  callback(items)
})

const chromeStorageSetMock = jest.fn().mockImplementation(() => console.log('TODO'))

const chromeStorageClearMock = jest.fn().mockImplementation(() => console.log('TODO'))

/**
 * Local version of chrome (mocking chrome). Used to access
 * chrome.storage.sync.get, chrome.storage.sync.set,
 * chrome.storage.sync.clear, and chrome.runtime.lastError.
 *
 * If there is a storage error, then chrome.runtime.lastError should not be
 * undefined.
 */
const chromeMock = {
  storage: {
    sync: {
      get: chromeStorageGetMock,
      set: chromeStorageSetMock,
      clear: chromeStorageClearMock
    }
  },
  runtime: {
    lastError: undefined
  }
}

global.chrome = chromeMock
/** CHROME STORAGE MOCK */

// These variables are based on the testing clubhouse
// MAKE SURE THESE ARE UP TO DATE IF YOU ADD/REMOVE/EDIT STORIES ON CLUBHOUSE
const myIncompleteIDs = [31, 30, 38]
const allIncompleteIDs = [31, 30, 34, 38]
const battleLogIDsSorted = [39, 37, 36, 35]
const completedHealth = 16
const totalHealth = 25
const myIcon = 'https://cdn.patchcdn.com/assets/layout/contribute/user-default.png'
const topWarriorNames = ['_Test User_', 'Dorian Maldonado']
const topWarriorPoints = [10, 4]

describe('Test suite for popup-backend.js', () => {

  // Perform the setup before any test
  beforeAll(async () => {
    await setup();
  });

  /**
   * Unit Test 1
   * Testing for api.getMyIncompleteStories()
   * Checks if the count of test stories are correct and that they are the correct ids
   */
  it('Test MY Incomplete Stories', done => {
    
    // The only story that has been assigned to this test user as of right now is story 56
    const incompleteStories = getMyIncompleteStories()
    expect(incompleteStories.length).toBe(myIncompleteIDs.length) // Make sure the number of incomplete is correct

    // Make sure each incomplete ID specified above will be in here
    incompleteStories.forEach(story => {
      expect(myIncompleteIDs).toContain(story.id)
    })

    done()
  })



  /**
   * Unit Test 2
   * Testing for api.getAllIncompleteStories()
   * Checks if the count of test stories are correct and that they are the correct ids
   */
  it('Test ALL Incomplete Stories', done => {
    // The only story that has been assigned to this test user as of right now is story 56
    const incompleteStories = getAllIncompleteStories()

    expect(incompleteStories.length).toBe(allIncompleteIDs.length) // Make sure the number of all incomplete is correct

    // Just like UT1, check if all the stories returned is a part of our expected list
    incompleteStories.forEach(story => {
      expect(allIncompleteIDs).toContain(story.id)
    })

    done()
  })


  /**
   * Unit Test 3
   * Testing for api.getBattleLog()
   * Two main features for this to test:
   * 1. Get a list of completed stories
   * 2. Make sure they are sorted from most recently completed
   */
  it('Test Getting Battle Log', done => {
    // The only story that has been assigned to this test user as of right now is story 56
    const battleStories = getBattleLog()

    expect(battleStories.length).toBe(battleLogIDsSorted.length) // Make sure the number of battle log elements is correct

    var i
    // Since this is supposed to be a sorted we can directly compare elements to make sure they are equal
    for (i = 0; i < battleStories.length; i++) {
      expect(battleStories[i].id).toBe(battleLogIDsSorted[i])
    }
    done()
  })


  /**
   * Unit Test 4:
   * Checks if getMemberName returns correct name
   */
  it('Testing getMemberName', done => {
    var name
    name = getMemberName(memberID)
    expect(name).toMatch(myName)
    done()
  }) 

  /**
   * Unit Test 5:
   * Checks if getMemberProfile returns a correct default profile
   */
  it('Testing default getMemberProfile', done => {
    var profile
    profile = getMemberProfile()
    expect(profile.name).toMatch(myName)
    expect(profile.icon).toContain(myIcon)
    done()
  })



  /**
   * Unit Test 6:
   * Checks the completed and total story values for health bar
   */
  it('Test HealthBar Values', done => {
    const { completed, total } = getProgress()
    expect(completed).toBe(completedHealth)
    expect(total).toBe(totalHealth)
    done()
  })



  /**
   * Unit Test 7:
   * Gets the top warriors
   * There should only be two top warriors
   * The third slot should be filled accordingly with an empty slot and that will be tested in our puppeteer testing
   */
  it('Test Top Warriors', done => {
    const topWarriors = getTopWarriors()

    // First check the base case that the top warriors must be 3 or less
    expect(topWarriors.length).toBeLessThanOrEqual(3)

    // Now we should expect only two warriors since two users have contributed
    expect(topWarriors.length).toBe(2)

    var i
    // Now check if the names of the warriors and that they are in order and that their point values are correct
    for (i = 0; i < topWarriors.length; i++) {
      expect(topWarriors[i].name).toBe(topWarriorNames[i])
      expect(topWarriors[i].points).toBe(topWarriorPoints[i])
    }

    done()
  })
})

