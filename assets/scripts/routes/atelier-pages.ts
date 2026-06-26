import lireFrontMatter from 'front-matter'
import page, { Context } from 'page'

import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import store, { type ScribouilliState } from '../store'
import { handleErrors, logMessage } from '../utils'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.ts'
import PageContenu from '../components/screens/PageContenu.svelte'
import { deletePage, createPage, updatePage } from './../actions/page'
import { makeAtelierListPageURL } from './urls.ts'
import { showArticles } from '../actions/article'
import type { EditeurFile } from '../types/atelier.ts'
import { setBuildingAndCheckStatusLater } from '../buildStatus'
import { ComponentProps } from 'svelte'

const makeMapStateToProps =
  (fileName: string) =>
  (state: ScribouilliState): ComponentProps<typeof PageContenu> => {
    const EMPTY_ARTICLE = {
      fileName: '',
      title: '',
      index: (state.pages?.length ?? 0) + 1,
      content: '',
      previousTitle: undefined,
      previousContent: undefined,
      inMenu: true,
      blogIndex: false,
    }

    const { gitAgent, currentRepository } = store.state

    if (!gitAgent || !currentRepository) {
      throw new TypeError('gitAgent or currentRepository is undefined')
    }

    const onSave: (file: EditeurFile) => Promise<void> = async ({
      fileName,
      title,
      content,
      previousTitle,
      previousContent,
      index,
      blogIndex,
    }): Promise<void> => {
      const hasContentChanged = content !== previousContent
      const hasTitleChanged = title !== previousTitle

      // If no content changed, just redirect
      if (!hasTitleChanged && !hasContentChanged) {
        page(makeAtelierListPageURL(currentRepository))
        return
      }

      // If the file name is empty, it means that we are creating a new page.
      if (fileName === '') {
        try {
          await createPage(content, title, index)
          setBuildingAndCheckStatusLater(currentRepository, gitAgent)
          page(makeAtelierListPageURL(currentRepository))
          return
        } catch (msg: any) {
          handleErrors(msg)
        }
      }

      try {
        await updatePage(fileName, title, content, index, blogIndex)
        setBuildingAndCheckStatusLater(currentRepository, gitAgent)
        page(makeAtelierListPageURL(currentRepository))
      } catch (msg: any) {
        handleErrors(msg)
      }
    }

    // Display existing file
    if (fileName) {
      const onDelete = () => {
        deletePage(fileName)
          .then(() => {
            setBuildingAndCheckStatusLater(currentRepository, gitAgent)
            page(makeAtelierListPageURL(currentRepository))
          })
          .catch(msg => handleErrors(msg))
      }

      const fileP = async (): Promise<EditeurFile> => {
        try {
          const content = await gitAgent.getFile(fileName)
          const { attributes: data, body: markdownContent } = lireFrontMatter<{
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

          return EMPTY_ARTICLE
        }
      }

      return {
        fileP: fileP(),
        contenus: state.articles ?? [],
        buildStatus: state.buildStatus,
        showArticles: showArticles(state),
        currentRepository: currentRepository,
        onDelete,
        onSave,
      }
    } else {
      return {
        fileP: Promise.resolve(EMPTY_ARTICLE),
        contenus: state.pages ?? [],
        buildStatus: state.buildStatus,
        showArticles: showArticles(state),
        currentRepository: currentRepository,
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
  replaceComponent(PageContenu, mapStateToProps)
}
