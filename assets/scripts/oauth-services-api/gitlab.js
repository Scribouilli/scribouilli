//@ts-check

import './../types.js'

/**
 * @implements {OAuthServiceAPI}
 */
export default class GitLabAPI {
  /**
   * @param {string} accessToken
   * @param {string} origin
   * @param {import('../gitAgent.js').GitAgent} gitAgent
   */
  constructor(accessToken, origin, gitAgent) {
    /** @type {string | undefined} */
    this.accessToken = accessToken
    this.origin = origin
    this.authenticatedUser = undefined
    this.gitAgent = gitAgent
  }

  get apiBaseUrl() {
    return `${this.origin}/api/v4`
  }

  /** @type {OAuthServiceAPI["getOauthUsernameAndPassword"]} */
  getOauthUsernameAndPassword() {
    if (!this.accessToken) {
      throw new TypeError('Missing accessToken')
    }

    // cf. https://isomorphic-git.org/docs/en/authentication
    return {
      username: 'oauth2',
      password: this.accessToken,
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
  createDefaultRepository(scribouilliGitRepo, { url: gitRepoUrl }) {
    const { owner, repoName } = scribouilliGitRepo

    return this.callAPI(`${this.apiBaseUrl}/projects`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        import_url: gitRepoUrl,
        name: repoName,
        description: 'Mon site Scribouilli',
        topics: ['site-scribouilli'],
        visibility: 'public',
      }),
    }).then(response => response.json())
  }

  /** @type {OAuthServiceAPI["deploy"]} */
  deploy(scribouilliGitRepo) {
    return this.gitAgent.currentBranch(scribouilliGitRepo).then(branch => {
      return this.callAPI(
        `${this.apiBaseUrl}/projects/${encodeURIComponent(
          scribouilliGitRepo.repoId,
        )}/pipelines`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + this.accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: branch,
          }),
        },
      )
    })
  }

  /** @type {OAuthServiceAPI["getPagesWebsiteDeploymentStatus"]} */
  getPagesWebsiteDeploymentStatus({ owner, repoName }) {
    const urlEncodedRepoPath = encodeURIComponent(`${owner}/${repoName}`)

    return this.callAPI(
      `${this.apiBaseUrl}/projects/${urlEncodedRepoPath}/deployments?per_page=1&order_by=updated_at&sort=desc`,
    )
      .then(response => response.json())
      .then(json => {
        const status = json[0].status
        const matchingStatus = {
          running: 'in_progress',
          success: 'success',
          failed: 'error',
          created: 'in_progress',
          canceled: 'error',
          blocked: 'error',
        }

        console.debug('Deployment status: ', status)

        // @ts-ignore
        return Promise.resolve(matchingStatus[status])
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
  isRepositoryReady({ owner, repoName }) {
    const urlEncodedRepoPath = encodeURIComponent(`${owner}/${repoName}`)

    // This call is used only at the creation of the repository.
    // We assume that the git ref is `main`.
    return this.callAPI(
      `${this.apiBaseUrl}/projects/${urlEncodedRepoPath}/repository/files/_config.yml?ref=main`,
    )
      .then(response => {
        return response.ok
      })
      .catch(error => {
        return false
      })
  }

  /** @type {OAuthServiceAPI["getPublishedWebsiteURL"]} */
  getPublishedWebsiteURL({ repoId }) {
    return this.callAPI(
      `${this.apiBaseUrl}/projects/${repoId}/environments?per_page=1&order_by=updated_at&sort=desc`,
    )
      .then(response => response.json())
      .then(environments => {
        return environments[0].external_url
      })
      .catch(() => {
        return undefined
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
