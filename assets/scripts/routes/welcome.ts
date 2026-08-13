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
        const repoPath = repos[0].path || repos[0].name // In GitHub, repository slug is defined in the name attribute. In GitLab, repository slug is defined in the path attribute and may differ from the name attribute (after renaming)
        const account = repos[0].owner.login

        page(`/atelier-list-pages?repoPath=${repoPath}&account=${account}`)
      } else {
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
