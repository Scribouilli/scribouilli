import {
  fetchCurrentUserRepositories,
  fetchAuthenticatedUserLogin,
} from '../actions/current-user.ts'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.ts'
import SelectCurrentSite from '../components/screens/SelectCurrentSite.svelte'
import type { ScribouilliState } from '../store.ts'

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
