import page from 'page'

import { svelteTarget } from "../config";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import SelectOrCreateSite from '../components/SelectOrCreateSite.svelte'

export default () => {
    const selectOrCreateSite = new SelectOrCreateSite({
      target: svelteTarget,
      props: {},
    });

    replaceComponent(selectOrCreateSite, () => {});
}
