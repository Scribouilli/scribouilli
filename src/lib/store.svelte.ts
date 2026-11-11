import type ScribouilliGitRepo from './atelier/repo.svelte'
import type { Article } from './atelier/article.svelte'
import type { Page } from './atelier/page.svelte'
import type { MinimalGitRepository } from './providers'
import type { BuildStatus } from '#lib/build-status.ts'
import type { ResolutionOption } from './git/agent'
import type { ScribouilliBackendProvider } from './providers'

import * as storage from './storage'

export interface ScribouilliState {
  provider?: ScribouilliBackendProvider
  login?: string
  email?: string
  currentRepository?: ScribouilliGitRepo
  conflict: ResolutionOption[] | undefined
  repos: MinimalGitRepository[] | undefined
  pages?: Page[]
  articles?: Article[]
  buildStatus: BuildStatus
  basePath: string
  theme: { css?: string }
}

const DEFAULT_STATE: ScribouilliState = {
  conflict: undefined,
  repos: [],
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
  if (localStorage) {
    state.basePath = location.hostname.endsWith('.github.io') ? '/scribouilli' : ''
  }
  return state
}

export const state = $state(loadState())


export function logout() {
  storage.deleteProvider()

  // account-related
  state.provider = undefined
  state.login = undefined
  state.email = undefined
  state.repos = undefined

  // repo-related
  state.pages = undefined
  state.articles = undefined
  state.currentRepository = undefined
  state.conflict = undefined
}
