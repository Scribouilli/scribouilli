// @ts-check

import page from 'page'

import {
  svelteTarget,
  defaultRepositoryName,
  ACCESS_TOKEN_STORAGE_KEY,
  OAUTH_PROVIDER_STORAGE_KEY,
  OAUTH_PROVIDER_ORIGIN_STORAGE_KEY,
  TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
  TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
} from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import store from '../store'
import AfterOauthLogin from '../components/screens/AfterOauthLogin.svelte'
import {
  fetchCurrentUserRepositories,
  createRepositoryForCurrentAccount,
} from '../actions.js'
import { oAuthAppByType } from '../oauth-services-api/index.js'

const storeOAuthProviderAccess = () => {
  const url = new URL(location.href)

  console.log(
    'type',
    url.searchParams.get(TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER),
  )

  const accessToken = url.searchParams.get(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER)
  const providerName = url.searchParams.get(
    TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
  )

  if (accessToken && providerName) {
    const origin = oAuthAppByType.get(providerName)?.origin || ''

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
    localStorage.setItem(OAUTH_PROVIDER_STORAGE_KEY, providerName)
    localStorage.setItem(OAUTH_PROVIDER_ORIGIN_STORAGE_KEY, origin)

    store.mutations.setOAuthProvider({
      accessToken: accessToken,
      name: providerName,
      origin: origin,
    })
  }
}

export default () => {
  storeOAuthProviderAccess()

  const type = store.state.oAuthProvider?.name

  let currentUserReposP

  // no type is implicitly github for historical reasons (which will certainly be irrelevant in, say, 2025)
  // if (!type || type === 'github') {
  currentUserReposP = fetchCurrentUserRepositories().then(repos => {
    console.log('repos', repos)
    if (repos.length === 0) {
      // If the user has no repository, we automatically create one for them.
      createRepositoryForCurrentAccount(defaultRepositoryName)
    } else {
      store.mutations.setReposForAccount({
        login: store.state.login,
        repos,
      })

      page.redirect('/selectionner-un-site')
    }
  })
  // } else {
  // currentUserReposP = Promise.resolve()
  // if (type === 'gitlab') {
  // console.log(
  // 'Connexion depuis gitlab détectée et on ne sait rien en faire',
  // )
  // } else {
  // console.error(`Type dans l'URL non reconnu:`, type)
  // }
  // }

  const afterOauthLogin = new AfterOauthLogin({
    target: svelteTarget,
    props: {
      // @ts-ignore
      currentUserReposP,
      // @ts-ignore
      type,
    },
  })

  replaceComponent(afterOauthLogin, () => {})
}
