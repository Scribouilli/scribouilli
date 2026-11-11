import lireFrontMatter from 'front-matter'
import { format } from 'date-fns'

import { deleteFileAndPushChanges, writeFileAndPushChanges } from '../git/file'
import { isMarkdownOrHTMLFile, makeFilenameCompatibleString } from './page.svelte'
import type { GitAgent } from '../git/agent'

export interface Article {
  path: string
  title: string
  content?: string
}

export class Articles {
  #gitAgent: () => GitAgent
  articles: Article[] = $state([])

  constructor(gitAgent: () => GitAgent) {
    this.#gitAgent = gitAgent

  }

  static makeFileName(title: string, date: Date): string {
    return `_posts/${format(date, 'yyyy-MM-dd')}-${makeFilenameCompatibleString(title)}.md`
  }

  static makeFrontMatter(title: string): string {
    return [
      '---',
      'title: ' + '"' + title.replace(/"/g, '\\"') + '"',
      '---'
    ].join('\n')
  }

  async listAll(): Promise<Article[]> {
    const ARTICLES_DIRECTORY = '_posts'

    const allFiles = await this.#gitAgent().listFiles(ARTICLES_DIRECTORY)

    return Promise.all(
      allFiles.filter(isMarkdownOrHTMLFile).map(async filename => {
        const fullName = `${ARTICLES_DIRECTORY}/${filename}`
        const content = await this.#gitAgent().getFile(fullName)
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
    ).then((articles) => {
      this.articles = articles
      return articles
    })
  }

  async delete(fileName: string): ReturnType<typeof deleteFileAndPushChanges> {
    return deleteFileAndPushChanges(
      this.#gitAgent(),
      fileName,
      `Suppression de l'article ${fileName}`
    )
  }

  async create(title: string, content: string): ReturnType<typeof writeFileAndPushChanges> {
    const date = new Date()
    const targetFileName = Articles.makeFileName(title, date)

    const finalContent = `${title ? Articles.makeFrontMatter(title) + '\n' : ''}${content}`

    return writeFileAndPushChanges(
      this.#gitAgent(),
      targetFileName,
      finalContent,
      `Création de l'article : ${title}`
    )
  }

  async update(fileName: string, title: string, content: string): ReturnType<typeof writeFileAndPushChanges> {
    const articleDateString = fileName.slice('_posts/'.length, '_posts/YYYY-MM-DD'.length)
    const date = new Date(articleDateString)

    const targetFileName = Articles.makeFileName(title, date)

    // If the title has changed, we need to delete the old article and
    // create a new one because the file name has changed.
    if (fileName && fileName !== targetFileName) {
      await this.#gitAgent().removeFile(fileName)
    }

    const finalContent = `${title ? Articles.makeFrontMatter(title) + '\n' : ''}${content}`

    return writeFileAndPushChanges(
      this.#gitAgent(),
      targetFileName,
      finalContent,
      `Modification de l'article : ${title}`,
    )
  }
}
