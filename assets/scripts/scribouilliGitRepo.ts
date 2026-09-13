import type { BackendType } from './types/atelier.ts'
import type { OAuthServiceAPI } from './types/git.ts'

export default class ScribouilliGitRepo {
  // TODO: better typing of these fields
  public origin
  public publicRepositoryURL
  public owner
  public repoPath
  public repoType: BackendType
  public repoId
  public publishedWebsiteURL: Promise<string>

  constructor({
    repoId,
    origin,
    owner,
    repoPath,
    repoType,
    gitServiceProvider,
  }: {
    repoId?: string
    origin: string
    owner: string
    repoPath: string
    repoType: BackendType
    gitServiceProvider: OAuthServiceAPI
  }) {
    this.origin = origin
    this.publicRepositoryURL = gitServiceProvider.makePublicRepositoryURL(
      owner,
      repoPath,
    )
    this.owner = owner
    this.repoPath = repoPath
    this.repoType = repoType

    this.repoId = repoId
      ? repoId
      : gitServiceProvider.makeRepoId(owner, repoPath)

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
