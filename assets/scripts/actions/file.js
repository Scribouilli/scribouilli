//@ts-check

import gitAgent from './../gitAgent.js'
import store from './../store.js'
import {getOAuthServiceAPI} from '../oauth-services-api/index.js'

/**
 * @param {string} fileName
 * @param {string|Uint8Array} content
 * @param {string} [commitMessage]
 *
 * @returns {Promise<string>}
 */
export const writeFileAndCommit = (fileName, content, commitMessage) => {
  if (typeof commitMessage !== 'string' || commitMessage === '') {
    commitMessage = `Modification du fichier ${fileName}`
  }
  const currentRepository = store.state.currentRepository

  if(!currentRepository){
    throw new TypeError('currentRepository is undefined')
  }

  return gitAgent.writeFile(currentRepository, fileName, content).then(() => {
    // @ts-ignore
    return gitAgent.commit(currentRepository, commitMessage)
  })
}

/**
 * @param {string} fileName
 * @param {string|Uint8Array} content
 * @param {string} [commitMessage]
 *
 * @returns {ReturnType<typeof gitAgent.safePush>}
 */
export const writeFileAndPushChanges = (
  fileName,
  content,
  commitMessage = '',
) => {
  const currentRepository = store.state.currentRepository

  if(!currentRepository){
    throw new TypeError('currentRepository is undefined')
  }

  return writeFileAndCommit(fileName, content, commitMessage).then(() =>
    gitAgent.safePush(currentRepository, getOAuthServiceAPI().getOauthUsernameAndPassword()),
  )
}

/**
 * @param {string} fileName
 * @param {string} [commitMessage]
 *
 * @returns {Promise<string>}
 */
export const deleteFileAndCommit = (fileName, commitMessage = '') => {
  const currentRepository = store.state.currentRepository

  if(!currentRepository){
    throw new TypeError('currentRepository is undefined')
  }

  if (commitMessage === '') {
    commitMessage = `Suppression du fichier ${fileName}`
  }

  return gitAgent.removeFile(currentRepository, fileName).then(() => {
    return gitAgent.commit(currentRepository, commitMessage)
  })
}

/**
 * @param {string} fileName
 * @param {string} [commitMessage]
 *
 * @returns {ReturnType<typeof gitAgent.safePush>}
 */
export const deleteFileAndPushChanges = (fileName, commitMessage) => {
  const currentRepository = store.state.currentRepository

  if(!currentRepository){
    throw new TypeError('currentRepository is undefined')
  }

  return deleteFileAndCommit(fileName, commitMessage).then(() =>
    gitAgent.safePush(currentRepository, getOAuthServiceAPI().getOauthUsernameAndPassword()),
  )
}
