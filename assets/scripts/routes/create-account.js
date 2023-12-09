// @ts-check

import CreateAccount from '../components/screens/CreateAccount.svelte'
import { svelteTarget } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'

/**
 * @param {import('page').Context} _
 */
export default ({ querystring }) => {
  const params = new URLSearchParams(querystring)
  const gitProvider = params.get('provider')

  if (!gitProvider) {
    throw new TypeError(`Missing 'provider' parameter`)
  }

  const createAccount = new CreateAccount({
    target: svelteTarget,
    props: { gitProvider },
  })

  replaceComponent(createAccount, () => {})
}
