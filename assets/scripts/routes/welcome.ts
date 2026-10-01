import page from 'page'

import store from '../store.ts'
import { fetchCurrentUserRepositories } from '../actions/current-user.ts'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.ts'

import Welcome from '../components/screens/Welcome.svelte'

export default () => {
  let props = {}

  if (store.state.oAuthProvider) {
    props = {
      isFetchingCurrentUserRepos: true,
    }

    fetchCurrentUserRepositories().then(repos => {
      if (repos.length === 1) {
        const repoPath = repos[0].path
        const account = repos[0].owner.login

        page(`/atelier-list-pages?repoPath=${repoPath}&account=${account}`)
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
