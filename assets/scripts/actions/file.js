//@ts-check

import gitAgent from './../gitAgent.js'
import store from './../store.js'
import { handleErrors } from './../utils.js'

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

  const { state } = store
  const { owner, name } = store.state.currentRepository

  return gitAgent.writeFile(owner, name, fileName, content).then(() => {
    // @ts-ignore
    return gitAgent.commit(owner, name, commitMessage)
  })
}

/**
 * @param {string} fileName
 * @param {string|Uint8Array} content
 * @param {string} [commitMessage]
 *
 * @returns {Promise<void>}
 */
export const writeFileAndPushChanges = (
  fileName,
  content,
  commitMessage = '',
) => {
  const { state } = store
  const { owner, name } = state.currentRepository

  return writeFileAndCommit(fileName, content, commitMessage).then(() =>
    gitAgent.push(owner, name),
  )
}

/**
 * @param {string} fileName
 * @param {string} [commitMessage]
 *
 * @returns {Promise<string>}
 */
export const deleteFileAndCommit = (fileName, commitMessage = '') => {
  const { state } = store
  const { owner, name } = state.currentRepository

  if (commitMessage === '') {
    commitMessage = `Suppression du fichier ${fileName}`
  }

  return gitAgent.removeFile(owner, name, fileName).then(() => {
    return gitAgent.commit(owner, name, commitMessage)
  })
}

/**
 * @param {string} fileName
 * @param {string} [commitMessage]
 *
 * @returns {Promise<Void>}
 */
export const deleteFileAndPushChanges = (fileName, commitMessage) => {
  const { state } = store
  const { owner, name } = state.currentRepository

  return deleteFileAndCommit(fileName, commitMessage).then(() =>
    gitAgent.push(owner, name),
  )
}
