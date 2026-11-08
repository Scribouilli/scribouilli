import z from 'zod'

import ScribouilliGitRepo from '../git/repo'
import type { MinimalGitRepository, GitSiteTemplate, OAuthServiceAPI, UserRole } from '.'
import type { BuildStatus } from '#lib/build-status.ts'

const WEBSITE_LIST_SCHEMA = z.array(
  z.object({
    name: z.string(),
    is_ready: z.boolean(),
    role: z.union([z.literal('editor'), z.literal('owner')]),
  }),
)

export default class ScribouilliBackend implements OAuthServiceAPI {
  private accessToken: string | undefined
  private origin
  private authenticatedUser: undefined | { id: string; login: string; email: string }

  constructor(accessToken: string, origin: string) {
    this.accessToken = accessToken
    this.origin = origin
    this.authenticatedUser = undefined
  }

  get apiBaseUrl() {
    return `${this.origin}/api`
  }

  async callAPI(
    url: string,
    requestParams: RequestInit & { headers?: Record<string, string> } = {},
  ) {
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
    if (httpResp.status >= 300) {
      console.warn('Api error:', httpResp.status, await httpResp.text())
      throw 'API_ERROR_RESPONSE'
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
    const { repoPath } = scribouilliGitRepo
    await this.callAPI(`/websites`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: repoPath,
        template_url: template.url,
      }),
    })

    return { remoteURL: `${this.origin}/websites/${scribouilliGitRepo.repoPath}` }
  }

  async isRepositoryReady(scribouilliGitRepo: ScribouilliGitRepo): Promise<boolean> {
    const response = await this.callAPI(`/websites/${scribouilliGitRepo.repoPath}/ready`)
    const { is_ready } = await response.json()
    return is_ready
  }

  async getCurrentUserRepositories(): Promise<MinimalGitRepository[]> {
    const response = await this.callAPI(`/websites`)
    const rawRepos = await response.json()
    const repos = z.parse(WEBSITE_LIST_SCHEMA, rawRepos)
    const githubRepos = repos.map(repo => {
      return {
        name: repo.name,
        repoPath: repo.name,
        owner: undefined,
      }
    })

    return githubRepos
  }

  async deploy(scribouilliGitRepo: ScribouilliGitRepo): Promise<any> {
    await this.callAPI(`/websites/${scribouilliGitRepo.repoPath}/deployment`, {
      method: 'POST',
    })
  }

  async getPagesWebsiteDeploymentStatus(
    scribouilliGitRepo: ScribouilliGitRepo,
  ): Promise<BuildStatus> {
    const data = await this.callAPI(`/websites/${scribouilliGitRepo.repoPath}/deployment`)
    const { status } = await data.json()
    return status
  }

  async isPagesWebsiteBuilt(scribouilliGitRepo: ScribouilliGitRepo): Promise<boolean> {
    try {
      const response = await this.getPagesWebsiteDeploymentStatus(scribouilliGitRepo)
      return response === 'success'
    } catch {
      return false
    }
  }

  async getPublishedWebsiteURL(
    scribouilliGitRepo: ScribouilliGitRepo,
  ): Promise<string | undefined> {
    const data = await this.callAPI(`/websites/${scribouilliGitRepo.repoPath}/url`)
    const { url } = await data.json()
    return url
  }

  async getUserPermissions(scribouilliGitRepo: ScribouilliGitRepo): Promise<UserRole> {
    const data = await this.callAPI(`/websites/${scribouilliGitRepo.repoPath}/permissions`)
    const { role } = await data.json()
    return role
  }

  async deleteRepository(scribouilliGitRepo: ScribouilliGitRepo): Promise<void> {
    await this.callAPI(`/websites/${scribouilliGitRepo.repoPath}`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        confirm: true,
      }),
    })
  }

  makeRepoId(_owner: string | undefined, repoPath: string): string {
    return `websites/${repoPath}`
  }

  makePublicRepositoryURL(owner: string | undefined, repoPath: string): string {
    const repoId = this.makeRepoId(owner, repoPath)
    return `${this.origin}/${repoId}`
  }
}
