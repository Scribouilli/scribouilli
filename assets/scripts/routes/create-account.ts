import { Context } from 'page'
import CreateAccount from '../components/screens/CreateAccount.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte'

export default ({ querystring }: Context) => {
  const params = new URLSearchParams(querystring)
  const gitProvider = params.get('provider')

  if (!gitProvider) {
    throw new TypeError(`Missing 'provider' parameter`)
  }

  replaceComponent(CreateAccount, () => {
    return { gitProvider }
  })
}
