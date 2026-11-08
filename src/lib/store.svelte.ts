import type ScribouilliGitRepo from './git/repo'
import type { Article } from './article'
import type { Page } from './page'
import type { MinimalGitRepository } from './providers'
import type { BuildStatus } from '#lib/build-status.ts'
import type { GitAgent } from './git/agent'
import type { ResolutionOption } from './git/agent'
import type { OAuthProvider } from './providers'

import { browser } from '$app/env'
import * as auth from './auth'

export interface ScribouilliState {
  oAuthProvider?: OAuthProvider
  login?: string
  email?: string
  currentRepository: ScribouilliGitRepo | undefined
  gitAgent: GitAgent | undefined
  conflict: ResolutionOption[] | undefined
  // We use the term "account" to refer to user or organization.
  reposByAccount: { [account: string]: MinimalGitRepository[] } | undefined
  pages?: Page[]
  articles?: Article[]
  buildStatus: BuildStatus
  basePath: string
  theme: { css?: string }
}

const DEFAULT_STATE: ScribouilliState = {
  oAuthProvider: undefined,
  login: undefined,
  email: undefined,
  currentRepository: undefined,
  gitAgent: undefined,
  conflict: undefined,
  reposByAccount: {},
  pages: [],
  articles: undefined,
  buildStatus: 'in_progress' as const,
  basePath: '',
  theme: {
    css: undefined,
  },
}

function loadState(): ScribouilliState {
  let state = structuredClone(DEFAULT_STATE)
  if (browser) {
    state.oAuthProvider = auth.load()
    state.basePath = location.hostname.endsWith('.github.io') ? '/scribouilli' : ''
  }
  return state
}

export const state = $state(loadState())

export function setPages(pages: ScribouilliState['pages']) {
  state.pages = pages?.sort((pageA, pageB) => {
    const diffIndex = pageA.index - pageB.index
    if (diffIndex === 0) {
      if (pageA.path < pageB.path) {
        return -1
      }
      if (pageA.path > pageB.path) {
        return 1
      }
      if (pageA.path === pageB.path) {
        return 0
      }
    }
    return diffIndex
  })
}

export function setArticles(articles: ScribouilliState['articles']) {
  state.articles = articles?.sort((pageA, pageB) => {
    if (pageA.path < pageB.path) {
      return 1
    }
    if (pageA.path > pageB.path) {
      return -1
    }

    // pageA.path === pageB.path
    return 0
  })
}

// TODO: sort les repos dans le composant
// TODO: remplacer l’objet `reposByAccount` par une liste `repos` vu qu’il n’y a toujours qu’une seule clé
export function setReposForAccount({
  login,
  repos,
}: {
  login: string
  repos: MinimalGitRepository[]
}) {
  if (!state.reposByAccount) {
    state.reposByAccount = {}
  }

  state.reposByAccount[login] = repos
    // on place ses propres dépôts avant les dépôts des autres
    .sort((a, b) => {
      if (state.login && typeof state.login === 'string') {
        if (a.owner === undefined || b.owner === undefined || a.owner == b.owner) {
          return a.repoPath.localeCompare(b.repoPath)
        } else if (a.owner === state.login) {
          return -1
        } else if (b.owner === state.login) {
          return 1
        } else {
          return a.owner.localeCompare(b.owner)
        }
      }

      return 0
    })
}

export function logout() {
  auth.logout()

  // account-related
  state.oAuthProvider = undefined
  state.login = undefined
  state.email = undefined
  state.reposByAccount = undefined

  // repo-related
  state.pages = undefined
  state.articles = undefined
  state.currentRepository = undefined
  state.gitAgent = undefined
  state.conflict = undefined
}
