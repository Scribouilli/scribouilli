import type { OAuthProvider } from './providers'
import { OAUTH_PROVIDER_STORAGE_KEY } from './config'

export function load(): OAuthProvider | undefined {
  if (localStorage) {
    let oAuthProviderRaw = localStorage.getItem(OAUTH_PROVIDER_STORAGE_KEY)

    return oAuthProviderRaw ? (JSON.parse(oAuthProviderRaw) as OAuthProvider) : undefined
  }
}

export function login(oAuthProvider: OAuthProvider) {
  if (localStorage) {
    localStorage.setItem(OAUTH_PROVIDER_STORAGE_KEY, JSON.stringify(oAuthProvider))
  }
}

export function logout() {
  if (localStorage) {
    localStorage.removeItem(OAUTH_PROVIDER_STORAGE_KEY)
  }
}
