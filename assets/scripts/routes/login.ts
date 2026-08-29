import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import store from '../store'
import Login from '../components/screens/Login.svelte'
import { Context } from 'page'
import {
  TOCTOCTOC_ORIGIN,
  TOCTOCTOC_OAUTH_PROVIDER_ORIGIN_PARAMETER,
  TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
  PROVIDERS_MAP,
} from '../config'
import { ScribouilliBackendProvider } from '../types/atelier'

function redirectURLByProvider(
  { type: providerType, origin }: ScribouilliBackendProvider,
  destination: string,
) {
  if (providerType === 'github') {
    return `${TOCTOCTOC_ORIGIN}/github-callback?destination=${destination}`
  } else if (providerType === 'gitlab') {
    return `${TOCTOCTOC_ORIGIN}/gitlab-callback/${origin}/?destination=${destination}`
  } else if (providerType === 'scribouilli') {
    // TODO: get rid of origin parameter when not used?
    return `${destination}?${TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER}=scribouilli&${TOCTOCTOC_OAUTH_PROVIDER_ORIGIN_PARAMETER}=${origin}`
  } else {
    throw new Error('unreachable')
  }
}

function makeLoginHref(
  { clientId, type: providerType, origin }: ScribouilliBackendProvider,
  redirectUrl: string,
) {
  if (providerType === 'github') {
    return `${origin}/login/oauth/authorize?client_id=${clientId}&scope=public_repo,user:email&redirect_uri=${redirectUrl}`
  } else if (providerType == 'gitlab') {
    return `${origin}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&scope=api+read_api`
  } else {
    return `${origin}/login?callback=${encodeURIComponent(redirectUrl)}`
  }
}

export default ({ querystring }: Context) => {
  const params = new URLSearchParams(querystring)
  const gitProvider = params.get('provider')

  console.log('gitProvider', gitProvider)

  if (!gitProvider) {
    throw new TypeError(`Missing 'provider' parameter`)
  }

  const destination =
    location.origin + store.state.basePath + '/after-oauth-login'

  const provider = PROVIDERS_MAP.get(gitProvider)

  if (!provider) {
    throw new TypeError(`Unknown provider ${gitProvider}`)
  }

  const redirectUrl = redirectURLByProvider(provider, destination)
  const loginHref = makeLoginHref(provider, redirectUrl)

  replaceComponent(Login, () => {
    return {
      href: loginHref,
      providerType: provider.type,
      providerId: provider.id,
    }
  })
}
