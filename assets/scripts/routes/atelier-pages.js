// @ts-check

import lireFrontMatter from 'front-matter'
import page from 'page'

import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import store from '../store'
import { handleErrors, logMessage, makeFileNameFromTitle } from '../utils'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.js'
import PageContenu from '../components/screens/PageContenu.svelte'
import { deletePage, createPage, updatePage } from './../actions/page'
import { makeAtelierListPageURL } from './urls.js'
import { showArticles } from '../actions/article'

/**
 *
 * @param {string} fileName
 * @returns {(state: import('../store').ScribouilliState) => any}
 */
const makeMapStateToProps = fileName => state => {
  /** @type {(file: EditeurFile) => Promise<void> | void} */
  const onSave = ({
    fileName,
    title,
    content,
    previousTitle,
    previousContent,
    index,
    blogIndex,
  }) => {
    const currentRepository = state.currentRepository
    if (!currentRepository) return

    const hasContentChanged = content !== previousContent
    const hasTitleChanged = title !== previousTitle

    // If no content changed, just redirect
    if (!hasTitleChanged && !hasContentChanged) {
      page(makeAtelierListPageURL(currentRepository))
      return
    }
    //
    // If the file name is empty, it means that we are creating a new page.
    if (fileName === '') {
      return createPage(content, title, index)
        .then(() => {
          state.buildStatus.setBuildingAndCheckStatusLater()
          page(makeAtelierListPageURL(currentRepository))
        })
        .catch(msg => handleErrors(msg))
    }

    updatePage(fileName, title, content, index, blogIndex)
      .then(() => {
        state.buildStatus.setBuildingAndCheckStatusLater()
        page(makeAtelierListPageURL(currentRepository))
      })
      .catch(msg => handleErrors(msg))
  }

  // Display existing file
  if (fileName) {
    const { gitAgent } = store.state

    if (!gitAgent) {
      throw new TypeError('gitAgent is undefined')
    }

    const onDelete = () => {
      deletePage(fileName)
        .then(() => {
          if (!state.currentRepository) return
          state.buildStatus.setBuildingAndCheckStatusLater()
          page(makeAtelierListPageURL(state.currentRepository))
        })
        .catch(msg => handleErrors(msg))
    }

    /** @type {() => Promise<EditeurFile | undefined>} */
    const fileP = async function () {
      try {
        const content = await gitAgent.getFile(fileName)
        const { attributes: data, body: markdownContent } =
          lireFrontMatter(content)
        return {
          fileName,
          content: markdownContent,
          previousContent: markdownContent,
          title: data?.title,
          index: data?.order,
          previousTitle: data?.title,
          blogIndex: data?.blog_index,
        }
      } catch (errorMessage) {
        //@ts-ignore
        logMessage(errorMessage, 'routes/atelier-pages.js:makeMapStateToProps')
      }
    }

    return {
      fileP: fileP(),
      contenus: state.articles,
      buildStatus: state.buildStatus,
      showArticles: showArticles(state),
      currentRepository: state.currentRepository,
      onDelete,
      onSave,
    }
  } else {
    return {
      fileP: Promise.resolve({
        fileName: '',
        title: '',
        index: state.pages && state.pages.length + 1,
        content: '',
        previousTitle: undefined,
        previousContent: undefined,
        inMenu: true,
        blogIndex: false,
      }),
      makeFileNameFromTitle: makeFileNameFromTitle,
      contenus: state.pages,
      buildStatus: state.buildStatus,
      showArticles: showArticles(state),
      currentRepository: state.currentRepository,
      onDelete: () => {},
      onSave,
    }
  }
}

/**
 * @param {import('page').Context} _
 */
export default async ({ querystring }) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  const fileName = decodeURIComponent(
    new URLSearchParams(querystring).get('path') ?? '',
  )
  const mapStateToProps = makeMapStateToProps(fileName)

  const currentRepository = store.state.currentRepository

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  replaceComponent(PageContenu, mapStateToProps)
}
