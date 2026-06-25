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

const makeMapStateToProps =
  (fileName: string): ((state: ScribouilliState) => any) =>
  state => {
    const onSave: (file: EditeurFile) => Promise<void> = async ({
      fileName,
      content,
      previousContent,
      title,
      previousTitle,
    }): Promise<void> => {
      if (!state.currentRepository || !state.gitAgent) return

      const hasContentChanged = content !== previousContent
      const hasTitleChanged = title !== previousTitle
      const articlePageUrl = makeAtelierListArticlesURL(state.currentRepository)

      // If no content changed, just redirect
      if (!hasTitleChanged && !hasContentChanged) {
        return page(articlePageUrl)
      }

      // If the file name is empty, it means that we are creating a new article.
      if (fileName === '') {
        try {
          await createArticle(title, content)
          setBuildingAndCheckStatusLater(
            state.currentRepository,
            state.gitAgent,
          )
          page(articlePageUrl)
          return
        } catch (msg: any) {
          handleErrors(msg)
        }
      }

      try {
        await updateArticle(fileName, title, content)
        setBuildingAndCheckStatusLater(state.currentRepository, state.gitAgent)
        page(articlePageUrl)
        return
      } catch (msg: any) {
        handleErrors(msg)
      }
    }

    if (fileName) {
      const { gitAgent } = store.state

      if (!gitAgent) {
        throw new TypeError('gitAgent is undefined')
      }

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
          }>(contenu)

          return {
            fileName: fileName,
            content: markdownContent,
            previousContent: markdownContent,
            title: data?.title,
            previousTitle: data?.title,
            onDelete,
            onSave,
          }
        })
        .catch(msg => handleErrors(msg))
      return {
        fileP,
        contenus: state.articles,
        buildStatus: state.buildStatus,
        showArticles: showArticles(state),
        currentRepository: state.currentRepository,
        onDelete,
        onSave,
      }
    } else {
      // Create a new file
      return {
        fileP: Promise.resolve({
          fileName: '',
          content: '',
          previousContent: undefined,
          title: '',
          previousTitle: undefined,
          blogIndex: false,
        }),
        contenus: state.articles,
        buildStatus: state.buildStatus,
        showArticles: showArticles(state),
        currentRepository: state.currentRepository,
        onDelete: () => {
          return
        },
        onSave,
      }
    }
  }

export default async ({ querystring }: Context) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  const currentRepository = store.state.currentRepository

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  const fileName = decodeURIComponent(
    new URLSearchParams(querystring).get('path') ?? '',
  )
  const mapStateToProps = makeMapStateToProps(fileName)

  replaceComponent(ArticleContenu, mapStateToProps)
}
