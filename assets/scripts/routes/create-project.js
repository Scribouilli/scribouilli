// @ts-check

import page from "page";

import { svelteTarget } from "../config";
import makeCreateProjectButtonListener from "../makeCreateProjectButtonListener";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import { makeOrigin, makePublishedWebsiteURL } from "../utils";
import CreateProject from "../components/screens/CreateProject.svelte";

function mapStateToProps(state) {
  return {
    publishedWebsiteURL: makePublishedWebsiteURL(state),
    siteRepoConfig: state.siteRepoConfig,
    createProject: Promise.all([
      Promise.resolve(state.login),
      makeOrigin(state),
    ]).then(([login, origin]) =>
      makeCreateProjectButtonListener(
        state.accessToken,
        login,
        origin,
        state.repoName,
        state.buildStatus
      )
    ),
  };
}

export default () => {
  Promise.resolve(store.state.siteRepoConfig).then((repo) => {
    if (repo) {
      page.redirect("/atelier-list-pages");
    }
  });

  const createProject = new CreateProject({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  replaceComponent(createProject, mapStateToProps);
};
