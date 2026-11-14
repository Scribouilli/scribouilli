import ScribouilliGitRepo from '../atelier/repo.svelte'
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

export interface ProviderConfig {
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

export interface ProviderApi {
  callAPI: (
    url: string,
    requestParams?: RequestInit & { headers?: Record<string, string> },
  ) => Promise<Response>
  getOauthUsernameAndPassword: () => { username: string; password: string }
  getAuthenticatedUser: () => Promise<any>
  getUserEmails: () => Promise<AuthenticatedUserEmails[]>
  isSessionActive: () => Promise<boolean>
  createDefaultRepository: (
    scribouilliGitRepo: { owner?: string, repoPath: string },
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

export interface ScribouilliBackendProvider {
  api: ProviderApi,
  config: ProviderConfig
}

interface AuthenticatedUserEmails {
  email: string
  primary: boolean
}

export const makeOAuthServiceAPI = (provider: OAuthProvider): ProviderApi => {
  if (provider.type === 'github') {
    return new GitHubAPI(provider)
  } else if (provider.type === 'gitlab') {
    return new GitLabAPI(provider)
  } else if (provider.type === 'scribouilli') {
    return new ScribouilliBackend(provider)
  } else {
    throw new Error('unreachable')
  }
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
