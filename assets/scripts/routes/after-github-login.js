// @ts-check

import page from 'page'

import { svelteTarget } from "../config";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import AfterGithubLogin from '../components/AfterGithubLogin.svelte'
import { getCurrentUserRepositories } from '../actions.js'

export default () => {
    getCurrentUserRepositories().then((repos) => {
      if (repos.length === 0) {
        // redirect to create default repo
      } else {
        store.mutations.setReposForAccount(
          {
            login: store.state.login,
            repos
          }
        );

        page.redirect("/selectionner-un-site");
      }
    })

    const afterGithubLogin = new AfterGithubLogin({
      target: svelteTarget,
      props: {}
    });

    replaceComponent(afterGithubLogin, () => {});
}
