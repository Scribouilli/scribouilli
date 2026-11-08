import lireFrontMatter from 'front-matter'
import { format } from 'date-fns'

import * as store from './store.svelte'
import { type ScribouilliState } from './store.svelte'
import { deleteFileAndPushChanges, writeFileAndPushChanges } from './git/file'
import { keepMarkdownAndHTMLFiles, makeFilenameCompatibleString } from './page'

export interface Article {
  path: string
  title: string
  content?: string
}

export function makeArticleFileName(title: string, date: Date): string {
  return `_posts/${format(date, 'yyyy-MM-dd')}-${makeFilenameCompatibleString(title)}.md`
}

export function makeArticleFrontMatter(title: string): string {
  return ['---', 'title: ' + '"' + title.replace(/"/g, '\\"') + '"', '---'].join('\n')
}

/** Return whether the blog is enabled or not and whether the "Articles" section
 * should be available.
 */
export function showArticles(state: ScribouilliState) {
  const index = blogIndex(state)
  return index !== undefined
}

/**
 * Return the file path of the blog index if it is enabled.
 *
 * It is true if there is a file in the root of the project that has `blogIndex: true`
 * in its front-matter.
 */
export function blogIndex(state: ScribouilliState): string | undefined {
  const pages = state.pages ?? []
  const index = pages.find(p => p.blogIndex ?? false)?.path
  // In previous versions we assumed that the blog index was always
  // named "blog.md", so keep that as a fallback for older websites.
  return index ?? pages.find(p => p.path === 'blog.md')?.path
}

export async function getArticlesList(): Promise<Article[]> {
  const { gitAgent } = store.state

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  const ARTICLES_DIRECTORY = '_posts'

  const allFiles = await gitAgent.listFiles(ARTICLES_DIRECTORY)

  return Promise.all(
    allFiles.filter(keepMarkdownAndHTMLFiles).map(async filename => {
      const fullName = `${ARTICLES_DIRECTORY}/${filename}`
      const content = await gitAgent.getFile(fullName)
      const { attributes: data, body: markdownContent } = lireFrontMatter(content.toString())
      return {
        title:
          typeof data === 'object' &&
          data !== null &&
          'title' in data &&
          typeof data.title === 'string'
            ? data.title
            : '',
        path: fullName,
        content: markdownContent,
      }
    }),
  )
}

export const deleteArticle = (fileName: string): ReturnType<typeof deleteFileAndPushChanges> => {
  store.setArticles(
    (store.state.articles ?? []).filter(article => {
      return article.path !== fileName
    }),
  )

  return deleteFileAndPushChanges(fileName, `Suppression de l'article ${fileName}`)
}

export const createArticle = (
  title: string,
  content: string,
): ReturnType<typeof writeFileAndPushChanges> => {
  const { state } = store

  const date = new Date()
  const targetFileName = makeArticleFileName(title, date)

  let newArticles =
    state.articles?.filter(article => {
      return article.path !== targetFileName
    }) || []
  newArticles.push({ title: title, path: targetFileName })

  store.setArticles(newArticles)

  const finalContent = `${title ? makeArticleFrontMatter(title) + '\n' : ''}${content}`

  return writeFileAndPushChanges(targetFileName, finalContent, `Création de l'article : ${title}`)
}

export const updateArticle = async (
  fileName: string,
  title: string,
  content: string,
): ReturnType<typeof writeFileAndPushChanges> => {
  const { gitAgent } = store.state

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  const existingDate = fileName.slice('_posts/'.length, '_posts/YYYY-MM-DD'.length)
  const date = new Date(existingDate)

  const targetFileName = makeArticleFileName(title, date)

  // If the title has changed, we need to delete the old article and
  // create a new one because the file name has changed.
  if (fileName && fileName !== targetFileName) {
    await gitAgent.removeFile(fileName)
  }

  const finalContent = `${title ? makeArticleFrontMatter(title) + '\n' : ''}${content}`

  return writeFileAndPushChanges(
    targetFileName,
    finalContent,
    `Modification de l'article : ${title}`,
  )
}
