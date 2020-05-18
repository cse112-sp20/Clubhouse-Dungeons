import {
  setup,
  getMyIncompleteStories,
  getAllIncompleteStories,
  getBattleLog,
  getTopWarriors,
  getMemberName,
  getMemberProfile,
  getProgress,
  removeApiToken
} from './api/api'

// Member profile button and info
const profileContainer = document.getElementById('profileContainer')
const memberProfile = document.getElementById('memberProfile')
const memberName = document.getElementById('memberName')
const memberIcon = document.getElementById('memberIcon')

// Member menu and menu buttons
const memberMenu = document.getElementById('memberMenu')
const signoutButton = document.getElementById('signoutButton')

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
 * Signout by removing all items from StorageArea storage.sync
 */
const signout = () => {
  chrome.storage.sync.clear((clear) => {
    if (chrome.runtime.lastError === undefined) {
      console.log('storage cleared')
      // remove the api token in use from api.js
      removeApiToken()
      // load the login page
      window.location.href = 'login.html'
    } else {
      alert('Error trying to clear storage')
    }
  })
}

/**
 * Show member profile menu
 */
const toggleMemberMenu = () => {
  if (profileContainer.classList.contains('closed')) {
    profileContainer.classList.remove('closed')
    profileContainer.classList.add('open')
  } else {
    profileContainer.classList.remove('open')
    profileContainer.classList.add('closed')
  }
}

/**
 * Close member profile menu on outside click
 */
document.body.addEventListener('click', (event) => {
  if (event.target.id.length > 0) {
    if (!event.target.id.substring(0, 5) == 'member' && memberMenu.classList.contains('show')) {
      toggleMemberMenu()
    }
  } else {
    toggleMemberMenu()
  }
})
profileContainer.addEventListener('click', toggleMemberMenu)
signoutButton.addEventListener('click', signout)

/**
 * Apply appropriate styles to selected tab and panel item
 *
 * @param {number} tabIndex - index of tab
 */
function selectTab (tabIndex) {
  // Close profile menu if it's open
  if (memberMenu.classList.contains('show')) {
    toggleMemberMenu()
  }
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
        /* Get member info for profile button */
        const memberProfile = getMemberProfile()
        memberName.innerHTML = memberProfile.name
        memberIcon.src = memberProfile.icon

        /* Get top warraiors and update text */
        const topWarriors = getTopWarriors()
        document.getElementById('warrior1Name').innerText = (topWarriors) ? `${topWarriors[0].name}` : 'Kevin'
        document.getElementById('warrior2Name').innerText = (topWarriors) ? `${topWarriors[1].name}` : 'Chris'
        document.getElementById('warrior3Name').innerText = (topWarriors) ? `${topWarriors[2].name}` : 'Jedd'

        document.getElementById('warrior1Points').innerText = `${topWarriors[0].points}` + ' DMG'
        document.getElementById('warrior2Points').innerText = `${topWarriors[1].points}` + ' DMG'
        document.getElementById('warrior3Points').innerText = `${topWarriors[2].points}` + ' DMG'

        /* Set progress bar values */
        const { completed, total } = getProgress()
        document.getElementById('healthText').appendChild(document.createTextNode(`${completed} / ${total}`))

        /* Set progress bar color change */
        const greenThreshold = (2 / 5) * total
        const yellowThreshold = (1 / 5) * total
        const healthBar = document.getElementById('healthLeft')
        healthBar.style.background = (completed > greenThreshold) ? 'linear-gradient(-180deg, #00ff00 0%, #00cc00 100%)'
          : (completed > yellowThreshold) ? 'linear-gradient(-180deg, #ffff00 0%, #e6e600 100%)'
            : 'linear-gradient(-180deg, #e74c3c 0%, #c0392b 100%)'

        /* Set progress bar width */
        healthBar.style.width = (completed * 100 / total) + '%'

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
