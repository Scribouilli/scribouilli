import { goto } from '$app/navigation'

import type { MinimalGitRepository } from './providers'
import { makeAtelierListPageURL, makeUrlParam } from './urls'
import type { ResolutionOption } from './git/agent'
import { resolve } from '$app/paths'
import { getAtelier } from './atelier/index.svelte'

export const logout = () => {
  const atelier = getAtelier()
  console.info('[logout] redirecting to /login')
  atelier.logout()
  goto(resolve('/'))
}

export interface User {
  login: string,
  email: string
}

export function addConflictRemovalAndRedirectToResolution(
  resolution: ResolutionOption['resolution'],
): ResolutionOption['resolution'] {
  return async function() {
    await resolution()
    const atelier = getAtelier()
    atelier.repo.conflicts = undefined
    // TODO: navigate to previous page
    if (atelier.repo.status !== 'not-intitialized') {
      goto(makeAtelierListPageURL(atelier.repo))
    }
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
