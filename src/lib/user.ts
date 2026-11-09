import { goto } from '$app/navigation'

import { getOAuthServiceAPI } from './providers'
import type { MinimalGitRepository } from './providers'
import * as store from './store.svelte'
import { logMessage } from './logger'
import { makeAtelierListPageURL, makeUrlParam } from './urls'
import type { ResolutionOption } from './git/agent'
import { resolve } from '$app/paths'

const logout = () => {
  store.logout()
  console.info('[logout] redirecting to /login')
  goto(resolve('/'))
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
export const fetchAuthenticatedUserLogin = (): Promise<{
  login: string
  email: string
}> => {
  const loginP = getOAuthServiceAPI()
    .getAuthenticatedUser()
    .then(({ login = '' }) => {
      if (login === '') {
        throw new Error('NO_LOGIN')
      }

      store.state.login = login

      return login
    })
    // @ts-ignore
    .catch(errorMessage => {
      switch (errorMessage) {
        case 'INVALIDATE_TOKEN':
        case 'NO_LOGIN': {
          logout()
          break
        }

        default:
          const message = `The access token is invalid. ${errorMessage}`

          logMessage(message, 'fetchAuthenticatedUserLogin')
      }

      throw errorMessage
    })

  const emailP = getOAuthServiceAPI()
    .getUserEmails()
    // @ts-ignore
    .then(emails => {
      // @ts-ignore
      const email = (emails.find(e => e.primary) ?? emails[0]).email
      store.state.email = email
      return email
    })
    // @ts-ignore
    .catch(err => {
      // If we can't get email addresses, we ask the user to login again
      logout()
      throw err
    })

  return Promise.all([loginP, emailP]).then(([login, email]) => ({
    login,
    email,
  }))
}

/**
 * @summary Fetch the list of repositories for the current user and set it in
 * the store.
 *
 * @description This function is called on every page that needs the list of
 * repositories for the current user. It returns a promise that resolves to the
 * list of repositories. If the user is not logged in, it redirects to the
 * authentication page.
 *
 * @returns A promise that resolves to the list of repositories for the current
 * user.
 */
export const fetchCurrentUserRepositories = async () => {
  const { login } = await fetchAuthenticatedUserLogin()
  const currentUserRepositoriesP = getOAuthServiceAPI()
    .getCurrentUserRepositories()
    // @ts-ignore
    .then(repos => {
      store.setReposForAccount({ login, repos })

      return repos
    })

  return currentUserRepositoriesP
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
    goto(resolve('/atelier/creer-nouveau-site'))
  } else if (repos.length === 1) {
    const repoPath = repos[0].repoPath
    const account = repos[0].owner

    goto(makeUrlParam('/atelier/pages', account, repoPath))
  } else {
    goto('/atelier/selectionner-site')
  }
}
