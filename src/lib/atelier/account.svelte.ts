import type { ProviderApi } from "../providers"


export class Account {
  login: string = $state('')
  email: string = $state('')

  loading: Promise<any> | null = null

  #api: () => Promise<ProviderApi>

  constructor(api: () => Promise<ProviderApi>) {
    this.#api = api
  }

  reset() {
    this.login = ''
    this.email = ''
  }

  async refresh() {
    const loginP = this.#api()
      .then(api => api.getAuthenticatedUser())
      .then(({ login }) => this.login = login)

    const emailP = this.#api().then(api => api.getUserEmails())
      .then(emails => {
        const email = (emails.find(e => e.primary) ?? emails[0]).email
        this.email = email
      })

    return Promise.all([loginP, emailP])
  }
}
