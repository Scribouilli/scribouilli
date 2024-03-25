// @ts-check

import lireFrontMatter from 'front-matter'
import page from 'page'

import { svelteTarget } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import store from '../store'
import { handleErrors, logMessage, makeFileNameFromTitle } from '../utils'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.js'
import PageContenu from '../components/screens/PageContenu.svelte'
import { deletePage, createPage, updatePage } from './../actions/page'
import { makeAtelierListPageURL } from './urls.js'

/**
 *
 * @param {string} fileName
 * @returns {(state: import('../store').ScribouilliState) => any}
 */
const makeMapStateToProps = fileName => state => {
  // Display existing file
  if (fileName) {
    const {gitAgent} = store.state

    if(!gitAgent){
      throw new TypeError('gitAgent is undefined')
    }

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
          inMenu: true,
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
      showArticles:
        (state.pages &&
          state.pages.find(p => p.path === 'blog.md') !== undefined) ||
        (state.articles && state.articles.length > 0),
      currentRepository: state.currentRepository,
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
      }),
      makeFileNameFromTitle: makeFileNameFromTitle,
      contenus: state.pages,
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
export default async ({ querystring }) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  const state = store.state
  const fileName = decodeURIComponent(new URLSearchParams(querystring).get('path') ?? '')
  const mapStateToProps = makeMapStateToProps(fileName)

  const currentRepository = store.state.currentRepository

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  const pageContenu = new PageContenu({
    target: svelteTarget,
    props: mapStateToProps(state),
  })

  replaceComponent(pageContenu, mapStateToProps)

  pageContenu.$on('delete', () => {
    deletePage(fileName)
      .then(() => {
        state.buildStatus.setBuildingAndCheckStatusLater()
        page(makeAtelierListPageURL(currentRepository))
      })
      .catch(msg => handleErrors(msg))
  })

  // @ts-ignore
  pageContenu.$on(
    'save',
    ({
      detail: {
        fileName,
        title,
        content,
        previousTitle,
        previousContent,
        index,
      },
    }) => {
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

      updatePage(fileName, title, content, index)
        .then(() => {
          state.buildStatus.setBuildingAndCheckStatusLater()
          page(makeAtelierListPageURL(currentRepository))
        })
        .catch(msg => handleErrors(msg))
    },
  )
}
