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
  [
    'git.scribouilli.org',
    {
      origin: 'https://git.scribouilli.org',
      client_id:
        '3e8ac6636615d396a8f73e02fa3880e7e2140981b0ca27b0f240a450f69f1c76',
    },
  ],
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
 * @param {import('./../store.js').OAuthProvider} _
 *
 * @returns {OAuthServiceAPI}
 */
const makeOAuthServiceAPI = ({ accessToken, origin }) => {
  const hostname = new URL(origin).hostname

  if (hostname === 'github.com') return new GitHubAPI(accessToken)
  else {
    // assuming a gitlab instance
    return new GitlabAPI(accessToken, origin)
  }
}

// @ts-ignore
let oAuthServiceAPI

/**
 * @returns {OAuthServiceAPI}
 */
export const getOAuthServiceAPI = () => {
  // @ts-ignore
  if (oAuthServiceAPI) {
    return oAuthServiceAPI
  }

  const oAuthProvider = store.state.oAuthProvider

  if (!oAuthProvider) {
    console.info("L'utilisateur n'est pas connecté. Redirection vers /")

    page('/')

    throw new TypeError('Missing accessToken or provider name')
  }

  oAuthServiceAPI = makeOAuthServiceAPI(oAuthProvider)

  return oAuthServiceAPI
}
