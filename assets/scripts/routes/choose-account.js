// @ts-check

import ChooseAccount from '../components/screens/ChooseAccount.svelte'
import { svelteTarget } from '../config.js'
import { replaceComponent } from '../routeComponentLifeCycle.js'

export default () => {
  const chooseAccount = new ChooseAccount({
    target: svelteTarget,
    props: {},
  })

  replaceComponent(chooseAccount, () => {})
}
