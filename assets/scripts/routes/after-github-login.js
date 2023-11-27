// @ts-check

import page from 'page'

import { svelteTarget, defaultRepositoryName } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import store from '../store'
import AfterGithubLogin from '../components/screens/AfterGithubLogin.svelte'
import {
  fetchCurrentUserRepositories,
  createRepositoryForCurrentAccount,
} from '../actions.js'
import {
  ACCESS_TOKEN_STORAGE_KEY,
  OAUTH_PROVIDER_STORAGE_KEY,
  TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
  TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
} from './../config.js'

const storeOAuthProviderAccess = () => {
  const url = new URL(location.href)

  if (
    url.searchParams.has(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER) &&
    url.searchParams.get(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER) !== null &&
    url.searchParams.has(TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER) &&
    url.searchParams.get(TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER) !== null
  ) {
    const accessToken = url.searchParams.get(
      TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
    )
    const providerName = url.searchParams.get(
      TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
    )
    history.replaceState(undefined, '', url)

    // @ts-ignore
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
    // @ts-ignore
    localStorage.setItem(OAUTH_PROVIDER_STORAGE_KEY, providerName)

    store.mutations.setOAuthProvider({
      accessToken: accessToken,
      name: providerName,
    })
  }
}

export default () => {
  storeOAuthProviderAccess()

  const currentUserReposP = fetchCurrentUserRepositories().then(repos => {
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

  const afterGithubLogin = new AfterGithubLogin({
    target: svelteTarget,
    props: {
      currentUserReposP,
    },
  })

  replaceComponent(afterGithubLogin, () => {})
}
