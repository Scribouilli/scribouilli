// c'est le store qui est chargé dans les tests via hooks.ts

import Store, { type BareduxStore } from 'baredux'
import type { ScribouilliState } from '../assets/scripts/store'
import * as sinon from 'sinon'
import GitAgent from '../assets/scripts/GitAgent.ts'
// @ts-ignore Le ?no-fake permet de charger le vrai store (dont on veut
// réutiliser les mutations) sans que le resolver dans `hook.ts` tente de
// charger ce fichier (`fake-store.ts`) à nouveau. En pratique, ce bout est
// ignoré par le resolver fournit par Node.js, et donc ça charge vraiment le
// fichier `store.ts`.
import { mutations } from '../assets/scripts/store.ts?no-fake'

const gitAgentFunctions: (keyof GitAgent)[] = [
  'branch',
  'checkFileExistence',
  'checkout',
  'clone',
  'commit',
  'currentBranch',
  'currentCommit',
  'falliblePush',
  'fetch',
  'fetchAndTryMerging',
  'forcePush',
  'getFile',
  'listBranches',
  'listFiles',
  'listRemotes',
  'pullOrCloneRepo',
  'removeFile',
  'safePush',
  'setAuthor',
  'tryMerging',
  'writeFile',
]

for (const func of gitAgentFunctions) {
  sinon.stub(GitAgent.prototype, func)
}

const MON_PETIT_SITE = {
  origin: 'https://github.com',
  owner: 'utilisateurice',
  publicRepositoryURL: 'https://github.com/utilisateurice/mon-petit-site',
  repoName: 'mon-petit-site',
  publishedWebsiteURL: Promise.resolve(
    'https://utilisateurice.github.io/mon-petit-site',
  ),
  repoId: 'utilisateurice-mon-petit-site',
}

const state: ScribouilliState = {
  oAuthProvider: {
    name: 'GitHub',
    accessToken: 'top-secret',
    origin: 'https://github.com',
  },
  login: 'utilisateurice',
  email: 'utilisateurice@courriel.fr',
  currentRepository: MON_PETIT_SITE,
  gitAgent: new GitAgent({
    auth: {},
    remoteURL: 'https://github.com',
    repoId: MON_PETIT_SITE.repoId,
  }),
  conflict: undefined,
  reposByAccount: {
    utilisateurice: Promise.resolve([MON_PETIT_SITE]),
  },
  pages: [
    {
      index: 1,
      path: 'index.md',
      title: 'Accueil',
    },
  ],
  articles: undefined,
  buildStatus: 'in_progress',
  basePath: '',
  theme: {
    css: undefined,
  },
}

type ScribouilliMutations = typeof mutations

const store: BareduxStore<ScribouilliState, ScribouilliMutations> = Store({
  state,
  mutations,
})

export default store
