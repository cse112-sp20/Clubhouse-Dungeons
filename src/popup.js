import {
  setup,
  getMyIncompleteStories,
  getAllIncompleteStories,
  getBattleLog,
  getTopWarriors,
  getAllMembers,
  getMemberName,
  getMemberProfile,
  getProgress,
  completeStory
} from './popup-backend'
import {
  ERR_MSG_INTERNET,
  ERR_MSG_INVALID_API_TOKEN,
  ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED,
  ERR_MSG_BROWSER_STORAGE,
  ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE
} from './api/clubhouse-api'

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
  chrome.storage.sync.clear(() => {
    if (chrome.runtime.lastError) {
      console.log(ERR_MSG_BROWSER_STORAGE)
      console.log('Error trying to clear storage')
      /* TODO: UI */
    } else {
      console.log('Storage cleared')

      // load the login page
      window.location.href = 'login.html'
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
 * TODO: Record honoring of member in database
 *
 * @param {Member} member Member object that is being honored
 */
function honorMember (member) {
  const memberId = member.id
  console.log('honor member', memberId)
}

/**
 * TODO: Complete story
 *
 * @param {Story} story Story that is being completed
 * @param storyNode
 * @param tabName
 */
function onCompleteStory (story, storyNode, tabName) {
  completeStory(story.id)
    .then(story => {
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
    .catch((e) => {
      switch (e.message) {
        case ERR_MSG_INTERNET:
          // Respond to internet error
          /* TODO: UI */
          break
        case ERR_MSG_INVALID_API_TOKEN:
          signout()
          /* TODO: UI */
          break
        case ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED:
          // Respond to quota exceeded
          /* TODO: UI */
          break
        case ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE:
        default:
          // Respond to unknown error
          /* TODO: UI */
          break
      }
    })
}

/**
 * Converts a string containing someone's full name into first name and last initial format
 *
 * @param {string} name the name to be converted into first name, last initial format
 */
const getFNameAndLInitial = name => {
  // Split up the full name into an array called res using " " as the delimiter
  var res = name.split(' ')

  /* Pseudocode
   * ----------
   * If res is empty, throw error.
   * Else, if res has more than 2 elements,
   * concatenate and return the first element, a space, the first char of the last element, and a period.
   * Else, if res has 2 elements,
   * concatenate and return the first element, a space, the first char of the second element, and a period.
   * Else, if res has 1 element,
   * return the first element of res
   */
  if (res.length === 0) {
    throw new Error('Length of name is 0!')
  } else if (res.length > 2) {
    return res[0] + ' ' + res[res.length - 1][0] + '.'
  } else if (res.length === 2) {
    return res[0] + ' ' + res[1][0] + '.'
  } else if (res.length === 1) {
    return res[0]
  }
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
 *
 * @param {*} story the story to add to the myStories tab
 */
const addToMyStoriesTab = story => {
  const storyDiv = document.createElement('div')
  const storyButton = document.createElement('div')
  storyDiv.classList.add('story')
  storyButton.classList.add('story-button')
  storyButton.innerHTML = '<img src="images/sword.png" >'
  storyDiv.innerHTML = '<div class="name">' + story.name + '</div>'

  if (story.estimate) {
    storyDiv.innerHTML += '<div class="points">' + story.estimate + ' DMG</div>'
  } else {
    storyDiv.innerHTML += '<div class="points"></div>'
  }

  storyButton.addEventListener('click', () => onCompleteStory(story, storyDiv, 'myStoriesTab'))
  storyDiv.prepend(storyButton)
  myStories.appendChild(storyDiv)
}

/**
 * Adds the passed in story to the allStories tab
 *
 * @param {*} story the story to add to the allStories tab
 */
const addToAllStoriesTab = story => {
  const ownerNames = story.owner_ids.length > 0
    ? story.owner_ids.map(memberId => getMemberName(memberId))
    : ['Unassigned']

  const storyDiv = document.createElement('div')
  const storyButton = document.createElement('div')
  storyDiv.classList.add('story')
  storyButton.classList.add('story-button')
  storyButton.innerHTML = '<img src="images/sword.png" >'
  storyDiv.innerHTML = '<div class="name">' + story.name + '</div>'

  if (story.estimate) {
    storyDiv.innerHTML += '<div class="points">' + story.estimate + ' DMG</div>'
  } else {
    storyDiv.innerHTML += '<div class="points"></div>'
  }

  const ownersDiv = document.createElement('div')
  ownersDiv.classList.add('owners')
  ownerNames.forEach(ownerName => {
    const ownerDiv = document.createElement('div')
    ownerDiv.innerHTML = ownerName
    ownersDiv.append(ownerDiv)
  })
  storyDiv.prepend(storyButton)
  storyDiv.append(ownersDiv)
  allStories.appendChild(storyDiv)
}

/**
 * Add the passed in story to the battleLog tab
 *
 * @param {*} story the story to add to the battleLog tab
 */
const addToBattleLogTab = story => {
  const ownerNames = story.owner_ids.length > 0
    ? story.owner_ids.map(memberId => getMemberName(memberId)).join(', ')
    : 'unassigned'
  const actionDiv = document.createElement('div')
  actionDiv.classList.add('action')

  if (story.estimate) {
    actionDiv.innerHTML = ownerNames + ' completed ' + story.name + ' dealing ' + story.estimate + ' DMG'
  } else {
    actionDiv.innerHTML = ownerNames + ' completed ' + story.name
  }

  battleLog.appendChild(actionDiv)
}

/**
 * See {@link https://www.w3schools.com/jsref/met_document_addeventlistener.asp} for
 * the definition and usage of document.addEventListener. Also, check out
 * {@link https://www.w3schools.com/jsref/dom_obj_event.asp} for at list of DOM Events
 * which are used by entering as strings into the first parameter of addEventListener.
 * Unfortunately, the 'DOMContentLoaded' event isn't listed in that link, but it is
 * explained in detail here: {@link https://www.javascripttutorial.net/javascript-dom/javascript-domcontentloaded/}.
 */
document.addEventListener(
  'DOMContentLoaded',
  () => {
    setup()
      .catch((e) => {
        switch (e.message) {
          case ERR_MSG_INTERNET:
            // Respond to internet error
            /* TODO: UI */
            break
          case ERR_MSG_INVALID_API_TOKEN:
            signout()
            /* TODO: UI */
            break
          case ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED:
            // Respond to quota exceeded
            /* TODO: UI */
            break
          case ERR_MSG_BROWSER_STORAGE:
            // Respond to error reading/writing to browser storage
            /* TODO: UI */
            break
          case ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE:
          default:
            // Respond to unknown error
            /* TODO: UI */
            break
        }
      })
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

        document.getElementById('warrior1Name').innerText = getFNameAndLInitial(topWarriors[0].name)
        document.getElementById('warrior2Name').innerText = getFNameAndLInitial(topWarriors[1].name)
        document.getElementById('warrior3Name').innerText = getFNameAndLInitial(topWarriors[2].name)

        document.getElementById('warrior1Points').innerText = `${topWarriors[0].points}` + ' DMG'
        document.getElementById('warrior2Points').innerText = `${topWarriors[1].points}` + ' DMG'
        document.getElementById('warrior3Points').innerText = `${topWarriors[2].points}` + ' DMG'

        updateHealthBar()

        /* Populate tabs */
        getMyIncompleteStories().map(story => {
          addToMyStoriesTab(story)
        })

        getAllIncompleteStories().map(story => {
          addToAllStoriesTab(story)
        })

        getBattleLog().map(story => {
          addToBattleLogTab(story)
        })

        /*
         * For each member in the array returned by getAllMembers(),
         * create HTML 'div' elements (which includes the member name
         * and honor button) to add into the honorButton drop-down list.
         */
        getAllMembers().map(member => {
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
  }
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
