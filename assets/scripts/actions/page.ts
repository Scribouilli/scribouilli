import lireFrontMatter from 'front-matter'

import store from './../store.js'
import { makeFileNameFromTitle, makePageFrontMatter } from './../utils.js'
import { deleteFileAndPushChanges, writeFileAndPushChanges } from './file.js'
import { Page } from '../types/atelier.js'

export function keepMarkdownAndHTMLFiles(filename: string): boolean {
  return filename.endsWith('.md') || filename.endsWith('.html')
}

export async function getPagesList(): Promise<Page[]> {
  const { gitAgent } = store.state

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  const allFiles = await gitAgent.listFiles('')

  return Promise.all(
    allFiles.filter(keepMarkdownAndHTMLFiles).map(async filename => {
      const content = await gitAgent.getFile(filename)
      // TODO: validate data with zod or equivalent
      const { attributes: data, body: markdownContent } = lireFrontMatter<{
        title: string
        order: number
        in_menu: boolean | undefined
        blog_index: boolean | undefined
      }>(content.toString())

      return {
        title: data?.title,
        index: data?.order,
        // no `in_menu` proprerty is interpreted as the page should be in the menu
        inMenu: data?.in_menu === true || data?.in_menu === undefined,
        blogIndex: data?.blog_index === true,
        path: filename,
        content: markdownContent,
      }
    }),
  )
}

export const deletePage = (
  fileName: string,
): ReturnType<typeof deleteFileAndPushChanges> => {
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

export const createPage = (
  content: string,
  title: string,
  index: number,
): ReturnType<typeof writeFileAndPushChanges> => {
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

export const updatePage = async (
  fileName: string,
  title: string,
  content: string,
  index: number,
  blogIndex: boolean,
): ReturnType<typeof writeFileAndPushChanges> => {
  const { gitAgent } = store.state

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }
  let targetFileName = fileName

  if (fileName !== 'index.md') {
    targetFileName = makeFileNameFromTitle(title)
  }

  // If the title has changed, we need to delete the old page and
  // create a new one because the file name has changed.
  if (fileName && fileName !== targetFileName) {
    await gitAgent.removeFile(fileName)
  }

  const finalContent = `${
    title ? makePageFrontMatter(title, index, undefined, blogIndex) + '\n' : ''
  }${content} `

  return writeFileAndPushChanges(
    targetFileName,
    finalContent,
    `Modification de la page : ${title}`,
  )
}
