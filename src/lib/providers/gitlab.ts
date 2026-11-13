import z from 'zod'

import ScribouilliGitRepo from '../atelier/repo.svelte'
import type { GitSiteTemplate, OAuthProvider, ProviderApi } from '.'
import { defaultMakePublicRepositoryURL, defaultMakeRepoId } from '.'
import type { BuildStatus } from '#lib/build-status.ts'

const GITLAB_DEVELOPER_ROLE = 30
const GITLAB_OWNER_ROLE = 50
const REPO_SCHEMA = z.object({
  id: z.number(),
  name: z.string(),
  path: z.string(),
  permissions: z.object({
    project_access: z.object({
      access_level: z.union([z.literal(GITLAB_OWNER_ROLE), z.literal(GITLAB_DEVELOPER_ROLE)]),
    }),
  }),
  namespace: z.object({
    full_path: z.string(),
  }),
  default_branch: z.string()
})
const REPO_LIST_SCHEMA = z.array(REPO_SCHEMA)
const REPO_PAGE_SETTING = z.object({
  url: z.string()
})

export default class GitLabAPI implements ProviderApi {
  public accessToken: string | undefined
  private origin
  private authenticatedUser: undefined | { id: string; login: string; email: string }

  constructor({ accessToken, origin }: OAuthProvider) {
    this.accessToken = accessToken
    this.origin = origin
    this.authenticatedUser = undefined
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

  async isSessionActive() {
    try {
      await this.callAPI(`${this.apiBaseUrl}/user`)
    } catch (e) {
      if (e === 'INVALIDATE_TOKEN') {
        return false
      }
      throw e
    }
    return true
  }

  async getCurrentUserRepositories() {
    const response = await this.callAPI(
      `${this.apiBaseUrl}/projects?order_by=updated_at&sort=desc&per_page=30&visibility=public&min_access_level=${GITLAB_DEVELOPER_ROLE}&active=true`,
    )
    const rawRepos = await response.json()
    const gitlabRepos = z.parse(REPO_LIST_SCHEMA, rawRepos)
    const a = gitlabRepos.map(repo => {
      return {
        name: repo.name,
        repoPath: repo.path,
        owner: repo.namespace.full_path,
      }
    })

    console.log(a)
    return a
  }

  async createDefaultRepository(
    { repoPath }: { owner?: string, repoPath: string },
    { url: gitRepoUrl }: GitSiteTemplate,
  ) {
    const response = await this.callAPI(`${this.apiBaseUrl}/projects`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        import_url: gitRepoUrl,
        name: repoPath, // On creation, path and name are identical
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

    const urlEncodedRepoPath = encodeURIComponent(scribouilliGitRepo.repoId)
    const projectResponse = await this.callAPI(`${this.apiBaseUrl}/projects/${urlEncodedRepoPath}`)
    const rawProject = await projectResponse.json()
    const project = z.parse(REPO_SCHEMA, rawProject)
    const branch = project.default_branch

    console.log('branch', branch)

    const response = await this.callAPI(
      `${this.apiBaseUrl}/projects/${urlEncodedRepoPath}/pipeline`,
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

  async getPagesWebsiteDeploymentStatus({ repoId }: ScribouilliGitRepo) {
    const urlEncodedRepoPath = encodeURIComponent(repoId)

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
      const response = await this.getPagesWebsiteDeploymentStatus(scribouilliGitRepo)
      return response === 'success'
    } catch {
      return false
    }
  }

  async isRepositoryReady({ repoId }: ScribouilliGitRepo) {
    const urlEncodedRepoPath = encodeURIComponent(repoId)

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

  async getPublishedWebsiteURL({ repoId }: ScribouilliGitRepo) {
    // TODO: check if possible to disable single unique domain?
    const urlEncodedRepoPath = encodeURIComponent(repoId)
    const response = await this.callAPI(`${this.apiBaseUrl}/projects/${urlEncodedRepoPath}/pages`)
    const rawPage = await response.json()
    const page = z.parse(REPO_PAGE_SETTING, rawPage)
    return page.url
  }

  async getUserPermissions({ owner, repoPath }: ScribouilliGitRepo) {
    const urlEncodedRepoPath = encodeURIComponent(`${owner}/${repoPath}`)
    const response = await this.callAPI(`${this.apiBaseUrl}/projects/${urlEncodedRepoPath}`)
    const rawRepo = await response.json()
    const repo = z.parse(REPO_SCHEMA, rawRepo)
    return repo.permissions.project_access.access_level === GITLAB_OWNER_ROLE
      ? ('owner' as const)
      : ('editor' as const)
  }

  async deleteRepository({ owner, repoPath }: ScribouilliGitRepo) {
    const urlEncodedRepoPath = encodeURIComponent(`${owner}/${repoPath}`)
    await this.callAPI(`${this.apiBaseUrl}/projects/${urlEncodedRepoPath}`, {
      method: 'DELETE',
    })
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

  makeRepoId = defaultMakeRepoId

  makePublicRepositoryURL(owner: string | undefined, repoPath: string): string {
    return defaultMakePublicRepositoryURL(owner, repoPath, this.origin)
  }
}
