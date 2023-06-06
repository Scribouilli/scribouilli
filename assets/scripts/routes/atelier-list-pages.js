// @ts-check

import { svelteTarget } from "../config";
import databaseAPI from "../databaseAPI";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import { checkRepositoryAvailabilityThen, handleErrors, makePublishedWebsiteURL, makeRepositoryURL } from "../utils";
import AtelierPages from "../components/AtelierPages.svelte";

export default () => {
    Promise.resolve(store.state.login).then(async (login) => {
      return checkRepositoryAvailabilityThen(
        login,
        store.state.repoName,
        () => {}
      );
    });
  
    function mapStateToProps(state) {
      return {
        publishedWebsiteURL: makePublishedWebsiteURL(state),
        pages: state.pages,
        buildStatus: state.buildStatus,
        repositoryURL: makeRepositoryURL(state),
      };
    }
  
    const state = store.state;
  
    // @ts-ignore
    const atelierPages = new AtelierPages({
      target: svelteTarget,
      props: mapStateToProps(state),
    });
    replaceComponent(atelierPages, mapStateToProps);
  
    Promise.resolve(state.login).then((login) => {
      databaseAPI
        .getPagesList(login, state.repoName)
        .then((pages) => {
          store.mutations.setPages(pages);
        })
        .catch((msg) => handleErrors(msg));
    });
}