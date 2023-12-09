/**
 *
 * @param {ScribouilliGitRepo} scribouilliGitRepo
 * @returns {string}
 */
export function makeAtelierListPageURL({ owner, repoName }) {
  return `/atelier-list-pages?account=${owner}&repoName=${repoName}`
}
