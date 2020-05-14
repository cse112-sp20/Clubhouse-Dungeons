document.addEventListener(
  'DOMContentLoaded',
  () => {
    /**
     * Function to handle onClick event
     */
    function onClick () {
      var apiKey = document.getElementById("apiEntry").nodeValue;

      fetchMemberInfoAsync(apiKey)
        .then((res) => {
            console.log(res);
        })
        .catch()
        
      /*if () {
        alert("Invalid key!");
      } else {
        localStorage.setItem("loginKeyLocalStorage", apiKey);
        window.location.href = '../popup.html'
      }*/
    } // OnClick()
    document.querySelector('button').addEventListener('click', onClick, false)
  },
  false
) // addEventListener()