import Store, { type BareduxStore } from 'baredux'
import GitAgent from './GitAgent.ts'
import ScribouilliGitRepo from './scribouilliGitRepo.ts'
import type { Page, Article } from './types/atelier.ts'
import type { BuildStatus } from './types/git.ts'
/**
 * Un store baredux a pour vocation de refléter notamment le modèle mental de la
 * personne face à Scribouilli. Le store stocke donc principalement des données (et parfois des singletons)
 * Il stocke aussi parfois des promesses pour permettre d'afficher des loaders
 *
 * Dans un store Baredux, les mutations sont synchrones
 * S'il manque des informations, attendre la résolution de la promesse avant d'appeler une mutation
 * (à moins que la valeur soit délibérément une promesse)
 *
 */
// DO NOT import x from 'remember' // do it in an action instead
// DO NOT import x from './actions/*.ts' // you're making an action, so add an action instead

export interface ResolutionOption {
  message: string
  resolution: (...args: any[]) => Promise<any>
}

export interface OAuthProvider {
  name: string
  accessToken: string
  origin: string
}

export interface ScribouilliState {
  oAuthProvider?: OAuthProvider
  login?: Promise<string> | string
  email?: string
  currentRepository: ScribouilliGitRepo | undefined
  gitAgent: GitAgent | undefined
  conflict: ResolutionOption[] | undefined
  reposByAccount: any
  pages?: Page[]
  articles?: Article[]
  buildStatus: BuildStatus
  basePath: string
  theme: { css?: string }
}

const state: ScribouilliState = {
  oAuthProvider: undefined,
  login: undefined,
  email: undefined,
  currentRepository: undefined,
  gitAgent: undefined,
  conflict: undefined,
  // We use the term "account" to refer to user or organization.
  reposByAccount: {
    // [login: string]: Promise<Repository[]>
  },
  pages: [],
  articles: undefined,
  buildStatus: 'in_progress',
  basePath: location.hostname.endsWith('.github.io') ? '/scribouilli' : '',
  theme: {
    css: undefined,
  },
}

const mutations = {
  setOAuthProvider(
    state: ScribouilliState,
    oAuthProvider: ScribouilliState['oAuthProvider'],
  ) {
    state.oAuthProvider = oAuthProvider
  },

  setLogin(state: ScribouilliState, login: ScribouilliState['login']) {
    state.login = login
  },

  setEmail(state: ScribouilliState, email: ScribouilliState['email']) {
    state.email = email
  },

  setCurrentRepository(
    state: ScribouilliState,
    repository: ScribouilliState['currentRepository'],
  ) {
    state.currentRepository = repository
  },

  setGitAgent(state: ScribouilliState, gitAgent: ScribouilliState['gitAgent']) {
    state.gitAgent = gitAgent
  },

  setPages(state: ScribouilliState, pages: ScribouilliState['pages']) {
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

  setConflict(state: ScribouilliState, conflict: ScribouilliState['conflict']) {
    state.conflict = conflict
  },

  setArticles(state: ScribouilliState, articles: ScribouilliState['articles']) {
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
  },

  setBuildStatus(state: ScribouilliState, buildStatus: BuildStatus) {
    state.buildStatus = buildStatus
  },

  setReposForAccount(
    state: ScribouilliState,
    { login, repos }: { login: string; repos: any[] },
  ) {
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

  setTheme(state: ScribouilliState, css: ScribouilliState['theme']['css']) {
    state.theme.css = css
  },

  logout(state: ScribouilliState) {
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
  },
}

type ScribouilliMutations = typeof mutations

const store: BareduxStore<ScribouilliState, ScribouilliMutations> = Store({
  state,
  mutations,
})

type PartialMutations<State, Mutations extends keyof ScribouilliMutations> = {
  [mutation in Mutations]: (state: State, ...others: any[]) => void | State
}

export type PartialStore<
  S extends keyof ScribouilliState = keyof ScribouilliState,
  M extends keyof ScribouilliMutations = keyof ScribouilliMutations,
> = BareduxStore<
  Pick<ScribouilliState, S>,
  PartialMutations<Pick<ScribouilliState, S>, M>
>

export default store
