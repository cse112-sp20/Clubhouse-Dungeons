import { fetchMembersAsync, fetchProjectsAsync, fetchProjectStoriesAsync } from './api/api'

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
myStoriesTab.addEventListener('click', () => selectTab(0))
allStoriesTab.addEventListener('click', () => selectTab(1))
battleLogTab.addEventListener('click', () => selectTab(2))

/**
 * Apply appropriate styles to selected tab and panel item
 *
 * @param {number} tabIndex - index of tab
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

/*
 * function that sums all stories points in all projects and returns the sum
 */
function sumOfStoryPoints () {
  /* array to store all story points */
  var storyPoints = []
  var sum = 0
  var completedSum = 0

  fetchProjectsAsync()
    .then((projData) => {
      projData.map((proj) => {
        const projID = proj.id
        /* for each project, get all stories within the project */
        fetchProjectStoriesAsync(projID)
          .then((storyData) => {
            storyData.map((story) => {
              const currStoryID = story.id
              if (story.estimate) {
                /* if story is completed */
                if (story.completed) {
                  completedSum += story.estimate
                }
                /* method 1: sums estimates in accumulator */
                sum += story.estimate
                /* method 2: pushes id and respective points as JS object to array */
                storyPoints.push({
                  storyID: currStoryID,
                  points: story.estimate
                })
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
          })
      })
    })
} // sumOfStoryPoints()

document.addEventListener(
  'DOMContentLoaded',
  () => {
    /**
     * Function to handle onClick event
     */
    const btn = document.getElementById('sumButton')
    /* attach sumButton function to sumOfStoryPoints on click */
    btn.addEventListener('click', sumOfStoryPoints, false)

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

      // Fetch all members !!!!!!!!!!!!!!!!!!!!!
      fetchMembersAsync()
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
          fetchProjectsAsync()
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
              fetchProjectStoriesAsync(firstProj.id)
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
