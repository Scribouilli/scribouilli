import page from 'page'

import { svelteTarget } from "../config";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import SelectASite from '../components/SelectASite.svelte'

export default () => {
    const selectASite = new SelectASite({
      target: svelteTarget,
      props: {},
    });

    replaceComponent(selectASite, () => {});
}
