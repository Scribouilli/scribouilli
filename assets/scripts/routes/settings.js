// @ts-check

import { svelteTarget } from "../config";
import databaseAPI from '../databaseAPI'
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import { checkRepositoryAvailabilityThen, handleErrors, makePublishedWebsiteURL, makeRepositoryURL } from "../utils";
import Settings from "../components/Settings.svelte";

function mapStateToProps(state) {
  return {
    publishedWebsiteURL: makePublishedWebsiteURL(state),
    buildStatus: state.buildStatus,
    theme: state.theme,
    deleteRepositoryUrl: `https://github.com/${state.login}/${state.repoName}/settings#danger-zone`,
    repositoryURL: makeRepositoryURL(state),
  };
}

export default () => {
    Promise.resolve(store.state.login).then(async (login) => {
      return checkRepositoryAvailabilityThen(
        login,
        store.state.repoName,
        () => {}
      );
    });
  
    const settings = new Settings({
      target: svelteTarget,
      props: mapStateToProps(store.state),
    });
  
    settings.$on("delete-site", () => {
      Promise.resolve(store.state.login).then((login) => {
        databaseAPI
          .deleteRepository(login, store.state.repoName)
          .then(() => {
            store.mutations.removeSite(store.state);
            page("/create-project");
          })
          .catch((msg) => handleErrors(msg));
      });
    });
  
    settings.$on("update-theme", ({ detail: { theme } }) => {
      Promise.resolve(store.state.login).then((login) => {
        databaseAPI
          .updateCustomCSS(login, store.state.repoName, theme.css, theme.sha)
          .then((response) => {
            store.mutations.setTheme(store.state.theme.css, response.content.sha);
            store.state.buildStatus.setBuildingAndCheckStatusLater(10000);
          })
          .catch((msg) => handleErrors(msg));
      });
    });
  
    if (!store.state.theme.sha) {
      Promise.resolve(store.state.login).then((login) => {
        databaseAPI
          .getFile(login, store.state.repoName, databaseAPI.customCSSPath)
          .then(({ content, sha }) => {
            store.mutations.setTheme(
              Buffer.from(content, "base64").toString().trim(),
              sha
            );
          })
          .catch((msg) => handleErrors(msg));
      });
    }
  
    replaceComponent(settings, mapStateToProps);
}