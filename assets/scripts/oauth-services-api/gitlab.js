import {
  defaultRepoOwner,
  defaultThemeRepoName,
  OAUTH_PROVIDER_ORIGIN_STORAGE_KEY,
} from './../config.js'

import './../types.js'

/**
 * @extends {OAuthServiceAPI}
 */
export default class GitHubAPI {
  /**
   * @param {string} accessToken
   */
  constructor(accessToken) {
    /** @type {string | undefined} */
    this.accessToken = accessToken
    this.origin = localStorage.getItem(OAUTH_PROVIDER_ORIGIN_STORAGE_KEY)
    this.apiBaseUrl = `${this.origin}/api/v4`
    this.authenticatedUser = undefined
  }

  /** @type {OAuthServiceAPI["getOauthUsernameAndPassword"]} */
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
    if (this.authenticatedUser) {
      return Promise.resolve(this.authenticatedUser)
    }

    return this.callAPI(`${this.apiBaseUrl}/user`)
      .then(response => response.json())
      .then(json => {
        const user = {
          id: json.id,
          login: json.username,
          email: json.email,
        }

        this.authenticatedUser = user

        return Promise.resolve(user)
      })
  }

  /** @type {OAuthServiceAPI["getUserEmails"]} */
  getUserEmails() {
    return this.getAuthenticatedUser().then(({ email }) => {
      return Promise.resolve([
        {
          email,
          primary: true,
        },
      ])
    })
  }

  /** @type {OAuthServiceAPI["getRepository"]} */
  getRepository({ owner, repoName }) {
    throw `gitlab.getRepository`

    const urlEncodedRepoPath = encodeURIComponent(`${owner}/${repoName}`)

    return this.callAPI(`${this.apiBaseUrl}/projects/${urlEncodedRepoPath}`)
      .then(response => {
        return response.json()
      })
      .catch(msg => {
        if (msg === 'NOT_FOUND') {
          throw 'REPOSITORY_NOT_FOUND'
        }

        throw msg
      })
  }

  /** @type {OAuthServiceAPI["getCurrentUserRepositories"]} */
  getCurrentUserRepositories() {
    return this.getAuthenticatedUser()
      .then(({ login }) => {
        return this.callAPI(
          `${this.apiBaseUrl}/users/${login}/projects?order_by=updated_at&sort=desc&per_page=30&visibility=public`,
        )
      })
      .then(response => response.json())
      .then(json => {
        // @ts-ignore
        const repositories = json.map(repo => {
          return {
            id: repo.id,
            name: repo.name,
            owner: {
              login: repo.owner.username,
            },
          }
        })

        return Promise.resolve(repositories)
      })
  }

  /** @type {OAuthServiceAPI["createDefaultRepository"]} */
  createDefaultRepository(scribouilliGitRepo) {
    const { owner, repoName } = scribouilliGitRepo

    return this.callAPI(`${this.apiBaseUrl}/projects`, {
      headers: {
        Authorization: 'Bearer ' + this.accessToken,
      },
      method: 'POST',
      body: JSON.stringify({
        import_url: 'https://git.scribouilli.org/scribouilli/site-template.git',
        name: repoName,
        description: 'Mon site Scribouilli',
        topics: ['site-scribouilli'],
      }),
    }).then(response => {
      console.log('response : ', response)
      return response
    })
  }

  /** @type {OAuthServiceAPI["addTopicOnRepository"]} */
  addTopicOnRepository({ repoId }) {
    return Promise.resolve()
  }

  /** @type {OAuthServiceAPI["updateRepositoryFeaturesSettings"]} */
  updateRepositoryFeaturesSettings({ repoId }) {
    return Promise.resolve()
  }

  /** @type {OAuthServiceAPI["deleteRepository"]} */
  deleteRepository({ repoId }) {
    throw `GitLab.deleteRepository`

    return this.callAPI(`${this.apiBaseUrl}/repos/${repoId}`, {
      headers: { Authorization: 'token ' + this.accessToken },
      method: 'DELETE',
    })
  }

  /** @type {OAuthServiceAPI["createPagesWebsiteFromRepository"]} */
  createPagesWebsiteFromRepository({ repoId }) {
    throw `GitLab.createPagesWebsiteFromRepository`

    return this.callAPI(`${this.apiBaseUrl}/repos/${repoId}/pages`, {
      headers: {
        Authorization: 'Bearer ' + this.accessToken,
      },
      method: 'POST',
      body: JSON.stringify({
        build_type: 'workflow',
      }),
    })
  }

  /** @type {OAuthServiceAPI["getPagesWebsiteDeploymentStatus"]} */
  getPagesWebsiteDeploymentStatus({ repoId }) {
    throw `GitLab.getPagesWebsiteDeploymentStatus`

    return this.callAPI(
      `${this.apiBaseUrl}/repos/${repoId}/deployments?environment=github-pages`,
    )
      .then(response => response.json())
      .then(json => {
        console.debug('Deployments list: ', json)
        const statusesUrl = json[0].statuses_url

        return this.callAPI(`${statusesUrl}?per_page=1`)
      })
      .then(response => response.json())
      .then(json => {
        console.debug('Deployment status: ', json[0].state)
        return json[0].state
      })
  }

  /** @type {OAuthServiceAPI["isPagesWebsiteBuilt"]} */
  isPagesWebsiteBuilt(scribouilliGitRepo) {
    throw `GitLab.isPagesWebsiteBuilt`

    return this.getPagesWebsiteDeploymentStatus(scribouilliGitRepo)
      .then(response => {
        return response === 'success'
      })
      .catch(error => {
        return false
      })
  }

  /** @type {OAuthServiceAPI["isRepositoryReady"]} */
  isRepositoryReady({ repoId }) {
    throw `GitLab.isRepositoryReady`

    return this.callAPI(
      `${this.apiBaseUrl}/repos/${repoId}/contents/_config.yml`,
    )
      .then(response => {
        return response.ok
      })
      .catch(error => {
        return false
      })
  }

  /**
   * @type {OAuthServiceAPI["callAPI"]}
   */
  callAPI(url, requestParams) {
    if (requestParams && requestParams.headers === undefined) {
      requestParams.headers = {
        Authorization: 'Bearer ' + this.accessToken,
      }
    }

    if (requestParams === undefined) {
      requestParams = {
        headers: {
          Authorization: 'Bearer ' + this.accessToken,
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
}
