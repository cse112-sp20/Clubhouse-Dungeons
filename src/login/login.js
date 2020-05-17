import {
  onLogin,
  fetchMemberInfoAsync
} from '../api/api'

chrome.storage.sync.get(['api_token', 'member_id'], store => {
  const errorExists = chrome.runtime.lastError !== undefined
  const tokenExists = Object.prototype.hasOwnProperty.call(store, 'api_token')
  if (!errorExists && tokenExists) {
    console.log(store)
    onLogin(store.api_token, store.member_id)
    window.location.href = '../popup.html'
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
              member_name: res.name
            }, () => {
              console.log('storing member info')
              onLogin(apiKey, res.name)
              window.location.href = '../popup.html'
            })
          }
        })
        .catch((e) => {
          alert('Error')
          console.log(e)
        })
    } // OnClick()
    document.querySelector('button').addEventListener('click', onClick, false)
  },
  false
) // addEventListener()
