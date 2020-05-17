var API_TOKEN
var MEMBER_ID
var MEMBER_MAP // Maps member ID -> member
var STORIES // Array of story objects
var SETUP // Promise that fulfills when all global vars are initialized

/**
 * Fetch all projects
 *
 * @async
 * @returns {Promise<Array>}
 */
const fetchProjectsAsync = async () => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/projects?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

/**
 * Fetch all stories in project with project ID {@param projectId}
 *
 * @async
 * @param {string} projectId
 * @returns {Promise<Array>}
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
 * @returns {Promise<Array>}
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

const fetchMemberInfoAsync = async (apiToken) => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/member?token=${apiToken}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

const fetchMembersAsync = async () => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/members?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

const isComplete = story => story.completed === true

const getStories = ({ memberOnly = false, incompleteOnly = false, completeOnly = false } = {}) => {
  if (STORIES === undefined) {
    console.log('getStories called before api::STORIES assigned')
    return
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

const getMyIncompleteStories = () => {
  return getStories({ memberOnly: true, incompleteOnly: true })
}

const getAllIncompleteStories = () => {
  return getStories({ incompleteOnly: true })
}

// Returns stories in sorted by most recently completed
const getBattleLog = () => {
  const compare = (a, b) => {
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
  }

  const stories = getStories({ completeOnly: true })
  stories.sort(compare)
  return stories
}

const getMemberName = (memberId) => {
  return MEMBER_MAP[memberId].profile.name
}
const getMemberProfile = () => {
  // Relevant user profile details
  if (MEMBER_MAP[MEMBER_ID].profile.display_icon) {
    return {
      name: MEMBER_MAP[MEMBER_ID].profile.name,
      icon: MEMBER_MAP[MEMBER_ID].profile.display_icon.url
    }
  } else {
    return {
      name: MEMBER_MAP[MEMBER_ID].profile.name,
      icon: 'https://cdn.patchcdn.com/assets/layout/contribute/user-default.png'
    }
  }
}

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

const onLogin = (apiToken, memberId) => {
  // Init global vars that don't require fetching
  API_TOKEN = apiToken
  MEMBER_ID = memberId

  // Init global vars that require fetching
  setup()
}

const setup = () => {
  if (!SETUP) {
    SETUP = new Promise((resolve, reject) => {
      chrome.storage.sync.get(['api_token', 'member_id'], store => {
        API_TOKEN = store.api_token
        MEMBER_ID = store.member_id

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
            resolve('All globals are setup')
          })
      })
    })
  }
  return SETUP
}

module.exports = {
  fetchMemberInfoAsync,
  getMyIncompleteStories,
  getAllIncompleteStories,
  getBattleLog,
  getMemberName,
  getMemberProfile,
  getProgress,
  onLogin,
  setup
}

/**
 * Set the current value of {@var API_TOKEN} to undefined
 */
export const removeApiToken = () => {
  API_TOKEN = undefined
}
