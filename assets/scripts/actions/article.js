//@ts-check

import store from './../store.js'
import { deleteFileAndPushChanges } from './file.js'

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
