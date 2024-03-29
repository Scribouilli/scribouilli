// @ts-check

import Account from '../components/screens/Account.svelte'
import { svelteTarget } from '../config.js'
import { replaceComponent } from '../routeComponentLifeCycle.js'

/**
 * @param {import('page').Context} _
 */
export default ({ querystring }) => {
  const params = new URLSearchParams(querystring)
  const gitProvider = params.get('provider')

  console.log('gitProvider', gitProvider)

  if (!gitProvider) {
    throw new TypeError(`Missing 'provider' parameter`)
  }

  const account = new Account({
    target: svelteTarget,
    props: { gitProvider },
  })

  replaceComponent(account, () => {})
}
