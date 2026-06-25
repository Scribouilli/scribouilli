import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import store from '../store'
import Login from '../components/screens/Login.svelte'
import { Context } from 'page'

const TOCTOCTOC_ORIGIN = `https://toctoctoc.lechappeebelle.team`

const oAuthAppByProvider = new Map([
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

function redirectURLByProvider(gitProvider: string, destination: string) {
  if (gitProvider === 'github.com') {
    return `${TOCTOCTOC_ORIGIN}/github-callback?destination=${destination}`
  } else {
    // assume Gitlab and assume HTTPS
    return `${TOCTOCTOC_ORIGIN}/gitlab-callback/https://${gitProvider}/?destination=${destination}`
  }
}

function makeLoginHref(
  gitProvider: string,
  client_id: string,
  redirect_url: string,
) {
  if (gitProvider === 'github.com') {
    return `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=public_repo,user:email&redirect_uri=${redirect_url}`
  } else {
    // assume HTTPS
    return `https://${gitProvider}/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_url}&response_type=code&scope=api+read_api`
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
  const client_id = oAuthAppByProvider.get(gitProvider)?.client_id
  if (!client_id) {
    throw new TypeError(`Missing client_id`)
  }

  const redirect_url = redirectURLByProvider(gitProvider, destination)
  const loginHref = makeLoginHref(gitProvider, client_id, redirect_url)

  replaceComponent(Login, () => {
    return {
      href: loginHref,
      gitProvider,
    }
  })
}
