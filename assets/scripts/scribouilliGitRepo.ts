import type { BackendType } from './types/atelier.ts'
import type { UserRole, OAuthServiceAPI } from './types/git.ts'

export default class ScribouilliGitRepo {
  public origin: string
  public publicRepositoryURL: string
  public owner: string | undefined
  public repoName: string
  public repoType: BackendType
  public repoId: string
  public publishedWebsiteURL: Promise<string>
  public userPermission: Promise<UserRole>

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
    owner: string | undefined
    repoName: string
    repoType: BackendType
    gitServiceProvider: OAuthServiceAPI
  }) {
    this.origin = origin
    this.publicRepositoryURL = gitServiceProvider.makePublicRepositoryURL(
      owner,
      repoName,
    )
    this.owner = owner
    this.repoName = repoName
    this.repoType = repoType

    this.repoId = repoId
      ? repoId
      : gitServiceProvider.makeRepoId(owner, repoName)

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

    this.userPermission = gitServiceProvider.getUserPermissions(this)
  }
}
