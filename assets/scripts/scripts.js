//@ts-check

import './routes/main.js'
import store from './store.js'
import {
  ACCESS_TOKEN_STORAGE_KEY,
  OAUTH_PROVIDER_STORAGE_KEY,
  TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
  TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
} from './config.js'

// @ts-ignore
window.Buffer = buffer.Buffer

const url = new URL(location.href)

// Store access_token in browser
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
