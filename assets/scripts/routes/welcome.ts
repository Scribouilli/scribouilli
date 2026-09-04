import page from 'page'

import store from '../store.ts'
import { fetchCurrentUserRepositories } from '../actions/current-user.ts'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.ts'

import Welcome from '../components/screens/Welcome.svelte'
import { makeUrlParam } from './urls.ts'

export default () => {
  let props = {}

  if (store.state.oAuthProvider) {
    props = {
      isFetchingCurrentUserRepos: true,
    }

    fetchCurrentUserRepositories().then(repos => {
      if (repos.length === 1) {
        const repoName = repos[0].repoName
        const account = repos[0].owner

        page(makeUrlParam('/atelier-list-pages', account, repoName))
      } else {
        store.mutations.setReposForAccount({
          // @ts-ignore
          login: store.state.login,
          repos,
        })

        page.redirect('/selectionner-un-site')
      }
    })
  } else {
    props = {
      showWelcome: true,
    }
  }

  replaceComponent(Welcome, () => {
    return props
  })
}
