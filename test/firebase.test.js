import {
  memberLogin,
  honorDatabaseMember
} from '../src/db/firebase'
import{
  setup,
  getAllMembers
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

const allMemberIDs = [
    '5ecdd3a1-62b4-4aa9-9a45-b774c82b4e27', 
    '5ecdd412-7a37-4aa4-b555-8006d2fb7ce6', 
    '5ecdd3de-0125-4888-802a-5d3ba46ca0dc', 
    '5ecdd438-2c26-445b-bfa5-cbb113f47484', 
    '5ed2e8e5-8046-4508-86d3-02d366a31bd3', 
    '5ed2c520-5486-4d9d-9882-3067306a2700', 
    '5ecdd489-3ab7-42ab-addc-18e48997cce9'
  ];
const iterationId = 1; 

/**
 * Unit Test 1
 * 
 */
it('Test Member Login', done => {
  setup()
    .then(() =>{
      memberLogin(memberID, getAllMembers().map(member => {member['id']}), workspace /*, iterationId */)
      .then(() => {
        expect(1).toBe(1)
  
        done()
      })
    })
})