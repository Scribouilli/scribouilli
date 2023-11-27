import page from 'page'
import store from './../store.js'
import { GitHubAPI } from './github.js'

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
 * @param {any} options
 *
 * @returns {OAuthServiceAPI}
 */
const makeOAuthServiceAPI = (type, options) => {
  const accessToken = options.accessToken
  const implementedServices = ['github', 'gitlab']

  if (!implementedServices.includes(type)) {
    throw new Error(`Le service d'authentificaton ${type} n'est pas supporté.`)
  }

  // TODO: Ajouter le support à GitLab

  return new GitHubAPI(accessToken)
}

// @ts-ignore
let oAuthServiceAPI

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

    return
  }

  oAuthServiceAPI = makeOAuthServiceAPI(store.state.oAuthProvider.name, {
    accessToken: store.state.oAuthProvider.accessToken,
  })

  return oAuthServiceAPI
}
