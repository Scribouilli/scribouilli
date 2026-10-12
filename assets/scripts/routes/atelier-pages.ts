import lireFrontMatter from 'front-matter'
import page, { Context } from 'page'

import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import store, { type ScribouilliState } from '../store'
import { handleErrors, logMessage, makeFileNameFromTitle } from '../utils'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.ts'
import PageContenu from '../components/screens/PageContenu.svelte'
import { deletePage, createPage, updatePage } from './../actions/page'
import { makeAtelierListPageURL } from './urls.ts'
import { showArticles } from '../actions/article'
import type { EditeurFile } from '../types/atelier.ts'
import { setBuildingAndCheckStatusLater } from '../buildStatus'

const makeMapStateToProps =
  (fileName: string): ((state: ScribouilliState) => any) =>
  state => {
    const onSave: (file: EditeurFile) => Promise<void> = async ({
      fileName,
      title,
      content,
      previousTitle,
      previousContent,
      index,
      blogIndex,
    }): Promise<void> => {
      if (!state.currentRepository || !state.gitAgent) return

      const hasContentChanged = content !== previousContent
      const hasTitleChanged = title !== previousTitle

      // If no content changed, just redirect
      if (!hasTitleChanged && !hasContentChanged) {
        page(makeAtelierListPageURL(state.currentRepository))
        return
      }

      // If the file name is empty, it means that we are creating a new page.
      if (fileName === '') {
        try {
          await createPage(content, title, index)
          setBuildingAndCheckStatusLater(
            state.currentRepository,
            state.gitAgent,
          )
          page(makeAtelierListPageURL(state.currentRepository))
          return
        } catch (msg: any) {
          handleErrors(msg)
        }
      }

      try {
        throw `On a besoin de savoir quelle était la valeur de inMenu pour la fournir`
        await updatePage(fileName, title, content, index, inMenu, blogIndex)
        setBuildingAndCheckStatusLater(state.currentRepository, state.gitAgent)
        page(makeAtelierListPageURL(state.currentRepository))
      } catch (msg: any) {
        handleErrors(msg)
      }
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
            if (!state.currentRepository || !state.gitAgent) return
            setBuildingAndCheckStatusLater(
              state.currentRepository,
              state.gitAgent,
            )
            page(makeAtelierListPageURL(state.currentRepository))
          })
          .catch(msg => handleErrors(msg))
      }

      const fileP: () => Promise<EditeurFile | undefined> =
        async function (): Promise<EditeurFile | undefined> {
          try {
            const content = await gitAgent.getFile(fileName)
            const { attributes: data, body: markdownContent } =
              lireFrontMatter<{
                title: string
                order: number
                blog_index: boolean
              }>(content)
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
            if (typeof errorMessage === 'string') {
              logMessage(
                errorMessage,
                'routes/atelier-pages.js:makeMapStateToProps',
              )
            }
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

export default async ({ querystring }: Context) => {
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
