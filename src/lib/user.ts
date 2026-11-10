import { goto } from '$app/navigation'

import type { MinimalGitRepository, ScribouilliBackendProvider } from './providers'
import * as store from './store.svelte'
import { makeAtelierListPageURL, makeUrlParam } from './urls'
import type { ResolutionOption } from './git/agent'
import { resolve } from '$app/paths'

export const logout = () => {
  store.logout()
  console.info('[logout] redirecting to /login')
  goto(resolve('/'))
}

export interface User {
  login: string,
  email: string
}

/**
 * @summary Fetch the current authenticated user login and set it in the store.
 *
 * @description This function is called on every page that needs authentication.
 * It returns the login of the user or the organization. If the user is not
 * logged in, it redirects to the authentication page.
 *
 * @returns A promise that resolves to the login of the authenticated user or
 * organization.
 *
 */
export const fetchUser = async (provider: ScribouilliBackendProvider): Promise<User> => {
  const loginP = provider.api.getAuthenticatedUser()
  const emailP = provider.api.getUserEmails()
    .then(emails => {
      const email = (emails.find(e => e.primary) ?? emails[0]).email
      return email
    })

  const user = await Promise.all([loginP, emailP])
    .then(([login, email]) => ({
      login,
      email,
    }))
  return user
}


export function sortRepositories(repos: MinimalGitRepository[], login: string | undefined) {
  return repos
    // on place ses propres dépôts avant les dépôts des autres
    .sort((a, b) => {
      if (login && typeof login === 'string') {
        if (a.owner === undefined || b.owner === undefined || a.owner == b.owner) {
          return a.repoPath.localeCompare(b.repoPath)
        } else if (a.owner === login) {
          return -1
        } else if (b.owner === login) {
          return 1
        } else {
          return a.owner.localeCompare(b.owner)
        }
      }

      return 0
    })
}

export function addConflictRemovalAndRedirectToResolution(
  resolution: ResolutionOption['resolution'],
): ResolutionOption['resolution'] {
  return async function() {
    await resolution()
    store.state.conflict = undefined
    // TODO: navigate to previous page
    if (store.state.currentRepository) {
      goto(makeAtelierListPageURL(store.state.currentRepository))
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
