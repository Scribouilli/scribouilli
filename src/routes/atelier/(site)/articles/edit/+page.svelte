<script lang="ts">
  import lireFrontMatter from 'front-matter'
  import { makeAtelierListArticlesURL } from '#lib/urls.ts'
  import type { EditeurFile } from '#lib/atelier.ts'
  import Editeur from '#lib/components/atelier/Editeur.svelte'
  import { goto } from '$app/navigation'
  import { handleErrors } from '#lib/error.ts'
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import type { Article } from '#lib/atelier/article.svelte.ts'

  const atelier = getAtelier()
  const articles: Article[] = $derived(atelier.articles)

  const onSave: (file: EditeurFile) => Promise<void> = async ({
    fileName,
    content,
    previousContent,
    title,
    previousTitle,
  }): Promise<void> => {
    const repo = atelier.repo
    const articlePageUrl = makeAtelierListArticlesURL(repo)

    const hasContentChanged = content !== previousContent
    const hasTitleChanged = title !== previousTitle

    // If no content changed, just redirect
    if (!hasTitleChanged && !hasContentChanged) {
      await goto(articlePageUrl)
      return
    }

    let promise
    // If the file name is empty, it means that we are creating a new article.
    if (fileName === '') {
      promise = repo.articleList.create(title, content)
    } else {
      promise = repo.articleList.update(fileName, title, content)
    }

    await repo.sync(promise.then(() => goto(articlePageUrl)))
  }

  const onDelete = ({ fileName }: EditeurFile) => {
    atelier.repo.sync(
      atelier.repo.articleList
        .delete(fileName)
        .then(() => goto(makeAtelierListArticlesURL(atelier.repo))),
    )
  }

  let file: EditeurFile | undefined = $state()
  let listPrefix = $derived(
    makeAtelierListArticlesURL({ owner: atelier.repo.owner, repoPath: atelier.repo.repoPath }),
  )

  onMount(async () => {
    const fileName = decodeURIComponent(page.url.searchParams.get('path') ?? '')

    if (fileName) {
      try {
        const content = await atelier.repo.gitAgent.getFile(fileName)
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
  contenus={articles}
  editionTitle="Édition d'un article"
  {listPrefix}
  deleteTitle="Supprimer l'article"
  {onDelete}
  {onSave}
/>
