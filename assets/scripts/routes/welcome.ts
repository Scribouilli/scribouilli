import store from '../store.ts'
import { fetchCurrentUserRepositories, redirectForRepos } from '../actions/current-user.ts'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.ts'

import Welcome from '../components/screens/Welcome.svelte'

export default () => {
  let props = {}

  if (store.state.oAuthProvider) {
    props = {
      isFetchingCurrentUserRepos: true,
    }

    fetchCurrentUserRepositories().then(redirectForRepos)
  } else {
    props = {
      showWelcome: true,
    }
  }

  replaceComponent(Welcome, () => {
    return props
  })
}
