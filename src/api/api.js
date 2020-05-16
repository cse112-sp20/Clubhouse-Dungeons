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

export const fetchMemberInfoAsync = async (apiToken) => {
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

const getStories = ({ memberOnly = false, incompleteOnly = false, completeOnly = false } = {}) => {
  if (STORIES === undefined) {
    console.log('getStories called before api::STORIES assigned')
    return
  }

  const isComplete = story => story.completed === true

  let stories = STORIES
  if (memberOnly) {
    stories = stories.filter(story => story.owner_ids.indexOf(MEMBER_ID !== -1))
  }
  if (incompleteOnly) {
    stories = stories.filter(story => !isComplete(story))
  }
  if (completeOnly) {
    stories = stories.filter(story => isComplete(story))
  }
  return stories
}

export const getMyIncompleteStories = () => {
  return getStories({ memberOnly: true, incompleteOnly: true })
}

export const getAllIncompleteStories = () => {
  return getStories({ incompleteOnly: true })
}

// Returns stories in sorted by most recently completed
export const getBattleLog = () => {
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

  const stories = getStories({ incompleteOnly: true })
  stories.sort(compare)
  return stories
}

export const onLogin = (apiToken, memberId) => {
  // Init global vars that don't require fetching
  API_TOKEN = apiToken
  MEMBER_ID = memberId

  // Init global vars that require fetching
  setup()
}

export const setup = () => {
  if (!SETUP) {
    if (!API_TOKEN || !MEMBER_ID) {
      SETUP = Promise.all(
        chrome.storage.sync.get('api_token', store => {
          API_TOKEN = store.api_token
          MEMBER_ID = store.member_id
        }),
        fetchStoriesAsync()
          .then(stories => {
            STORIES = stories
          }),
        fetchMembersAsync()
          .then(members => {
            members.map(member => {
              MEMBER_MAP[member.id] = member
            })
          })
      )
    } else {
      SETUP = Promise.all(
        fetchStoriesAsync()
          .then(stories => {
            STORIES = stories
          }),
        fetchMembersAsync()
          .then(members => {
            members.map(member => {
              MEMBER_MAP[member.id] = member
            })
          })
      )
    }
    return SETUP
  }
}
