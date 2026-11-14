<script lang="ts">
  import type { Article } from '#lib/atelier/article.svelte.ts'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import ListContenu from '#lib/components/atelier/ListContenu.svelte'
  import { resolve } from '$app/paths'

  const atelier = getAtelier()
  let articles: Article[] = $derived(atelier.articles)
</script>

<ListContenu
  listContenu={articles}
  title="Articles"
  atelierPrefix={resolve('/atelier/(site)/articles/edit')}
  newContentButtonText="Nouvel article"
  allowModification={false}
/>
