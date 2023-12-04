//@ts-check

import store from '../store.js'
import {
  fetchCurrentUserRepositories,
  fetchAuthenticatedUserLogin,
} from '../actions.js'
import { svelteTarget } from '../config.js'
import { replaceComponent } from '../routeComponentLifeCycle.js'
import SelectCurrentSite from '../components/screens/SelectCurrentSite.svelte'

/**
 *
 * @param {import('../store').ScribouilliState} state
 * @returns
 */
const mapStateToProps = state => {
  const { login, reposByAccount, currentRepository } = state

  return {
    currentAccount: login,
    // @ts-ignore
    currentAccountRepositories: reposByAccount[login],
    currentRepository,
  }
}

export default () => {
  fetchAuthenticatedUserLogin()
  fetchCurrentUserRepositories()

  const selectCurrentSite = new SelectCurrentSite({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(selectCurrentSite, mapStateToProps)
}
