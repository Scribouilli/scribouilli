import { svelteTarget } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import SelectOrCreateSite from '../components/screens/SelectOrCreateSite.svelte'

export default () => {
  const selectOrCreateSite = new SelectOrCreateSite({
    target: svelteTarget,
    props: {},
  })

  replaceComponent(selectOrCreateSite, () => {})
}
