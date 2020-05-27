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
// const memberProfile = document.getElementById('memberProfile')
const memberIcon = document.getElementById('memberIcon')
const memberName = document.getElementById('memberName')
const memberTeam = document.getElementById('memberTeam')

const healthText = document.getElementById('healthText')
const healthLeft = document.getElementById('healthLeft')

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

// Top 3 point earners
// TODO: Set these values
// const warrior1Name = document.getElementById('warrior1Name')
// const warrior1Points = document.getElementById('warrior1Points')
// const warrior2Name = document.getElementById('warrior2Name')
// const warrior2Points = document.getElementById('warrior2Points')
// const warrior3Name = document.getElementById('warrior3Name')
// const warrior3Points = document.getElementById('warrior3Points')

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
    if (!event.target.id.substring(0, 5) === 'member' && memberMenu.classList.contains('show')) {
      toggleMemberMenu()
    }
  } else {
    if (memberMenu.classList.contains('show')) {
      toggleMemberMenu()
    }
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

/**
 * TODO: Complete story
 *
 * @param {Story} story
 */
function completeStory (story) {
  console.log('complete story', story)
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    setup()
      .then(() => {
        /* Get member info for profile button */
        const memberProfile = getMemberProfile()
        memberIcon.src = memberProfile.icon
        memberName.innerHTML = memberProfile.name
        memberTeam.innerHTML = memberProfile.workspace

        /* Get top warraiors and update text */
        const topWarriors = getTopWarriors()
        while (topWarriors.length < 3) {
          topWarriors.push({ name: 'Empty', points: 0 })
        }
        document.getElementById('warrior1Name').innerText = (topWarriors) ? `${topWarriors[0].name.split(' ')[0]}` : 'Kevin'
        document.getElementById('warrior2Name').innerText = (topWarriors) ? `${topWarriors[1].name.split(' ')[0]}` : 'Chris'
        document.getElementById('warrior3Name').innerText = (topWarriors) ? `${topWarriors[2].name.split(' ')[0]}` : 'Jedd'

        document.getElementById('warrior1Points').innerText = `${topWarriors[0].points}` + ' DMG'
        document.getElementById('warrior2Points').innerText = `${topWarriors[1].points}` + ' DMG'
        document.getElementById('warrior3Points').innerText = `${topWarriors[2].points}` + ' DMG'

        /* Set progress bar values */
        const { completed, total } = getProgress()
        healthLeft.style.width = (completed / total) * 100 + '%'
        healthText.appendChild(document.createTextNode(`${completed} / ${total}`))

        /* Set progress bar color change */
        const greenThreshold = (2 / 5) * total
        const yellowThreshold = (1 / 5) * total
        healthLeft.className += (total - completed > greenThreshold) ? 'healthBarGreenState'
          : (total - completed > yellowThreshold) ? 'healthBarYellowState'
            : 'healthBarRedState'
        /* Populate tabs */

        // My Stories
        getMyIncompleteStories().map(story => {
          const storyDiv = document.createElement('div')
          const storyButton = document.createElement('div')
          storyDiv.classList.add('story')
          storyButton.classList.add('story-button')
          storyButton.innerHTML = '<img src="images/sword.png" >'
          storyDiv.innerHTML = '<div class="name">' + story.name + '</div>'
          storyDiv.innerHTML += '<div class="points">' + story.estimate + ' DMG</div>'
          storyButton.addEventListener('click', () => completeStory(story))
          storyDiv.prepend(storyButton)
          myStories.appendChild(storyDiv)
        })

        getAllIncompleteStories().map(story => {
          const ownerNames = story.owner_ids.length > 0
            ? story.owner_ids.map(memberId => getMemberName(memberId))
            : ['Unassigned']

          console.log(ownerNames)
          const storyDiv = document.createElement('div')
          const storyButton = document.createElement('div')
          storyDiv.classList.add('story')
          storyButton.classList.add('story-button')
          storyButton.innerHTML = '<img src="images/sword.png" >'
          storyDiv.innerHTML = '<div class="name">' + story.name + '</div>'
          storyDiv.innerHTML += '<div class="points">' + story.estimate + ' DMG</div>'
          const ownersDiv = document.createElement('div')
          ownersDiv.classList.add('owners')
          ownerNames.forEach(ownerName => {
            const ownerDiv = document.createElement('div')
            ownerDiv.innerHTML = ownerName
            ownersDiv.append(ownerDiv)
          })
          storyButton.addEventListener('click', () => completeStory(story))
          storyDiv.prepend(storyButton)
          storyDiv.append(ownersDiv)
          allStories.appendChild(storyDiv)
        })

        getBattleLog().map(story => {
          const ownerNames = story.owner_ids.length > 0
            ? story.owner_ids.map(memberId => getMemberName(memberId)).join(', ')
            : 'unassigned'
          const actionDiv = document.createElement('div')
          actionDiv.classList.add('action')
          actionDiv.innerHTML = ownerNames + ' completed ' + story.name + ' dealing ' + story.estimate + ' DMG'
          battleLog.appendChild(actionDiv)
        })
      })
  },
  false
) // addEventListener()
