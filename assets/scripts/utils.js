//@ts-check

import page from 'page'

import databaseAPI from './databaseAPI.js'
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

export async function makeOrigin(state) {
  const login = await Promise.resolve(state.login);
  return `${login.toLowerCase()}.github.io`;
}

export async function makePublishedWebsiteURL(state) {
  const origin = await makeOrigin(state);
  return `https://${origin}/${state.repoName}`;
}

export async function makeRepositoryURL(state) {
  const login = await Promise.resolve(state.login);
  return `https://github.com/${login}/${state.repoName}`;
}

export function makeFileNameFromTitle(title) {
  const fileName =
    title
      .replace(/\/|#|\?/g, "-") // replace url confusing characters
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accent because GH pages triggers file download
      .split(".")
      .join("") // Remove dot to avoid issues
      .toLowerCase() + ".md";

  return fileName;
}

export function makeFrontMatterYAMLJsaisPasQuoiLa(title) {
  return ["---", "title: " + title, "---"].join("\n");
}