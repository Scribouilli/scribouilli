// @ts-check

import { svelteTarget } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import store from '../store'
import Login from '../components/screens/Login.svelte'
import { oAuthAppByProvider } from '../oauth-services-api/index.js'

const TOCTOCTOC_ORIGIN = `https://toctoctoc.lechappeebelle.team`

/**
 * @param {string} gitProvider
 * @param {string} destination
 */
function redirectURLByProvider(gitProvider, destination) {
  if (gitProvider === 'github.com') {
    return `${TOCTOCTOC_ORIGIN}/github-callback?destination=${destination}`
  } else {
    // assume Gitlab and assume HTTPS
    return `${TOCTOCTOC_ORIGIN}/gitlab-callback/https://${gitProvider}/?destination=${destination}`
  }
}

/**
 *
 * @param {string} gitProvider
 * @param {string} client_id
 * @param {string} redirect_url
 * @returns
 */
function makeLoginHref(gitProvider, client_id, redirect_url) {
  if (gitProvider === 'github.com') {
    return `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=public_repo,user:email&redirect_uri=${redirect_url}`
  } else {
    // assume HTTPS
    return `https://${gitProvider}/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_url}&response_type=code&scope=api+read_api`
  }
}

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

  const destination =
    location.origin + store.state.basePath + '/after-oauth-login'
  const client_id = oAuthAppByProvider.get(gitProvider)?.client_id
  if (!client_id) {
    throw new TypeError(`Missing client_id`)
  }

  const redirect_url = redirectURLByProvider(gitProvider, destination)
  const loginHref = makeLoginHref(gitProvider, client_id, redirect_url)

  const login = new Login({
    target: svelteTarget,
    props: {
      href: loginHref,
      gitProvider,
    },
  })

  replaceComponent(login, () => {})
}
