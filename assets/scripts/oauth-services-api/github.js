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

  getAccessToken() {
    return this.accessToken
  }

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
  getRepository({ owner, repoName }) {
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
    return this.callAPI(
      `${gitHubApiBaseUrl}/user/repos?sort=updated&visibility=public`,
    ).then(response => {
      return response.json()
    })
  }

  /** @type {OAuthServiceAPI["createDefaultRepository"]} */
  createDefaultRepository(scribouilliGitRepo) {
    const { owner, repoName } = scribouilliGitRepo

    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${defaultRepoOwner}/${defaultThemeRepoName}/generate`,
      {
        headers: {
          Authorization: 'token ' + this.accessToken,
          Accept: 'application/vnd.github+json',
        },
        method: 'POST',
        body: JSON.stringify({
          owner,
          name: repoName,
          description: 'Mon site Scribouilli',
        }),
      },
    ).then(response => {
      return this.addTopicOnRepository(scribouilliGitRepo).then(() => {
        this.updateRepositoryFeaturesSettings(scribouilliGitRepo)

        // We don't wait for the end of the setup to return the response
        // because we don't need all the data it returns.
        return response
      })
    })
  }

  /** @type {OAuthServiceAPI["addTopicOnRepository"]} */
  addTopicOnRepository({ repoId, owner, repoName }) {
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
    return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}`, {
      headers: { Authorization: 'token ' + this.accessToken },
      method: 'DELETE',
    })
  }

  /** @type {OAuthServiceAPI["createPagesWebsiteFromRepository"]} */
  createPagesWebsiteFromRepository({ repoId }) {
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
    // TODO: We need to add the `sha` parameter to avoid the GitHub API to return
    // cached data.
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
