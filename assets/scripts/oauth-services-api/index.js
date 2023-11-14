import page from 'page'
import store from './../store.js'
import { GitHubAPI } from './github.js'

import './../types.js'

export class OAuthProvider {
  /**
   *
   * @param {string} accessToken
   * @param {string} oAuthProviderName
   */
  constructor(accessToken, oAuthProviderName) {
    this._accessToken = accessToken
    this._oAuthProviderName = oAuthProviderName
    /** @type {OAuthServiceAPI | null} */
    this._serviceAPI = null
  }

  /**
   * @returns {OAuthServiceAPI}
   */
  getServiceAPI() {
    if (!this._accessToken) {
      throw new Error("Il manque le token d'accès.")
    }

    if (this._serviceAPI) {
      return this._serviceAPI
    }

    // TODO: add other OAuth providers here when needed
    return new GitHubAPI(this._accessToken)
  }
}

/**
 * @type {OAuthProvider}
 */
let oAuthProvider = new OAuthProvider('', '')

if (store.state.oAuthProvider?.accessToken && store.state.oAuthProvider?.name) {
  oAuthProvider = new OAuthProvider(
    store.state.oAuthProvider.accessToken,
    store.state.oAuthProvider.name,
  )
} else {
  console.info('No access token found in store. Redirecting to /account.')

  page.redirect('/account')
}

export default oAuthProvider
