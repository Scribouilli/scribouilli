//@ts-check

import page from "page";

import store from "../store.js";
import { logError } from "../utils.js";
import { fetchCurrentUserRepositories } from "../actions.js";
import { svelteTarget } from "../config.js";
import { replaceComponent } from "../routeComponentLifeCycle.js";

import Welcome from "../components/screens/Welcome.svelte";

export default () => {
  let props = {};

  if (!!store.state.accessToken) {
    fetchCurrentUserRepositories()
      .then((repos) => {
        if (repos.length === 1) {
            const repoName = repos[0].name;
            const account = repos[0].owner;

            page(`/atelier-list-pages?repoName=${repoName}&account=${account}`);
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
  } else {
    props = {
      showWelcome: true,
    }
  }

  const welcome = new Welcome({
    target: svelteTarget,
    props,
  });

  replaceComponent(welcome, () => {});
};
