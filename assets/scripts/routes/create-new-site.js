import page from 'page'

import { svelteTarget } from "../config";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import CreateNewSite from '../components/CreateNewSite.svelte'
import { getAuthenticatedUserLogin } from '../actions.js'
export default () => {
    getAuthenticatedUserLogin()

    const createNewSite = new CreateNewSite({
      target: svelteTarget,
      props: {},
    });

    replaceComponent(createNewSite, () => {});
}
