//@ts-check

import store from "../store.js";
import { checkRepositoryAvailabilityThen } from "../utils.js";
import { svelteTarget } from "../config.js";
import { replaceComponent } from "../routeComponentLifeCycle.js";

import Welcome from "../components/screens/Welcome.svelte";

export default () => {
  if (store.state.login) {
    const repoName = store.state.repoName;

    Promise.resolve(store.state.login).then(async (login) => {
      return checkRepositoryAvailabilityThen(login, repoName, () => {
        page("/atelier-list-pages");
      });
    });
  }

  const welcome = new Welcome({
    target: svelteTarget,
    props: {},
  });

  replaceComponent(welcome, () => {});
};
