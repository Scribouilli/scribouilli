// @ts-check

import lireFrontMatter from 'front-matter'
import page from 'page'

import { svelteTarget } from '../config'
import databaseAPI from '../databaseAPI'
import { replaceComponent } from '../routeComponentLifeCycle'
import store from '../store'
import {
  handleErrors,
  logMessage,
  makeFileNameFromTitle,
  makePageFrontMatter,
} from '../utils'
import { setCurrentRepositoryFromQuerystring } from '../actions'
import PageContenu from '../components/screens/PageContenu.svelte'
import { deletePage } from './../actions/file'

/**
 *
 * @param {string} fileName
 * @returns {(state: import('../store').ScribouilliState) => any}
 */
const makeMapStateToProps = fileName => state => {
  // Display existing file
  if (fileName) {
    const fileP = async function () {
      try {
        const content = await databaseAPI.getFile(
          state.currentRepository.owner,
          state.currentRepository.name,
          fileName,
        )
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
export default ({ querystring }) => {
  setCurrentRepositoryFromQuerystring(querystring)

  const state = store.state
  const currentRepository = state.currentRepository
  const fileName = new URLSearchParams(querystring).get('path') ?? ''
  const mapStateToProps = makeMapStateToProps(fileName)

  const pageContenu = new PageContenu({
    target: svelteTarget,
    props: mapStateToProps(state),
  })

  replaceComponent(pageContenu, mapStateToProps)

  pageContenu.$on('delete', () => {
    deletePage(fileName).then(() => {
      state.buildStatus.setBuildingAndCheckStatusLater()
      page(
        `/atelier-list-pages?repoName=${currentRepository.name}&account=${currentRepository.owner}`,
      )
    })

    page(
      `/atelier-list-pages?repoName=${currentRepository.name}&account=${currentRepository.owner}`,
    )
  })

  // @ts-ignore
  pageContenu.$on(
    'save',
    ({
      detail: {
        fileName,
        content,
        previousContent,
        title,
        index,
        previousTitle,
      },
    }) => {
      const hasContentChanged = content !== previousContent
      const hasTitleChanged = title !== previousTitle

      // If no content changed, just redirect
      if (!hasTitleChanged && !hasContentChanged) {
        page(
          `/atelier-list-pages?repoName=${currentRepository.name}&account=${currentRepository.owner}`,
        )
        return
      }

      let newFileName = fileName
      if (fileName !== 'index.md') {
        newFileName = makeFileNameFromTitle(title)
      }

      const message = `création de la page ${title || 'index.md'}`

      let newPages =
        state.pages?.filter(page => {
          return page.path !== fileName
        }) || []
      newPages.push({ title: title, path: newFileName })

      store.mutations.setPages(newPages)

      // If it is a new page
      if (fileName === '') {
        fileName = newFileName
      }

      // If title changed
      if (fileName && fileName !== newFileName) {
        fileName = {
          old: fileName,
          new: newFileName,
        }
      }

      const finalContent = `${
        title ? makePageFrontMatter(title, index) + '\n' : ''
      }${content} `

      databaseAPI
        .writeFile(
          state.currentRepository.owner,
          state.currentRepository.name,
          fileName,
          finalContent,
          message,
        )
        .then(() => {
          state.buildStatus.setBuildingAndCheckStatusLater()
          page(
            `/atelier-list-pages?repoName=${currentRepository.name}&account=${currentRepository.owner}`,
          )
        })
        .catch(msg => handleErrors(msg))
    },
  )
}
