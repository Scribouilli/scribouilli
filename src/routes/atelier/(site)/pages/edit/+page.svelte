<script lang="ts">
  import lireFrontMatter from 'front-matter'
  import { makeAtelierListPageURL } from '#lib/urls.ts'
  import type { EditeurFile } from '#lib/atelier.ts'
  import Editeur from '#lib/components/atelier/Editeur.svelte'
  import * as store from '#lib/store.svelte.ts'
  import type { Page } from '#lib/page.ts'
  import { goto } from '$app/navigation'
  import { setBuildingAndCheckStatusLater } from '#lib/build-status.ts'
  import { handleErrors } from '#lib/error.ts'
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { getCurrentRepo } from '#lib/context.ts'

  const repo = getCurrentRepo()
  let pages: Page[] = $state([])

  repo.pages.listAll().then(newPages => (pages = newPages))

  const onSave: (file: EditeurFile) => Promise<void> = async ({
    fileName,
    title,
    content,
    previousTitle,
    previousContent,
    index,
    blogIndex,
  }: EditeurFile) => {
    const repo = getCurrentRepo()

    const hasContentChanged = content !== previousContent
    const hasTitleChanged = title !== previousTitle

    // If no content changed, just redirect
    if (!hasTitleChanged && !hasContentChanged) {
      goto(makeAtelierListPageURL(repo))
      return
    }

    // If the file name is empty, it means that we are creating a new page.
    if (fileName === '') {
      try {
        await repo.pages.create(content, title, index)
        setBuildingAndCheckStatusLater(repo)
        goto(makeAtelierListPageURL(repo))
        return
      } catch (msg: any) {
        handleErrors(msg)
      }
    }

    try {
      await repo.pages.update(fileName, title, content, index, blogIndex)
      setBuildingAndCheckStatusLater(repo)
      goto(makeAtelierListPageURL(repo))
      return
    } catch (msg: any) {
      handleErrors(msg)
    }
  }

  const onDelete = ({ fileName }: EditeurFile) => {
    repo.pages
      .delete(fileName)
      .then(() => {
        setBuildingAndCheckStatusLater(repo)
        goto(makeAtelierListPageURL(repo))
      })
      .catch(msg => handleErrors(msg))
  }

  let file: EditeurFile | undefined = $state()
  let listPrefix = $derived(
    store.state.currentRepository ? makeAtelierListPageURL(store.state.currentRepository) : '',
  )

  onMount(async () => {
    const fileName = decodeURIComponent(page.url.searchParams.get('path') ?? '')

    if (fileName) {
      try {
        const content = await repo.gitAgent.getFile(fileName)
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
        index: pages ? pages.length + 1 : 1,
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
  contenus={pages}
  editionTitle="Édition d'une page"
  {listPrefix}
  deleteTitle="Supprimer la page"
  {onDelete}
  {onSave}
/>
