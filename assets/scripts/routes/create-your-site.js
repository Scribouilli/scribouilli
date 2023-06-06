import page from 'page'

import { svelteTarget } from "../config";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import CreateYourSite from '../components/CreateYourSite.svelte'

export default () => {
    const createYourSite = new CreateYourSite({
      target: svelteTarget,
      props: {},
    });

    replaceComponent(createYourSite, () => {});
}
