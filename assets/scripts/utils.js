//@ts-check

import databaseAPI from "./databaseAPI.js";
import store from "./store.js";

/**
 * @summary Check the availability of a repository and redirect to project creation
 *          if it does not exist.
 * @param {string} login
 * @param {string} repoName
 * @param {*} thenCallback The callback you'll want to execute if the repository is available
 * @returns
 */
export function checkRepositoryAvailabilityThen(login, repoName, thenCallback) {
  return databaseAPI
    .getRepository(login, repoName)
    .then(thenCallback)
    .catch((msg) => handleErrors(msg));
}

/**
 * @summary Handle errors catched by Promises
 * @param {string} errorMessage
 */
export const handleErrors = (errorMessage) => {
  switch (errorMessage) {
    case "INVALIDATE_TOKEN": {
      store.mutations.invalidateToken();
      page("/account");

      break;
    }
    case "REPOSITORY_NOT_FOUND": {
      page("/create-project");

      break;
    }

    default:
      console.log(`Error catched: ${errorMessage}`);
  }
};
