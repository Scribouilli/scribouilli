//@ts-check

import databaseAPI from './../databaseAPI.js'
import store from './../store.js'
import { handleErrors } from '../utils'

/**
 * @param {string} fileName
 * @param {string|Uint8Array} content
 * @param {object} options
 * @param {string} [options.commitMessage]
 *
 * @returns {Promise<void>}
 */
export const writeFileAndCommit = (
  fileName,
  content,
  { commitMessage = '' } = {},
) => {
  if (commitMessage === '') {
    commitMessage = `Modification du fichier ${fileName}`
  }

  const { state } = store
  const { owner, name } = store.state.currentRepository

  return databaseAPI.writeFile(owner, name, fileName, content).then(() => {
    state.buildStatus.setBuildingAndCheckStatusLater()

    return databaseAPI.commit(owner, name, commitMessage)
  })
}

/**
 * @param {string} fileName
 * @param {string|Uint8Array} content
 * @param {object} options
 * @param {string} [options.commitMessage]
 *
 * @returns {Promise<void>}
 */
export const writeFileAndPushChanges = (
  fileName,
  content,
  { commitMessage },
) => {
  const { state } = store
  const { owner, name } = state.currentRepository

  return writeFileAndCommit(fileName, content, { commitMessage }).then(() =>
    databaseAPI.push(owner, name),
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

  return databaseAPI.removeFile(owner, name, fileName).then(() => {
    return databaseAPI.commit(owner, name, commitMessage)
  })
}

/**
 * @param {string} fileName
 * @param {string} [commitMessage]
 *
 * @returns {Promise<void>}
 */
export const deleteFileAndPushChanges = (fileName, commitMessage) => {
  const { state } = store
  const { owner, name } = state.currentRepository

  return deleteFileAndCommit(fileName, commitMessage).then(() =>
    databaseAPI.push(owner, name),
  )
}
