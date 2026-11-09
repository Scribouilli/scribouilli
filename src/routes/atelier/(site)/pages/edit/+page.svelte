<script lang="ts">
  import lireFrontMatter from 'front-matter'
  import { makeAtelierListPageURL } from '#lib/urls.ts'
  import type { EditeurFile } from '#lib/atelier.ts'
  import Editeur from '#lib/components/atelier/Editeur.svelte'
  import * as store from '#lib/store.svelte.ts'
  import { deletePage, createPage, updatePage } from '#lib/page.ts'
  import { goto } from '$app/navigation'
  import { setBuildingAndCheckStatusLater } from '#lib/build-status.ts'
  import { handleErrors } from '#lib/error.ts'
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { error } from '@sveltejs/kit'

  const onSave: (file: EditeurFile) => Promise<void> = async ({
    fileName,
    title,
    content,
    previousTitle,
    previousContent,
    index,
    blogIndex,
  }: EditeurFile) => {
    if (!store.state.currentRepository || !store.state.gitAgent) return

    const hasContentChanged = content !== previousContent
    const hasTitleChanged = title !== previousTitle

    // If no content changed, just redirect
    if (!hasTitleChanged && !hasContentChanged) {
      goto(makeAtelierListPageURL(store.state.currentRepository))
      return
    }

    // If the file name is empty, it means that we are creating a new page.
    if (fileName === '') {
      try {
        await createPage(content, title, index)
        setBuildingAndCheckStatusLater(store.state.currentRepository, store.state.gitAgent)
        goto(makeAtelierListPageURL(store.state.currentRepository))
        return
      } catch (msg: any) {
        handleErrors(msg)
      }
    }

    try {
      await updatePage(fileName, title, content, index, blogIndex)
      setBuildingAndCheckStatusLater(store.state.currentRepository, store.state.gitAgent)
      goto(makeAtelierListPageURL(store.state.currentRepository))
    } catch (msg: any) {
      handleErrors(msg)
    }
  }

  let onDelete = $state(() => {})
  let file: EditeurFile | undefined = $state()
  let listPrefix = $derived(
    store.state.currentRepository ? makeAtelierListPageURL(store.state.currentRepository) : '',
  )

  onMount(async () => {
    const fileName = decodeURIComponent(page.url.searchParams.get('path') ?? '')

    if (fileName) {
      const { gitAgent } = store.state

      if (!gitAgent) {
        error(500, 'gitAgent is undefined')
      }

      onDelete = () => {
        deletePage(fileName)
          .then(() => {
            if (!store.state.currentRepository || !store.state.gitAgent) return
            setBuildingAndCheckStatusLater(store.state.currentRepository, store.state.gitAgent)
            goto(makeAtelierListPageURL(store.state.currentRepository))
          })
          .catch(msg => handleErrors(msg))
      }

      try {
        const content = await gitAgent.getFile(fileName)
        const { attributes: data, body: markdownContent } = lireFrontMatter<{
          title: string
          order: number
          blog_index: boolean
        }>(content)
        file = {
          fileName,
          content: markdownContent,
          previousContent: markdownContent,
          title: data?.title,
          index: data?.order,
          previousTitle: data?.title,
          blogIndex: data?.blog_index,
        }
      } catch (errorMessage: any) {
        handleErrors(errorMessage)
      }
    } else {
      file = {
        fileName: '',
        title: '',
        index: store.state.pages ? store.state.pages.length + 1 : 1,
        content: '',
        previousTitle: undefined,
        previousContent: undefined,
        blogIndex: false,
      }
    }
  })
</script>

<Editeur
  {file}
  contenus={store.state.pages}
  editionTitle="Édition d'une page"
  {listPrefix}
  deleteTitle="Supprimer la page"
  {onDelete}
  {onSave}
/>
