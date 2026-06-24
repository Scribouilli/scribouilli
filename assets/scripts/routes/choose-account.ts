import ChooseAccount from '../components/screens/ChooseAccount.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.ts'

export default () => {
  replaceComponent(ChooseAccount, () => ({}))
}
