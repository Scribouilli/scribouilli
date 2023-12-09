import page from 'page'

import { svelteTarget } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import store from '../store'
import ChooseSiteTemplate from '../components/screens/ChooseSiteTemplate.svelte'
import { fetchAuthenticatedUserLogin } from '../actions/current-user.js'
export default () => {
  fetchAuthenticatedUserLogin()

  const chooseSiteTemplate = new ChooseSiteTemplate({
    target: svelteTarget,
    props: {},
  })

  replaceComponent(chooseSiteTemplate, () => {})
}
