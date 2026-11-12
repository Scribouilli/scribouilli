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
    const fresh = this.loadFromCache(this.repoId)

    if (!fresh) {
      await this.setupLocalRepo()
    }
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

    if (!fresh) {
      // TODO: should this be done here?
      await setBaseUrlInConfigIfNecessary(this)
      await installPluginIfNecessary(this, 'jekyll-git-hash', '0.1.1')
    }

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
      this.#loadPublishedUrl()
        .then(
          () => this.#loadBuildStatus()
        ),
      this.pageList.listAll(),
      this.articleList.listAll(),
    ])

    // TODO: should this be done here?
    await setBaseUrlInConfigIfNecessary(this, this.publishedUrl ? undefined : this.guessBaseURL())
    this.status = 'ready'
    this.cacheRepo()
  }

  public async setupLocalRepo(): Promise<void> {
    console.log('seting up local repo')
    await this.gitAgent.pullOrCloneRepo()
    await this.gitAgent.setAuthor(this.#account().login, this.#account().email)
  }

  public async deleteLocalRepo(): Promise<void> {
    console.log('deleting up local repo')
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
    this.userPermission = await this.#provider().api.getUserPermissions(this)
    this.cacheRepo()
  }

  async #loadPublishedUrl() {
    const fetchUrl = async () => {
      const url = await this.#provider().api.getPublishedWebsiteURL(this)
      if (url) {
        this.publishedUrl = url
        this.cacheRepo()
      } else {
        setTimeout(fetchUrl, 1000)
      }
    }
    return fetchUrl()
  }

  // NOTE: don’t cache the status
  async #loadBuildStatus() {
    this.buildStatus = await getBuildStatus(this)
    this.cacheRepo()
    // TODO: reschedule check if build 'in_progress' or 'needs_account_verification'
  }

  setBuilding() {
    if (this.status === 'ready') {
      this.buildStatus = 'in_progress'
    }

    // TODO: check if check if already scheduled
    setTimeout(() => this.#loadBuildStatus(), 30_000)
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
    return work
      .then((ret) => {
        this.setBuilding()
        return ret
      })
      .finally(() => this.status = 'ready')
  }
}
