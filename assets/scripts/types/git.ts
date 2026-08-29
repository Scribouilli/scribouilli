import { BackendType } from './atelier'

interface ScribouilliGitRepo {
  repoId: string
  owner: string
  repoName: string
  repoType: BackendType
  origin: string
  publishedWebsiteURL: Promise<string>
  publicRepositoryURL: string
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

export interface OAuthServiceAPI {
  callAPI: (url: string, requestParams?: RequestInit) => Promise<Response>
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
  getCurrentUserRepositories: () => Promise<GithubRepository[]>
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
  makeRepoId: (owner: string, repoName: string) => string
  makePublicRepositoryURL: (owner: string, repoName: string) => string
}

interface AuthenticatedUserEmails {
  email: string
  primary: boolean
}

export interface GithubRepository {
  name: string
  owner: {
    login: string
  }
}
