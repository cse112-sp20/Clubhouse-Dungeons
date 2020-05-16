export var API_TOKEN
chrome.storage.sync.get('api_token', (store) => {
  console.log(store)
  API_TOKEN = store.api_token
})

/**
 * Fetch all projects
 *
 * @async
 * @returns {Promise<Array>}
 */
export const fetchProjectsAsync = async () => {
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
export const fetchProjectStoriesAsync = async (projectId) => {
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
export const fetchStoriesAsync = async () => {
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

export const fetchMembersAsync = async () => {
  const res = await fetch(`https://api.clubhouse.io/api/v3/members?token=${API_TOKEN}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}

/**
 * Set {@var API_TOKEN} to {@param apiToken}
 *
 * @param {string} apiToken
 */
export const setApiToken = (apiToken) => {
  API_TOKEN = apiToken
}
