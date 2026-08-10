import { Context } from 'page'
import CreateAccount from '../components/screens/CreateAccount.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import { PROVIDERS_MAP } from '../config'

export default ({ querystring }: Context) => {
  const params = new URLSearchParams(querystring)
  const providerId = params.get('provider')

  if (!providerId) {
    throw new TypeError(`Missing 'provider' parameter`)
  }

  const provider = PROVIDERS_MAP.get(providerId)

  if (!provider) {
    throw new TypeError(`Unkown provider ${providerId}`)
  }

  replaceComponent(CreateAccount, () => {
    return { provider }
  })
}
