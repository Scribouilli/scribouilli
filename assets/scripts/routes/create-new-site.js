import { svelteTarget } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import CreateNewSite from '../components/screens/CreateNewSite.svelte'
import { fetchAuthenticatedUserLogin } from '../actions/current-user.js'

export default () => {
  fetchAuthenticatedUserLogin()

  const createNewSite = new CreateNewSite({
    target: svelteTarget,
    props: {},
  })

  replaceComponent(createNewSite, () => {})
}
