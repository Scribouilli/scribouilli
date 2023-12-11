//@ts-check

import page from 'page'

import store from '../store.js'
import { fetchCurrentUserRepositories } from '../actions/current-user.js'
import { svelteTarget } from '../config.js'
import { replaceComponent } from '../routeComponentLifeCycle.js'

import Welcome from '../components/screens/Welcome.svelte'

export default () => {
  let props = {}

  if (store.state.oAuthProvider) {
    props = {
      isFetchingCurrentUserRepos: true,
    }

    fetchCurrentUserRepositories().then(repos => {
      if (repos.length === 1) {
        const repoName = repos[0].name
        const account = repos[0].owner.login

        page(`/atelier-list-pages?repoName=${repoName}&account=${account}`)
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

  const welcome = new Welcome({
    target: svelteTarget,
    props,
  })

  replaceComponent(welcome, () => {})
}
