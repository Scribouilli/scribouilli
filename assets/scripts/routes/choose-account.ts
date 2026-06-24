import ChooseAccount from '../components/screens/ChooseAccount.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.js'

export default () => {
  replaceComponent(ChooseAccount, () => ({}))
}
