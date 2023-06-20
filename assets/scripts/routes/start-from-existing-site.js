import page from 'page'

import store from "../store.js";
import {
  getCurrentUserRepositories,
  fetchAuthenticatedUserLogin,
} from "../actions.js"
import { svelteTarget } from "../config.js";
import { replaceComponent } from "../routeComponentLifeCycle.js";
import SelectCurrentSite from '../components/SelectCurrentSite.svelte'

const mapStateToProps = (state) => {
    const { login, reposByAccount } = state;

    return {
      currentAccount: login,
      currentAccountRepositories: reposByAccount[login],
    };
}

export default () => {
    fetchAuthenticatedUserLogin()
    getCurrentUserRepositories()

    const selectCurrentSite = new SelectCurrentSite({
        target: svelteTarget,
        props: mapStateToProps(store.state),
    });

    replaceComponent(selectCurrentSite, mapStateToProps);
}
