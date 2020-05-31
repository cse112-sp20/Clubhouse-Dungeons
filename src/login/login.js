import {
  fetchMemberInfoAsync,
  ERR_MSG_INTERNET,
  ERR_MSG_INVALID_API_TOKEN,
  ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED,
  ERR_MSG_BROWSER_STORAGE,
  ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE
} from '../api/api'

/**
 * validate member
 *
 * @async
 * @returns {}
 */
const validateMember = (apiKey) => {
  fetchMemberInfoAsync(apiKey)
    .then((res) => {
      // Store user info into browser sync storage
      chrome.storage.sync.set({
        api_token: apiKey,
        member_id: res.id,
        member_name: res.name,
        workspace: res.workspace2.url_slug
      }, () => {
        const storageError = chrome.runtime.lastError !== undefined
        if (!storageError) {
          console.log('Stored member info in browser storage')

          // Move to popup
          window.location.href = '../popup.html'
        } else {
          throw new Error(ERR_MSG_BROWSER_STORAGE)
        }
      })
    })
    .catch((e) => {
      console.log(`Caught ${e.message} in validateMember`)
      switch (e.message) {
        case ERR_MSG_INTERNET:
          // Respond to internet error
          /* TODO: UI */
          break
        case ERR_MSG_INVALID_API_TOKEN:
          // Respond to invalid api token error
          /* TODO: UI */
          break
        case ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED:
          // Respond to quota exceeded
          /* TODO: UI */
          break
        case ERR_MSG_BROWSER_STORAGE:
          // Respond to error reading/writing to browser storage
          /* TODO: UI */
          break
        case ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE:
        default:
          // Respond to unknown error
          /* TODO: UI */
          break
      }
    })
}

chrome.storage.sync.get(['api_token', 'member_id', 'workspace'], store => {
  const storageError = chrome.runtime.lastError !== undefined
  const tokenExists = Object.prototype.hasOwnProperty.call(store, 'api_token')
  if (!storageError && tokenExists) {
    validateMember(store.api_token)
  } else if (storageError) {
    console.log(ERR_MSG_BROWSER_STORAGE)
    /* TODO: UI */
  }
})

document.addEventListener(
  'DOMContentLoaded',
  () => {
    /**
     * Function to handle onClick event
     */
    function onClick () {
      var apiKey = document.getElementById('apiEntry').value
      validateMember(apiKey)
    } // OnClick()
    document.querySelector('button').addEventListener('click', onClick, false)
  },
  false
) // addEventListener()
