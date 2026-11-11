import lireFrontMatter from 'front-matter'

import { deleteFileAndPushChanges, writeFileAndPushChanges } from '../git/file'
import type { GitAgent } from '../git/agent'

export interface Page {
  path: string
  title: string
  content?: string
  inMenu?: boolean
  blogIndex?: boolean
  index: number
}

export function makeFilenameCompatibleString(string: string): string {
  return string
    .replace(/\/|#|\?|:|&|\(|\)|\+/g, '-') // replace url confusing characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent because GH pages triggers file download
    .split('.')
    .join('') // Remove dot to avoid issues
    .toLowerCase()
}


export function isMarkdownOrHTMLFile(filename: string): boolean {
  return filename.endsWith('.md') || filename.endsWith('.html')
}


export class Pages {
  #gitAgent
  #pages: Page[] = $state([])
  readonly pages = $derived(Pages.sort(this.#pages))

  constructor(gitAgent: () => GitAgent) {
    this.#gitAgent = gitAgent
  }

  static makeFrontMatter(
    title: string,
    index: number | null = 1,
    inMenu: boolean = true,
    blogIndex?: boolean,
  ): string {
    return [
      '---',
      'title: ' + '"' + title.replace(/"/g, '\\"') + '"',
      'order: ' + index,
      'in_menu: ' + inMenu,
    ]
      .concat(blogIndex ? ['blog_index: true'] : [])
      .concat(['---'])
      .join('\n')
  }

  static makeFileNameFromTitle(title: string): string {
    return makeFilenameCompatibleString(title) + '.md'
  }

  static sort(pages: Page[]) {
    return pages.toSorted((pageA, pageB) => {
      const diffIndex = pageA.index - pageB.index
      if (diffIndex === 0) {
        if (pageA.path < pageB.path) {
          return -1
        }
        if (pageA.path > pageB.path) {
          return 1
        }
        if (pageA.path === pageB.path) {
          return 0
        }
      }
      return diffIndex
    })
  }

  async listAll(): Promise<Page[]> {
    const allFiles = await this.#gitAgent().listFiles('')

    return Promise.all(
      allFiles.filter(isMarkdownOrHTMLFile).map(async filename => {
        const content = await this.#gitAgent().getFile(filename)
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
    ).then((pages) => {
      this.#pages = pages
      return pages
    })
  }

  async delete(fileName: string): ReturnType<typeof deleteFileAndPushChanges> {
    return deleteFileAndPushChanges(
      this.#gitAgent(),
      fileName,
      `Suppression de la page ${fileName}`
    )
  }

  async create(content: string, title: string, index: number): ReturnType<typeof writeFileAndPushChanges> {
    const fileName = Pages.makeFileNameFromTitle(title)

    const finalContent = `${title ? Pages.makeFrontMatter(title, index) + '\n' : ''}${content} `

    return writeFileAndPushChanges(
      this.#gitAgent(),
      fileName,
      finalContent,
      `Création de la page : ${title}`
    )
  }

  async update(
    fileName: string,
    title: string,
    content: string,
    index: number,
    blogIndex: boolean,
  ): ReturnType<typeof writeFileAndPushChanges> {
    let targetFileName = fileName

    if (fileName !== 'index.md') {
      targetFileName = Pages.makeFileNameFromTitle(title)
    }

    // If the title has changed, we need to delete the old page and
    // create a new one because the file name has changed.
    if (fileName && fileName !== targetFileName) {
      await this.#gitAgent().removeFile(fileName)
    }

    const frontMatter = title ? Pages.makeFrontMatter(title, index, undefined, blogIndex) + '\n' : ''
    const finalContent = `${frontMatter}${content} `

    return writeFileAndPushChanges(
      this.#gitAgent(),
      targetFileName,
      finalContent,
      `Modification de la page : ${title}`
    )
  }
}
