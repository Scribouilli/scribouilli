//@ts-check

import store from './../store.js'
import { makeFileNameFromTitle, makePageFrontMatter } from './../utils'
import {
  deleteFile,
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

  return deleteFileAndPushChanges(fileName)
}

/**
 * @param {object} fileOptions
 * @param {string} fileOptions.fileName
 * @param {string} fileOptions.content
 * @param {string} fileOptions.title
 * @param {number} fileOptions.index
 *
 * @returns {Promise<void>}
 */
export const createPage = ({ fileName, content, title, index }) => {
  console.log('createPage', fileName, content, title, index)
  const { state } = store

  let newPages =
    state.pages?.filter(page => {
      return page.path !== fileName
    }) || []
  newPages.push({ title: title, path: fileName })

  store.mutations.setPages(newPages)

  const finalContent = `${
    title ? makePageFrontMatter(title, index) + '\n' : ''
  }${content} `

  return writeFileAndPushChanges({
    fileName,
    content: finalContent,
    message: `Création de la page ${fileName}`,
  })
}

/**
 * @param {object} fileOptions
 * @param {string} fileOptions.fileName
 * @param {string} fileOptions.content
 * @param {string} fileOptions.title
 * @param {number} fileOptions.index
 *
 * @returns {Promise<void>}
 */
export const createOrUpdatePage = async ({
  fileName,
  title,
  content,
  index,
}) => {
  let targetFileName = fileName

  if (fileName !== 'index.md') {
    targetFileName = makeFileNameFromTitle(title)
  }

  if (fileName === '') {
    return createPage({ fileName: targetFileName, content, title, index })
  }

  // If the title has changed, we need to delete the old page and
  // create a new one because the file name has changed.
  if (fileName && fileName !== targetFileName) {
    await deleteFile(fileName)
  }

  const finalContent = `${
    title ? makePageFrontMatter(title, index) + '\n' : ''
  }${content} `

  return writeFileAndPushChanges({
    fileName: targetFileName,
    content: finalContent,
    message: `Modification de la page ${targetFileName}`,
  })
}
