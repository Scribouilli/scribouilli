import { gitHubApiBaseUrl } from './../config.js'

import './../types.js'

const GITHUB_JSON_ACCEPT_HEADER = 'application/vnd.github+json'

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql'

/**
 * @implements {OAuthServiceAPI}
 */
export default class GitHubAPI {
  /**
   * @param {string} accessToken
   */
  constructor(accessToken) {
    /** @type {string | undefined} */
    this.accessToken = accessToken
  }

  getOauthUsernameAndPassword() {
    if (!this.accessToken) {
      throw new TypeError('Missing accessToken')
    }

    return {
      username: this.accessToken,
      password: 'x-oauth-basic',
    }
  }

  /** @type {OAuthServiceAPI["getAuthenticatedUser"]} */
  getAuthenticatedUser() {
    const query = `query {
      viewer {
        login
        email
      }
    }`

    return this.graphQLCall(query)
    .then(resp => resp.data.viewer)
  }

  /** @type {OAuthServiceAPI["getUserEmails"]} */
  getUserEmails() {
    return this.callAPI(`${gitHubApiBaseUrl}/user/emails`).then(response => {
      return response.json()
    })
  }

  /** @type {OAuthServiceAPI["getCurrentUserRepositories"]} */
  getCurrentUserRepositories() {
    return this.callAPI(
      `${gitHubApiBaseUrl}/user/repos?sort=updated&visibility=public`,
    ).then(response => {
      return response.json()
    })
  }

  /** @type {OAuthServiceAPI["createDefaultRepository"]} */
  createDefaultRepository(
    { owner, repoName, repoId, publishedWebsiteURL },
    template,
  ) {
    // Generate a new repository from the theme repository
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${template.githubRepoId}/generate`,
      {
        headers: {
          Authorization: 'token ' + this.accessToken,
          Accept: GITHUB_JSON_ACCEPT_HEADER,
        },
        method: 'POST',
        body: JSON.stringify({
          owner,
          name: repoName,
          description: 'Mon site Scribouilli',
        }),
      },
    ).then(() => {
      // Apply topic to the new repository
      return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}/topics`, {
        headers: {
          Authorization: 'token ' + this.accessToken,
          Accept: GITHUB_JSON_ACCEPT_HEADER,
        },
        method: 'PUT',
        body: JSON.stringify({
          owner,
          repo: repoName,
          names: ['site-scribouilli'],
        }),
      })
        .then(() => {
          // Setup repository settings
          return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}`, {
            method: 'POST',
            headers: {
              Authorization: 'token ' + this.accessToken,
              Accept: GITHUB_JSON_ACCEPT_HEADER,
            },
            body: JSON.stringify({
              homepage: publishedWebsiteURL,
              has_issues: false,
              has_projects: false,
              has_wiki: false,
            }),
          })
        })
        .then(() => {
          // Activate GitHub Pages
          return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}/pages`, {
            method: 'POST',
            headers: {
              Authorization: 'token ' + this.accessToken,
              Accept: GITHUB_JSON_ACCEPT_HEADER,
            },
            body: JSON.stringify({
              build_type: 'workflow',
            }),
          })
        })
    })
  }

  /** @type {OAuthServiceAPI["deploy"]} */
  deploy({ repoId }) {
    return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
      body: JSON.stringify({
        event_type: 'atelier-scribouilli',
      }),
    })
  }

  /** @type {OAuthServiceAPI["getPagesWebsiteDeploymentStatus"]} */
  getPagesWebsiteDeploymentStatus({ repoId }) {
    const [owner, name] = repoId.split('/')

    const query = `query {
      repository(owner: "${owner}", name: "${name}") {
        deployments(last: 1) {
          nodes {
            statuses(first: 1){
              nodes {
                state
              }
            }
          }
        }
      }
    }`

    return this.graphQLCall(query)
    .then(resp => resp.data.repository.deployments.nodes[0].statuses.nodes[0].state.toLowerString())
  }

  /** @type {OAuthServiceAPI["isPagesWebsiteBuilt"]} */
  isPagesWebsiteBuilt(scribouilliGitRepo) {
    return this.getPagesWebsiteDeploymentStatus(scribouilliGitRepo)
      .then(response => {
        return response === 'success'
      })
      .catch(() => {
        return false
      })
  }

  /** @type {OAuthServiceAPI["isRepositoryReady"]} */
  isRepositoryReady({ repoId }) {
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${repoId}/contents/_config.yml`,
    )
      .then(response => {
        return response.ok
      })
      .catch(() => {
        return false
      })
  }

  /** @type {OAuthServiceAPI["getPublishedWebsiteURL"]} */
  getPublishedWebsiteURL({ repoId }) {
    return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}/pages`, {
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
    })
      .then(resp => resp.json())
      .then(({ html_url }) => (html_url ? html_url : undefined))
  }

  /** @type {OAuthServiceAPI["callAPI"]} */
  callAPI(url, requestParams) {
    if (requestParams && requestParams.headers === undefined) {
      requestParams.headers = {
        Authorization: 'token ' + this.accessToken,
      }
    }

    if (requestParams === undefined) {
      requestParams = {
        headers: {
          Authorization: 'token ' + this.accessToken,
        },
      }
    }

    return fetch(url, requestParams).then(httpResp => {
      if (httpResp.status === 404) {
        throw 'NOT_FOUND'
      }

      if (httpResp.status === 401) {
        this.accessToken = undefined
        console.debug('this accessToken : ', this.accessToken)
        throw 'INVALIDATE_TOKEN'
      }
      return httpResp
    })
  }

  

  /**
   * 
   * @param {string} query 
   * @returns {Promise<any>}
   */
  graphQLCall(query){
    return fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: 'token ' + this.accessToken,
      },
      body: JSON.stringify({query: query})
    })
    .then(httpResp => {
      if (httpResp.status === 404) {
        throw 'NOT_FOUND'
      }

      if (httpResp.status === 401) {
        this.accessToken = undefined
        console.debug('this accessToken : ', this.accessToken)
        throw 'INVALIDATE_TOKEN'
      }
      return httpResp.json()
    })
  }
}
