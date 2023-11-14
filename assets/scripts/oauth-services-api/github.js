import './../types.js'

export class GitHubAPI {
  /**
   * @param {string} accessToken
   */
  constructor(accessToken) {
    /** @type {string} */
    this.url = 'https://api.github.com'

    /** @type {string | undefined} */
    this.accessToken = accessToken

    this.defaultRepoOwner = 'Scribouilli'
    this.defaultThemeRepoName = 'site-template'
  }

  /**
   * @summary Fetch the authenticated user
   *
   * @returns {Promise<any>} A promise that resolves to the login of the
   * authenticated user or organization.
   */
  getAuthenticatedUser() {
    return this.callAPI(`${this.url}/user`).then(response => {
      return response.json()
    })
  }

  /**
   * @summary Get the authenticated user emails
   *
   * @returns {Promise<GithubUserEmails[]>}
   */
  getUserEmails() {
    return this.callAPI(`${this.url}/user/emails`).then(response => {
      return response.json()
    })
  }

  /**
   * @summary Fetch a repository given its owner and name
   *
   * @param {string} account
   * @param {string} repositoryName
   *
   * @returns {Promise<GithubRepository>}
   */
  getRepository(account, repositoryName) {
    return this.callAPI(`${this.url}/repos/${account}/${repositoryName}`)
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

  /**
   * @summary Fetch the list of public repositories for the current user
   *
   * @returns {Promise<GithubRepository[]>}
   * A promise that resolves to the list of repositories for the current user.
   */
  getCurrentUserRepositories() {
    return this.callAPI(
      `${this.url}/user/repos?sort=updated&visibility=public`,
    ).then(response => {
      return response.json()
    })
  }

  /**
   * @summary Create a repository given its owner and a name
   *
   * @param {string} account
   * @param {string} repositoryName
   *
   * @returns {Promise<any>}
   */
  createDefaultRepository(account, repositoryName) {
    return this.callAPI(
      `${this.url}/repos/${this.defaultRepoOwner}/${this.defaultThemeRepoName}/generate`,
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
    ).then(response => {
      // We don't wait for the end of the setup to return the response
      // because we don't need all the data it returns.
      this.setupRepository(account, repositoryName)

      return response
    })
  }

  /**
   * @summary Put topic in GitHub repository to find more easily the websites.
   *          Also configure some other options
   *
   * @param {string} account
   * @param {string} repositoryName
   *
   * @returns {Promise<any>}
   */
  setupRepository(account, repositoryName) {
    return this.callAPI(
      `${this.url}/repos/${account}/${repositoryName}/topics`,
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
    ).then(response => {
      return this.callAPI(`${this.url}/repos/${account}/${repositoryName}`, {
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
      })
    })
  }

  /**
   *
   * @param {string} account
   * @param {string} repositoryName
   *
   * @returns {Promise<any>}
   */
  deleteRepository(account, repositoryName) {
    return this.callAPI(`${this.url}/repos/${account}/${repositoryName}`, {
      headers: { Authorization: 'token ' + this.accessToken },
      method: 'DELETE',
    })
  }

  /**
   *
   * @param {string} account
   * @param {string} repositoryName
   *
   * @returns {Promise<any>}
   */
  createPagesWebsiteFromRepository(account, repositoryName) {
    return this.callAPI(
      `${this.url}/repos/${account}/${repositoryName}/pages`,
      {
        headers: {
          Authorization: 'token ' + this.accessToken,
          Accept: 'applicatikn/vnd.github+json',
        },
        method: 'POST',
        body: JSON.stringify({ source: { branch: 'main' } }),
      },
    )
  }

  /**
   *
   * @param {string} account
   * @param {string} repositoryName
   *
   * @returns {Promise<any>}
   */
  getPagesWebsite(account, repositoryName) {
    return this.callAPI(
      `${this.url}/repos/${account}/${repositoryName}/pages`,
    ).then(response => {
      return response.json()
    })
  }

  /**
   *
   * @param {string} account
   * @param {string} repositoryName
   *
   * @returns {Promise<boolean>}
   */
  isPagesWebsiteBuilt(account, repositoryName) {
    return this.getPagesWebsite(account, repositoryName)
      .then(response => {
        return response.status === 'built'
      })
      .catch(error => {
        return false
      })
  }

  /**
   *
   * @param {string} account
   * @param {string} repositoryName
   *
   * @returns {Promise<boolean>}
   */
  isRepositoryReady(account, repositoryName) {
    return this.callAPI(
      `${this.url}/repos/${account}/${repositoryName}/contents/_config.yml`,
    )
      .then(response => {
        return response.ok
      })
      .catch(error => {
        return false
      })
  }

  /**
   *
   * @param {GithubDeployment} deployment
   *
   * @returns {Promise<any>}
   */
  // getDeploymentStatus(deployment) {
  // return this.callAPI(deployment.statuses_url).then(response => {
  // return response.json()
  // })
  // }

  /**
   * @summary This method must be called for each API call.
   *
   * It handles access_token errors
   *
   * @param {string} url - the url of the endpoint
   * @param {RequestInit} requestParams - the request parameters
   *
   * @returns {Promise<Response>}
   */
  callAPI(
    url,
    requestParams = { headers: { Authorization: 'token ' + this.accessToken } },
  ) {
    return fetch(url, requestParams).then(httpResp => {
      if (httpResp.status === 404) {
        throw 'NOT_FOUND'
      }

      if (httpResp.status === 401) {
        this.accessToken = undefined
        console.debug('this accessToken : ', this)
        throw 'INVALIDATE_TOKEN'
      }
      return httpResp
    })
  }
}
