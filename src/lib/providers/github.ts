import z from 'zod'

import { GITHUB_API_BASE_URL } from './../config'
import ScribouilliGitRepo from '../atelier/repo.svelte'
import type { GitSiteTemplate, OAuthProvider, ProviderApi } from '.'
import { defaultMakePublicRepositoryURL, defaultMakeRepoId } from '.'

const GITHUB_JSON_ACCEPT_HEADER = 'application/vnd.github+json'
const GITHUB_REPO_SCHEMA = z.object({
  id: z.number(),
  name: z.string(),
  archived: z.boolean(),
  disabled: z.boolean(),
  permissions: z.object({
    admin: z.boolean(),
    push: z.boolean(),
  }),
  owner: z.object({
    login: z.string(),
  }),
})
const GITHUB_REPO_LIST_SCHEMA = z.array(GITHUB_REPO_SCHEMA)

export default class GitHubAPI implements ProviderApi {
  private accessToken: string | undefined

  constructor({ accessToken }: OAuthProvider) {
    this.accessToken = accessToken
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

  async getAuthenticatedUser() {
    return this.callAPI(`${GITHUB_API_BASE_URL}/user`).then(response => {
      return response.json()
    })
  }

  async getUserEmails() {
    return this.callAPI(`${GITHUB_API_BASE_URL}/user/emails`).then(response => {
      return response.json()
    })
  }

  async isSessionActive() {
    try {
      await this.getAuthenticatedUser()
    } catch (e) {
      if (e === 'INVALIDATE_TOKEN') {
        return false
      }
      throw e
    }
    return true
  }

  async getCurrentUserRepositories() {
    return this.callAPI(`${GITHUB_API_BASE_URL}/user/repos?sort=updated&visibility=public`)
      .then(response => response.json())
      .then(rawRepos => {
        const githubRepos = z.parse(GITHUB_REPO_LIST_SCHEMA, rawRepos)
        return githubRepos
          .filter(repo => repo.permissions?.push && !repo.archived && !repo.disabled)
          .map(repo => {
            return {
              name: repo.name,
              repoPath: repo.name,
              owner: repo.owner.login,
            }
          })
      })
  }

  async createDefaultRepository(
    { owner, repoPath }: { owner?: string, repoPath: string },
    template: GitSiteTemplate,
  ) {
    console.info('Create repository from template')
    // Generate a new repository from the theme repository
    const rawRepoResponse = await this.callAPI(`${GITHUB_API_BASE_URL}/repos/${template.githubRepoId}/generate`, {
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
      method: 'POST',
      body: JSON.stringify({
        owner,
        name: repoPath,
        description: 'Mon site Scribouilli',
      }),
    })
    const { url: newRepoAPIURL, clone_url } = await rawRepoResponse.json()

    console.info('Configure pages on repository')
    const rawPagesResponse = await this.callAPI(`${newRepoAPIURL}/pages`, {
      method: 'POST',
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
      body: JSON.stringify({
        build_type: 'workflow',
      }),
    })
    const { html_url } = await rawPagesResponse.json();

    console.info('Setup repository settings')
    await this.callAPI(newRepoAPIURL, {
      method: 'POST',
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
      body: JSON.stringify({
        homepage: html_url || '',
        has_issues: false,
        has_projects: false,
        has_wiki: false,
      }),
    })

    console.info('Apply topic to the new repository')
    await this.callAPI(`${newRepoAPIURL}/topics`, {
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
      method: 'PUT',
      body: JSON.stringify({
        owner,
        repo: repoPath,
        names: ['site-scribouilli'],
      }),
    })
    return { remoteURL: clone_url }
  }

  async deploy({ repoId }: ScribouilliGitRepo) {
    return this.callAPI(`${GITHUB_API_BASE_URL}/repos/${repoId}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
      body: JSON.stringify({
        event_type: 'atelier-scribouilli',
      }),
    })
  }

  async getPagesWebsiteDeploymentStatus({ repoId }: ScribouilliGitRepo) {
    // TODO: We need to add the `sha` parameter to avoid the GitHub API to return
    // cached data.
    return this.callAPI(
      `${GITHUB_API_BASE_URL}/repos/${repoId}/deployments?environment=github-pages`,
    )
      .then(response => response.json())
      .then(json => {
        const statusesUrl = json[0].statuses_url

        return this.callAPI(`${statusesUrl}?per_page=1`)
      })
      .then(response => response.json())
      .then(json => {
        return json[0].state
      })
  }

  async isPagesWebsiteBuilt(scribouilliGitRepo: ScribouilliGitRepo) {
    return this.getPagesWebsiteDeploymentStatus(scribouilliGitRepo)
      .then(response => {
        return response === 'success'
      })
      .catch(() => {
        return false
      })
  }

  async isRepositoryReady({ repoId }: ScribouilliGitRepo) {
    return this.callAPI(`${GITHUB_API_BASE_URL}/repos/${repoId}/contents/_config.yml`)
      .then(response => {
        return response.ok
      })
      .catch(() => {
        return false
      })
  }

  async getPublishedWebsiteURL({ repoId }: ScribouilliGitRepo) {
    return this.callAPI(`${GITHUB_API_BASE_URL}/repos/${repoId}/pages`, {
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
    })
      .then(resp => resp.json())
      .then(({ html_url }) => (html_url ? html_url : undefined))
  }

  async getUserPermissions({ repoId }: ScribouilliGitRepo) {
    const response = await this.callAPI(`${GITHUB_API_BASE_URL}/repos/${repoId}`, {
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
    })
    const rawRepo = await response.json()
    const repo = z.parse(GITHUB_REPO_SCHEMA, rawRepo)
    return repo.permissions.admin ? ('owner' as const) : ('editor' as const)
  }

  async deleteRepository({ repoId }: ScribouilliGitRepo) {
    await this.callAPI(`${GITHUB_API_BASE_URL}/repos/${repoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
    })
  }

  async callAPI(url: string, requestParams?: RequestInit) {
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

  makeRepoId = defaultMakeRepoId

  makePublicRepositoryURL(owner: string | undefined, repoPath: string): string {
    return defaultMakePublicRepositoryURL(owner, repoPath, 'https://github.com')
  }
}
