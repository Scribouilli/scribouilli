// @ts-check

import lireFrontMatter from 'front-matter'
import page from 'page'

import store from '../store'
import {
  checkRepositoryAvailabilityThen,
  handleErrors,
  makeArticleFileName,
  makeArticleFrontMatter,
} from '../utils'

import databaseAPI from '../databaseAPI'
import { svelteTarget } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import ArticleContenu from '../components/screens/ArticleContenu.svelte'
import { setCurrentRepositoryFromQuerystring } from '../actions'
import { deleteArticle, createOrUpdateArticle } from '../actions/article'

const LIST_ARTICLE_URL = '/atelier-list-articles'

/**
 *
 * @param {string} fileName
 * @returns {(state: import('../store').ScribouilliState) => any}
 */
const makeMapStateToProps = fileName => state => {
  if (fileName) {
    // Display existing file
    const fileP = databaseAPI
      .getFile(
        store.state.currentRepository.owner,
        store.state.currentRepository.name,
        fileName,
      )
      .then(contenu => {
        const { attributes: data, body: markdownContent } =
          lireFrontMatter(contenu)

        return {
          fileName: fileName,
          content: markdownContent,
          previousContent: markdownContent,
          title: data?.title,
          previousTitle: data?.title,
        }
      })
      .catch(msg => handleErrors(msg))
    return {
      fileP,
      contenus: state.articles,
      buildStatus: state.buildStatus,
      showArticles:
        (state.pages &&
          state.pages.find(p => p.path === 'blog.md') !== undefined) ||
        (state.articles && state.articles.length > 0),
      currentRepository: state.currentRepository,
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
      }),
      contenus: state.articles,
      buildStatus: state.buildStatus,
      showArticles:
        (state.pages &&
          state.pages.find(p => p.path === 'blog.md') !== undefined) ||
        (state.articles && state.articles.length > 0),
      currentRepository: state.currentRepository,
    }
  }
}

/**
 * @param {import('page').Context} _
 */
export default ({ querystring }) => {
  setCurrentRepositoryFromQuerystring(querystring)

  checkRepositoryAvailabilityThen(
    store.state.currentRepository.owner,
    store.state.currentRepository.name,
    () => {},
  )

  const state = store.state
  const currentRepository = state.currentRepository
  const fileName = new URLSearchParams(querystring).get('path') ?? ''
  const mapStateToProps = makeMapStateToProps(fileName)

  const articleContenu = new ArticleContenu({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(articleContenu, mapStateToProps)

  articleContenu.$on('delete', () => {
    deleteArticle(fileName)
      .then(() => {
        state.buildStatus.setBuildingAndCheckStatusLater()
        page(
          `${LIST_ARTICLE_URL}?repoName=${currentRepository.name}&account=${currentRepository.owner}`,
        )
      })
      .catch(msg => handleErrors(msg))

    page(
      `${LIST_ARTICLE_URL}?repoName=${currentRepository.name}&account=${currentRepository.owner}`,
    )
  })

  articleContenu.$on(
    'save',
    ({
      detail: { fileName, content, previousContent, title, previousTitle },
    }) => {
      const hasContentChanged = content !== previousContent
      const hasTitleChanged = title !== previousTitle
      const articlePageUrl = `${LIST_ARTICLE_URL}?repoName=${currentRepository.name}&account=${currentRepository.owner}`

      // If no content changed, just redirect
      if (!hasTitleChanged && !hasContentChanged) {
        return page(articlePageUrl)
      }

      createOrUpdateArticle({
        fileName,
        title,
        content,
      }).then(() => {
        state.buildStatus.setBuildingAndCheckStatusLater()
        page(articlePageUrl)
      })
    },
  )
}
