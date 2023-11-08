//@ts-check

import databaseAPI from './../databaseAPI.js'
import store from './../store.js'
import { handleErrors } from '../utils'

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

  return deleteFileAndPushChanges(fileName)
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

  return deleteFileAndPushChanges(fileName)
}

/**
 * @param {string} fileName
 *
 * @returns {Promise<Void>}
 */
export const deleteFile = fileName => {
  const { state } = store
  const { owner, name } = state.currentRepository

  return databaseAPI.removeFile(owner, name, fileName).then(() => {
    return databaseAPI.commit(owner, name, `Suppression de la page ${fileName}`)
  })
}

/**
 * @param {string} fileName
 *
 * @returns {Promise<Void>}
 */
export const deleteFileAndPushChanges = fileName => {
  const { state } = store
  const { owner, name } = state.currentRepository

  return deleteFile(fileName).then(() => databaseAPI.push(owner, name))
}
