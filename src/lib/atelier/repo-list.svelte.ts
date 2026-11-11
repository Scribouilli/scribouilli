import type { MinimalGitRepository, ProviderApi } from "../providers";
import type { Account } from "./account.svelte";
import type ScribouilliGitRepo from "./repo.svelte";

export class RepoList {
  #repos: MinimalGitRepository[] = $state([])
  #account: Account

  readonly repos = $derived.by(() => RepoList.sortRepositories(this.#repos, this.#account.login))
  loading: Promise<any> | null = null

  #api: () => Promise<ProviderApi>

  constructor(api: () => Promise<ProviderApi>, account: Account) {
    this.#api = api
    this.#account = account
  }

  reset() {
    this.#repos = []
  }

  async refresh() {
    return this.#api()
      .then(api => api.getCurrentUserRepositories())
      .then(repos => {
        this.#repos = repos
      })
  }

  async delete(repo: ScribouilliGitRepo) {
    this.#repos = this.repos.filter(({ repoPath, owner }) => {
      repoPath != repo.repoPath && owner != repo.owner
    })
    const client = await this.#api()
    await client.deleteRepository(repo)
    await this.refresh()
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
