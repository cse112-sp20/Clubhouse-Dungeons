import {
  fetchIterationsAsync,
  fetchIterationStoriesAsync,
  fetchMembersAsync,
  completeStoryAsync,
  ERR_MSG_NO_ACTIVE_ITERATION,
  ERR_MSG_BROWSER_STORAGE
} from './api/clubhouse-api'

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
 * @type {?object<string, Member>}
 */
var MEMBER_MAP = null

/**
 * All stories in the workspace
 *
 * @type {?Array<Story>}
 */
var STORIES = null

/**
 * The current iteration that the signed-in member is in; the first 'started'
 * iteration of all iterations.
 *
 * @type {?Iteration}
 */
var CURRENT_ITERATION = null

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
 * @param {object<string, boolean>} [params] - Optional parameter to specify
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
 * @returns {Array<Contributor>} An array of top contributors (max 3). If less
 *   than 3 top contributors exist, the returned array will have length less
 *   than 3. If there are no top contributors, an empty array is returned.
 */
const getTopWarriors = () => {
  // Map Member objects to Contributor objects
  // Filter out Members that haven't completed any story points
  const contributors = Object.values(MEMBER_MAP)
    .map(member => ({ name: member.profile.name, points: member.points }))
    .filter(member => member.points > 0)
  // Sort contributors by descending points
  contributors.sort((a, b) => b.points - a.points)
  return contributors.slice(0, 3)
}

/**
 * Get a member
 *
 * @param {string} memberId - Member ID of the member to get
 * @returns {Member} The member
 */
const getMember = (memberId) => MEMBER_MAP[memberId]

/**
 * Get the signed-in member
 *
 * @returns {Member} Signed-in member
 */
const getSignedInMember = () => MEMBER_MAP[MEMBER_ID]

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
 * Get the current iteration
 *
 * @returns {?IterationDisplay} Display information about the current iteration,
 *   or null if CURRENT_ITERATION is null.
 */
const getIterationTimeline = () => {
  if (!CURRENT_ITERATION) {
    return null
  }

  // calculate days remaining based on current & end dates
  var startDate = new Date(CURRENT_ITERATION.start_date)
  var currDate = new Date()
  var endDate = new Date(CURRENT_ITERATION.end_date)
  var remaining = Math.ceil((endDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24))

  if (remaining < 0) { // if the iteration is late don't show negative days
    remaining = 0
  }

  return {
    start_date: startDate,
    end_date: endDate,
    days_remaining: remaining
  }
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

        fetchIterationsAsync(API_TOKEN)
          .then(async iterations => {
            CURRENT_ITERATION = iterations.find(iter => iter.status === 'started')

            if (!CURRENT_ITERATION) {
              throw Error(ERR_MSG_NO_ACTIVE_ITERATION)
            }

            await Promise.all([
              fetchIterationStoriesAsync(API_TOKEN, CURRENT_ITERATION.id)
                .then(stories => {
                  STORIES = stories
                }),
              fetchMembersAsync(API_TOKEN)
                .then(members => {
                  MEMBER_MAP = {}
                  members.map(member => {
                    MEMBER_MAP[member.id] = member
                  })
                })
            ])

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
          .catch(e => {
            console.log(`Caught ${e.message} in setup. Rejecting with reason being the error`)
            reject(e)
          })
      })
    })
  }
  return SETUP
}

const completeStory = storyId => completeStoryAsync(API_TOKEN, storyId)

export {
  getMyIncompleteStories,
  getAllIncompleteStories,
  getBattleLog,
  getTopWarriors,
  getMember,
  getSignedInMember,
  getAllMembers,
  getMemberName,
  getMemberProfile,
  getProgress,
  getIterationTimeline,
  setup,
  completeStory
}
