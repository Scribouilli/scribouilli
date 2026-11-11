import { makeOAuthServiceAPI, type OAuthProvider, type ScribouilliBackendProvider } from './providers'
import type { RepoCache, SyncedRepos } from './atelier/repo.svelte'
import { OAUTH_PROVIDER_STORAGE_KEY, SYNCED_REPOS_STORAGE_KEY, PROVIDERS_MAP } from './config'

export function loadProvider(): ScribouilliBackendProvider | undefined {
  if (localStorage) {
    const providerRaw = localStorage.getItem(OAUTH_PROVIDER_STORAGE_KEY)
    const provider = providerRaw ? (JSON.parse(providerRaw) as OAuthProvider) : undefined
    const providerConfig = PROVIDERS_MAP.get(provider?.id ?? '')

    if (provider && providerConfig) {
      return {
        api: makeOAuthServiceAPI(provider),
        config: providerConfig
      }
    } else if (provider) {
      console.warn(`Unkown provider ${provider.id}`)
    }
  }
}

export function saveProvider(oAuthProvider: OAuthProvider) {
  if (localStorage) {
    localStorage.setItem(OAUTH_PROVIDER_STORAGE_KEY, JSON.stringify(oAuthProvider))
  }
}

export function deleteProvider() {
  if (localStorage) {
    localStorage.removeItem(OAUTH_PROVIDER_STORAGE_KEY)
  }
}

export function loadRepoCache() {
  if (sessionStorage) {
    const rawSyncedRepos = sessionStorage.getItem(SYNCED_REPOS_STORAGE_KEY)
    if (rawSyncedRepos) {
      return JSON.parse(rawSyncedRepos) as RepoCache
    }
  }

  return {}
}

export function saveRepoCache(repos: RepoCache) {
  if (sessionStorage) {
    sessionStorage.setItem(SYNCED_REPOS_STORAGE_KEY, JSON.stringify(repos))
  }
}
