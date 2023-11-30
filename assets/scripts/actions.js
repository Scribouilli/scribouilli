//@ts-check

import page from 'page'

import gitAgent from './gitAgent.js'
import { getOAuthServiceAPI } from './oauth-services-api/index.js'
import store from './store.js'
import makeBuildStatus from './buildStatus.js'
import { handleErrors, logMessage, delay } from './utils'

const logout = () => {
  store.mutations.setLogin(undefined)
  store.mutations.invalidateToken()
  store.mutations.removeSite()
  console.info('[logout] redirecting to /login')
  page('/login')
}

/**
 * @summary Fetch the current authenticated user login and set it in the store.
 *
 * @description This function is called on every page that needs authentication.
 * It returns the login of the user or the organization. If the user is not
 * logged in, it redirects to the authentication page.
 *
 * @returns {Promise<{login: string, email: string}>} A promise that resolves to the login of the
 * authenticated user or organization.
 *
 */
export const fetchAuthenticatedUserLogin = () => {
  const loginP = getOAuthServiceAPI()
    .getAuthenticatedUser()
    .then(({ login = '' }) => {
      if (login === '') {
        throw new Error('NO_LOGIN')
      }

      store.mutations.setLogin(login)

      return login
    })
    // @ts-ignore
    .catch(errorMessage => {
      switch (errorMessage) {
        case 'INVALIDATE_TOKEN': {
          store.mutations.invalidateToken()
          console.info('[token error] redirecting to /account')
          page('/account')

          break
        }

        case 'NO_LOGIN': {
          logout()

          page('/account')
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
      store.mutations.setEmail(email)
      return email
    })
    // @ts-ignore
    .catch(err => {
      // If we can't get email addresses, we ask the user to login again
      logout()
      throw err
    })

  store.mutations.setLogin(loginP)

  return Promise.all([loginP, emailP]).then(([login, email]) => ({
    login,
    email,
  }))
}

/**
 * @summary Fetch the list of repositories for the current user
 * and set it in the store.
 *
 * @description This function is called on every page that needs the list of
 * repositories for the current user. It returns a promise that resolves to the
 * list of repositories. If the user is not logged in, it redirects to the
 * authentication page.
 *
 * @returns A promise that resolves to the list of
 * repositories for the current user.
 *
 */

export const fetchCurrentUserRepositories = async () => {
  const { login } = await fetchAuthenticatedUserLogin()
  const currentUserRepositoriesP = getOAuthServiceAPI()
    .getCurrentUserRepositories()
    // @ts-ignore
    .then(repos => {
      store.mutations.setReposForAccount({ login, repos })

      return repos
    })

  return currentUserRepositoriesP
}

export const getCurrentRepoPages = () => {
  const { owner, name } = store.state.currentRepository

  return gitAgent
    .getPagesList(owner, name)
    .then(pages => {
      store.mutations.setPages(pages)
    })
    .catch(msg => handleErrors(msg))
}

export const getCurrentRepoArticles = () => {
  const { owner, name } = store.state.currentRepository

  return gitAgent
    .getArticlesList(owner, name)
    .then(articles => {
      store.mutations.setArticles(articles)
    })
    .catch(msg => handleErrors(msg))
}

/**
 * @summary Set the current repository from the owner and the name
 * of the repository in the URL
 *
 * @description This function is called on every page that needs a current
 * repository to be functionnal. It sets the current repository in the store,
 * but also the build status and the site repo config. If the user is not
 * logged in, it redirects to the authentication page.
 *
 * @param {string} querystring
 * @returns {Promise<void>}
 */
export const setCurrentRepositoryFromQuerystring = async querystring => {
  const params = new URLSearchParams(querystring)
  const repoName = params.get('repoName')
  const owner = params.get('account')

  if (!repoName || !owner) {
    const message = !repoName
      ? `Missing parameter 'repoName' in URL`
      : `Missing parameter 'account' in URL`

    console.info('[missing URL param] redirecting to /', message)
    page('/')
    throw new Error(message)
  }

  const currentRepository = {
    name: repoName,
    owner,
    publishedWebsiteURL: `${owner.toLowerCase()}.github.io/${repoName.toLowerCase()}`,
    repositoryURL: `https://github.com/${owner}/${repoName}`,
  }

  store.mutations.setCurrentRepository(currentRepository)

  const { login, email } = await fetchAuthenticatedUserLogin()

  await gitAgent.pullOrCloneRepo(login, repoName)
  await gitAgent.setAuthor(login, owner, repoName, email)

  setBuildStatus(owner, repoName)
  getCurrentRepoArticles()
}

/**
 *
 * @param {string} owner
 * @param {string} repoName
 */
export const setBuildStatus = (owner, repoName) => {
  store.mutations.setBuildStatus(makeBuildStatus(owner, repoName))
  /*
  Appel sans vérification,
  On suppose qu'au chargement initial,
  on peut faire confiance à ce que renvoit l'API
  */
  store.state.buildStatus.checkStatus()
}

/**
 * @summary Create a repository for the current account
 *
 * @description This function creates a repository for the current account
 * and set a GitHub Pages branch. It redirects to the
 * list of pages for the atelier.
 *
 * @param {string} repoName - The name of the repository to create
 *
 * @returns {Promise<void>} A promise that resolves when the repository
 * is created.
 *
 * @throws {string} An error message if the repository cannot be created.
 *
 */
export const createRepositoryForCurrentAccount = async repoName => {
  const login = await store.state.login

  if (!login) {
    throw new TypeError(`login manquant dans createRepositoryForCurrentAccount`)
  }

  const escapedRepoName = repoName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .toLowerCase()

  const waitRepoReady = /** @type {Promise<void>} */ (
    new Promise(resolve => {
      const timer = setInterval(() => {
        getOAuthServiceAPI()
          .isRepositoryReady(login, escapedRepoName)
          // @ts-ignore
          .then(res => {
            if (res) {
              clearInterval(timer)
              resolve()
            }
          })
      }, 1000)
    })
  )

  const waitGithubPages = /** @type {Promise<void>} */ (
    new Promise(resolve => {
      const timer = setInterval(() => {
        getOAuthServiceAPI()
          .isPagesWebsiteBuilt(login, escapedRepoName)
          // @ts-ignore
          .then(res => {
            if (res) {
              clearInterval(timer)
              resolve()
            }
          })
      }, 5000)
    })
  )
  return (
    getOAuthServiceAPI()
      .createDefaultRepository(login, escapedRepoName)
      .then(() => {
        // Generation from a template repository
        // is asynchronous, so we need to wait a bit
        // for the new repo to be created
        // before the setup of the GitHub Pages branch
        return waitRepoReady
      })
      .then(() => {
        return getOAuthServiceAPI().createPagesWebsiteFromRepository(
          login,
          escapedRepoName,
        )
      })
      .then(() => {
        return waitGithubPages
      })
      .then(() => {
        page(`/atelier-list-pages?repoName=${escapedRepoName}&account=${login}`)
      })
      // @ts-ignore
      .catch(errorMessage => {
        logMessage(errorMessage, 'createRepositoryForCurrentAccount')

        throw errorMessage
      })
  )
}
