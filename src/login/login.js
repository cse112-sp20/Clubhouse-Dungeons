import {
  onLogin,
  fetchMemberInfoAsync,
  getAllMembers,
  setup
} from '../api/api'
import {
  memberLogin
} from '../db/firebase'

chrome.storage.sync.get(['api_token', 'member_id', 'member_name', 'workspace'], store => {
  const errorExists = chrome.runtime.lastError !== undefined
  const tokenExists = Object.prototype.hasOwnProperty.call(store, 'api_token')
  if (!errorExists && tokenExists) {
    console.log(store)
    onLogin(store.api_token, store.member_id, store.workspace)
    setup()
      .then(() => {
        const allMemberIds = getAllMembers().map(member => member.id)
        return memberLogin(store.member_id, allMemberIds, store.workspace)
      })
      .then(() => {
        // TODO: this should run if memberLogin had no errors
        window.location.href = '../popup.html'
      })
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

      fetchMemberInfoAsync(apiKey)
        .then((res) => {
          if (res.message === 'Unauthorized') {
            alert('Invalid key!')
          } else {
            // store user info into the StorageArea storage.sync
            chrome.storage.sync.set({
              api_token: apiKey,
              member_id: res.id,
              member_name: res.name,
              workspace: res.workspace2.url_slug
            }, () => {
              console.log('storing member info')
              onLogin(apiKey, res.name, res.workspace2.url_slug)
              setup()
                .then(() => {
                  const allMemberIds = getAllMembers().map(member => member.id)
                  return memberLogin(res.id, allMemberIds, res.workspace2.url_slug)
                })
                .then(() => {
                  // TODO: this should run if memberLogin had no errors
                  window.location.href = '../popup.html'
                })
            })
          }
        })
        .catch((e) => {
          console.log('error', e)
          alert('Error')
        })
    } // OnClick()
    document.querySelector('button').addEventListener('click', onClick, false)
  },
  false
) // addEventListener()
