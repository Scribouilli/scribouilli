import { cache } from "#lib/storage.ts";
import type { MinimalGitRepository, ProviderConfig, ScribouilliBackendProvider } from "../providers";
import type { Account } from "./account.svelte";
import type ScribouilliGitRepo from "./repo.svelte";

export type RepoListCache = Record<ProviderConfig['id'], MinimalGitRepository[]>

export class RepoList {
  #repos: MinimalGitRepository[] = $state([])
  #repoCache: RepoListCache = cache.loadRepoList()
  #account: () => Account

  readonly repos = $derived.by(() => RepoList.sortRepositories(this.#repos, this.#account().login))
  loading: Promise<any> | null = null

  #provider: () => Promise<ScribouilliBackendProvider>

  constructor(api: () => Promise<ScribouilliBackendProvider>, account: () => Account) {
    this.#provider = api
    this.#account = account
  }

  reset() {
    this.#repos = []
  }

  async refresh() {
    const fresh = await this.loadFromCache()

    const promise = this.#provider()
      .then(({ api }) => api.getCurrentUserRepositories())
      .then(repos => {
        this.#repos = repos
        this.saveCache()
      })

    if (!fresh) {
      await promise
    }
  }

  async delete(repo: ScribouilliGitRepo) {
    this.#repos = this.repos.filter(({ repoPath, owner }) => {
      repoPath != repo.repoPath && owner != repo.owner
    })
    const { api } = await this.#provider()
    await api.deleteRepository(repo)
    await this.refresh()
  }

  async saveCache() {
    const { config } = await this.#provider()
    this.#repoCache[config.id] = this.#repos

    cache.saveRepoList(this.#repoCache)
  }

  async loadFromCache() {
    const { config } = await this.#provider()
    if (!(config.id in this.#repoCache)) {
      return false
    }
    const cachedRepos = this.#repoCache[config.id]
    this.#repos = cachedRepos
    return true
  }

  static sortRepositories(repos: MinimalGitRepository[], login: string | undefined) {
    return repos
      // on place ses propres dépôts avant les dépôts des autres
      .toSorted((a, b) => {
        if (login && typeof login === 'string') {
          if (a.owner === undefined || b.owner === undefined || a.owner == b.owner) {
            return a.repoPath.localeCompare(b.repoPath)
          } else if (a.owner === login) {
            return -1
          } else if (b.owner === login) {
            return 1
          } else {
            return a.owner.localeCompare(b.owner)
          }
        }

        return 0
      })
  }
}
