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

const storeAccessTokenInLocalStorage = () => {
  const url = new URL(location.href)

  if (
    url.searchParams.has(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER) &&
    url.searchParams.has(TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER) &&
    store.state.oAuthProvider?.accessToken &&
    store.state.oAuthProvider?.name
  ) {
    url.searchParams.delete(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER)
    url.searchParams.delete(TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER)
    history.replaceState(undefined, '', url)

    localStorage.setItem(
      ACCESS_TOKEN_STORAGE_KEY,
      store.state.oAuthProvider.accessToken,
    )
    localStorage.setItem(
      OAUTH_PROVIDER_STORAGE_KEY,
      store.state.oAuthProvider.name,
    )
  }
}

export default () => {
  storeAccessTokenInLocalStorage()

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
