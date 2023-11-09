//@ts-check

import store from './../store.js'
import {
  deleteFileAndCommit,
  deleteFileAndPushChanges,
  writeFileAndPushChanges,
} from './file'
import { makeArticleFileName, makeArticleFrontMatter } from './../utils.js'

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

  return deleteFileAndPushChanges(fileName, {
    commitMessage: `Suppression de l'article ${fileName}`,
  })
}

/**
 * @param {string} fileName
 * @param {string} content
 * @param {string} title
 *
 * @returns {Promise<void>}
 */
export const createArticle = (fileName, content, title) => {
  const { state } = store

  const date = new Date()
  const targetFileName = makeArticleFileName(title, date)

  let newArticles =
    state.articles?.filter(article => {
      return article.path !== targetFileName
    }) || []
  newArticles.push({ title: title, path: targetFileName })

  store.mutations.setArticles(newArticles)

  const finalContent = `${
    title ? makeArticleFrontMatter(title) + '\n' : ''
  }${content}`

  return writeFileAndPushChanges(targetFileName, finalContent, {
    commitMessage: `Création de l'article : ${title}`,
  })
}

/**
 * @param {string} fileName
 * @param {string} content
 * @param {string} title
 *
 * @returns {Promise<void>}
 */
export const createOrUpdateArticle = async (fileName, title, content) => {
  // If the file name is empty, it means that we are creating a new article.
  if (fileName === '') {
    return createArticle(fileName, title, content)
  }

  const existingDate = fileName.slice(
    '_posts/'.length,
    '_posts/YYYY-MM-DD'.length,
  )
  const date = new Date(existingDate)

  const targetFileName = makeArticleFileName(title, date)

  // If the title has changed, we need to delete the old article and
  // create a new one because the file name has changed.
  if (fileName && fileName !== targetFileName) {
    await deleteFileAndCommit(fileName, {
      commitMessage: `Suppression de l'article ${fileName} (changement de titre)`,
    })
  }

  const finalContent = `${
    title ? makeArticleFrontMatter(title) + '\n' : ''
  }${content}`

  return writeFileAndPushChanges(targetFileName, finalContent, {
    commitMessage: `Modification de l'article : ${title}`,
  })
}
