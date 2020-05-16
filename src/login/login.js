import { setApiToken, fetchMemberInfoAsync } from '../api/api'

chrome.storage.sync.get('api_token', (res) => {
  if (res) {
    setApiToken(res.api_token)
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
          console.log(res)
          if (res.message === 'Unauthorized') {
            alert('Invalid key!')
          } else {
            setApiToken(apiKey)
            /*
            localStorage.setItem('api_token', apiKey)
            localStorage.setItem('member_id', res.id)
            localStorage.setItem('member_name', res.name)
            */
            chrome.storage.sync.set(
              {
                api_token: apiKey,
                member_id: res.id,
                member_name: res.name
              }, () => { console.log('storing member info') })

            window.location.href = '../popup.html'
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
