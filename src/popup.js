import {
  setup,
  getMyIncompleteStories,
  getAllIncompleteStories,
  getBattleLog,
  getMemberName,
  getProgress
} from './api/api'

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

document.addEventListener(
  'DOMContentLoaded',
  () => {
    setup()
      .then(() => {
        /* Set progress bar values */
        const { completed, total } = getProgress()
        document.getElementById('healthText').appendChild(document.createTextNode(`${completed} / ${total}`))

        /* Set progress bar color change */
        const healthBar = document.getElementById('healthLeft')
        healthBar.style.background = (completed > (2 / 5) * total) ? 'linear-gradient(-180deg, #00ff00 0%, #00cc00 100%)'
          : (completed > (1 / 5) * total) ? 'linear-gradient(-180deg, #ffff00 0%, #e6e600 100%)'
            : 'linear-gradient(-180deg, #e74c3c 0%, #c0392b 100%)'

        /* Set progress bar width */
        var percentage = (completed * 100 / total)
        healthBar.style.width = percentage + '%'

        /* Populate tabs */
        const myStoriesList = document.createElement('ul')
        getMyIncompleteStories().map(story => {
          const li = document.createElement('li')
          li.appendChild(document.createTextNode(`${story.name} --- ${story.estimate} points`))
          myStoriesList.appendChild(li)
        })
        myStories.appendChild(myStoriesList)

        const allStoriesList = document.createElement('ul')
        getAllIncompleteStories().map(story => {
          const li = document.createElement('li')
          const ownerNames = story.owner_ids.length > 0
            ? story.owner_ids.map(memberId => getMemberName(memberId))
            : 'unassigned'
          li.appendChild(document.createTextNode(`${story.name} --- ${ownerNames} --- ${story.estimate} points`))
          allStoriesList.appendChild(li)
        })
        allStories.appendChild(allStoriesList)

        const battleLogList = document.createElement('ul')
        getBattleLog().map(story => {
          const li = document.createElement('li')
          const ownerNames = story.owner_ids.length > 0
            ? story.owner_ids.map(memberId => getMemberName(memberId)).join(', ')
            : 'unassigned'
          li.appendChild(document.createTextNode(`${ownerNames} completed ${story.name} --- ${story.estimate} points`))
          battleLogList.appendChild(li)
        })
        battleLog.appendChild(battleLogList)
      })
  },
  false
) // addEventListener()
