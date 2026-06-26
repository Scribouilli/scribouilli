import lireFrontMatter from 'front-matter'
import page, { Context } from 'page'

import store, { type ScribouilliState } from '../store'
import { handleErrors } from '../utils'

import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import ArticleContenu from '../components/screens/ArticleContenu.svelte'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.ts'
import {
  deleteArticle,
  createArticle,
  updateArticle,
  showArticles,
} from '../actions/article'
import { makeAtelierListArticlesURL } from './atelier-list-articles.ts'
import type { EditeurFile } from '../types/atelier.ts'
import { setBuildingAndCheckStatusLater } from '../buildStatus'
import { ComponentProps } from 'svelte'

const EMPTY_FILE = {
  fileName: '',
  content: '',
  previousContent: undefined,
  title: '',
  index: 1,
  previousTitle: undefined,
  blogIndex: false,
}

const makeMapStateToProps =
  (fileName: string) =>
  (state: ScribouilliState): ComponentProps<typeof ArticleContenu> => {
    const { gitAgent, currentRepository } = store.state

    if (!gitAgent || !currentRepository) {
      throw new TypeError('gitAgent or currentRepository is undefined')
    }

    const onSave: (file: EditeurFile) => Promise<void> = async ({
      fileName,
      content,
      previousContent,
      title,
      previousTitle,
    }): Promise<void> => {
      const hasContentChanged = content !== previousContent
      const hasTitleChanged = title !== previousTitle
      const articlePageUrl = makeAtelierListArticlesURL(currentRepository)

      // If no content changed, just redirect
      if (!hasTitleChanged && !hasContentChanged) {
        return page(articlePageUrl)
      }

      // If the file name is empty, it means that we are creating a new article.
      if (fileName === '') {
        try {
          await createArticle(title, content)
          setBuildingAndCheckStatusLater(currentRepository, gitAgent)
          page(articlePageUrl)
          return
        } catch (msg: any) {
          handleErrors(msg)
        }
      }

      try {
        await updateArticle(fileName, title, content)
        setBuildingAndCheckStatusLater(currentRepository, gitAgent)
        page(articlePageUrl)
        return
      } catch (msg: any) {
        handleErrors(msg)
      }
    }

    if (fileName) {
      const onDelete = () => {
        deleteArticle(fileName)
          .then(() => {
            if (!state.currentRepository || !state.gitAgent) return

            setBuildingAndCheckStatusLater(
              state.currentRepository,
              state.gitAgent,
            )
            page(makeAtelierListArticlesURL(state.currentRepository))
          })
          .catch(msg => handleErrors(msg))
      }

      // Display existing file
      const fileP = gitAgent
        .getFile(fileName)
        .then(contenu => {
          const { attributes: data, body: markdownContent } = lireFrontMatter<{
            title: string
            index: number
            blogIndex: boolean
          }>(contenu)

          return {
            fileName: fileName,
            content: markdownContent,
            previousContent: markdownContent,
            title: data.title,
            previousTitle: data.title,
            index: data.index,
            blogIndex: data.blogIndex,
            onDelete,
            onSave,
          }
        })
        .catch(msg => {
          handleErrors(msg)
          return EMPTY_FILE
        })
      return {
        fileP,
        contenus: state.articles ?? [],
        buildStatus: state.buildStatus,
        showArticles: showArticles(state),
        currentRepository: currentRepository,
        onDelete,
        onSave,
      }
    } else {
      // Create a new file
      return {
        fileP: Promise.resolve(EMPTY_FILE),
        contenus: state.articles ?? [],
        buildStatus: state.buildStatus,
        showArticles: showArticles(state),
        currentRepository: currentRepository,
        onDelete: () => {
          return
        },
        onSave,
      }
    }
  }

export default async ({ querystring }: Context) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  const fileName = decodeURIComponent(
    new URLSearchParams(querystring).get('path') ?? '',
  )
  const mapStateToProps = makeMapStateToProps(fileName)

  replaceComponent(ArticleContenu, mapStateToProps)
}
