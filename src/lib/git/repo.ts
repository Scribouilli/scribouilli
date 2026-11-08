import type { OAuthServiceAPI, UserRole, BackendType } from '#lib/providers/index.ts'

export default class ScribouilliGitRepo {
  public origin: string
  public publicRepositoryURL: string
  public owner: string | undefined
  public repoPath: string
  public repoType: BackendType
  public repoId: string
  public publishedWebsiteURL: Promise<string>
  public userPermission: Promise<UserRole>

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
    owner: string | undefined
    repoPath: string
    repoType: BackendType
    gitServiceProvider: OAuthServiceAPI
  }) {
    this.origin = origin
    this.publicRepositoryURL = gitServiceProvider.makePublicRepositoryURL(owner, repoPath)
    this.owner = owner
    this.repoPath = repoPath
    this.repoType = repoType

    this.repoId = repoId ? repoId : gitServiceProvider.makeRepoId(owner, repoPath)

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
