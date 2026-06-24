import {
  fetchCurrentUserRepositories,
  fetchAuthenticatedUserLogin,
} from '../actions/current-user.js'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.js'
import SelectCurrentSite from '../components/screens/SelectCurrentSite.svelte'
import type { ScribouilliState } from '../store.js'

const mapStateToProps = (state: ScribouilliState) => {
  const { login, reposByAccount } = state

  return {
    currentAccount: login,
    // @ts-ignore
    currentAccountRepositories: reposByAccount[login],
  }
}

export default () => {
  fetchAuthenticatedUserLogin()
  fetchCurrentUserRepositories()

  replaceComponent(SelectCurrentSite, mapStateToProps)
}
