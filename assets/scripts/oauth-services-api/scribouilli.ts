import ScribouilliGitRepo from '../scribouilliGitRepo.ts'
import type {
  BuildStatus,
  GithubRepository,
  GitSiteTemplate,
  OAuthServiceAPI,
} from '../types/git.ts'

export default class ScribouilliBackend implements OAuthServiceAPI {
  private accessToken: string | undefined
  private origin
  private authenticatedUser:
    | undefined
    | { id: string; login: string; email: string }

  constructor(accessToken: string, origin: string) {
    7
    this.accessToken = accessToken
    this.origin = origin
    this.authenticatedUser = undefined
  }

  get apiBaseUrl() {
    return `${this.origin}/api`
  }

  async callAPI(url: string, requestParams: RequestInit = {}) {
    requestParams.headers ??= {}
    requestParams.headers['Authorization'] = 'Bearer ' + this.accessToken

    const httpResp = await fetch(`${this.apiBaseUrl}${url}`, requestParams)
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

  getOauthUsernameAndPassword() {
    if (!this.accessToken) {
      throw new TypeError('Missing accessToken')
    }

    return { username: 'token', password: this.accessToken }
  }

  async getAuthenticatedUser() {
    if (this.authenticatedUser) {
      return this.authenticatedUser
    }

    const response = await this.callAPI(`/profile`)
    const user = await response.json()
    this.authenticatedUser = {
      login: user.email,
      email: user.email,
      id: user.id,
    }
    return this.authenticatedUser
  }

  async getUserEmails() {
    const { email } = await this.getAuthenticatedUser()
    return [
      {
        email,
        primary: true,
      },
    ]
  }

  async createDefaultRepository(
    scribouilliGitRepo: ScribouilliGitRepo,
    template: GitSiteTemplate,
  ): Promise<{ remoteURL: string }> {
    const { repoName } = scribouilliGitRepo
    await this.callAPI(`/websites`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        template_url: template.url,
      }),
    })

    return { remoteURL: this.makePublicRepositoryURL('', repoName) }
  }

  async isRepositoryReady(
    scribouilliGitRepo: ScribouilliGitRepo,
  ): Promise<boolean> {
    const response = await this.callAPI(
      `/websites/${scribouilliGitRepo.repoName}/ready`,
    )
    const { is_ready } = await response.json()
    return is_ready
  }

  async getCurrentUserRepositories(): Promise<GithubRepository[]> {
    const response = await this.callAPI(`/websites`)
    const repos = await response.json()
    const { email } = await this.getAuthenticatedUser()
    // @ts-ignore
    const githubRepos = repos.map(repo => {
      return {
        id: repo.name,
        name: repo.name,
        owner: {
          login: email,
        },
      }
    })
    return githubRepos
  }

  async deploy(scribouilliGitRepo: ScribouilliGitRepo): Promise<any> {
    await this.callAPI(`/websites/${scribouilliGitRepo.repoName}/deployment`, {
      method: 'POST',
    })
  }

  async getPagesWebsiteDeploymentStatus(
    scribouilliGitRepo: ScribouilliGitRepo,
  ): Promise<BuildStatus> {
    const data = await this.callAPI(
      `/websites/${scribouilliGitRepo.repoName}/deployment`,
    )
    const { status } = await data.json()
    return status
  }

  async isPagesWebsiteBuilt(
    scribouilliGitRepo: ScribouilliGitRepo,
  ): Promise<boolean> {
    try {
      const response =
        await this.getPagesWebsiteDeploymentStatus(scribouilliGitRepo)
      return response === 'success'
    } catch {
      return false
    }
  }

  async getPublishedWebsiteURL(
    scribouilliGitRepo: ScribouilliGitRepo,
  ): Promise<string | undefined> {
    const data = await this.callAPI(
      `/websites/${scribouilliGitRepo.repoName}/url`,
    )
    const { url } = await data.json()
    return url
  }

  makeRepoId(_owner: string, repoName: string): string {
    return `websites/${repoName}`
  }

  makePublicRepositoryURL(_owner: string, repoName: string): string {
    return `${this.origin}/websites/${repoName}`
  }
}
