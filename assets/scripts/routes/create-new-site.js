import page from 'page'

import { svelteTarget, defaultThemeRepoName } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import store from '../store'
import CreateNewSite from '../components/screens/CreateNewSite.svelte'
import { fetchAuthenticatedUserLogin } from '../actions/current-user.js'

/**
 * @param {import('page').Context} _
 */
export default ({ querystring }) => {
  fetchAuthenticatedUserLogin()

  const params = new URLSearchParams(querystring)
  const template = params.get('template') || defaultThemeRepoName

  const createNewSite = new CreateNewSite({
    target: svelteTarget,
    props: {
      template,
    },
  })

  replaceComponent(createNewSite, () => {})
}
