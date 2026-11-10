<script lang="ts">
  import ListContenu from '#lib/components/atelier/ListContenu.svelte'
  import { resolve } from '$app/paths'
  import { getCurrentRepo } from '#lib/context.ts'
  import type { Article } from '#lib/article.ts'

  let repo = getCurrentRepo()
  let articles: Article[] = $state([])

  repo.pages.listAll().then(newPages => (articles = newPages))
</script>

<ListContenu
  listContenu={articles}
  title="Articles"
  atelierPrefix={resolve('/atelier/(site)/articles/edit')}
  newContentButtonText="Nouvel article"
  allowModification={false}
/>
