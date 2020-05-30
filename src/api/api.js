import './type-defs'
/**
 * Signed-in member's API key
 *
 * @type {?string}
 */
var API_TOKEN = null

/**
 * Name of the workspace (workspace URL slug, actually) that the signed-in
 * member is a part of
 *
 * @type {?string}
 */
var WORKSPACE = null

/**
 * Signed-in member's member ID
 *
 * @type {?string}
 */
var MEMBER_ID = null

/**
 * Object mapping member ID -> member object. Contains all members
 *
 * @type {?object<string, import('type-defs.js').Member>}
 */
var MEMBER_MAP = null

/**
 * All stories in the workspace
 *
 * @type {?Array<import('type-defs.js').Story>}
 */
var STORIES = null

/**
 * A promise to all global variables being initialized; promise that fulfills
 * when all global vars are initialized. Once all global vars are initialized
 * (without errors), all methods can execute correctly.
 *
 * @type {?Promise<void>}
 *
 * @see setup
 */
var SETUP = null

/**
 * Fetch all projects
 *
 * @async
 * @returns {Promise<Array<import('type-defs.js').Project>>} A promise to all projects in the workspace
 */
const fetchProjectsAsync = async () => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/projects?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

/**
 * Fetch all stories in a project
 *
 * @async
 * @param {string} projectId - ID of the project
 * @returns {Promise<Array<import('type-defs.js').Story>>} A promise to all stories in the project
 */
const fetchProjectStoriesAsync = async (projectId) => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/projects/${projectId}/stories?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

/**
 * Fetch all stories in all projects
 *
 * @async
 * @returns {Promise<Array<import('type-defs.js').Story>>} A promise to all stories in the workspace
 */
const fetchStoriesAsync = async () => {
  return await fetchProjectsAsync()
    .then(projects => {
      return Promise.all(projects.map(project => fetchProjectStoriesAsync(project.id)))
    })
    .then(allProjectsStories => {
      // Remove projects that have no stories
      // Flatten the array to an array of story objects
      return allProjectsStories
        .filter(projectStories => projectStories.length > 0)
        .flat()
    })
}

/**
 * Fetch info about a member
 *
 * @async
 * @param {string} apiToken - Member's API token
 * @returns {Promise<import('type-defs.js').MemberInfo>} A promise to the member info object
 */
const fetchMemberInfoAsync = async (apiToken) => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/member?token=${apiToken}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

/**
 * Fetch all members in the workspace
 *
 * @async
 * @returns {Promise<Array<import('type-defs.js').BasicMember>>} A promise to the array of member objects
 */
const fetchMembersAsync = async () => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/members?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

/**
 * Check if a story is complete
 *
 * @param {import('type-defs.js').Story} story - Story to check
 * @returns {boolean} True if the story is complete, false otherwise
 */
const isComplete = story => story.completed === true

/**
 * Get stories - using optional filters - from the set of all stories in the
 * workspace (STORIES).
 *
 * @param {object<string, boolean>} [params] - Optional parameter to specify
 *                                             filter flags.
 * @param {boolean} [params.memberOnly=false] - Flag to only include stories
 *                                              assigned to the signed-in
 *                                              member.
 * @param {boolean} [params.incompleteOnly=false] - Flag to only include stories
 *                                                  that are incomplete.
 * @param {boolean} [params.completeOnly=false] - Flag to only include stories
 *                                                that are complete.
 * @returns {?Array<import('type-defs.js').Story>} Stories specified by the filters (if any). If no
 *                          filters are specified, returns all stories in the
 *                          workspace (STORIES). If STORIES is null, returns
 *                          null.
 */
const getStories = ({ memberOnly = false, incompleteOnly = false, completeOnly = false } = {}) => {
  if (!STORIES) {
    console.log('getStories called before api::STORIES assigned')
    return null
  }

  let stories = STORIES
  if (memberOnly) {
    stories = stories.filter(story => story.owner_ids.indexOf(MEMBER_ID) !== -1)
  }
  if (incompleteOnly) {
    stories = stories.filter(story => !isComplete(story))
  }
  if (completeOnly) {
    stories = stories.filter(story => isComplete(story))
  }
  return stories
}

/**
 * Get incomplete stories that are assigned to the signed-in member
 *
 * @returns {?Array<import('type-defs.js').Story>} Incomplete stories assigned to the signed-in member.
 *                          If STORIES is null, returns null.
 *
 * @see getStories
 */
const getMyIncompleteStories = () => {
  return getStories({ memberOnly: true, incompleteOnly: true })
}

/**
 * Get all incomplete stories in the workspace
 *
 * @returns {?Array<import('type-defs.js').Story>} All incomplete stories in the workspace. If STORIES
 *                          is null, returns null.
 *
 * @see getStories
 */
const getAllIncompleteStories = () => {
  return getStories({ incompleteOnly: true })
}

/**
 * Get up to top 3 point contributors. If less than 3 members have completed any
 * stories (and have more than 0 points), only return those that do.
 *
 * @returns {Array<import('type-defs.js').TopContributor>} The top contributors (max 3). If less than
 *                                  3 top contributors exist, only those, the
 *                                  returned array will have length less than 3.
 */
const getTopWarriors = () => {
  // Map to hold member ID as key and member object as value
  const map = new Map()
  for (const [memberId, memberObj] of Object.entries(MEMBER_MAP)) {
    map.set(memberId, memberObj)
  }

  /**
   * Finds top warrior by points and removes from map. If a top warrior doesn't
   * exist, return null.
   *
   * @returns {?import('type-defs.js').TopContributor} Top contributor in map or null if none exists
   */
  const removeTopWarrior = () => {
    let memberName = null
    let memberPoints = null
    let memId = null
    // Iterate through map and find greatest value
    for (const [memberId, memberObj] of map) {
      if (memberObj.points > memberPoints) {
        memberPoints = memberObj.points
        memberName = getMemberName(memberId)
        memId = memberId
      }
    }

    if (memberName) {
      // If top warrior found, remove from map
      map.delete(memId)

      return {
        name: memberName,
        points: memberPoints
      }
    } else {
      return null
    }
  }

  const warriors = []
  while (warriors.length < 3) {
    const topWarrior = removeTopWarrior()
    if (topWarrior) {
      warriors.push(topWarrior)
    } else {
      break
    }
  }
  return warriors
}

/**
 * Get all team members.
 *
 * @returns {Array<import('type-defs.js').Member>} Array of all members.
 */
const getAllMembers = () => Object.values(MEMBER_MAP)

/** Returns stories in sorted by most recently completed
 * Get stories to show in the battle log - all completed stories sorted by most
 * recently completed.
 *
 * @returns {?Array<import('type-defs.js').Story>} Stories for battle log. If STORIES is null, returns null
 */
const getBattleLog = () => {
  const stories = getStories({ completeOnly: true })

  if (!stories) {
    return null
  }

  stories.sort((a, b) => {
    const dateA = Date.parse(
      a.completed_at_override
        ? a.completed_at_override
        : a.completed_at)
    const dateB = Date.parse(
      b.completed_at_override
        ? b.completed_at_override
        : b.completed_at)

    if (dateA > dateB) {
      return -1
    } else if (dateA === dateB) {
      return 0
    } else {
      return 1
    }
  })
  return stories
}

/**
 * Get the name of a member
 *
 * @param {string} memberId - ID of the member to get the name of
 * @returns {string} Name of the specified member
 */
const getMemberName = (memberId) => {
  return MEMBER_MAP[memberId].profile.name
}

/**
 * Get the display info - workspace, name, and display icon - of the signed-in
 * member.
 *
 * @returns {import('type-defs.js').MemberDisplay} The display info of the signed-in member
 */
const getMemberProfile = () => {
  // Relevant user profile details
  if (MEMBER_MAP[MEMBER_ID].profile.display_icon) {
    return {
      workspace: WORKSPACE,
      name: MEMBER_MAP[MEMBER_ID].profile.name,
      icon: MEMBER_MAP[MEMBER_ID].profile.display_icon.url
    }
  } else {
    return {
      workspace: WORKSPACE,
      name: MEMBER_MAP[MEMBER_ID].profile.name,
      icon: 'https://cdn.patchcdn.com/assets/layout/contribute/user-default.png'
    }
  }
}

/**
 * Set the value of API_TOKEN to undefined
 */
const removeApiToken = () => {
  API_TOKEN = undefined
}

/**
 * Get the overall progress of stories, in terms of points completed
 *
 * @returns {import('type-defs.js').Progress} Completed points and total points
 */
const getProgress = () => {
  let completed = 0
  let total = 0
  getStories().map(story => {
    if (story.estimate) {
      if (isComplete(story)) {
        completed += story.estimate
      }
      total += story.estimate
    }
  })
  return { completed, total }
}

/**
 * Method to be called during the sign-in process once the member's API token,
 * ID, and workspace are known. Initializes global variables that are known, and
 * triggers the initialization of all other global variables (by calling setup).
 *
 * @param {string} apiToken - API token of the member signing in
 * @param {string} memberId - Member ID of the member signing in
 * @param {string} workspace - Workspace of the member signing in
 *
 * @see setup
 */
const onLogin = (apiToken, memberId, workspace) => {
  // Init global vars that don't require fetching
  API_TOKEN = apiToken
  MEMBER_ID = memberId
  WORKSPACE = workspace

  // Init global vars that require fetching
  setup()
}

/**
 * Get the SETUP promise. If SETUP hasn't been initialized yet, create it.
 * Otherwise, return the existing promise - do not recreate/restart it.
 *
 * @returns {?Promise<void>} A promise to all global variables being initialized
 *                           without error and all methods being ready for
 *                           execution.
 *
 * @see SETUP
 */
const setup = () => {
  if (!SETUP) {
    SETUP = new Promise((resolve, reject) => {
      chrome.storage.sync.get(['api_token', 'member_id', 'workspace'], store => {
        API_TOKEN = store.api_token
        MEMBER_ID = store.member_id
        WORKSPACE = store.workspace

        Promise.all([
          fetchStoriesAsync()
            .then(stories => {
              STORIES = stories
            }),
          fetchMembersAsync()
            .then(members => {
              MEMBER_MAP = {}
              members.map(member => {
                MEMBER_MAP[member.id] = member
              })
            })
        ])

          .then(() => {
            // Initalize member map points to 0
            for (const memberObj of Object.values(MEMBER_MAP)) {
              memberObj.points = 0
            }
            // Set total contributed points to each member
            getStories({ completeOnly: true }).map((story) => {
              if (story.owner_ids && story.estimate) {
                story.owner_ids.map((memberId) => {
                  MEMBER_MAP[memberId].points += story.estimate
                })
              }
            })
            resolve('All globals are setup')
          })
      })
    })
  }
  return SETUP
}

/**
 * Used for testing only.  Does the same thing as setup, but does not use chrome storage
 *
 * @param {string} apiToken the token to set the API_TOKEN var to
 * @param {string} memberID the id to set MEMBER_ID var to
 * @param {Function} cb function called at end
 */
const setupTest = (apiToken, memberID, cb) => {
  API_TOKEN = apiToken
  MEMBER_ID = memberID

  Promise.all([
    fetchStoriesAsync()
      .then(stories => {
        STORIES = stories
      }),
    fetchMembersAsync()
      .then(members => {
        MEMBER_MAP = {}
        members.map(member => {
          MEMBER_MAP[member.id] = member
        })
      })
  ])
    .then(() => {
      cb()
    })
}

module.exports = {
  fetchMemberInfoAsync,
  getMyIncompleteStories,
  getAllIncompleteStories,
  getBattleLog,
  getTopWarriors,
  getAllMembers,
  getMemberName,
  getMemberProfile,
  getProgress,
  onLogin,
  setup,
  removeApiToken,
  setupTest
}
