// @ts-check

import Account from "../components/Account.svelte";
import { svelteTarget } from "../config.js";
import { replaceComponent } from "../routeComponentLifeCycle.js";

export default () => {
    const account = new Account({
      target: svelteTarget,
      props: {},
    });
  
    replaceComponent(account, () => {});
}