<script lang="ts">
  import lireFrontMatter from 'front-matter'
  import { makeAtelierListArticlesURL, makeAtelierListPageURL } from '#lib/urls.ts'
  import type { EditeurFile } from '#lib/atelier.ts'
  import Editeur from '#lib/components/atelier/Editeur.svelte'
  import type { Page } from '#lib/atelier/page.svelte.ts'
  import { goto } from '$app/navigation'
  import { handleErrors } from '#lib/error.ts'
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'

  const atelier = getAtelier()
  const pages: Page[] = $derived(atelier.pages)

  const onSave: (file: EditeurFile) => Promise<void> = async ({
    fileName,
    title,
    content,
    previousTitle,
    previousContent,
    index,
    blogIndex,
  }: EditeurFile) => {
    const repo = atelier.repo
    const pagesUrl = makeAtelierListPageURL(repo)

    const hasContentChanged = content !== previousContent
    const hasTitleChanged = title !== previousTitle

    // If no content changed, just redirect
    if (!hasTitleChanged && !hasContentChanged) {
      await goto(pagesUrl)
      return
    }

    let promise
    // If the file name is empty, it means that we are creating a new page.
    if (fileName === '') {
      promise = repo.pageList.create(content, title, index)
    } else {
      promise = repo.pageList.update(fileName, title, content, index, blogIndex)
    }

    await repo.sync(promise.then(() => goto(pagesUrl)))
  }

  const onDelete = ({ fileName }: EditeurFile) => {
    atelier.repo.sync(
      atelier.repo.pageList.delete(fileName).then(() => goto(makeAtelierListPageURL(atelier.repo))),
    )
  }

  let file: EditeurFile | undefined = $state()
  let listPrefix = $derived(
    makeAtelierListPageURL({ owner: atelier.repo.owner, repoPath: atelier.repo.repoPath }),
  )

  onMount(async () => {
    const fileName = decodeURIComponent(page.url.searchParams.get('path') ?? '')

    if (fileName) {
      try {
        const content = await atelier.repo.gitAgent.getFile(fileName)
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
