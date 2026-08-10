import { BackendType } from './types/atelier.ts'
import type { OAuthServiceAPI } from './types/git.ts'

export default class ScribouilliGitRepo {
  // TODO: better typing of these fields
  public origin
  public publicRepositoryURL
  public owner
  public repoName
  public repoType: BackendType
  public repoId
  public publishedWebsiteURL: Promise<string>

  constructor({
    repoId,
    origin,
    owner,
    repoName,
    repoType,
    gitServiceProvider,
  }: {
    repoId?: string
    origin: string
    owner: string
    repoName: string
    repoType: BackendType,
    gitServiceProvider: OAuthServiceAPI
  }) {
    this.origin = origin
    this.publicRepositoryURL = gitServiceProvider.makePublicRepositoryURL(owner, repoName)
    this.owner = owner
    this.repoName = repoName
    this.repoType = repoType

    this.repoId = repoId ? repoId : gitServiceProvider.makeRepoId(owner, repoName)

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
