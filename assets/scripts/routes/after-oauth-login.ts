import page from 'page'
import remember from 'remember'

import {
  OAUTH_PROVIDER_STORAGE_KEY,
  TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
  TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
  TOCTOCTOC_OAUTH_PROVIDER_ORIGIN_PARAMETER,
} from '../config.ts'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.ts'
import store from '../store'
import AfterOauthLogin from '../components/screens/AfterOauthLogin.svelte'
import { fetchCurrentUserRepositories } from '../actions/current-user.ts'

const storeOAuthProviderAccess = () => {
  const url = new URL(location.href)

  const accessToken = url.searchParams.get(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER)
  const providerType = url.searchParams.get(
    TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
  )
  let origin = url.searchParams.get(TOCTOCTOC_OAUTH_PROVIDER_ORIGIN_PARAMETER)

  console.log('type', providerType, 'origin', origin)

  if (!origin) {
    if (providerType === 'github') {
      origin = 'https://github.com'
    } else {
      throw new TypeError('missing origin')
    }
  }

  const providerId = new URL(origin).hostname

  if (providerType && accessToken) {
    const oAuthProvider = {
      type: providerType,
      accessToken,
      origin,
      id: providerId,
    }

    console.log(oAuthProvider)

    store.mutations.setOAuthProvider(oAuthProvider)

    remember(OAUTH_PROVIDER_STORAGE_KEY, oAuthProvider)
  }
}

export default () => {
  storeOAuthProviderAccess()

  const oAuthProvider = store.state.oAuthProvider
  let type = oAuthProvider?.type

  console.log('type', type)
  console.log('oAuthProvider', oAuthProvider)

  // no type is implicitly github for historical reasons (which will certainly be irrelevant in, say, 2025)
  if (!type) {
    type = 'github'
  }

  let currentUserReposP

  if (type === 'github' || type === 'gitlab' || type == 'scribouilli') {
    currentUserReposP = fetchCurrentUserRepositories().then(repos => {
      if (repos.length === 0) {
        page.redirect('/creer-un-nouveau-site')
      } else {
        store.mutations.setReposForAccount({
          // @ts-ignore
          login: store.state.login,
          repos,
        })

        page.redirect('/selectionner-un-site')
      }
    })
  } else {
    throw new Error(`Unknown OAuth provider type: ${type}`)
  }

  // TODO: pareil que dans account.js ici
  replaceComponent(AfterOauthLogin, () => {
    return { currentUserReposP }
  })
}
