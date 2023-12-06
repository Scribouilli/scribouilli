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

  getOauthUsernameAndPassword() {
    if (!this.accessToken) {
      throw new TypeError('Missing accessToken')
    }

    return {
      username: this.accessToken,
      password: 'x-oauth-basic',
    }
  }

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
        },
      ])
    })
  }

  /** @type {OAuthServiceAPI["getRepository"]} */
  getRepository({ owner, repoName }) {
    throw `PPP`

    return this.callAPI(`${gitHubApiBaseUrl}/repos/${owner}/${repoName}`)
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
      .then(response => {
        const json = response.json()
        console.log('json : ', json)

        return json
      })
  }

  /** @type {OAuthServiceAPI["createDefaultRepository"]} */
  createDefaultRepository(scribouilliGitRepo) {
    const { owner, repoName } = scribouilliGitRepo

    return this.callAPI(`${this.origin}/projects`, {
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: 'application/vnd.github+json',
      },
      method: 'POST',
      body: JSON.stringify({
        import_url: 'https://git.scribouilli.org/scribouilli/site-template.git',
        name: repoName,
        description: 'Mon site Scribouilli',
      }),
    }).then(response => {
      console.log('response : ', response)
      return response
      // return this.addTopicOnRepository(scribouilliGitRepo).then(() => {
      // this.updateRepositoryFeaturesSettings(scribouilliGitRepo)

      // // We don't wait for the end of the setup to return the response
      // // because we don't need all the data it returns.
      // return response
      // })
    })
  }

  /** @type {OAuthServiceAPI["addTopicOnRepository"]} */
  addTopicOnRepository({ repoId, owner, repoName }) {
    throw `PPP`

    return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}/topics`, {
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: 'application/vnd.github+json',
      },
      method: 'PUT',
      body: JSON.stringify({
        owner,
        repo: repoName,
        names: ['site-scribouilli'],
      }),
    })
  }

  /** @type {OAuthServiceAPI["updateRepositoryFeaturesSettings"]} */
  updateRepositoryFeaturesSettings({ repoId, publishedWebsiteURL }) {
    throw `PPP`

    return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}`, {
      method: 'POST',
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        homepage: publishedWebsiteURL,
        has_issues: false,
        has_projects: false,
        has_wiki: false,
      }),
    })
  }

  /** @type {OAuthServiceAPI["deleteRepository"]} */
  deleteRepository({ repoId }) {
    throw `PPP`

    return this.callAPI(`${this.apiBaseUrl}/repos/${repoId}`, {
      headers: { Authorization: 'token ' + this.accessToken },
      method: 'DELETE',
    })
  }

  /** @type {OAuthServiceAPI["createPagesWebsiteFromRepository"]} */
  createPagesWebsiteFromRepository({ repoId }) {
    throw `PPP`

    return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}/pages`, {
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: 'applicatikn/vnd.github+json',
      },
      method: 'POST',
      body: JSON.stringify({
        build_type: 'workflow',
      }),
    })
  }

  /** @type {OAuthServiceAPI["getPagesWebsiteDeploymentStatus"]} */
  getPagesWebsiteDeploymentStatus({ repoId }) {
    throw `PPP`

    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${repoId}/deployments?environment=github-pages`,
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
    throw `PPP`
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
    throw `PPP`
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${repoId}/contents/_config.yml`,
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
