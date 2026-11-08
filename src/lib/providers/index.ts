import { goto } from '$app/navigation'

import { state } from '../store.svelte'
import { PROVIDERS_MAP } from '../config'
import ScribouilliGitRepo from '../git/repo'
import GitLabAPI from './gitlab'
import GitHubAPI from './github'
import ScribouilliBackend from './scribouilli'
import type { BuildStatus } from '#lib/build-status.ts'

export interface OAuthProvider {
  type: string
  accessToken: string
  origin: string
  id: string
}

export interface MinimalGitRepository {
  name: string
  repoPath: string
  owner: string | undefined
}

export interface GitSiteTemplate {
  url: string
  description: string
  githubRepoId: string
}

export type UserRole = 'owner' | 'editor'

export type BackendType = 'github' | 'gitlab' | 'scribouilli'

export interface ScribouilliBackendProvider {
  id: string
  origin: string
  clientId?: string
  type: BackendType
  description: string
  name: string
  signupInstructions?: string
  signupEnabled: boolean
  signupLink?: string
  corsProxy?: string
}

export interface OAuthServiceAPI {
  callAPI: (
    url: string,
    requestParams?: RequestInit & { headers?: Record<string, string> },
  ) => Promise<Response>
  getOauthUsernameAndPassword: () => { username: string; password: string }
  getAuthenticatedUser: () => Promise<any>
  getUserEmails: () => Promise<AuthenticatedUserEmails[]>
  createDefaultRepository: (
    scribouilliGitRepo: ScribouilliGitRepo,
    template: GitSiteTemplate,
  ) => Promise<{ remoteURL: string }>
  isRepositoryReady: (scribouilliGitRepo: ScribouilliGitRepo) => Promise<boolean>
  getCurrentUserRepositories: () => Promise<MinimalGitRepository[]>
  deploy: (scribouilliGitRepo: ScribouilliGitRepo) => Promise<any>
  getPagesWebsiteDeploymentStatus: (scribouilliGitRepo: ScribouilliGitRepo) => Promise<BuildStatus>
  isPagesWebsiteBuilt: (scribouilliGitRepo: ScribouilliGitRepo) => Promise<boolean>
  getPublishedWebsiteURL: (scribouilliGitRepo: ScribouilliGitRepo) => Promise<string | undefined>
  getUserPermissions: (scribouilliGitRepo: ScribouilliGitRepo) => Promise<UserRole>
  deleteRepository: (scribouilliGitRepo: ScribouilliGitRepo) => Promise<void>
  makeRepoId: (owner: string | undefined, repoPath: string) => string
  makePublicRepositoryURL: (owner: string | undefined, repoPath: string) => string
}

interface AuthenticatedUserEmails {
  email: string
  primary: boolean
}

const makeOAuthServiceAPI = ({ accessToken, origin, id }: OAuthProvider): OAuthServiceAPI => {
  let provider = PROVIDERS_MAP.get(id)

  if (!provider) {
    throw new TypeError(`Unkown provider ${id}`)
  }

  if (provider.type === 'github') {
    return new GitHubAPI(accessToken)
  } else if (provider.type === 'gitlab') {
    return new GitLabAPI(accessToken, origin, () => {
      if (!state.gitAgent) {
        throw new TypeError('store.state.gitAgent is undefined')
      }
      return state.gitAgent
    })
  } else if (provider.type === 'scribouilli') {
    return new ScribouilliBackend(accessToken, origin)
  } else {
    throw new Error('unreachable')
  }
}

let oAuthServiceAPI: OAuthServiceAPI

export const getOAuthServiceAPI = (): OAuthServiceAPI => {
  if (oAuthServiceAPI) {
    return oAuthServiceAPI
  }

  const oAuthProvider = state.oAuthProvider

  if (!oAuthProvider) {
    console.info("L'utilisateur n'est pas connecté. Redirection vers /")

    goto('/')

    throw new TypeError('Missing accessToken or provider name')
  }

  oAuthServiceAPI = makeOAuthServiceAPI(oAuthProvider)

  return oAuthServiceAPI
}

/**
 * @param owner may be an individual Github user or an organisation
 */
export function defaultMakeRepoId(owner: string | undefined, repoPath: string): string {
  return owner ? `${owner}/${repoPath}` : `${repoPath}`
}

/**
 * @param owner may be an individual Github user or an organisation
 */
export function defaultMakePublicRepositoryURL(
  owner: string | undefined,
  repoPath: string,
  origin: string,
): string {
  const repoId = defaultMakeRepoId(owner, repoPath)
  return `${origin}/${repoId}.git`
}
