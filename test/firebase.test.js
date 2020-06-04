import {
  memberLogin,
  honorDatabaseMember,
  member,
  workspaceRef,
} from '../src/db/firebase'
import{
  setup,
  getAllMembers,
  getMember
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


// Test user Cases
// USER 1: New user that has not been honored or will not be honoring anyone
const user1ID = '5ed2c520-5486-4d9d-9882-3067306a2700'
const user1HonoredBy = [];
const user1HonorsRemaining = 3;

const iterationId = 1; 

/**
 * Unit Test 1
 * We are creating a user that will have no honors, so the honoredBy should be empty or null
 * This user is also not already in the database
 */
it('Test Member Login for local Variables', done => {
  setup()
    .then(() =>{
      memberLogin(user1ID, getAllMembers().map(member => {return member['id']}), workspace /*, iterationId */)
        .then(() => {

          // Expect the honored_by size of the newly logged in user to be 0
          expect(getMember(user1ID).honoredBy.length).toBe(user1HonoredBy.length);

          // Expect the honoredRecognitionsRemaining to be 3
          expect(getMember(user1ID).honorRecognitionsRemaining).toBe(user1HonorsRemaining);
          done()
        })
    })
})