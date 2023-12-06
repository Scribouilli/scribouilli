import page from 'page'
import store from './../store.js'
import GitHubAPI from './github.js'
import GitlabAPI from './gitlab.js'

import './../types.js'

/**
 * @overlaod
 * @param {'github'} type
 * @param {GithubOptions} options
 *
 * @returns {OAuthServiceAPI}
 */

/**
 * @overlaod
 * @param {'gitlab'} type
 * @param {GitlabOptions} options
 *
 * @returns {OAuthServiceAPI}
 */

/**
 * @param {string} type
 * @param {{accessToken: string}} options
 *
 * @returns {OAuthServiceAPI}
 */
const makeOAuthServiceAPI = (type, { accessToken }) => {
  if (type === 'github') return new GitHubAPI(accessToken)

  if (type === 'gitlab') return new GitlabAPI(accessToken)

  throw new TypeError(
    `Le service d'authentificaton ${type} n'est pas supporté.`,
  )
}

// @ts-ignore
let oAuthServiceAPI

/**
 *
 * @returns {OAuthServiceAPI}
 */
export const getOAuthServiceAPI = () => {
  // @ts-ignore
  if (oAuthServiceAPI) {
    return oAuthServiceAPI
  }

  if (
    !store.state.oAuthProvider?.accessToken ||
    !store.state.oAuthProvider?.name
  ) {
    console.info("L'utilisateur n'est pas connecté. Redirection vers /account")

    page('/account')

    throw new TypeError('Missing accessToken or provider name')
  }

  oAuthServiceAPI = makeOAuthServiceAPI(store.state.oAuthProvider.name, {
    accessToken: store.state.oAuthProvider.accessToken,
  })

  return oAuthServiceAPI
}
