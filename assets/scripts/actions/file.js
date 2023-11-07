//@ts-check

import databaseAPI from './../databaseAPI.js'
import store from './../store.js'
import { handleErrors } from '../utils'

/**
 * @param {object} fileOptions
 * @param {string} fileOptions.fileName
 * @param {string} fileOptions.content
 * @param {string} fileOptions.title
 *
 * @returns {Promise<void>}
 */
export const writeFile = ({ fileName, content, title }) => {
  const { state } = store
  const { owner, name } = store.state.currentRepository

  return databaseAPI
    .writeFile(owner, name, fileName, content)
    .then(() => {
      state.buildStatus.setBuildingAndCheckStatusLater()

      return databaseAPI.commit(
        owner,
        name,
        `Modification du fichier ${fileName}`,
      )
    })
    .catch(msg => handleErrors(msg))
}

/**
 * @param {object} fileOptions
 * @param {string} fileOptions.fileName
 * @param {string} fileOptions.content
 * @param {string} fileOptions.title
 *
 * @returns {Promise<void>}
 */
export const writeFileAndPushChanges = ({ fileName, content, title }) => {
  const { state } = store
  const { owner, name } = state.currentRepository

  return writeFile({ fileName, content, title })
    .then(() => databaseAPI.push(owner, name))
    .catch(msg => handleErrors(msg))
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
