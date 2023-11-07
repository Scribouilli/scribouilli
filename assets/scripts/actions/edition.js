//@ts-check

import page from 'page'

import databaseAPI from './../databaseAPI.js'
import store from './../store.js'
import makeBuildStatus from './../buildStatus.js'
import {
  handleErrors,
  logMessage,
  delay,
  makeFileNameFromTitle,
  makePageFrontMatter,
} from '../utils'

/**
 * @param {string} fileName
 *
 * @returns {Promise<Void>}
 */
export const deletePage = fileName => {
  const { state } = store
  const { owner, name } = state.currentRepository

  store.mutations.setPages(
    state.pages &&
      state.pages.filter(page => {
        return page.path !== fileName
      }),
  )

  return deleteFile(fileName)
    .then(() => databaseAPI.push(owner, name))
    .catch(msg => handleErrors(msg))
}

/**
 * @param {string} fileName
 *
 * @returns {Promise<Void>}
 */
export const deleteArticle = fileName => {
  const { state } = store
  const { owner, name } = state.currentRepository

  store.mutations.setArticles(
    (state.articles ?? []).filter(article => {
      return article.path !== fileName
    }),
  )

  return deleteFile(fileName)
    .then(() => databaseAPI.push(owner, name))
    .catch(msg => handleErrors(msg))
}

/**
 * @param {string} fileName
 *
 * @returns {Promise<Void>}
 */
export const deleteFile = fileName => {
  const { state } = store
  const { owner, name } = state.currentRepository

  console.log('deleteFile', fileName)
  return databaseAPI
    .removeFile(owner, name, fileName)
    .then(() => {
      state.buildStatus.setBuildingAndCheckStatusLater()

      return databaseAPI.commit(
        owner,
        name,
        `Suppression de la page ${fileName}`,
      )
    })
    .catch(msg => handleErrors(msg))
}
