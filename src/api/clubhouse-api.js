/**
 * @typedef {object} Project
 * @property {string} id - ID of the project
 */

/**
 * @typedef {object} Story
 * @property {boolean} completed - Whether the story is completed
 * @property {?string} completed_at - String representation of the time of
 * completion
 * @property {number} estimate - Story point estimate
 * @property {string} name - Name of the story
 * @property {Array<string>} owner_ids - Member IDs of members assigned to the
 * story
 */

/**
 * @typedef {object} BasicMember - Basic (not modified/enhanced by us) member object
 * fetched from Clubhouse
 * @property {object} profile - Profile of the member containing personal info
 * @property {string} profile.name - Name of the member
 */

/**
 * @typedef {object} Member - BasicMember that we have enhanced with additional
 * attributes (i.e. points)
 * @property {number} points - Total story points completed by the member
 * @property {object} profile - Profile of the member containing personal info
 * @property {string} profile.name - Name of the member
 */

/**
 * @typedef {object} MemberDisplay - Sub-object of BasicMember, with simplified structure
 * @property {string} workspace - Name of the member's workspace
 * @property {name} name - Name of the member
 * @property {string} icon - URL of the member's display icon
 */

/**
 * @typedef {object} Contributor - Sub-object of Member, with simplified structure
 * @property {string} name - Name of the contributor (member)
 * @property {string} points - Total story points completed by the member
 */

/**
 * @typedef {object} MemberInfo - Member object, containing workspace info (but less
 * member info than BasicMember), fetched from Clubhouse
 * @property {string} name - Name of the member
 * @property {object} workspace2 - Info about the member's workspace
 * @property {string} workspace2.url_slug - Member's workspace URL slug
 */

/**
 * @typedef {object} Iteration - Iteration object that contains all info about an iteration from Clubhouse
 * @property {number} id - ID of the iteration
 * @property {string} start_date - String representation (format 'yyyy-mm-dd') of the starting date of the iteration
 * @property {string} end_date - String representation (format 'yyyy-mm-dd') of the ending date of the iteration
 * @property {string} status - The current status of the iteration. Can be 'started', 'unstarted' or 'done'
 */

/**
 * @typedef {object} IterationDisplay - Sub-object of Iteration, with additional days_remaining attribute
 * @property {Date} start_date - The starting date of the iteration
 * @property {Date} end_date - The ending date of the iteration
 * @property {number} days_remaining - Days remaining in the iteration
 */

/**
 * @typedef {object} Progress
 * @property {number} total - Number of total story points
 */

const ERR_MSG_INTERNET = 'internet-error'
const ERR_MSG_INVALID_API_TOKEN = 'invalid-api-token-error'
const ERR_MSG_NO_ACTIVE_ITERATION = 'no-iteration-in-progress-error'
const ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED = 'clubhouse-api-quota-exceeded-error'
const ERR_MSG_BROWSER_STORAGE = 'browser-storage-error'
const ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE = 'unknown-clubhouse-api-response-status'

/**
 * Fetch from a Clubhouse API endpoint. Fetch calls from this method differ from
 * regular fetches in that they send the desired fetch call through a CORS proxy.
 *
 * @async
 * @param {string} url - The Clubhouse URL to fetch from
 * @param {object} params - Optional parameters to pass to fetch (i.e. headers)
 * @returns {Promise<Array<Project | Story | BasicMember> | MemberInfo | Error>}
 * If successful, a promise to the requested object. Otherwise, an Error with
 * message equal to the value of:
 *   - ERR_MSG_INTERNET
 *   - ERR_MSG_INVALID_API_TOKEN
 *   - ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED
 *   - ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE
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
 * @async
 * @param {string} apiToken - Member's API token
 * @returns {Promise<Array<Iteration>>} A promise of an array of iteration objects
 */
const fetchIterationsAsync = async (apiToken) => {
  return fetchFromClubhouse(`https://api.clubhouse.io/api/v3/iterations?token=${apiToken}`, {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Fetch all stories in an iteration
 *
 * @async
 * @param {string} apiToken - Member's API token
 * @param {string} iterationId - ID of the iteration
 * @returns {Promise<Array<Story>>} A promise to all stories in the iteration
 */
const fetchIterationStoriesAsync = async (apiToken, iterationId) => {
  return fetchFromClubhouse(`https://api.clubhouse.io/api/v3/iterations/${iterationId}/stories?token=${apiToken}`, {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Fetch all members in the workspace
 *
 * @async
 * @param {string} apiToken - Member's API token
 * @returns {Promise<Array<BasicMember>>} A promise to the array of member objects
 */
const fetchMembersAsync = async (apiToken) => {
  return fetchFromClubhouse(`https://api.clubhouse.io/api/v3/members?token=${apiToken}`, {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Request update to story info using workflow_state_id and time completed
 *
 * @async
 * @param {string} apiToken - Member's API token
 * @param {string} storyId - ID of the story
 * @returns {Promise<Story>} A promise to the updated story
 */
const completeStoryAsync = async (apiToken, storyId) => {
  return fetchFromClubhouse(`https://api.clubhouse.io/api/v3/stories/${storyId}?token=${apiToken}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed_at_override: getCurrentTime(), workflow_state_id: 500000011 })
  })
}

const getCurrentTime = () => {
  var today = new Date()
  var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
  var time = 'T' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds() + 'Z'
  return date + time
}

export {
  fetchMemberInfoAsync,
  fetchIterationsAsync,
  fetchIterationStoriesAsync,
  fetchMembersAsync,
  completeStoryAsync,
  ERR_MSG_INTERNET,
  ERR_MSG_INVALID_API_TOKEN,
  ERR_MSG_NO_ACTIVE_ITERATION,
  ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED,
  ERR_MSG_BROWSER_STORAGE,
  ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE
}
