import { OAuthServiceAPI } from './types/git'

export default class ScribouilliGitRepo {
  // TODO: better typing of these fields
  public origin
  public publicRepositoryURL
  public owner
  public repoName
  public repoId
  public publishedWebsiteURL: Promise<string>

  constructor({
    repoId,
    origin,
    publicRepositoryURL,
    owner,
    repoName,
    gitServiceProvider,
  }: {
    repoId?: string
    origin: string
    publicRepositoryURL: string
    owner: string
    repoName: string
    gitServiceProvider: OAuthServiceAPI
  }) {
    this.origin = origin
    this.publicRepositoryURL = publicRepositoryURL
    this.owner = owner
    this.repoName = repoName

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
export function makeRepoId(owner: string, repoName: string): string {
  return `${owner}/${repoName}`
}

/**
 * @param owner may be an individual Github user or an organisation
 */
export function makePublicRepositoryURL(
  owner: string,
  repoName: string,
  origin: string,
): string {
  return `${origin}/${owner}/${repoName}`
}
