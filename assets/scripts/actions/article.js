//@ts-check

import store from './../store.js'
import gitAgent from './../gitAgent.js'
import { deleteFileAndPushChanges, writeFileAndPushChanges } from './file'
import { makeArticleFileName, makeArticleFrontMatter } from './../utils.js'

/**
 * @param {string} fileName
 *
 * @returns {ReturnType<typeof deleteFileAndPushChanges>}
 */
export const deleteArticle = fileName => {
  const { state } = store

  store.mutations.setArticles(
    (state.articles ?? []).filter(article => {
      return article.path !== fileName
    }),
  )

  return deleteFileAndPushChanges(
    fileName,
    `Suppression de l'article ${fileName}`,
  )
}

/**
 * @param {string} title
 * @param {string} content
 *
 * @returns {ReturnType<typeof writeFileAndPushChanges>}
 */
export const createArticle = (title, content) => {
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

  return writeFileAndPushChanges(
    targetFileName,
    finalContent,
    `Création de l'article : ${title}`,
  )
}

/**
 * @param {string} fileName
 * @param {string} content
 * @param {string} title
 *
 * @returns {ReturnType<typeof writeFileAndPushChanges>}
 */
export const updateArticle = async (fileName, title, content) => {
  const currentRepository = store.state.currentRepository

  if(!currentRepository){
    throw new TypeError('currentRepository is undefined')
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
    await gitAgent.removeFile(currentRepository, fileName)
  }

  const finalContent = `${
    title ? makeArticleFrontMatter(title) + '\n' : ''
  }${content}`

  return writeFileAndPushChanges(
    targetFileName,
    finalContent,
    `Modification de l'article : ${title}`,
  )
}
