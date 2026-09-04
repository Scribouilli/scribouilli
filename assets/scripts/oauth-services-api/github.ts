import z from 'zod'

import { gitHubApiBaseUrl } from './../config.ts'
import type { GitSiteTemplate, OAuthServiceAPI } from '../types/git.ts'
import ScribouilliGitRepo from '../scribouilliGitRepo.ts'
import { defaultMakePublicRepositoryURL, defaultMakeRepoId } from './index.ts'

const GITHUB_JSON_ACCEPT_HEADER = 'application/vnd.github+json'
const REPO_SCHEMA = z.object({
  id: z.number(),
  name: z.string(),
  permissions: z.object({
    admin: z.boolean(),
    push: z.boolean(),
  }),
  owner: z.object({
    login: z.string(),
  }),
})
const REPO_LIST_SCHEMA = z.array(REPO_SCHEMA)

export default class GitHubAPI implements OAuthServiceAPI {
  private accessToken: string | undefined

  constructor(accessToken: string) {
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

  getAuthenticatedUser() {
    return this.callAPI(`${gitHubApiBaseUrl}/user`).then(response => {
      return response.json()
    })
  }

  getUserEmails() {
    return this.callAPI(`${gitHubApiBaseUrl}/user/emails`).then(response => {
      return response.json()
    })
  }

  getCurrentUserRepositories() {
    return this.callAPI(
      `${gitHubApiBaseUrl}/user/repos?sort=updated&visibility=public`,
    ).then(response => response.json())
      .then((rawRepos) => {
        const githubRepos = z.parse(REPO_LIST_SCHEMA, rawRepos)
        return githubRepos
          .filter((repo) => repo?.permissions?.push)
          .map((repo) => {
            return {
              repoName: repo.name,
              owner: repo.owner.login,
            }
          })
      })
  }

  async createDefaultRepository(
    { owner, repoName, publishedWebsiteURL }: ScribouilliGitRepo,
    template: GitSiteTemplate,
  ) {
    // Generate a new repository from the theme repository
    const r = await this.callAPI(
      `${gitHubApiBaseUrl}/repos/${template.githubRepoId}/generate`,
      {
        headers: {
          Authorization: 'token ' + this.accessToken,
          Accept: GITHUB_JSON_ACCEPT_HEADER,
        },
        method: 'POST',
        body: JSON.stringify({
          owner,
          name: repoName,
          description: 'Mon site Scribouilli',
        }),
      },
    )
    const { url: newRepoAPIURL, clone_url } = await r.json()
    await this.callAPI(`${newRepoAPIURL}/pages`, {
      method: 'POST',
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
      body: JSON.stringify({
        build_type: 'workflow',
      }),
    })
    console.info('Setup repository settings')
    await this.callAPI(newRepoAPIURL, {
      method: 'POST',
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
      body: JSON.stringify({
        homepage: (await publishedWebsiteURL) || '',
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
        repo: repoName,
        names: ['site-scribouilli'],
      }),
    })
    return { remoteURL: clone_url }
  }

  deploy({ repoId }: ScribouilliGitRepo) {
    return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}/dispatches`, {
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

  getPagesWebsiteDeploymentStatus({ repoId }: ScribouilliGitRepo) {
    // TODO: We need to add the `sha` parameter to avoid the GitHub API to return
    // cached data.
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${repoId}/deployments?environment=github-pages`,
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

  isPagesWebsiteBuilt(scribouilliGitRepo: ScribouilliGitRepo) {
    return this.getPagesWebsiteDeploymentStatus(scribouilliGitRepo)
      .then(response => {
        return response === 'success'
      })
      .catch(() => {
        return false
      })
  }

  isRepositoryReady({ repoId }: ScribouilliGitRepo) {
    return this.callAPI(
      `${gitHubApiBaseUrl}/repos/${repoId}/contents/_config.yml`,
    )
      .then(response => {
        return response.ok
      })
      .catch(() => {
        return false
      })
  }

  getPublishedWebsiteURL({ repoId }: ScribouilliGitRepo) {
    return this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}/pages`, {
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
    })
      .then(resp => resp.json())
      .then(({ html_url }) => (html_url ? html_url : undefined))
  }

  async getUserPermissions({ repoId }: ScribouilliGitRepo) {
    const response = await this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}`, {
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      },
    })
    const rawRepo = await response.json()
    const repo = z.parse(REPO_SCHEMA, rawRepo)
    return repo.permissions.admin ? 'owner' as const : 'editor' as const
  }

  async deleteRepository({ repoId }: ScribouilliGitRepo) {
    await this.callAPI(`${gitHubApiBaseUrl}/repos/${repoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'token ' + this.accessToken,
        Accept: GITHUB_JSON_ACCEPT_HEADER,
      }
    })
  }

  callAPI(url: string, requestParams?: RequestInit) {
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

  makePublicRepositoryURL(owner: string | undefined, repoName: string): string {
    return defaultMakePublicRepositoryURL(owner, repoName, 'https://github.com')
  }
}
