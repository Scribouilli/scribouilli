// @ts-check

import CreateAccount from '../components/screens/CreateAccount.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte'

/**
 * @param {import('page').Context} _
 */
export default ({ querystring }) => {
  const params = new URLSearchParams(querystring)
  const gitProvider = params.get('provider')

  if (!gitProvider) {
    throw new TypeError(`Missing 'provider' parameter`)
  }

  replaceComponent(CreateAccount, () => { return { gitProvider } })
}
