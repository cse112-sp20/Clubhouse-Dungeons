import {
  setup,
  getMyIncompleteStories,
  getAllIncompleteStories,
  getBattleLog,
  getTopWarriors,
  getSignedInMember,
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
import {
  honorDatabaseMember,
  getHonoredByMap,
  memberLogin
} from './db/firebase'

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
const storiesTab = document.getElementById('storiesTab')
const teamTab = document.getElementById('teamTab')
const battleLogTab = document.getElementById('battleLogTab')

// Containers for actual elements
const stories = document.getElementById('stories')
// const allStories = document.getElementById('allStories')
const battleLog = document.getElementById('battleLog')
const team = document.getElementById('team')

// Click event listeners for tabs
storiesTab.addEventListener('click', () => selectTab(0))
teamTab.addEventListener('click', () => selectTab(1))
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
      storiesTab.classList.add('selected')
      stories.classList.add('selected')
      // allStories.classList.add('selected')
      break
    // Team Tab / Honor List
    case 1:
      teamTab.classList.add('selected')
      team.classList.add('selected')
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
 * Record honoring of member in database
 *
 * @param {Member} honoredMember - Member object that is being honored
 */
function honorMember (honoredMember) {
  honorDatabaseMember(getSignedInMember().id, honoredMember.id)
}

/**
 * Callback to be called when the user wants to mark a story completed. First,
 * tries to update the story using the Clubhouse API. If successful, remove the
 * story from local references (i.e. myStories) and from the tab that it is in.
 * If the update fails, handle the error (TODO).
 *
 * @param {Story} story - Story that is being completed
 */
function onCompleteStory (story) {
  completeStory(story.id)
    .then(story => {
      // Remove from my stories
      const storiesNode = getStoryNodeFromContainer(stories, story)
      if (storiesNode) {
        stories.removeChild(storiesNode)
      }

      // add the completed story to the top of the battleLog tab
      addToBattleLogTab(story, true)
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
 * Converts a full (i.e. first and last) name into first name and last initial
 * format.
 *
 * @param {string} name - Name to convert
 * @returns {string} Name in first name and last initial format
 */
const getFNameAndLInitial = name => {
  // Split up the full name into an array called res using " " as the delimiter
  var res = name.split(' ')

  /* If res is empty, return original name.
   * Else, if res has more than 2 elements,
   * concatenate and return the first element, a space, the first char of the last element, and a period.
   * Else, if res has 2 elements,
   * concatenate and return the first element, a space, the first char of the second element, and a period.
   * Else, if res has 1 element,
   * return the first element of res
   */
  if (res.length === 0) {
    return name
  } else if (res.length > 2) {
    return res[0] + ' ' + res[res.length - 1][0] + '.'
  } else if (res.length === 2) {
    return res[0] + ' ' + res[1][0] + '.'
  } else if (res.length === 1) {
    return res[0]
  }
}

/**
 * Get the node with storyName from a known container/parent
 *
 * @param {Element} nodeContainer - Container of all stories associated with a
 *   specific tab in the DOM.
 * @param {Story} story - The story of the story node to get
 * @returns {?Element} The node associated with the story, or null if the node
 *   isn't found.
 */
const getStoryNodeFromContainer = (nodeContainer, story) => {
  const storyNode = nodeContainer.children.namedItem(story.id)
  return storyNode || null
}

/**
 * Adds the passed in story to the myStories section of the stories tab
 *
 * @param {Story} story the story to add to the myStories tab
 */
const addToMyStoriesSection = story => {
  const storyDiv = document.createElement('div')
  storyDiv.setAttribute('id', story.id)
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

  storyButton.addEventListener('click', () => onCompleteStory(story))
  storyDiv.prepend(storyButton)
  stories.appendChild(storyDiv)
}

/**
 * Adds the passed in story to the allStories section of the stories tab
 *
 * @param {Story} story the story to add to the allStories tab
 */
const addToAllStoriesSection = story => {
  const ownerNames = story.owner_ids.length > 0
    ? story.owner_ids.map(memberId => getMemberName(memberId))
    : ['Unassigned']

  let signedInOwner = false
  const signedInOwnerName = getMemberName(getSignedInMember().id)
  const ownersDiv = document.createElement('div')
  ownersDiv.classList.add('owners')
  ownerNames.forEach(ownerName => {
    if (ownerName === signedInOwnerName) {
      signedInOwner = true
    }
    const ownerDiv = document.createElement('div')
    ownerDiv.innerHTML = ownerName
    ownersDiv.append(ownerDiv)
  })

  if (!signedInOwner) {
    const storyDiv = document.createElement('div')
    storyDiv.setAttribute('id', story.id)
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

    storyButton.addEventListener('click', () => onCompleteStory(story))
    storyDiv.prepend(storyButton)
    storyDiv.append(ownersDiv)
    stories.appendChild(storyDiv)
  }
}

/**
 * Add the passed in story to the battleLog tab
 *
 * @param {Story} story the story to add to the battleLog tab
 * @param {boolean} [addToTop=false] - whether to add the story to the top of the battleLog tab
 */
const addToBattleLogTab = (story, addToTop = false) => {
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

  if (addToTop) {
    console.log('add to top of battleLog')
    battleLog.prepend(actionDiv)
  } else {
    battleLog.appendChild(actionDiv)
  }
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
        const memberProfile = getMemberProfile()
        const allMemberIds = getAllMembers().map(member => member.id)
        memberLogin(getSignedInMember().id, allMemberIds, memberProfile.workspace)
          .then(() => {
            // needs to wait for the database variables to be setup by memberLogin
            getHonoredByMap(allMemberIds)
              .then((honoredByMap) => {
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
                  const honorBadge = document.createElement('div')
                  honorBadge.classList.add('badge')
                  const hoverText = document.createElement('span')
                  hoverText.classList.add('hovertext')

                  /*
                   * If the current member has an honored_by array that's greater
                   * than 0, add the honorBadge image to the honorBadge div element
                   * that will be appended to memberDiv. Also, for each member in
                   * the current member's honored_by array, add them to the tooltip
                   * that pops up when the cursor hovers over the badge.
                   */
                  if (honoredByMap[member.id].length > 0) {
                    honorBadge.innerHTML = '<img src="images/honorBadge.png" >'
                    hoverText.innerHTML = '<b><u>Honored by:</u></b>'
                    for (const m of honoredByMap[member.id]) {
                      hoverText.innerHTML += '<br>' + getFNameAndLInitial(getMemberName(m))
                    }
                    honorBadge.appendChild(hoverText)
                  }
                  const honorButton = document.createElement('div')
                  honorButton.classList.add('honor')
                  honorButton.innerHTML = 'Honor'
                  honorButton.addEventListener('click', () => honorMember(member))
                  memberDiv.appendChild(memberName)
                  memberDiv.appendChild(honorBadge)
                  memberDiv.appendChild(honorButton)
                  team.appendChild(memberDiv)
                })
              })
          })

        /* Get member info for profile button */
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
        // add My Stories heading to the stories tab
        const myStoriesH1 = document.createElement('h1')
        myStoriesH1.innerHTML = 'My Stories'
        stories.appendChild(myStoriesH1)

        getMyIncompleteStories().map(story => {
          addToMyStoriesSection(story)
        })

        // add All Stories heading to the stories tab
        const allStoriesH1 = document.createElement('h1')
        allStoriesH1.innerHTML = 'All Stories'
        stories.appendChild(allStoriesH1)

        getAllIncompleteStories().map(story => {
          addToAllStoriesSection(story)
        })

        getBattleLog().map(story => {
          addToBattleLogTab(story)
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
