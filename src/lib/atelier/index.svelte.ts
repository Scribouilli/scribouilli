import { makeOAuthServiceAPI } from '../providers'
import type { GitSiteTemplate, OAuthProvider, ScribouilliBackendProvider } from '../providers'
import { OAUTH_PROVIDER_STORAGE_KEY, PROVIDERS_MAP } from '../config'
import { createContext } from 'svelte'
import { RepoList } from './repo-list.svelte'
import { Account } from './account.svelte'
import ScribouilliGitRepo from './repo.svelte'
import ScribouilliBackend from '#lib/providers/scribouilli.ts'

export class Atelier {
  #provider: ScribouilliBackendProvider | undefined = undefined

  readonly account = new Account(this.ensureClient.bind(this))
  readonly repoList = new RepoList(this.ensureClient.bind(this), this.account)
  readonly repo = new ScribouilliGitRepo(() => this.provider, () => this.account)
  readonly isBlogEnabled = $derived(
    this.repo.isBlogEnabled(this.repo.pageList.pages)
  )

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

  get pages() {
    return this.repo.pageList.pages
  }

  get articles() {
    return this.repo.articleList.articles
  }

  async loadRepo(
    repoPath: string | null, owner: string | null
  ): Promise<ScribouilliGitRepo> {
    // Ensure API client is ready
    await this.ensureClient()

    if (!repoPath || (!(this.provider.api instanceof ScribouilliBackend) && !owner)) {
      throw new Error('mssing URL param')
    }

    await this.repo.load({
      owner: owner ?? undefined,
      repoPath,
    })

    return this.repo
  }

  async createRepo({ owner, repoName, template }: {
    owner: string | undefined
    repoName: string
    template: GitSiteTemplate
  }): Promise<ScribouilliGitRepo> {
    // Ensure API client is ready
    await this.ensureClient()
    // Create new repo on load it to be ready
    await this.repo.createNewAndLoad({ owner, repoName, template })
    // Refresh repo list in the background
    this.repoList.refresh()

    return this.repo
  }

  async deleteRepository(repo: ScribouilliGitRepo) {
    return this.repoList.delete(repo)
  }

  get repos() {
    return this.repoList.repos
  }
}

export const [getAtelier, setAtelier] = createContext<Atelier>();
