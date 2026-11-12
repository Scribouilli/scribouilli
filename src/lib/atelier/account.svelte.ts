import { cache } from "#lib/storage.ts"
import type { ProviderConfig, ScribouilliBackendProvider } from "../providers"


export type AccountCache = Record<ProviderConfig['id'], Pick<Account, 'login' | 'email'>>

export class Account {
  login: string = $state('')
  email: string = $state('')

  loading: Promise<any> | null = null

  #provider: () => Promise<ScribouilliBackendProvider>
  #accountCache: AccountCache = cache.loadAccount()

  constructor(provider: () => Promise<ScribouilliBackendProvider>) {
    this.#provider = provider
  }

  reset() {
    this.login = ''
    this.email = ''
  }

  async refresh() {
    const fresh = await this.loadFromCache()

    const loginP = this.#provider()
      .then(({ api }) => api.getAuthenticatedUser())
      .then(({ login }) => this.login = login)

    const emailP = this.#provider()
      .then(({ api }) => api.getUserEmails())
      .then(emails => {
        const email = (emails.find(e => e.primary) ?? emails[0]).email
        this.email = email
      })

    const accountPromise = Promise.all([loginP, emailP]).then(() => this.saveCache())

    if (!fresh) {
      await accountPromise
    }
  }

  async saveCache() {
    const { config } = await this.#provider()
    this.#accountCache[config.id] = {
      login: this.login,
      email: this.email,
    }

    cache.saveAccount(this.#accountCache)
  }

  async loadFromCache() {
    const { config } = await this.#provider()
    if (!(config.id in this.#accountCache)) {
      return false
    }
    const cachedAccount = this.#accountCache[config.id]
    this.email = cachedAccount.email
    this.login = cachedAccount.login
    return true
  }
}
