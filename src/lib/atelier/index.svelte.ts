import { makeOAuthServiceAPI } from '../providers'
import type { GitSiteTemplate, OAuthProvider, ScribouilliBackendProvider } from '../providers'
import { OAUTH_PROVIDER_STORAGE_KEY, PROVIDERS_MAP } from '../config'
import { createContext } from 'svelte'
import { RepoList } from './repo-list.svelte'
import { Account } from './account.svelte'
import ScribouilliGitRepo from './repo.svelte'
import { setBaseUrlInConfigIfNecessary, setBuildStatus } from '#lib/atelier.ts'
import ScribouilliBackend from '#lib/providers/scribouilli.ts'

export class Atelier {
  #provider: ScribouilliBackendProvider | undefined = undefined
  #repo: ScribouilliGitRepo | undefined = undefined

  readonly repoList = new RepoList(this.ensureClient.bind(this))
  readonly account = new Account(this.ensureClient.bind(this))
  readonly isBlogEnabled = $derived(this.#repo ? this.#repo.isBlogEnabled(this.#repo.pageList.pages) : false)

  status: 'signed-out' | 'loaded' | 'ready' = $state('signed-out')

  refresh() {
    console.log('loading atelier')
    if (localStorage) {
      const providerRaw = localStorage.getItem(OAUTH_PROVIDER_STORAGE_KEY)
      console.log('providerRaw', providerRaw)
      const provider = providerRaw ? (JSON.parse(providerRaw) as OAuthProvider) : undefined
      const providerConfig = PROVIDERS_MAP.get(provider?.id ?? '')
      console.log('provider', provider, providerConfig)

      if (provider && providerConfig) {
        this.#provider = {
          api: makeOAuthServiceAPI(provider),
          config: providerConfig
        }
        this.status = 'loaded'
      } else if (provider) {
        console.warn(`Unkown provider ${provider.id}`)
      }
    }
  }

  async ensureClient() {
    if (!this.#provider) {
      this.status = 'signed-out'
      throw new Error('Provider is not loaded')
    }

    if (this.status === 'ready') {
      return this.#provider.api
    }

    const isActive = await this.#provider.api.isSessionActive()
    if (!isActive) {
      throw new Error('Invalid session')
    }

    this.status = 'ready'
    return this.#provider.api
  }

  get provider() {
    if (this.status !== 'ready' || !this.#provider) {
      this.status = 'signed-out'
      throw new Error('Provider is not loaded')
    }

    return this.#provider
  }

  get config() {
    if (this.status !== 'ready' || !this.#provider) {
      this.status = 'signed-out'
      throw new Error('Provider is not loaded')
    }

    return this.#provider.config
  }

  get repo() {
    if (!this.#repo) {
      throw new Error('Current repository is not loaded')
    }

    return this.#repo
  }

  get pages() {
    return this.#repo?.pageList.pages ?? []
  }

  get articles() {
    return this.#repo?.articleList.articles ?? []
  }

  async loadCurrentRepository(
    repoPath: string | null, owner: string | null
  ): Promise<ScribouilliGitRepo> {
    // Ensure API client is ready
    await this.ensureClient()

    if (!repoPath || (!(this.provider.api instanceof ScribouilliBackend) && !owner)) {
      throw new Error('mssing URL param')
    }

    this.#repo = await ScribouilliGitRepo.load({
      owner: owner ?? undefined,
      repoPath,
      provider: this.provider,
      account: this.account,
    })

    setBuildStatus(this.#repo)

    return this.#repo
  }

  // TODO: Move to RepoList??
  async createRepo({ owner, repoName, template }: {
    owner: string | undefined
    repoName: string
    template: GitSiteTemplate
  }): Promise<ScribouilliGitRepo> {
    // On creation, on both GitHub and GitLab, the name matches the repository path
    const repoPath = repoName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\.-]/g, '-') // see https://stackoverflow.com/a/59082561
      .toLowerCase()

    // Ensure API client is ready
    const client = await this.ensureClient()

    await client.createDefaultRepository({
      owner,
      repoPath,
    }, template)

    const repo = new ScribouilliGitRepo({
      owner,
      repoPath,
      provider: this.provider,
      account: this.account
    })

    await repo.waitRepoReady()
    await repo.deploy()
    await repo.setupLocalRepo()

    // TODO: should this be done here?
    await setBaseUrlInConfigIfNecessary(repo, repo.guessBaseURL())

    // Refresh repo list in the background
    this.repoList.refresh()

    return repo
  }

  async deleteRepository(repo: ScribouilliGitRepo) {
    return this.repoList.delete(repo)
  }

  get repos() {
    return this.repoList.repos
  }
}

export const [getAtelier, setAtelier] = createContext<Atelier>();
