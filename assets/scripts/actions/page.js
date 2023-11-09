//@ts-check

import store from './../store.js'
import { makeFileNameFromTitle, makePageFrontMatter } from './../utils'
import {
  deleteFileAndCommit,
  deleteFileAndPushChanges,
  writeFileAndPushChanges,
} from './file'

/**
 * @param {string} fileName
 *
 * @returns {Promise<void>}
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
 * @returns {Promise<void>}
 */
export const createPage = (content, title, index) => {
  const { state } = store
  const fileName = makeFileNameFromTitle(title)

  let newPages =
    state.pages?.filter(page => {
      return page.path !== fileName
    }) || []
  newPages.push({ title: title, path: fileName })

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
 * @returns {Promise<void>}
 */
export const updatePage = async (fileName, title, content, index) => {
  let targetFileName = fileName

  if (fileName !== 'index.md') {
    targetFileName = makeFileNameFromTitle(title)
  }

  // If the title has changed, we need to delete the old page and
  // create a new one because the file name has changed.
  if (fileName && fileName !== targetFileName) {
    await deleteFileAndCommit(
      fileName,
      `Suppression de la page ${fileName} (changement de titre)`,
    )
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
