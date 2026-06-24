import GitAgent from '../GitAgent.js'
import ScribouilliGitRepo from '../scribouilliGitRepo.js'
import type {
  BuildStatus,
  GitSiteTemplate,
  OAuthServiceAPI,
} from '../types/git.js'

export default class GitLabAPI implements OAuthServiceAPI {
  #gitAgentGetter

  public accessToken: string | undefined
  private origin
  private authenticatedUser:
    | undefined
    | { id: string; login: string; email: string }

  constructor(accessToken: string, origin: string, gitAgent: () => GitAgent) {
    this.accessToken = accessToken
    this.origin = origin
    this.authenticatedUser = undefined
    this.#gitAgentGetter = gitAgent
  }

  get gitAgent() {
    return this.#gitAgentGetter()
  }

  get apiBaseUrl() {
    return `${this.origin}/api/v4`
  }

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

  async getAuthenticatedUser() {
    if (this.authenticatedUser) {
      return Promise.resolve(this.authenticatedUser)
    }

    const response = await this.callAPI(`${this.apiBaseUrl}/user`)
    const json = await response.json()
    const user = {
      id: json.id,
      login: json.username,
      email: json.email,
    }
    this.authenticatedUser = user
    return await Promise.resolve(user)
  }

  async getUserEmails() {
    const { email } = await this.getAuthenticatedUser()
    return await Promise.resolve([
      {
        email,
        primary: true,
      },
    ])
  }

  async getCurrentUserRepositories() {
    const { login } = await this.getAuthenticatedUser()
    const response = await this.callAPI(
      `${this.apiBaseUrl}/users/${login}/projects?order_by=updated_at&sort=desc&per_page=30&visibility=public`,
    )
    const json = await response.json()
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
    return await Promise.resolve(repositories)
  }

  async createDefaultRepository(
    scribouilliGitRepo: ScribouilliGitRepo,
    { url: gitRepoUrl }: GitSiteTemplate,
  ) {
    const { repoName } = scribouilliGitRepo

    const response = await this.callAPI(`${this.apiBaseUrl}/projects`, {
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
        pages_access_level: 'public',
      }),
    })
    const { http_url_to_repo } = await response.json()
    return { remoteURL: http_url_to_repo }
  }

  async deploy(scribouilliGitRepo: ScribouilliGitRepo) {
    console.log('gitlab.deploy', scribouilliGitRepo)
    const branch = await this.gitAgent.currentBranch()
    console.log('branch', branch)
    const response = await this.callAPI(
      `${this.apiBaseUrl}/projects/${encodeURIComponent(
        scribouilliGitRepo.repoId,
      )}/pipeline`,
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
    console.log('response', response)
  }

  async getPagesWebsiteDeploymentStatus({
    owner,
    repoName,
  }: ScribouilliGitRepo) {
    const urlEncodedRepoPath = encodeURIComponent(`${owner}/${repoName}`)

    const response = await this.callAPI(
      `${this.apiBaseUrl}/projects/${urlEncodedRepoPath}/deployments?per_page=1&order_by=updated_at&sort=desc`,
    )
    const json = await response.json()
    const status = json[0].status as string
    const matchingStatus = {
      running: 'in_progress',
      success: 'success',
      failed: 'error',
      created: 'in_progress',
      canceled: 'error',
      blocked: 'error',
    } as Record<string, BuildStatus>
    console.debug('Deployment status: ', status)
    return await Promise.resolve(matchingStatus[status])
  }

  async isPagesWebsiteBuilt(scribouilliGitRepo: ScribouilliGitRepo) {
    try {
      const response =
        await this.getPagesWebsiteDeploymentStatus(scribouilliGitRepo)
      return response === 'success'
    } catch {
      return false
    }
  }

  async isRepositoryReady({ owner, repoName }: ScribouilliGitRepo) {
    const urlEncodedRepoPath = encodeURIComponent(`${owner}/${repoName}`)

    // This call is used only at the creation of the repository.
    // We assume that the git ref is `main`.
    try {
      const response = await this.callAPI(
        `${this.apiBaseUrl}/projects/${urlEncodedRepoPath}/repository/files/_config.yml?ref=main`,
      )
      return response.ok
    } catch {
      return false
    }
  }

  getPublishedWebsiteURL({ repoName, owner, origin }: ScribouilliGitRepo) {
    if (origin === 'https://gitlab.com') {
      return Promise.resolve(`https://${owner}.gitlab.io/${repoName}/`)
    }

    if (origin === 'https://git.scribouilli.org') {
      return Promise.resolve(`https://${owner}.monpetitsite.org/${repoName}/`)
    }

    return Promise.reject('Unknown origin')

    // console.log('gitlab.getPublishedWebsiteURL', repoId)
    // return this.callAPI(
    // `${this.apiBaseUrl}/projects/${encodeURIComponent(
    // repoId,
    // )}/environments?per_page=1&order_by=updated_at&sort=desc`,
    // )
    // .then(response => response.json())
    // .then(environments => {
    // console.log('environments', environments)
    // return environments[0].external_url
    // })
    // .catch(error => {
    // console.log('error', error)
    // return undefined
    // })
  }

  async callAPI(url: string, requestParams?: RequestInit) {
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

    const httpResp = await fetch(url, requestParams)
    if (httpResp.status === 404) {
      throw 'NOT_FOUND'
    }
    if (httpResp.status === 401) {
      this.accessToken = undefined
      console.debug('this accessToken : ', this.accessToken)
      throw 'INVALIDATE_TOKEN'
    }
    return httpResp
  }
}
