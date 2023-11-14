//@ts-check

// @ts-ignore
import Store from 'baredux'
import 'types.js'

import {
  ACCESS_TOKEN_STORAGE_KEY,
  TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
} from './config.js'

/**
 * @typedef {Object} CurrentRepository
 * @property {string} owner
 * @property {string} name
 * @property {string} repositoryURL
 * @property {string} publishedWebsiteURL
 */

/** @typedef {any} Page */
/** @typedef {any} Article */
/** @typedef {any} BuildStatus */
/** @typedef {any} Repo */


/**
 * @typedef {Object} ScribouilliState
 * @property {string} [accessToken]
 * @property {Promise<string> | string} [login]
 * @property {string} [email]
 * @property {Promise<string> | string} [origin]
 * @property {CurrentRepository} currentRepository
 * @property {any} reposByAccount
 * @property {Page[]} [pages]
 * @property {Article[]} [articles]
 * @property {BuildStatus} buildStatus
 * @property {string} basePath
 * @property {{css?: string}} theme
 */

/** @type {ScribouilliState} */
const state = {
  // @ts-ignore
  accessToken:
    new URL(location.toString()).searchParams.get(
      TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
    ) || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
  login: undefined,
  email: undefined,
  origin: undefined,
  currentRepository: {
    // @ts-ignore
    name: undefined,
    // @ts-ignore
    owner: undefined,
    // @ts-ignore
    publishedWebsiteURL: undefined,
    // @ts-ignore
    repositoryURL: undefined,
  },
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
  }
}

/**
 * @typedef {import('baredux').BareduxInputMutations<ScribouilliState>} ScribouilliInputMutations
 * @property {(s: ScribouilliState, login: string)} setLogin
 * @property {(s: ScribouilliState, email: string)} setEmail
 * @property {(s: ScribouilliState, repository: CurrentRepository)} setCurrentRepository
 * @property {(s: ScribouilliState, pages: Page[])} setPages
 * @property {(s: ScribouilliState, Article: Page[])} setArticles
 * @property {(s: ScribouilliState, buildStatus: BuildStatus)} setBuildStatus
 * @property {(s: ScribouilliState, { login: string, repos: Repo[] })} setReposForAccount
 * @property {(s: ScribouilliState, css: string)} setTheme
 * @property {(s: ScribouilliState)} removeSite
 * @property {(s: ScribouilliState)} invalidateToken
 */

/** @type {ScribouilliInputMutations} */
const mutations = {
  /**
   * @param {string} login 
   */
  setLogin(state, login) {
    state.login = login
  },
  /**
   * @param {string} email
   */
  setEmail(state, email) {
    state.email = email
  },
  /**
   * @param {CurrentRepository} repository
   */
  setCurrentRepository(state, repository) {
    state.currentRepository = repository
  },
  /**
   * @param {Page[]} pages
   */
  setPages(state, pages) {
    state.pages = pages.sort((pageA, pageB) => {
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
   * @param {Article[]} articles
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
   * @param {BuildStatus} buildStatus
   */
  setBuildStatus(state, buildStatus) {
    state.buildStatus = buildStatus
  },
  /**
   * @param {ScribouilliState} state
   * @param {{ login: string, repos: any[] }} _
   */
  setReposForAccount(state, { login, repos }) {
    // on place ses propres dépôts avant les dépôts des autres
    state.reposByAccount[login] = repos
      // @ts-ignore
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
   * @param {string} css
   */
  setTheme(state, css) {
    state.theme.css = css
  },
  removeSite(state) {
    state.pages = undefined
    state.articles = undefined
  },
  invalidateToken(state) {
    state.accessToken = undefined
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    console.log('Token has been invalidated')
  },
}

/** @type { import('baredux').BareduxStore<ScribouilliState, ScribouilliInputMutations> } */
const store = Store({ state, mutations })

export default store
