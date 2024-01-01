//@ts-check

import store from './../store.js'
import gitAgent from './../gitAgent.js'
import { makeFileNameFromTitle, makePageFrontMatter } from './../utils'
import { deleteFileAndPushChanges, writeFileAndPushChanges } from './file'

/**
 * @param {string} fileName
 *
 * @returns {ReturnType<typeof deleteFileAndPushChanges>}
 */
export const deletePage = fileName => {
  const { state } = store

  store.mutations.setPages(
    state.pages &&
      state.pages.filter(page => {
        return page.path !== fileName
      }),
  )

  return deleteFileAndPushChanges(
    fileName,
    `Suppression de la page ${fileName}`,
  )
}

/**
 * @param {string} content
 * @param {string} title
 * @param {number} index
 *
 * @returns {ReturnType<typeof writeFileAndPushChanges>}
 */
export const createPage = (content, title, index) => {
  const { state } = store
  const fileName = makeFileNameFromTitle(title)

  let newPages =
    state.pages?.filter(page => {
      return page.path !== fileName
    }) || []
  newPages.push({ title: title, path: fileName, index })

  store.mutations.setPages(newPages)

  const finalContent = `${
    title ? makePageFrontMatter(title, index) + '\n' : ''
  }${content} `

  return writeFileAndPushChanges(
    fileName,
    finalContent,
    `Création de la page : ${title}`,
  )
}

/**
 * @param {string} fileName
 * @param {string} content
 * @param {string} title
 * @param {number} index
 *
 * @returns {ReturnType<typeof writeFileAndPushChanges>}
 */
export const updatePage = async (fileName, title, content, index) => {
  const currentRepository = store.state.currentRepository

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }
  let targetFileName = fileName

  if (fileName !== 'index.md') {
    targetFileName = makeFileNameFromTitle(title)
  }

  // If the title has changed, we need to delete the old page and
  // create a new one because the file name has changed.
  if (fileName && fileName !== targetFileName) {
    await gitAgent.removeFile(currentRepository, fileName)
  }

  const finalContent = `${
    title ? makePageFrontMatter(title, index) + '\n' : ''
  }${content} `

  return writeFileAndPushChanges(
    targetFileName,
    finalContent,
    `Modification de la page : ${title}`,
  )
}
