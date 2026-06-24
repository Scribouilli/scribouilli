import page from 'page'
import store, { type OAuthProvider } from '../store.ts'
import GitHubAPI from './github.ts'
import GitlabAPI from './gitlab.ts'
import type { OAuthServiceAPI } from '../types/git.ts'

const makeOAuthServiceAPI = ({
  accessToken,
  origin,
}: OAuthProvider): OAuthServiceAPI => {
  const hostname = new URL(origin).hostname

  if (hostname === 'github.com') return new GitHubAPI(accessToken)
  else {
    // assuming a gitlab instance
    return new GitlabAPI(accessToken, origin, () => {
      if (!store.state.gitAgent) {
        throw new TypeError('store.state.gitAgent is undefined')
      }
      return store.state.gitAgent
    })
  }
}

let oAuthServiceAPI: OAuthServiceAPI

export const getOAuthServiceAPI = (): OAuthServiceAPI => {
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
