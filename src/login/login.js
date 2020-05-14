document.addEventListener(
  'DOMContentLoaded',
  () => {
    /**
     * Function to handle onClick event
     */
    function onClick () {
      var apiKey = document.getElementById("apiEntry").value;

      console.log(document.getElementById("apiEntry").value);

      fetchMemberInfoAsync(apiKey)
        .then((res) => {
            console.log(res);
            if (res.message == 'Unauthorized') {
              alert("Invalid key!");
            } else {
              localStorage.setItem("api_token", apiKey);
              localStorage.setItem("member_id", res.id);
              localStorage.setItem("member_name", res.name);
              window.location.href = '../popup.html'
            }
        })
        .catch((e) => {
          alert("Error");
          console.log(e);
        })
    } // OnClick()
    document.querySelector('button').addEventListener('click', onClick, false)
  },
  false
) // addEventListener()