//@ts-check

// @ts-ignore
import Store from 'baredux'
import { forget } from 'remember'
import './types.js'

import { OAUTH_PROVIDER_STORAGE_KEY } from './config.js'
import ScribouilliGitRepo from './scribouilliGitRepo.js'

/** @typedef { {message: string, resolution: (...args: any[]) => Promise<any>} } ResolutionOption */

/**
 * @typedef {Object} OAuthProvider
 * @property {string} name
 * @property {string} accessToken
 * @property {string} origin
 */

/**
 * @typedef {Object} ScribouilliState
 * @property {OAuthProvider} [oAuthProvider]
 * @property {Promise<string> | string} [login]
 * @property {string} [email]
 * @property {Promise<string> | string} [origin]
 * @property {ScribouilliGitRepo | undefined} currentRepository
 * @property {ResolutionOption[] | undefined} conflict
 * @property {any} reposByAccount
 * @property {Page[]} [pages]
 * @property {Article[]} [articles]
 * @property {any} buildStatus
 * @property {string} basePath
 * @property {{css?: string}} theme
 */

/** @type {ScribouilliState} */
const state = {
  // @ts-ignore
  oAuthProvider: undefined,
  login: undefined,
  email: undefined,
  origin: undefined,
  currentRepository: undefined,
  conflict: undefined,
  // We use the term "account" to refer to user or organization.
  reposByAccount: {
    // [login: string]: Promise<Repository[]>
  },
  pages: [],
  articles: undefined,
  buildStatus: undefined,
  basePath: location.hostname.endsWith('.github.io') ? '/scribouilli' : '',
  theme: {
    css: undefined,
  },
}

const mutations = {
  /**
   * @param {ScribouilliState} state
   * @param {ScribouilliState['oAuthProvider']} oAuthProvider
   */
  setOAuthProvider(state, oAuthProvider) {
    state.oAuthProvider = oAuthProvider
  },
  /**
   *
   * @param {ScribouilliState} state
   * @param {ScribouilliState['login']} login
   */
  setLogin(state, login) {
    state.login = login
  },
  /**
   *
   * @param {ScribouilliState} state
   * @param {ScribouilliState['email']} email
   */
  setEmail(state, email) {
    state.email = email
  },
  /**
   *
   * @param {ScribouilliState} state
   * @param {ScribouilliState['currentRepository']} repository
   */
  setCurrentRepository(state, repository) {
    state.currentRepository = repository
  },
  /**
   *
   * @param {ScribouilliState} state
   * @param {ScribouilliState['pages']} pages
   */
  setPages(state, pages) {
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
  },
  /**
   *
   * @param {ScribouilliState} state
   * @param {ScribouilliState['conflict']} conflict
   */
  setConflict(state, conflict) {
    state.conflict = conflict
  },
  /**
   *
   * @param {ScribouilliState} state
   * @param {ScribouilliState['articles']} articles
   */
  setArticles(state, articles) {
    state.articles = articles?.sort((pageA, pageB) => {
      if (pageA.path < pageB.path) {
        return -1
      }
      if (pageA.path > pageB.path) {
        return 1
      }

      // pageA.path === pageB.path
      return 0
    })
  },
  /**
   *
   * @param {ScribouilliState} state
   * @param {any} buildStatus
   */
  setBuildStatus(state, buildStatus) {
    state.buildStatus = buildStatus
  },
  /**
   * @param {ScribouilliState} state
   * @param {{ login: string, repos: any[] }} params
   */
  setReposForAccount(state, { login, repos }) {
    state.reposByAccount[login] = repos
      // on place ses propres dépôts avant les dépôts des autres
      .sort((a, b) => {
        if (state.login && typeof state.login === 'string') {
          if (a.owner.login != b.owner.login) {
            if (a.owner.login === state.login) {
              return -1
            } else {
              return 1
            }
          }
        }

        return 0
      })
  },
  /**
   *
   * @param {ScribouilliState} state
   * @param {ScribouilliState['theme']['css']} css
   */
  setTheme(state, css) {
    state.theme.css = css
  },
  /**
   *
   * @param {ScribouilliState} state
   */
  removeSite(state) {
    state.pages = undefined
    state.articles = undefined
  },
  /**
   *
   * @param {ScribouilliState} state
   */
  invalidateToken(state) {
    state.oAuthProvider = undefined
    forget(OAUTH_PROVIDER_STORAGE_KEY)
    console.log('Token has been invalidated')
  },
}

/** @typedef { typeof mutations } ScribouilliMutations */

/** @type { import('baredux').BareduxStore<ScribouilliState, ScribouilliMutations> } */
const store = Store({ state, mutations })

export default store
