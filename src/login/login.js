import {
  fetchMemberInfoAsync,
  ERR_MSG_INVALID_API_TOKEN
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
      if (!res.message && !res.tag) {
        // store user info into the StorageArea storage.sync
        chrome.storage.sync.set({
          api_token: apiKey,
          member_id: res.id,
          member_name: res.name,
          workspace: res.workspace2.url_slug
        }, () => {
          console.log('storing member info')
          window.location.href = '../popup.html'
        })
      } else {
        throw new Error(ERR_MSG_INVALID_API_TOKEN)
      }
    })
    .catch((e) => {
      console.log(e)
      /* TODO: UI */
    })
}

chrome.storage.sync.get(['api_token', 'member_id', 'workspace'], store => {
  const errorExists = chrome.runtime.lastError !== undefined
  const tokenExists = Object.prototype.hasOwnProperty.call(store, 'api_token')
  if (!errorExists && tokenExists) {
    validateMember(store.api_token)
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

      console.log(document.getElementById('apiEntry').value)

      validateMember(apiKey)
    } // OnClick()
    document.querySelector('button').addEventListener('click', onClick, false)
  },
  false
) // addEventListener()
