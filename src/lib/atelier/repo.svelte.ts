import type { UserRole, BackendType, ScribouilliBackendProvider, GitSiteTemplate } from '#lib/providers/index.ts'
import { GitAgent } from '../git/agent'
import * as store from '#lib/store.svelte.ts'
import { fetchUser } from '#lib/user.ts'
import { installPluginIfNecessary, setBaseUrlInConfigIfNecessary } from '#lib/atelier.ts'
import { Pages, type Page } from '#lib/atelier/page.svelte.ts'
import { Articles } from '#lib/article.ts'

export default class ScribouilliGitRepo {
  public origin: string
  public publicRepositoryURL: string
  public owner: string | undefined
  public repoPath: string
  public repoType: BackendType
  public repoId: string
  public publishedWebsiteURL: Promise<string>
  public userPermission: Promise<UserRole>
  public gitAgent: GitAgent

  public loading: boolean = $state(true)

  public pages: Pages
  public articles: Articles
  public provider: ScribouilliBackendProvider

  constructor({
    owner,
    repoPath,
    provider,
  }: {
    owner: string | undefined
    repoPath: string
    provider: ScribouilliBackendProvider
  }) {
    this.provider = provider
    this.origin = provider.config.origin
    this.publicRepositoryURL = provider.api.makePublicRepositoryURL(owner, repoPath)
    this.owner = owner
    this.repoPath = repoPath
    this.repoType = provider.config.type

    this.repoId = provider.api.makeRepoId(owner, repoPath)

    this.publishedWebsiteURL = new Promise(resolve => {
      const fetchUrl = (interval: ReturnType<typeof setInterval>) => {
        provider.api.getPublishedWebsiteURL(this).then(url => {
          if (url) {
            clearInterval(interval)
            resolve(url)
          }
        })
      }
      const interval = setInterval(() => fetchUrl(interval), 1000)
      fetchUrl(interval)
    })

    this.userPermission = provider.api.getUserPermissions(this)
    this.gitAgent = new GitAgent({
      repoId: provider.api.makeRepoId(owner, repoPath),
      remoteURL: provider.api.makePublicRepositoryURL(owner, repoPath),
      corsProxyURL: provider.config.corsProxy,
      gitServiceProvider: provider.api,
      onMergeConflict: resolutionOptions => {
        store.state.conflict = resolutionOptions
      },
    })

    this.pages = new Pages(this.gitAgent)
    this.articles = new Articles(this.gitAgent)

    this.init()
  }

  async init(): Promise<void> {
    await this.setupLocalRepo()

    // TODO: should this be done here?
    await setBaseUrlInConfigIfNecessary(this)
    await installPluginIfNecessary(this, 'jekyll-git-hash', '0.1.1')

    this.loading = false
  }

  static async create({ owner, repoName, template, provider }: {
    owner: string | undefined
    repoName: string
    template: GitSiteTemplate
    provider: ScribouilliBackendProvider
  }): Promise<ScribouilliGitRepo> {
    // On creation, on both GitHub and GitLab, the name matches the repository path
    const repoPath = repoName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\.-]/g, '-') // see https://stackoverflow.com/a/59082561
      .toLowerCase()

    await provider.api.createDefaultRepository({
      owner,
      repoPath,
    }, template)

    const repo = new ScribouilliGitRepo({ owner, repoPath, provider })
    await repo.waitRepoReady()
    await repo.deploy()
    await repo.setupLocalRepo()

    // TODO: should this be done here?
    await setBaseUrlInConfigIfNecessary(repo, repo.guessBaseURL())

    return repo
  }

  public async setupLocalRepo(): Promise<void> {
    const { login, email } = await fetchUser(this.provider)
    await this.gitAgent.setAuthor(login, email)
    await this.gitAgent.pullOrCloneRepo()
  }

  public async waitRepoReady(): Promise<void> {
    return new Promise(resolve => {
      const timer = setInterval(() => {
        this.provider.api
          .isRepositoryReady(this)
          .then(res => {
            if (res) {
              clearInterval(timer)
              resolve()
            }
          })
      }, 1000)
    })
  }

  public async deploy(): Promise<void> {
    return this.provider.api.deploy(this)
  }

  /**
   * @summary guess the published URL until a call to OAuthServiceAPI.getPublishedWebsiteURL is made
   */
  private guessBaseURL(): string {
    if (this.provider.config.type === 'github') {
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
