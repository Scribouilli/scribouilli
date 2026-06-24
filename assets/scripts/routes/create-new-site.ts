import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import CreateNewSite from '../components/screens/CreateNewSite.svelte'
import { fetchAuthenticatedUserLogin } from '../actions/current-user.ts'

export default () => {
  fetchAuthenticatedUserLogin()
  replaceComponent(CreateNewSite, () => ({}))
}
