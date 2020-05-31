/**
 * TYPE DECLARATIONS
 *
 * @typedef Project
 * @type {Object}
 * @property {string} id - ID of the project
 *
 *
 * @typedef Story
 * @type {Object}
 * @property {boolean} completed - Whether the story is completed
 * @property {?string} completed_at - String representation of the time of
 *                                    completion
 * @property {number} estimate - Story point estimate
 * @property {string} id - ID of the story
 * @property {string} name - Name of the story
 * @property {Array<string>} owner_ids - Member IDs of members assigned to the
 *                                       story
 *
 *
 * @typedef BasicMember - Basic (not modified/enhanced by us) member object
 *                        fetched from Clubhouse
 * @type {Object}
 * @property {string} id - ID of the member
 * @property {Object} profile - Profile of the member containing personal info
 * @property {string} profile.name - Name of the member
 *
 *
 * @typedef Member - BasicMember that we have enhanced with additional
 *                   attributes (i.e. points)
 * @type {Object}
 * @property {string} id - ID of the member
 * @property {number} points - Total story points completed by the member
 * @property {Object} profile - Profile of the member containing personal info
 * @property {string} profile.name - Name of the member
 *
 *
 * @typedef MemberDisplay - Sub-object of BasicMember, with simplified structure
 * @type {Object}
 * @property {string} workspace - Name of the member's workspace
 * @property {name} name - Name of the member
 * @property {string} icon - URL of the member's display icon
 *
 *
 * @typedef TopContributor - Sub-object of Member, with simplified structure
 * @type {Object}
 * @private {string} name - Name of the topContributor (member)
 * @private {string} points - Total story points completed by the member
 *
 *
 * @typedef MemberInfo - Member object, containing workspace info (but less
 *                       member info than BasicMember), fetched from Clubhouse
 * @type {Object}
 * @property {string} id - ID of the member
 * @property {string} name - Name of the member
 * @property {Object} workspace2 - Info about the member's workspace
 * @property {string} workspace2.url_slug - Member's workspace URL slug
 *
 *
 * @typedef Progress
 * @type {Object}
 * @property {number} completed - Number of story points completed
 * @property {number} total - Number of total story points
 */

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
 * @type {?Object<string, Member>}
 */
var MEMBER_MAP = null

/**
 * All stories in the workspace
 *
 * @type {?Array<Story>}
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

const ERR_MSG_INTERNET = 'internet-error'
const ERR_MSG_INVALID_API_TOKEN = 'invalid-api-token-error'
const ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED = 'clubhouse-api-quota-exceeded-error'
const ERR_MSG_BROWSER_STORAGE = 'browser-storage-error'
const ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE = 'unknown-clubhouse-api-response-status'

/**
 * Fetch from Clubhouse
 *
 * @async
 * @returns
 */
const fetchFromClubhouse = async (url, params) => {
  const corsProxyUrl = 'https://cors-anywhere.herokuapp.com'
  return fetch(`${corsProxyUrl}/${url}`, params)
    .catch(e => {
      // If the fetch call rejects, then there must've been an error in the network call
      console.log(`Caught ${e.name} in fetchFromClubhouse. Throwing internet error`)
      throw new Error(ERR_MSG_INTERNET) // Reject, with value 'internet-error'
    })
    .then(res => {
      switch (res.status) {
        case 200:
          return res.json() // Resolve, with value res.json()
        case 401:
          throw new Error(ERR_MSG_INVALID_API_TOKEN) // Reject, with value 'invalid-api-token-error'
        case 429:
          throw new Error(ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED) // Reject, with value 'clubhouse-api-quota-exceeded-error'
        default:
          throw new Error(ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE) // Reject, with value 'unknown-clubhouse-api-response-status'
      }
    })
}

/**
 * Fetch all projects
 *
 * @async
 * @returns {Promise<Array<Project>>} A promise to all projects in the workspace
 */
/* Fetch all projects. Returns a promise */
const fetchProjectsAsync = async () => {
  return fetchFromClubhouse(`https://api.clubhouse.io/api/v3/projects?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Fetch all stories in a project
 *
 * @async
 * @param {string} projectId - ID of the project
 * @returns {Promise<Array<Story>>} A promise to all stories in the project
 */
/* Fetch all stories in a project. Returns a promise */
const fetchProjectStoriesAsync = async (projectId) => {
  return fetchFromClubhouse(`https://api.clubhouse.io/api/v3/projects/${projectId}/stories?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Fetch all stories in all projects
 *
 * @async
 * @returns {Promise<Array<Story>>} A promise to all stories in the workspace
 */
/* Fetch all stories in all projects. Returns a promise */
const fetchStoriesAsync = async () => {
  return fetchProjectsAsync()
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
    .catch(e => {
      console.log(`Caught ${e.message} in fetchStoriesAsync. Rethrowing it`)
      throw e
    })
}

/**
 * Fetch info about a member
 *
 * @async
 * @param {string} apiToken - Member's API token
 * @returns {Promise<MemberInfo>} A promise to the member info object
 */
const fetchMemberInfoAsync = async (apiToken) => {
  return fetchFromClubhouse(`https://api.clubhouse.io/api/v3/member?token=${apiToken}`, {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Fetch all members in the workspace
 *
 * @async
 * @returns {Promise<Array<BasicMember>>} A promise to the array of member objects
 */
const fetchMembersAsync = async () => {
  return fetchFromClubhouse(`https://api.clubhouse.io/api/v3/members?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Check if a story is complete
 *
 * @param {Story} story - Story to check
 * @returns {boolean} True if the story is complete, false otherwise
 */
const isComplete = story => story.completed === true

/**
 * Get stories - using optional filters - from the set of all stories in the
 * workspace (STORIES).
 *
 * @param {Object<string, boolean>} [params] - Optional parameter to specify
 *                                             filter flags.
 * @param {boolean} [params.memberOnly=false] - Flag to only include stories
 *                                              assigned to the signed-in
 *                                              member.
 * @param {boolean} [params.incompleteOnly=false] - Flag to only include stories
 *                                                  that are incomplete.
 * @param {boolean} [params.completeOnly=false] - Flag to only include stories
 *                                                that are complete.
 * @returns {?Array<Story>} Stories specified by the filters (if any). If no
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
 * @returns {?Array<Story>} Incomplete stories assigned to the signed-in member.
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
 * @returns {?Array<Story>} All incomplete stories in the workspace. If STORIES
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
 * @returns {Array<TopContributor>} The top contributors (max 3). If less than
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
   * @returns {?TopContributor} Top contributor in map or null if none exists
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
 * @returns {Array<Member>} Array of all members.
 */
const getAllMembers = () => Object.values(MEMBER_MAP)

/** Returns stories in sorted by most recently completed
 * Get stories to show in the battle log - all completed stories sorted by most
 * recently completed.
 *
 * @returns {?Array<Story>} Stories for battle log. If STORIES is null, returns null
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
 * @returns {MemberDisplay} The display info of the signed-in member
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
 * Get the overall progress of stories, in terms of points completed
 *
 * @returns {Progress} Completed points and total points
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
        if (chrome.runtime.lastError) {
          reject(Error(ERR_MSG_BROWSER_STORAGE))
        }

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
            resolve('setup resolved. All globals in api are setup')
          })
          .catch((e) => {
            console.log(`Caught ${e.message} in setup. Rejecting with reason being the error`)
            reject(e)
          })
      })
    })
  }
  return SETUP
}

/** Used for testing only.  Does the same thing as setup, but does not use chrome storage
 * @param apiToken the token to set the API_TOKEN var to
 * @param memberID the id to set MEMBER_ID var to
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
  setup,
  ERR_MSG_INTERNET,
  ERR_MSG_INVALID_API_TOKEN,
  ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED,
  ERR_MSG_BROWSER_STORAGE,
  ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE,
  setupTest
}
