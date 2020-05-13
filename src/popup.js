// const fetch = require('node-fetch');
const API_TOKEN = '5eb1122c-36fd-435d-b318-02dc21ea111d'

// Element to create fancy animated tab highlight
// const selectedTabBG = document.getElementById("selectedTabBG");

// Tab elements
const myStoriesTab = document.getElementById('myStoriesTab')
const allStoriesTab = document.getElementById('allStoriesTab')
const battleLogTab = document.getElementById('battleLogTab')

// Containers for actual elements
const myStories = document.getElementById('myStories')
const allStories = document.getElementById('allStories')
const battleLog = document.getElementById('battleLog')

// Click event listeners for tabs
myStoriesTab.addEventListener("click", () => selectTab(0));
allStoriesTab.addEventListener("click", () => selectTab(1));
battleLogTab.addEventListener("click", () => selectTab(2));

/**
 * Apply appropriate styles to selected tab and panel item
 * 
 * @param {int} tabIndex - index of tab
 */
function selectTab (tabIndex) {
  // Deselect previously selected tab and hide previously selected panel item
  var selectedTabs = document.getElementsByClassName('selected')
  while (selectedTabs.length > 0) {
    selectedTabs[0].classList.remove('selected')
  }

  switch (tabIndex) {
    // My Stories
    case 0:
      myStoriesTab.classList.add('selected')
      myStories.classList.add('selected')
      break
    // All Stories
    case 1:
      allStoriesTab.classList.add('selected')
      allStories.classList.add('selected')
      break
    // Battle Log
    case 2:
      battleLogTab.classList.add('selected')
      battleLog.classList.add('selected')
      break

    default:
  }
}

/**
 * function that sums all stories points in all projects and returns the sum
 */
function sumOfStoryPoints () {
  /* array to store all story points */
  var storyPoints = []
  var sum = 0
  var completedSum = 0
  /* Fetch all projects. Returns a promise */
  const fetchProjects = () =>
    fetch(`https://api.clubhouse.io/api/v3/projects?token=${API_TOKEN}`, {
      headers: { 'Content-Type': 'application/json' }
    })

  /* Fetch all stories in a project. Returns a promise */
  const fetchProjectStories = (projectId) =>
    fetch(
      `https://api.clubhouse.io/api/v3/projects/${projectId}/stories?token=${API_TOKEN}`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )

  fetchProjects()
    .then((projRes) => projRes.json())
    .then((projData) => {
      var i
      /* loops for all projects within account */
      for (i = 0; i < projData.length; i++) {
        const projID = projData[i].id
        /* for each project, get all stories within the project */
        fetchProjectStories(projID)
          .then((storyRes) => storyRes.json())
          .then((storyData) => {
            var j
            /* for each story, get all story id and points */
            for (j = 0; j < storyData.length; j++) {
              const currStoryID = storyData[j].id
              /* check for non-null estimates */
              if (storyData[j].estimate) {
                /* if story is completed */
                if (storyData[j].completed) {
                  completedSum += storyData[j].estimate
                }

                /* method 1: sums estimates in accumulator */
                sum += storyData[j].estimate
                /* method 2: pushes id and respective points as JS object to array */
                storyPoints.push({
                  storyID: currStoryID,
                  points: storyData[j].estimate
                })
              }
            }

            /* method 2: sums all point values from storyPoints array which also holds respective id */
            var storySum = 0
            Object.values(storyPoints).map((data) => {
              storySum += data.points
            })
            /* update storyPoint HTML in current HTML DOM */
            document.getElementById('story').textContent =
              'Damage Done: ' +
              completedSum +
              ' Total Health: ' +
              sum +
              ' Total Health: ' +
              storySum
          })
      }
    })
} // sumOfStoryPoints()

/* checks if the window is loaded */
window.onload = () => {
  /* checks if button is loaded */
  const btn = document.getElementById('sumButton')
  if (btn) {
    /* attach sumButton function to sumOfStoryPoints on click */
    btn.addEventListener('click', sumOfStoryPoints, false)
  }
}

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
      const fetchProjects = () =>
        fetch(`https://api.clubhouse.io/api/v3/projects?token=${API_TOKEN}`, {
          headers: { 'Content-Type': 'application/json' }
        })

      /* UNUSED Fetch a project with ID. Returns a promise
      const fetchProject = (projectId) => fetch(`https://api.clubhouse.io/api/v3/projects/${projectId}?token=${API_TOKEN}`, {
        headers: { 'Content-Type': 'application/json' }
      }) */

      /* Fetch all stories in a project. Returns a promise */
      const fetchProjectStories = (projectId) =>
        fetch(
          `https://api.clubhouse.io/api/v3/projects/${projectId}/stories?token=${API_TOKEN}`,
          {
            headers: { 'Content-Type': 'application/json' }
          }
        )

      /* Fetch all members in the organization. Returns a promise */
      const fetchMembers = () =>
        fetch(`https://api.clubhouse.io/api/v3/members?token=${API_TOKEN}`, {
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
              console.log(
                `\t# of stories in project: ${firstProj.stats.num_stories}`
              )
              console.log(
                `\t# of story points in project: ${firstProj.stats.num_points}`
              )

              // Print everything out in the popup window by editing the HTML via JS
              const inspectProj = document.createElement('h3')
              inspectProj.setAttribute('id', 'inspectProj')
              inspectProj.innerHTML = `Inspecting project ${firstProj.id}`

              const projDetails = document.createElement('p')
              projDetails.setAttribute('id', 'projDetails')
              projDetails.innerHTML =
                `&emsp;Project ID: ${firstProj.id}<br />` +
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

                  console.log(
                    `Inspecting the stories in project ${firstProj.id}`
                  )

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

                    storyDetails.innerHTML +=
                      `<h4>&emsp;Inspecting story ${story.id}</h4>` +
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
