import ScribouilliGitRepo from '../scribouilliGitRepo'

export interface MinimalGitRepository {
  repoName: string
  owner: string | undefined
}

export interface GitSiteTemplate {
  url: string
  description: string
  githubRepoId: string
}

export type BuildStatus =
  | 'in_progress'
  | 'success'
  | 'error'
  | 'needs_account_verification'

export type UserRole = 'owner' | 'editor'

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
  isRepositoryReady: (
    scribouilliGitRepo: ScribouilliGitRepo,
  ) => Promise<boolean>
  getCurrentUserRepositories: () => Promise<MinimalGitRepository[]>
  deploy: (scribouilliGitRepo: ScribouilliGitRepo) => Promise<any>
  getPagesWebsiteDeploymentStatus: (
    scribouilliGitRepo: ScribouilliGitRepo,
  ) => Promise<BuildStatus>
  isPagesWebsiteBuilt: (
    scribouilliGitRepo: ScribouilliGitRepo,
  ) => Promise<boolean>
  getPublishedWebsiteURL: (
    scribouilliGitRepo: ScribouilliGitRepo,
  ) => Promise<string | undefined>
  getUserPermissions: (scribouilliGitRepo: ScribouilliGitRepo) => Promise<UserRole>
  deleteRepository: (scribouilliGitRepo: ScribouilliGitRepo) => Promise<void>
  makeRepoId: (owner: string | undefined, repoName: string) => string
  makePublicRepositoryURL: (owner: string | undefined, repoName: string) => string
}

interface AuthenticatedUserEmails {
  email: string
  primary: boolean
}
