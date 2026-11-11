import type { UserRole, ScribouilliBackendProvider } from '#lib/providers/index.ts'
import { GitAgent, type ResolutionOption } from '../git/agent'
import { installPluginIfNecessary, setBaseUrlInConfigIfNecessary } from '#lib/atelier.ts'
import { Pages, type Page } from '#lib/atelier/page.svelte.ts'
import { Articles } from '#lib/atelier/article.svelte.ts'
import type { Account } from './account.svelte'
import type { BuildStatus } from '#lib/build-status.ts'


export default class ScribouilliGitRepo {
  public publicRepositoryURL: string = $state('')
  public owner: string | undefined = $state(undefined)
  public repoPath: string = $state('')
  public repoId: string = $state('')

  public userPermission: UserRole = $state('editor')
  public conflicts: ResolutionOption[] = $state([])
  public publishedUrl: string | undefined = $state(undefined)
  public status: 'created' | 'loading' | 'ready' = $state('created')

  readonly pageList = new Pages(() => this.gitAgent)
  readonly articleList = new Articles(() => this.gitAgent)

  #gitAgent: GitAgent | undefined
  #provider: ScribouilliBackendProvider
  #account: Account

  constructor({
    owner,
    repoPath,
    provider,
    account,
  }: {
    owner: string | undefined
    repoPath: string
    provider: ScribouilliBackendProvider,
    account: Account,
  }) {
    this.#provider = provider
    this.#account = account
    this.repoId = this.#provider.api.makeRepoId(owner, repoPath)
    this.publicRepositoryURL = this.#provider.api.makePublicRepositoryURL(owner, repoPath)

    this.owner = owner
    this.repoPath = repoPath
  }

  get gitAgent() {
    if (!this.#gitAgent) {
      throw Error('Tried accessing gitAgent on uninitialised ScribouilliGitRepo')
    }
    return this.#gitAgent
  }

  get repoType() {
    return this.#provider.config.type
  }

  get origin() {
    return this.#provider.config.origin
  }

  static async load(repoArgs: {
    owner: string | undefined
    repoPath: string
    provider: ScribouilliBackendProvider,
    account: Account,
  }): Promise<ScribouilliGitRepo> {
    const newRepo = new ScribouilliGitRepo(repoArgs)
    newRepo.status = 'loading'

    newRepo.#gitAgent = new GitAgent({
      repoId: newRepo.repoId,
      remoteURL: newRepo.#provider.api.makePublicRepositoryURL(newRepo.owner, newRepo.repoPath),
      corsProxyURL: newRepo.#provider.config.corsProxy,
      auth: () => newRepo.#provider.api.getOauthUsernameAndPassword(),
      onMergeConflict: (resolutionOptions) => {
        newRepo.conflicts = resolutionOptions
      },
    })

    await newRepo.setupLocalRepo()

    // Start loading stuff in the background
    const backgroundPromises = Promise.all([
      newRepo.#loadPermission(),
      newRepo.pageList.listAll(),
      newRepo.articleList.listAll(),
    ])


    // TODO: should this be done here?
    await newRepo.#loadPublishedUrl()
    await setBaseUrlInConfigIfNecessary(newRepo)
    await installPluginIfNecessary(newRepo, 'jekyll-git-hash', '0.1.1')

    backgroundPromises.then(() => newRepo.status = 'ready')

    return newRepo
  }

  public async setupLocalRepo(): Promise<void> {
    await this.gitAgent.setAuthor(this.#account.login, this.#account.email)
    await this.gitAgent.pullOrCloneRepo()
  }

  public async waitRepoReady(): Promise<void> {
    return new Promise(resolve => {
      const checkReady = () => {
        this.#provider.api.isRepositoryReady(this)
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
    return this.#provider.api.deploy(this)
  }

  public async deploymentStatus(): Promise<BuildStatus> {
    return this.#provider.api.getPagesWebsiteDeploymentStatus(this)
  }

  async #loadPermission() {
    this.userPermission = await this.#provider.api.getUserPermissions(this)
  }

  async #loadPublishedUrl() {
    const fetchUrl = async () => {
      const url = await this.#provider.api.getPublishedWebsiteURL(this)
      if (url) {
        this.publishedUrl = url
      } else {
        setTimeout(fetchUrl, 1000)
      }
    }
    return fetchUrl()
  }

  /**
   * @summary guess the published URL until a call to OAuthServiceAPI.getPublishedWebsiteURL is made
   */
  guessBaseURL(): string {
    if (this.#provider.config.type === 'github') {
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
}
