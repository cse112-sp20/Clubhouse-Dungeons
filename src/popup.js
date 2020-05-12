// const fetch = require('node-fetch');=
const API_TOKEN = '5eb1122c-36fd-435d-b318-02dc21ea111d'

const selectedTabBG = document.getElementById("selectedTabBG");

function selectTab(tabName) {

}

document.onload(ev => {
  selectedTabBG.style();
});

document.addEventListener(
  'DOMContentLoaded',
  () => {
    /**
     * Function to handle onClick event
     */
    function onClick () {
      // Remove previously created document elements
      const el1 = document.getElementById('inspectProj')
      const el2 = document.getElementById('projDetails')
      const el3 = document.getElementById('inspectStories')
      const el4 = document.getElementById('storyDetails')
      if (el1) {
        el1.remove()
      }
      if (el2) {
        el2.remove()
      }
      if (el3) {
        el3.remove()
      }
      if (el4) {
        el4.remove()
      }

      /* Fetch all projects. Returns a promise */
      const fetchProjects = () => fetch(`https://api.clubhouse.io/api/v3/projects?token=${API_TOKEN}`, {
        headers: { 'Content-Type': 'application/json' }
      })

      /* UNUSED Fetch a project with ID. Returns a promise
      const fetchProject = (projectId) => fetch(`https://api.clubhouse.io/api/v3/projects/${projectId}?token=${API_TOKEN}`, {
        headers: { 'Content-Type': 'application/json' }
      }) */

      /* Fetch all stories in a project. Returns a promise */
      const fetchProjectStories = (projectId) => fetch(`https://api.clubhouse.io/api/v3/projects/${projectId}/stories?token=${API_TOKEN}`, {
        headers: { 'Content-Type': 'application/json' }
      })

      /* Fetch all members in the organization. Returns a promise */
      const fetchMembers = () => fetch(`https://api.clubhouse.io/api/v3/members?token=${API_TOKEN}`, {
        headers: { 'Content-Type': 'application/json' }
      })

      // Fetch all members !!!!!!!!!!!!!!!!!!!!!
      fetchMembers()
        .then((rawRes) => rawRes.json())
        .then((res) => {
          // res is an array of member objects
          // console.log(res);

          // Create a map of member ID -> member object
          const memberMap = {}
          res.map((member) => {
            memberMap[member.id] = member
          })
          // console.log(memberMap);

          // Fetch projects
          fetchProjects()
            .then((rawRes) => rawRes.json())
            .then((res) => {
              // res is an array of project objects
              // console.log(res);

              // Look at the first project in the array
              const firstProj = res[0]
              console.log(`Inspecting project ${firstProj.id}`)
              // console.log(firstProj);
              console.log(`\tProject ID: ${firstProj.id}`)
              console.log(`\tDescription: ${firstProj.description}`)
              console.log(`\t# of stories in project: ${firstProj.stats.num_stories}`)
              console.log(`\t# of story points in project: ${firstProj.stats.num_points}`)

              // Print everything out in the popup window by editing the HTML via JS
              const inspectProj = document.createElement('h3')
              inspectProj.setAttribute('id', 'inspectProj')
              inspectProj.innerHTML = `Inspecting project ${firstProj.id}`

              const projDetails = document.createElement('p')
              projDetails.setAttribute('id', 'projDetails')
              projDetails.innerHTML = `&emsp;Project ID: ${firstProj.id}<br />` +
                                `&emsp;Description: ${firstProj.description}<br />` +
                                `&emsp;# of stories in project: ${firstProj.stats.num_stories}<br />` +
                                `&emsp;# of story points in project: ${firstProj.stats.num_points}`

              document.body.appendChild(inspectProj)
              document.body.appendChild(projDetails)

              // Look at the stories in the firstProj
              fetchProjectStories(firstProj.id)
                .then((rawRes) => rawRes.json())
                .then((res) => {
                  // res is an array of story objects
                  // console.log(res);

                  console.log(`Inspecting the stories in project ${firstProj.id}`)

                  // Print everything out in the popup window by editing the HTML via JS
                  const inspectStories = document.createElement('h3')
                  inspectStories.setAttribute('id', 'inspectStories')
                  inspectStories.innerHTML = `Inspecting the stories in project ${firstProj.id}`

                  document.body.appendChild(inspectStories)

                  const storyDetails = document.createElement('p')
                  storyDetails.setAttribute('id', 'storyDetails')

                  res.map((story) => {
                    const membersAssignedToStory = story.owner_ids.map(
                      (id) => memberMap[id].profile.name
                    )
                    // console.log(membersAssignedToStory);

                    console.log(`\tInspecting story ${story.id}`)
                    console.log(`\t\tStory ID: ${story.id}`)
                    console.log(`\t\tName: ${story.name}`)
                    console.log(`\t\tCompleted: ${story.completed}`)
                    console.log(`\t\tEstimate (# points): ${story.estimate}`)
                    console.log(`\t\tDeadline: ${story.deadline}`)
                    console.log(`\t\tAssigned to: ${membersAssignedToStory}`)

                    storyDetails.innerHTML += `<h4>&emsp;Inspecting story ${story.id}</h4>` +
                                                `&emsp;&emsp;Story ID: ${story.id}<br />` +
                                                `&emsp;&emsp;Name: ${story.name}<br />` +
                                                `&emsp;&emsp;Completed: ${story.completed}<br />` +
                                                `&emsp;&emsp;Estimate (# points): ${story.estimate}<br />` +
                                                `&emsp;&emsp;Deadline: ${story.deadline}<br />` +
                                                `&emsp;&emsp;Assigned to: ${membersAssignedToStory}`
                  })

                  document.body.appendChild(storyDetails)
                })
            })
        })
    } // OnClick()
    document.querySelector('button').addEventListener('click', onClick, false)
  },
  false
) // addEventListener()
