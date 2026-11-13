import { goto } from '$app/navigation'

import type { MinimalGitRepository } from './providers'
import { makeAtelierListPageURL, makeUrlParam } from './urls'
import type { ResolutionOption } from './git/agent'
import { resolve } from '$app/paths'
import * as storage from './storage'
import type ScribouilliGitRepo from './atelier/repo.svelte'

export const logout = () => {
  console.info('[logout] redirecting to /login')
  storage.clear()

  goto(resolve('/')).then(() => {
    if (window) {
      // NOTE: Force refresh all states
      // Atelier.logout can’t be called from here as getAtelier needs to be called from a component initialization
      // TODO: make use of Atelier.logout to reset state (beware of lingering promises)
      window.location.reload()
    }
  })
}

export interface User {
  login: string,
  email: string
}

export function addConflictRemovalAndRedirectToResolution(
  resolution: ResolutionOption['resolution'],
  repo: ScribouilliGitRepo,
): ResolutionOption['resolution'] {
  return async function() {
    await repo.sync(
      resolution()
        .then(() => {
          repo.conflicts = undefined
          // TODO: navigate to previous page
          return goto(makeAtelierListPageURL(repo))
        })
    )
  }
}

export function redirectForRepos(repos: MinimalGitRepository[]) {
  if (repos.length === 0) {
    console.log('redirecting: creer-nouveau-site')
    goto(resolve('/atelier/creer-nouveau-site'))
  } else if (repos.length === 1) {
    const repoPath = repos[0].repoPath
    const account = repos[0].owner
    console.log('redirecting: pages')
    goto(makeUrlParam(resolve('/atelier/(site)/pages'), account, repoPath))
  } else {
    console.log('redirecting: selectionner-site')
    goto('/atelier/selectionner-site')
  }
}
