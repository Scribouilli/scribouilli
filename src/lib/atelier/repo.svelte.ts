import type { UserRole, ScribouilliBackendProvider, GitSiteTemplate, ProviderConfig } from '#lib/providers/index.ts'
import { GitAgent, type ResolutionOption } from '../git/agent'
import { installPluginIfNecessary, setBaseUrlInConfigIfNecessary } from '#lib/atelier.ts'
import { Pages, type Page } from '#lib/atelier/page.svelte.ts'
import { Articles } from '#lib/atelier/article.svelte.ts'
import type { Account } from './account.svelte'
import { getBuildStatus, type BuildStatus } from '#lib/build-status.ts'
import { cache } from '../storage'
import { handleErrors } from '#lib/error.ts'

export type RepoCache = Record<
  ProviderConfig['id'],
  Record<ScribouilliGitRepo['repoId'], CachedRepo>
>

export type CachedRepo = Pick<
  ScribouilliGitRepo,
  'publicRepositoryURL'
  | 'owner'
  | 'repoPath'
  | 'repoId'
  | 'userPermission'
  | 'publishedUrl'
  | 'buildStatus'
>

export default class ScribouilliGitRepo {
  public publicRepositoryURL: string = $state('')
  public owner: string | undefined = $state(undefined)
  public repoPath: string = $state('')
  public repoId: string = $state('')
  public buildStatus: BuildStatus = $state('in_progress')

  public userPermission: UserRole = $state('editor')
  public conflicts: ResolutionOption[] | undefined = $state(undefined)
  public publishedUrl: string | undefined = $state(undefined)
  public status: 'not-intitialized' | 'configured' | 'ready' | 'sync' = $state('not-intitialized')

  readonly pageList = new Pages(() => this.gitAgent)
  readonly articleList = new Articles(() => this.gitAgent)

  #gitAgent: GitAgent | undefined
  #provider: () => ScribouilliBackendProvider
  #account: () => Account
  #repoCache: RepoCache = cache.loadRepo()

  constructor(
    provider: () => ScribouilliBackendProvider,
    account: () => Account,
  ) {
    this.#provider = provider
    this.#account = account
  }

  get gitAgent() {
    if (!this.#gitAgent) {
      throw Error('Tried accessing gitAgent on uninitialised ScribouilliGitRepo')
    }
    return this.#gitAgent
  }

  get repoType() {
    return this.#provider().config.type
  }

  get origin() {
    return this.#provider().config.origin
  }

  configure({ owner, repoPath }: {
    owner: string | undefined
    repoPath: string
  }) {
    if (owner !== this.owner && repoPath !== repoPath) {
      this.reset()
    }

    this.owner = owner
    this.repoPath = repoPath

    this.repoId = this.#provider().api.makeRepoId(owner, repoPath)
    this.publicRepositoryURL = this.#provider().api.makePublicRepositoryURL(owner, repoPath)

    this.#gitAgent = new GitAgent({
      repoId: this.repoId,
      remoteURL: this.#provider().api.makePublicRepositoryURL(this.owner, this.repoPath),
      corsProxyURL: this.#provider().config.corsProxy,
      auth: () => this.#provider().api.getOauthUsernameAndPassword(),
      onMergeConflict: (resolutionOptions) => {
        this.conflicts = resolutionOptions
      },
    })

    this.status = 'configured'
  }

  reset() {
    this.publicRepositoryURL = ''
    this.owner = undefined
    this.repoPath = ''
    this.repoId = ''
    this.buildStatus = 'in_progress'

    this.userPermission = 'editor'
    this.conflicts = undefined
    this.publishedUrl = undefined
    this.status = 'not-intitialized'

    this.articleList.reset()
    this.pageList.reset()
  }

  async load({ owner, repoPath }: {
    owner: string | undefined
    repoPath: string
  }): Promise<void> {
    this.configure({ owner, repoPath })
    const repoId = this.repoId
    const fresh = this.loadFromCache(repoId)

    // TODO: would be nice to skip that if repo fresh
    // but if something’s happened we might want to setup the repo again
    await this.setupLocalRepo()

    const refreshCache: Promise<any> = Promise.all([
      this.#loadPermission(),
      this.#loadPublishedUrl().then(
        () => this.#loadBuildStatus()
      )
    ])

    await Promise.all([,
      this.pageList.listAll(),
      this.articleList.listAll(),
    ].concat(fresh ? [] : [refreshCache]))

    if (fresh) {
      // Handle error even if we don’t wait for it
      refreshCache.catch(handleErrors)
    }

    // TODO: should this be done here?
    // NOTE: don’t skip if fresh, won’t be long if not needed
    await setBaseUrlInConfigIfNecessary(this)
    await installPluginIfNecessary(this, 'jekyll-git-hash', '0.1.1')

    this.status = 'ready'
  }

  async createNewAndLoad({ owner, repoName, template }: {
    owner: string | undefined
    repoName: string
    template: GitSiteTemplate
  }) {
    // On creation, on both GitHub and GitLab, the name matches the repository path
    const repoPath = repoName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\.-]/g, '-') // see https://stackoverflow.com/a/59082561
      .toLowerCase()

    await this.#provider().api.createDefaultRepository({
      owner,
      repoPath,
    }, template)

    this.configure({ owner, repoPath })

    await this.waitRepoReady()
    await this.deploy()
    await this.setupLocalRepo()

    // Start loading stuff in the background
    await Promise.all([
      this.#loadPermission(),
      this.#loadPublishedUrl(),
      this.pageList.listAll(),
      this.articleList.listAll(),
    ])

    // TODO: should this be done here?
    await setBaseUrlInConfigIfNecessary(this, this.publishedUrl ? undefined : this.guessBaseURL())
    this.status = 'ready'
    this.buildStatus = 'in_progress'
    this.cacheRepo()
  }

  public async setupLocalRepo(): Promise<void> {
    console.log('setting up local repo')
    const setup = async () => {
      await this.gitAgent.pullOrCloneRepo()
      await this.gitAgent.setAuthor(this.#account().login, this.#account().email)
    }

    try {
      await setup()
    } catch (e) {
      console.warn('failed to setup local repo, will try deleting worktree and retrying: ', e)
      await this.deleteLocalRepo()
      // NOTE: force reconfigure after repo deletion to force the recreation of the GitAgent
      // because otherwise isomorphic-git still have some bad cache around.
      // This is cursed and I have spent too much time debugging that.
      this.configure({ repoPath: this.repoPath, owner: this.owner })
      await setup()
    }
  }

  public async deleteLocalRepo(): Promise<void> {
    console.log('deleting local repo')
    await this.gitAgent.deleteRepo()
  }

  public async waitRepoReady(): Promise<void> {
    return new Promise(resolve => {
      const checkReady = () => {
        this.#provider().api.isRepositoryReady(this)
          .then(res => {
            if (res) {
              resolve()
            } else {
              setTimeout(checkReady, 1000)
            }
          })
      }
      checkReady()
    })
  }

  public async deploy(): Promise<void> {
    return this.#provider().api.deploy(this)
  }

  public async deploymentStatus(): Promise<BuildStatus> {
    return this.#provider().api.getPagesWebsiteDeploymentStatus(this)
  }

  async #loadPermission() {
    const repoId = this.repoId
    const userPermission = await this.#provider().api.getUserPermissions(this)
    if (repoId === this.repoId) {
      this.userPermission = userPermission
      this.cacheRepo()
    }
  }

  async #loadPublishedUrl(): Promise<void> {
    const repoId = this.repoId
    return new Promise((resolve) => {
      const fetchUrl = () => {
        this.#provider().api.getPublishedWebsiteURL(this)
          .then(url => {
            if (this.repoId !== repoId) {
              resolve()
              return
            }

            if (url) {
              this.publishedUrl = url
              this.cacheRepo()
              resolve()
            } else {
              setTimeout(fetchUrl, 1000)
            }
          })
      }
      fetchUrl()
    })
  }

  async #loadBuildStatus(): Promise<void> {
    const repoId = this.repoId
    return new Promise((resolve) => {
      const fetchBuildStatus = () => {
        getBuildStatus(this)
          .then(buildStatus => {
            if (this.repoId !== repoId) {
              resolve()
              return
            }

            this.buildStatus = buildStatus
            this.cacheRepo()
            if (buildStatus === 'in_progress' || buildStatus === 'needs_account_verification') {
              setTimeout(fetchBuildStatus, 10_000)
            } else {
              resolve()
            }
          })
      }
      fetchBuildStatus()
    })
  }

  /**
   * @summary guess the published URL until a call to OAuthServiceAPI.getPublishedWebsiteURL is made
   */
  guessBaseURL(): string {
    if (this.#provider().config.type === 'github') {
      const publishedHostname = `${this.owner?.toLowerCase()}.github.io`
      const repoPath = this.repoPath.toLowerCase()

      return publishedHostname === repoPath ? '' : `/${repoPath}`
    } else {
      // TODO: I didn’t understand the previous code for guessing the base URL
      return ''
    }
  }

  /** Return whether the blog is enabled or not and whether the "Articles" section
   * should be available.
   */
  isBlogEnabled(pages: Page[]) {
    const index = this.getBlogIndexFilname(pages)
    return index !== undefined
  }

  /**
   * Return the file path of the blog index if it is enabled.
   *
   * It is true if there is a file in the root of the project that has `blogIndex: true`
   * in its front-matter.
   */
  getBlogIndexFilname(pages: Page[]): string | undefined {
    // TODO: fix this stuff
    const index = pages.find(p => p.blogIndex ?? false)?.path

    // In previous versions we assumed that the blog index was always
    // named "blog.md", so keep that as a fallback for older websites.
    return index ?? pages.find(p => p.path === 'blog.md')?.path
  }

  cacheRepo() {
    if (!(this.#provider().config.id in this.#repoCache)) {
      this.#repoCache[this.#provider().config.id] = {}
    }

    this.#repoCache[this.#provider().config.id][this.repoId] = {
      owner: this.owner,
      repoPath: this.repoPath,
      publicRepositoryURL: this.publicRepositoryURL,
      repoId: this.repoId,
      userPermission: this.userPermission,
      publishedUrl: this.publishedUrl,
      buildStatus: this.buildStatus,
    }
    cache.saveRepo(this.#repoCache)
  }

  loadFromCache(repoId: ScribouilliGitRepo['repoId']) {
    if (!(this.#provider().config.id in this.#repoCache)) {
      return false
    }

    if (!(repoId in this.#repoCache[this.#provider().config.id])) {
      return false
    }

    const cachedRepo = this.#repoCache[this.#provider().config.id][repoId]
    this.owner = cachedRepo.owner
    this.repoPath = cachedRepo.repoPath
    this.publicRepositoryURL = cachedRepo.publicRepositoryURL
    this.repoId = cachedRepo.repoId
    this.userPermission = cachedRepo.userPermission
    this.publishedUrl = cachedRepo.publishedUrl
    this.buildStatus = cachedRepo.buildStatus

    return true
  }

  async sync<T>(work: Promise<T>) {

    if (this.status !== 'ready') {
      throw new Error('repository is not ready to work with')
    }
    this.status = 'sync'
    this.buildStatus = 'in_progress'
    return work
      .then(async (ret) => {
        this.#loadBuildStatus()
        await this.pageList.listAll()
        await this.articleList.listAll()
        return ret
      })
      .finally(() => this.status = 'ready')
  }
}
