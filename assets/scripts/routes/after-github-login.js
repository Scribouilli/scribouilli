// @ts-check

import page from 'page'

import { svelteTarget, defaultRepositoryName } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import store from '../store'
import AfterGithubLogin from '../components/screens/AfterGithubLogin.svelte'
import {
  fetchCurrentUserRepositories,
  createRepositoryForCurrentAccount,
} from '../actions.js'

export default () => {
  const currentUserReposP = fetchCurrentUserRepositories().then(repos => {
    if (repos.length === 0) {
      // If the user has no repository, we automatically create one for them.
      createRepositoryForCurrentAccount(defaultRepositoryName)
    } else {
      store.mutations.setReposForAccount({
        login: store.state.login,
        repos,
      })

      page.redirect('/selectionner-un-site')
    }
  })

  const afterGithubLogin = new AfterGithubLogin({
    target: svelteTarget,
    props: {
      currentUserReposP,
    },
  })

  replaceComponent(afterGithubLogin, () => {})
}
