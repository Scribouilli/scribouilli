import page from 'page'
import store, { type OAuthProvider } from '../store.ts'
import GitHubAPI from './github.ts'
import GitlabAPI from './gitlab.ts'
import type { OAuthServiceAPI } from '../types/git.ts'
import ScribouilliBackend from './scribouilli.ts'
import { PROVIDERS_MAP } from '../config.ts'

const makeOAuthServiceAPI = ({
  accessToken,
  origin,
  id,
}: OAuthProvider): OAuthServiceAPI => {
  let provider = PROVIDERS_MAP.get(id)

  if (!provider) {
    throw new TypeError(`Unkown provider ${id}`)
  }

  if (provider.type === 'github') {
    return new GitHubAPI(accessToken)
  } else if (provider.type === 'gitlab') {
    return new GitlabAPI(accessToken, origin, () => {
      if (!store.state.gitAgent) {
        throw new TypeError('store.state.gitAgent is undefined')
      }
      return store.state.gitAgent
    })
  } else if (provider.type === 'scribouilli') {
    return new ScribouilliBackend(accessToken, origin)
  } else {
    throw new Error('unreachable')
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

/**
 * @param owner may be an individual Github user or an organisation
 */
export function defaultMakeRepoId(owner: string | undefined, repoName: string): string {
  return owner ? `${owner}/${repoName}` : `${repoName}`
}

/**
 * @param owner may be an individual Github user or an organisation
 */
export function defaultMakePublicRepositoryURL(
  owner: string | undefined,
  repoName: string,
  origin: string,
): string {
  return owner ? `${origin}/${owner}/${repoName}` : `${origin}/${repoName}`
}
