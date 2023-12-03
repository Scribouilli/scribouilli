import ScribouilliGitRepo from '../scribouilliGitRepo'
import gitAgent from './../gitAgent'
import { getOAuthServiceAPI } from './../oauth-services-api/index.js'

/**
 * @summary Delete a repository from the local indexedDB and from the OAuth service
 *
 * @param {ScribouilliGitRepo} scribouilliGitRepo
 *
 * @return {Promise<any>} - A promise that resolves when the repository has been deleted
 */
export const deleteRepository = (scribouilliGitRepo) => {
  return gitAgent.deleteRepository(scribouilliGitRepo).then(() => {
    return getOAuthServiceAPI().deleteRepository(scribouilliGitRepo)
  })
}
