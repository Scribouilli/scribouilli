<script lang="ts">
  import lireFrontMatter from 'front-matter'
  import { makeAtelierListArticlesURL } from '#lib/urls.ts'
  import { setCurrentRepositoryFromQuerystring, type EditeurFile } from '#lib/atelier.ts'
  import Editeur from '#lib/components/atelier/Editeur.svelte'
  import * as store from '#lib/store.svelte.ts'
  import { goto } from '$app/navigation'
  import { setBuildingAndCheckStatusLater } from '#lib/build-status.ts'
  import { handleErrors } from '#lib/error.ts'
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { error } from '@sveltejs/kit'
  import { createArticle, deleteArticle, updateArticle } from '#lib/article.ts'

  const onSave: (file: EditeurFile) => Promise<void> = async ({
    fileName,
    content,
    previousContent,
    title,
    previousTitle,
  }): Promise<void> => {
    if (!store.state.currentRepository || !store.state.gitAgent) return

    const hasContentChanged = content !== previousContent
    const hasTitleChanged = title !== previousTitle
    const articlePageUrl = makeAtelierListArticlesURL(store.state.currentRepository)

    // If no content changed, just redirect
    if (!hasTitleChanged && !hasContentChanged) {
      return goto(articlePageUrl)
    }

    // If the file name is empty, it means that we are creating a new article.
    if (fileName === '') {
      try {
        await createArticle(title, content)
        setBuildingAndCheckStatusLater(store.state.currentRepository, store.state.gitAgent)
        goto(articlePageUrl)
        return
      } catch (msg: any) {
        handleErrors(msg)
      }
    }

    try {
      await updateArticle(fileName, title, content)
      setBuildingAndCheckStatusLater(store.state.currentRepository, store.state.gitAgent)
      goto(articlePageUrl)
      return
    } catch (msg: any) {
      handleErrors(msg)
    }
  }

  let onDelete = $state(() => {})
  let file: EditeurFile | undefined = $state()
  let listPrefix = $derived(
    store.state.currentRepository ? makeAtelierListArticlesURL(store.state.currentRepository) : '',
  )

  onMount(async () => {
    await setCurrentRepositoryFromQuerystring(page.url.searchParams)

    const fileName = decodeURIComponent(page.url.searchParams.get('path') ?? '')

    if (fileName) {
      const { gitAgent } = store.state

      if (!gitAgent) {
        error(500, 'gitAgent is undefined')
      }

      onDelete = () => {
        deleteArticle(fileName)
          .then(() => {
            if (!store.state.currentRepository || !store.state.gitAgent) return
            setBuildingAndCheckStatusLater(store.state.currentRepository, store.state.gitAgent)
            goto(makeAtelierListArticlesURL(store.state.currentRepository))
          })
          .catch(msg => handleErrors(msg))
      }

      try {
        const content = await gitAgent.getFile(fileName)
        const { attributes: data, body: markdownContent } = lireFrontMatter<{
          title: string
        }>(content)

        file = {
          fileName,
          content: markdownContent,
          previousContent: markdownContent,
          title: data?.title,
          previousTitle: data?.title,
          // TODO: ces deux propriétés font pas beaucoup de sens sur un Article
          index: -1,
          blogIndex: false,
        }
      } catch (errorMessage: any) {
        handleErrors(errorMessage)
      }
    } else {
      file = {
        fileName: '',
        content: '',
        previousContent: undefined,
        title: '',
        previousTitle: undefined,
        // TODO: voir plus haut
        index: -1,
        blogIndex: false,
      }
    }
  })
</script>

<Editeur
  {file}
  contenus={store.state.articles}
  editionTitle="Édition d'un article"
  {listPrefix}
  deleteTitle="Supprimer l'article"
  {onDelete}
  {onSave}
/>
