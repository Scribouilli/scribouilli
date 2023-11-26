import gitHelper from './../gitHelper'
import { getOAuthServiceAPI } from './../oauth-services-api/index.js'

/**
 * @summary Delete a repository from the local indexedDB and from the OAuth service
 *
 * @param {string} account - The account name
 * @param {string} repositoryName - The repository name
 *
 * @return {Promise<any>} - A promise that resolves when the repository has been deleted
 */
export const deleteRepository = (account, repositoryName) => {
  return gitHelper.deleteRepository(account, repositoryName).then(() => {
    return getOAuthServiceAPI().deleteRepository(account, repositoryName)
  })
}
