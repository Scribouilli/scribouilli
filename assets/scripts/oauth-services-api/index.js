import page from 'page'
import store from './../store.js'
import GitHubAPI from './github.js'
import GitlabAPI from './gitlab.js'

import './../types.js'

export const oAuthAppByProvider = new Map([
  [
    'github.com',
    {
      origin: 'https://github.com',
      client_id: '64ecce0b01397c2499a6',
    },
  ],
  [
    'gitlab.com',
    {
      origin: 'https://gitlab.com',
      client_id:
        'b943c32d1a30f316cf4a72b5e40b05b6e71a1e3df34e2233c51e79838b22f7e8',
    },
  ],
])

export const oAuthAppByType = new Map([
  ['github', oAuthAppByProvider.get('github.com')],
  ['gitlab', oAuthAppByProvider.get('gitlab.com')],
])

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

  if (type === 'gitlab') {
    // @ts-ignore
    const origin = oAuthAppByType.get(type).origin

    return new GitlabAPI(accessToken, origin)
  }

  throw new TypeError(
    `Le service d'authentificaton ${type} n'est pas supporté.`,
  )
}

// @ts-ignore
let oAuthServiceAPI

/**
 * @returns {Promise<OAuthServiceAPI>}
 */
export const getOAuthServiceAPI = async () => {
  // @ts-ignore
  if (oAuthServiceAPI) {
    return oAuthServiceAPI
  }

  const oAuthProvider = await store.state.oAuthProvider

  if (!oAuthProvider) {
    console.info("L'utilisateur n'est pas connecté. Redirection vers /account")

    page('/account')

    throw new TypeError('Missing accessToken or provider name')
  }

  oAuthServiceAPI = makeOAuthServiceAPI(oAuthProvider.name, {
    accessToken: oAuthProvider.accessToken,
  })

  return oAuthServiceAPI
}
