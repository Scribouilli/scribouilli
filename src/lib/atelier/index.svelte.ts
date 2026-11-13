import type { GitSiteTemplate, ScribouilliBackendProvider } from '../providers'
import { createContext } from 'svelte'
import { RepoList } from './repo-list.svelte'
import { Account } from './account.svelte'
import ScribouilliGitRepo from './repo.svelte'
import ScribouilliBackend from '#lib/providers/scribouilli.ts'
import * as storage from '../storage'

export class Atelier {
  #provider: ScribouilliBackendProvider | undefined
  #providerCheckPromise: Promise<ScribouilliBackendProvider> | undefined

  readonly account = new Account(this.ensureProvider.bind(this))
  readonly repoList = new RepoList(this.ensureProvider.bind(this), () => this.account)
  readonly repo = new ScribouilliGitRepo(() => this.provider, () => this.account)
  readonly isBlogEnabled = $derived(
    this.repo.isBlogEnabled(this.repo.pageList.pages)
  )

  status: 'signed-out' | 'loaded' | 'ready' = $state('signed-out')

  refresh() {
    console.log('loading atelier')
    const provider = storage.loadProvider()

    if (provider) {
      this.#provider = provider
      this.status = 'loaded'
    }
  }

  logout() {
    storage.clear()
    this.reset()
    this.repo.reset()
    this.repoList.reset()
  }

  reset() {
    this.status = 'signed-out'
    this.#provider = undefined
    this.#providerCheckPromise = undefined
  }

  async ensureProvider() {
    if (!this.#provider) {
      this.status = 'signed-out'
      throw 'PROVIDER_NOT_LOADED'
    }

    if (this.status === 'ready') {
      return this.#provider
    }

    if (this.#providerCheckPromise) {
      return this.#providerCheckPromise
    }

    this.#providerCheckPromise = this.#provider.api.isSessionActive()
      .then(isActive => {
        if (!isActive) {
          throw 'INVALIDATE_TOKEN'
        }

        if (!this.#provider || this.status === 'signed-out') {
          throw new Error('Atelier not loaded')
        }

        this.status = 'ready'
        return this.#provider
      })
      .finally(() => {
        this.#providerCheckPromise = undefined
      })

    return this.#providerCheckPromise
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
    await this.ensureProvider()

    if (!repoPath || (!(this.provider.api instanceof ScribouilliBackend) && !owner)) {
      throw new Error('mssing URL param')
    }
    const newRepo = {
      owner: owner ?? undefined,
      repoPath,
    }

    await this.repo.load(newRepo)

    return this.repo
  }

  async createRepo({ owner, repoName, template }: {
    owner: string | undefined
    repoName: string
    template: GitSiteTemplate
  }): Promise<ScribouilliGitRepo> {
    // Ensure API client is ready
    await this.ensureProvider()
    // Create new repo on load it to be ready
    await this.repo.createNewAndLoad({ owner, repoName, template })
    // Refresh repo list in the background
    this.repoList.refresh()

    return this.repo
  }

  async deleteRepository(repo: ScribouilliGitRepo) {

    return this.repoList.delete(repo)
      .then(() => this.repo.deleteLocalRepo())
      .then(() => this.repo.reset())
  }

  get repos() {
    return this.repoList.repos
  }
}

export const [getAtelier, setAtelier] = createContext<Atelier>();
