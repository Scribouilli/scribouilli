import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import SelectOrCreateSite from '../components/screens/SelectOrCreateSite.svelte'

export default () => {
  replaceComponent(SelectOrCreateSite, () => {})
}
