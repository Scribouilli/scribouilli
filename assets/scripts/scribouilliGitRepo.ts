import type { OAuthServiceAPI } from './types/git.ts'

export default class ScribouilliGitRepo {
  // TODO: better typing of these fields
  public origin
  public publicRepositoryURL
  public owner
  public repoPath
  public repoId
  public publishedWebsiteURL: Promise<string>

  constructor({
    repoId,
    origin,
    publicRepositoryURL,
    owner,
    repoPath,
    gitServiceProvider,
  }: {
    repoId?: string
    origin: string
    publicRepositoryURL: string
    owner: string
    repoPath: string
    gitServiceProvider: OAuthServiceAPI
  }) {
    this.origin = origin
    this.publicRepositoryURL = publicRepositoryURL
    this.owner = owner
    this.repoPath = repoPath

    this.repoId = repoId ? repoId : makeRepoId(owner, repoName)

    this.publishedWebsiteURL = new Promise(resolve => {
      const interval = setInterval(() => {
        gitServiceProvider.getPublishedWebsiteURL(this).then(url => {
          if (url) {
            clearInterval(interval)
            resolve(url)
          }
        })
      }, 1000)
    })
  }
}

/**
 * @param owner may be an individual Github user or an organisation
 */
export function makeRepoId(owner: string, repoPath: string): string {
  return `${owner}/${repoPath}`
}

/**
 * @param owner may be an individual Github user or an organisation
 */
export function makePublicRepositoryURL(
  owner: string,
  repoPath: string,
  origin: string,
): string {
  const repoId = makeRepoId(owner, repoPath)
  return `${origin}/${repoId}`
}
