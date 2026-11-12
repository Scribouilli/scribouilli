import { makeOAuthServiceAPI, type OAuthProvider, type ScribouilliBackendProvider } from './providers'
import type { RepoCache } from './atelier/repo.svelte'
import type { AccountCache } from './atelier/account.svelte'
import {
  OAUTH_PROVIDER_STORAGE_KEY,
  REPOS_CACHE_KEY,
  PROVIDERS_MAP,
  ACCOUNT_CACHE_KEY,
  REPO_LIST_CACHE_KEY
} from './config'
import type { RepoListCache } from './atelier/repo-list.svelte'

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

export const cache = {
  loadRepo: () => {
    if (sessionStorage) {
      const rawSyncedRepos = sessionStorage.getItem(REPOS_CACHE_KEY)
      if (rawSyncedRepos) {
        return JSON.parse(rawSyncedRepos) as RepoCache
      }
    }

    return {}
  },

  saveRepo: (repos: RepoCache) => {
    if (sessionStorage) {
      sessionStorage.setItem(REPOS_CACHE_KEY, JSON.stringify(repos))
    }
  },

  loadRepoList: () => {
    if (sessionStorage) {
      const rawRepoList = sessionStorage.getItem(REPO_LIST_CACHE_KEY)
      if (rawRepoList) {
        return JSON.parse(rawRepoList) as RepoListCache
      }
    }

    return {}
  },

  saveRepoList: (repos: RepoListCache) => {
    if (sessionStorage) {
      sessionStorage.setItem(REPO_LIST_CACHE_KEY, JSON.stringify(repos))
    }
  },

  loadAccount: () => {
    if (sessionStorage) {
      const rawAccount = sessionStorage.getItem(ACCOUNT_CACHE_KEY)
      if (rawAccount) {
        return JSON.parse(rawAccount) as AccountCache
      }
    }

    return {}
  },

  saveAccount: (repos: AccountCache) => {
    if (sessionStorage) {
      sessionStorage.setItem(ACCOUNT_CACHE_KEY, JSON.stringify(repos))
    }
  }
}
