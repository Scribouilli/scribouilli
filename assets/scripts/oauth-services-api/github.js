import {
  gitHubApiBaseUrl,
  defaultRepoOwner,
  defaultThemeRepoName,
} from './../config.js'

import './../types.js'

/**
 * @extends {OAuthServiceAPI}
 */
export class GitHubAPI {
  /**
   * @param {string} accessToken
   */
  constructor(accessToken) {
    /** @type {string | undefined} */
    this.accessToken = accessToken
  }

  /** @type {OAuthServiceAPI["getAccessToken"]} */
  getAccessToken() {
    return this.accessToken
  }

  /** @type {OAuthServiceAPI["getAuthenticatedUser"]} */
  getAuthenticatedUser() {
    return this.callAPI(`${gitHubApiBaseUrl}/user`).then(response => {
      return response.json()
    })
  }

  /** @type {OAuthServiceAPI["getUserEmails"]} */
  getUserEmails() {
    return this.callAPI(`${gitHubApiBaseUrl}/user/emails`).then(response => {
      return response.json()
    })
  }

  /** @type {OAuthServiceAPI["getRepository"]} */
  getRepository(account, repositoryName) {
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${account}/${repositoryName}`,
    )
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
    return this.callAPI(
      `${gitHubApiBaseUrl}/user/repos?sort=updated&visibility=public`,
    ).then(response => {
      return response.json()
    })
  }

  /** @type {OAuthServiceAPI["createDefaultRepository"]} */
  createDefaultRepository(account, repositoryName) {
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${defaultRepoOwner}/${defaultThemeRepoName}/generate`,
      {
        headers: {
          Authorization: 'token ' + this.accessToken,
          Accept: 'application/vnd.github+json',
        },
        method: 'POST',
        body: JSON.stringify({
          owner: account,
          name: repositoryName,
          description: 'Mon site Scribouilli',
        }),
      },
    )
      .then(response => this.addTopicOnRepository(account, repositoryName))
      .then(response => {
        this.updateRepositoryFeaturesSettings(account, repositoryName)

        // We don't wait for the end of the setup to return the response
        // because we don't need all the data it returns.
        return response
      })
  }

  /** @type {OAuthServiceAPI["addTopicOnRepository"]} */
  addTopicOnRepository(account, repositoryName) {
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${account}/${repositoryName}/topics`,
      {
        headers: {
          Authorization: 'token ' + this.accessToken,
          Accept: 'application/vnd.github+json',
        },
        method: 'PUT',
        body: JSON.stringify({
          owner: account,
          repo: repositoryName,
          names: ['site-scribouilli'],
        }),
      },
    )
  }

  /** @type {OAuthServiceAPI["updateRepositoryFeaturesSettings"]} */
  updateRepositoryFeaturesSettings(account, repositoryName) {
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${account}/${repositoryName}`,
      {
        method: 'POST',
        headers: {
          Authorization: 'token ' + this.accessToken,
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          homepage: `https://${account.toLowerCase()}.github.io/${repositoryName.toLowerCase()}`,
          has_issues: false,
          has_projects: false,
          has_wiki: false,
        }),
      },
    )
  }

  /** @type {OAuthServiceAPI["deleteRepository"]} */
  deleteRepository(account, repositoryName) {
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${account}/${repositoryName}`,
      {
        headers: { Authorization: 'token ' + this.accessToken },
        method: 'DELETE',
      },
    )
  }

  /** @type {OAuthServiceAPI["createPagesWebsiteFromRepository"]} */
  createPagesWebsiteFromRepository(account, repositoryName) {
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${account}/${repositoryName}/pages`,
      {
        headers: {
          Authorization: 'token ' + this.accessToken,
          Accept: 'applicatikn/vnd.github+json',
        },
        method: 'POST',
        body: JSON.stringify({
          build_type: 'workflow',
        }),
      },
    )
  }

  /** @type {OAuthServiceAPI["getPagesWebsiteDeploymentStatus"]} */
  getPagesWebsiteDeploymentStatus(account, repositoryName) {
    // TODO: We need to add the `sha` parameter to avoid the GitHub API to return
    // cached data.
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${account}/${repositoryName}/deployments?environment=github-pages`,
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
  isPagesWebsiteBuilt(account, repositoryName) {
    return this.getPagesWebsiteDeploymentStatus(account, repositoryName)
      .then(response => {
        return response === 'success'
      })
      .catch(error => {
        return false
      })
  }

  /** @type {OAuthServiceAPI["isRepositoryReady"]} */
  isRepositoryReady(account, repositoryName) {
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${account}/${repositoryName}/contents/_config.yml`,
    )
      .then(response => {
        return response.ok
      })
      .catch(error => {
        return false
      })
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
}
