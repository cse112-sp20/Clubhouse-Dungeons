import {
  setup,
  getMyIncompleteStories,
  getAllIncompleteStories,
  completeStoriesAsync,
  getBattleLog,
  getTopWarriors,
  getSignedInMember,
  getAllMembers,
  getMemberName,
  getMemberProfile,
  getProgress,
  removeApiToken,
  onLogin
} from './api/api'
import {
  memberLogin,
  honorDatabaseMember
} from './db/firebase'

/* Get user info from chrome sync storage. If token exists and there is no error,
 * log the user in. Else, link the user back to the login page.
 */

chrome.storage.sync.get(['api_token', 'member_id', 'member_name', 'workspace'], store => {
  const errorExists = chrome.runtime.lastError !== undefined
  const tokenExists = Object.prototype.hasOwnProperty.call(store, 'api_token')
  if (!errorExists && tokenExists) {
    console.log(store)
    onLogin(store.api_token, store.member_id, store.workspace)
    setup()
      .then(() => {
        const allMemberIds = getAllMembers().map(member => member.id)
        return memberLogin(store.member_id, allMemberIds, store.workspace)
      })
  } else {
    window.location.href = '../login.html'
  }
})

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

// Event listener for open honor menu
const membersList = document.getElementById('membersList')
const membersListContainer = document.getElementById('membersListContainer')
const membersListButton = document.getElementById('membersListButton')
membersListButton.addEventListener('click', () => toggleMembersList())

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
 * Toggle members list for honors
 */
function toggleMembersList () {
  if (membersListContainer.classList.contains('show')) {
    membersListContainer.classList.remove('show')
  } else {
    membersListContainer.classList.add('show')
  }
}

/**
 * Record honoring of member in database
 *
 * @param {Member} honoredMember
 */
function honorMember (honoredMember) {
  //const allMemberIds = getAllMembers().map(member => member.id)
  //memberLogin(getSignedInMember().id, allMemberIds, )
  honorDatabaseMember(getSignedInMember().id, honoredMember.id)

}

/**
 * TODO: Complete story
 *
 * @param {Story} story the story to be completed
 * @param {*} storyNode the child story node to be removed from the myStories and allStories tabs
 * @param {string} tabName the name of the tab from where the complete story button was clicked
 */
function completeStory (story, storyNode, tabName) {
  completeStoriesAsync(story.id)
    .then((data) => {
      console.log(data)
      switch (tabName) {
        case 'myStoriesTab': {
          // remove from myStories tab
          myStories.removeChild(storyNode)
          // find the node that corresponds to the allStories container
          const newNode = getStoryNodeFromContainer(allStories, story.name)
          if (newNode) {
            // remove from allStories tab
            allStories.removeChild(newNode)
          }
          break
        }
        case 'allStoriesTab': {
          // find the node that corresponds to the myStories container
          const newNode = getStoryNodeFromContainer(myStories, story.name)
          if (newNode) {
            // remove from myStories tab
            myStories.removeChild(newNode)
          }
          // remove from allStories tab
          allStories.removeChild(newNode)
          break
        }
        default: {
          /*
            This case should never be reached. The complete story button should
            only be available in the myStories tab and the allStoriesTab
          */
          console.log(`Button error. I do not know which tab 
            ${getMemberProfile().name} was under when completing the story 
            ${story.name}`)
          break
        }
      }
      // add the completed story to the battleLog tab
      addToBattleLogTab(story)
    })
  console.log('complete story', story)
}

/**
 * Estimate the amount of story points a story is worth
 * (ensure that the value is at least 0 instead of null)
 *
 * @param {number} storyPoints the number of story points allocated to a
 * specific story
 * @returns {number} the number of points the story is worth
 */
const estimateStoryPoints = storyPoints => {
  return storyPoints === null ? 0 : storyPoints
}

/**
 * Return the node associated with the passed in story name
 *
 * @param {*} nodeContainer container of all stories associated with a specific
 * tab in the DOM
 * @param {*} storyName the name of the story of the node we want to retrieve
 * @returns the node associated with the story name
 */
const getStoryNodeFromContainer = (nodeContainer, storyName) => {
  for (const element of nodeContainer.children) {
    if (element.innerHTML.includes(storyName)) {
      return element
    }
  }
  // should never reach this statement if function is invoked from proper context
  return null
}

/**
 * Adds the passed in story to the myStories tab
 * @param {*} story the story to add to the myStories tab
 */
const addToMyStoriesTab = story => {
  const storyDiv = document.createElement('div')
  const storyButton = document.createElement('div')
  storyDiv.classList.add('story')
  storyButton.classList.add('story-button')
  storyButton.innerHTML = '<img src="images/sword.png" >'
  storyDiv.innerHTML = '<div class="name">' + story.name + '</div>'
  storyDiv.innerHTML += '<div class="points">' + estimateStoryPoints(story.estimate) + ' DMG</div>'
  storyButton.addEventListener('click', () => completeStory(story, storyDiv, 'myStoriesTab'))
  storyDiv.prepend(storyButton)
  myStories.appendChild(storyDiv)
}

/**
 * Adds the passed in story to the allStories tab
 * @param {*} story the story to add to the allStories tab
 */
const addToAllStoriesTab = story => {
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
  storyButton.addEventListener('click', () => completeStory(story, storyDiv, 'allStoriesTab'))
  storyDiv.prepend(storyButton)
  storyDiv.append(ownersDiv)
  allStories.appendChild(storyDiv)
}

/**
 * Add the passed in story to the battleLog tab
 * @param {*} story the story to add to the battleLog tab
 */
const addToBattleLogTab = story => {
  const ownerNames = story.owner_ids.length > 0
    ? story.owner_ids.map(memberId => getMemberName(memberId)).join(', ')
    : 'unassigned'
  const actionDiv = document.createElement('div')
  actionDiv.classList.add('action')
  actionDiv.innerHTML = ownerNames + ' completed ' + story.name + ' dealing ' + estimateStoryPoints(story.estimate) + ' DMG'

  battleLog.appendChild(actionDiv)
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
        memberTeam.innerHTML = memberProfile.role /* sets role of member not organization/team */

        /* Get top warriors and update text */
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

        updateHealthBar()

        /* Populate tabs */

        // My Stories
        getMyIncompleteStories().map(story => {
          addToMyStoriesTab(story)
        })

        getAllIncompleteStories().map(story => {
          addToAllStoriesTab(story)
        })

        getBattleLog().map(story => {
          addToBattleLogTab(story)
        })

        const allMembers = getAllMembers()
        allMembers.forEach(member => {
          const memberDiv = document.createElement('div')
          memberDiv.classList.add('member')
          const memberName = document.createElement('div')
          memberName.innerHTML = member.profile.name
          const honorButton = document.createElement('div')
          honorButton.classList.add('honor')
          honorButton.innerHTML = 'Honor'
          honorButton.addEventListener('click', () => honorMember(member))
          memberDiv.appendChild(memberName)
          memberDiv.appendChild(honorButton)
          membersList.appendChild(memberDiv)
        })
      })
  },
  false
) // addEventListener()

/**
 * Calculate the amount of health the boss has left and display it as a health
 * bar in the DOM
 */
function updateHealthBar () {
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
}
