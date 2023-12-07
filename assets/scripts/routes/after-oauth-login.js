// @ts-check

import page from 'page'
import remember from 'remember'

import {
  svelteTarget,
  defaultRepositoryName,
  OAUTH_PROVIDER_STORAGE_KEY,
  TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
  TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
} from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import store from '../store'
import AfterOauthLogin from '../components/screens/AfterOauthLogin.svelte'
import { fetchCurrentUserRepositories } from '../actions/current-user.js'
import { createRepositoryForCurrentAccount } from '../actions/setup.js'
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
    const oAuthProvider = {
      name: providerName,
      accessToken,
      origin,
    }

    remember(OAUTH_PROVIDER_STORAGE_KEY, oAuthProvider)

    store.mutations.setOAuthProvider(oAuthProvider)
  }
}

export default () => {
  storeOAuthProviderAccess()

  let type = store.state.oAuthProvider?.name

  // no type is implicitly github for historical reasons (which will certainly be irrelevant in, say, 2025)
  if (!type) {
    type = 'github'
  }

  let currentUserReposP

  if (type === 'github' || type === 'gitlab') {
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
  } else {
    throw new Error(`Unknown OAuth provider type: ${type}`)
  }

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
