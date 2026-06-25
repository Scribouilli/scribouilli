// @ts-check

import lireFrontMatter from 'front-matter'
import page from 'page'

import store from '../store'
import { handleErrors } from '../utils'

import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import ArticleContenu from '../components/screens/ArticleContenu.svelte'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.js'
import {
  deleteArticle,
  createArticle,
  updateArticle,
  showArticles,
} from '../actions/article'
import { makeAtelierListArticlesURL } from './atelier-list-articles.js'

/**
 *
 * @param {string} fileName
 * @returns {(state: import('../store').ScribouilliState) => any}
 */
const makeMapStateToProps = fileName => state => {
  /** @type {(file: EditeurFile) => Promise<void> | void} */
    const onSave = ({
      fileName, content, previousContent, title, previousTitle,
    }) => {
      if (!state.currentRepository) return

      const hasContentChanged = content !== previousContent
      const hasTitleChanged = title !== previousTitle
      const articlePageUrl = makeAtelierListArticlesURL(state.currentRepository)

      // If no content changed, just redirect
      if (!hasTitleChanged && !hasContentChanged) {
        return page(articlePageUrl)
      }

      // If the file name is empty, it means that we are creating a new article.
      if (fileName === '') {
        return createArticle(title, content)
          .then(() => {
            state.buildStatus.setBuildingAndCheckStatusLater()
            page(articlePageUrl)
          })
          .catch(msg => handleErrors(msg))
      }

      updateArticle(fileName, title, content)
        .then(() => {
          state.buildStatus.setBuildingAndCheckStatusLater()
          page(articlePageUrl)
        })
        .catch(msg => handleErrors(msg))
    }

  if (fileName) {
    const { gitAgent } = store.state

    if (!gitAgent) {
      throw new TypeError('gitAgent is undefined')
    }

    const onDelete = () => {
      deleteArticle(fileName)
        .then(() => {
          if (!state.currentRepository) return

          state.buildStatus.setBuildingAndCheckStatusLater()
          page(makeAtelierListArticlesURL(state.currentRepository))
        })
        .catch(msg => handleErrors(msg))
    }

    // Display existing file
    const fileP = gitAgent
      .getFile(fileName)
      .then(contenu => {
        const { attributes: data, body: markdownContent } =
          lireFrontMatter(contenu)

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
      onDelete: () => {return},
      onSave,
    }
  }
}

/**
 * @param {import('page').Context} _
 */
export default async ({ querystring }) => {
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
