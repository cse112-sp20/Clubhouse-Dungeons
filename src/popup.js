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
  removeApiToken,
  onLogin
} from './api/api'
import {
  memberLogin,
  honorDatabaseMember,
  getBoss,
  damageBoss
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

const monster = document.getElementById('monster')

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

const bossMap = document.getElementById('bossMap')
const bossMapContent = document.getElementById('bossMapContent')
const openBossMap = document.getElementById('openBossMap')
const closeBossMap = document.getElementById('closeBossMap')
openBossMap.addEventListener('click', () => toggleBossMap())
closeBossMap.addEventListener('click', () => toggleBossMap())

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
const toggleBossMap = () => {
  if (bossMap.classList.contains('open')) {
    bossMap.classList.remove('open')
  } else {
    bossMap.classList.add('open')
  }
}

/**
 * Show or hide the boss map
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
      const myStoriesNode = getStoryNodeFromContainer(myStories, story)
      if (myStoriesNode) {
        myStories.removeChild(myStoriesNode)
      }

      // Remove from all stories
      const allStoriesNode = getStoryNodeFromContainer(allStories, story)
      if (allStoriesNode) {
        allStories.removeChild(allStoriesNode)
      }

      // add the completed story to the battleLog tab
      addToBattleLogTab(story)

      // do damage to the boss
      doDamage(story.estimate)
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
 * Adds the passed in story to the myStories tab
 *
 * @param {Story} story the story to add to the myStories tab
 */
const addToMyStoriesTab = story => {
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
  myStories.appendChild(storyDiv)
}

/**
 * Adds the passed in story to the allStories tab
 *
 * @param {Story} story the story to add to the allStories tab
 */
const addToAllStoriesTab = story => {
  const ownerNames = story.owner_ids.length > 0
    ? story.owner_ids.map(memberId => getMemberName(memberId))
    : ['Unassigned']

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

  const ownersDiv = document.createElement('div')
  ownersDiv.classList.add('owners')
  ownerNames.forEach(ownerName => {
    const ownerDiv = document.createElement('div')
    ownerDiv.innerHTML = ownerName
    ownersDiv.append(ownerDiv)
  })

  storyButton.addEventListener('click', () => onCompleteStory(story))
  storyDiv.prepend(storyButton)
  storyDiv.append(ownersDiv)
  allStories.appendChild(storyDiv)
}

/**
 * Add the passed in story to the battleLog tab
 *
 * @param {Story} story the story to add to the battleLog tab
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

        initBossMap()

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
 * Populate the map with bosses
 */
const initBossMap = async () => {
  const { boss, healthTotal, health } = await getBoss(getMemberProfile().workspace);
  const numBosses = 10;
  // Iterate through all the bosses, adding each to the map
  for (let i = numBosses; i >= 0; i--) {
    const bossDiv = document.createElement('div');
    bossDiv.classList.add('boss');
    // If this boss is the current boss apply active style
    if (boss == i) {
      bossDiv.classList.add('active');
      const miniHealthBar = document.createElement('div');
      const miniHealthBarFill = document.createElement('div');
      miniHealthBar.classList.add('mini-health');
      miniHealthBarFill.classList.add('mini-health-fill');
      miniHealthBarFill.style.width = ((health / healthTotal) * 100) + '%';
      miniHealthBar.appendChild(miniHealthBarFill);
      bossDiv.appendChild(miniHealthBar);
    } else if (boss > i) {
      // If boss is greater than this boss it's already been defeated
      bossDiv.classList.add('dead');
      const crossDiv = document.createElement('div');
      crossDiv.classList.add('cross');
      crossDiv.innerHTML = '<span>&#10005;</span>'
      bossDiv.appendChild(crossDiv);
    } else {
      bossDiv.classList.add('locked');
    }
    const bossImg = document.createElement('img');
    bossImg.src = 'images/boss/' + i + '.png';
    bossDiv.appendChild(bossImg);
    bossMapContent.appendChild(bossDiv);
    if (i != 0) {
      const trailDiv = document.createElement('div');
      trailDiv.classList.add('trail');
      bossMapContent.appendChild(trailDiv); 
    }
  }
}

/**
 * Calculate the amount of health the boss has left and display it as a health
 * bar in the DOM
 */
const updateHealthBar = async () => {
  /* Set progress bar values */
  const { boss, healthTotal, health } = await getBoss(getMemberProfile().workspace)
  monster.src = 'images/boss/' + boss + '.png'
  healthLeft.style.width = (health / healthTotal) * 100 + '%'
  healthText.appendChild(document.createTextNode(`${health} / ${healthTotal}`))

  /* Set progress bar color change */
  const greenThreshold = (2 / 5) * health
  const yellowThreshold = (1 / 5) * health
  healthLeft.className += (health - healthTotal > greenThreshold) ? 'healthBarGreenState'
    : (health - healthTotal > yellowThreshold) ? 'healthBarYellowState'
      : 'healthBarRedState'
}

/**
 * Deal damage to the boss by calling appropriate Firebase function
 * 
 * @param {!number} damage - amount of damage (story points) being done
 */
function doDamage(damage) {
  damageBoss(getMemberProfile().workspace, damage).then(() => updateHealthBar())
}
