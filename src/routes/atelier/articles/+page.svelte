<script lang="ts">
  import { setCurrentRepositoryFromQuerystring } from '#lib/atelier.ts'
  import { page } from '$app/state'
  import { error } from '@sveltejs/kit'
  import { onMount } from 'svelte'
  import * as store from '#lib/store.svelte.ts'
  import ListContenu from '#lib/components/atelier/ListContenu.svelte'
  import { resolve } from '$app/paths'

  onMount(async () => {
    await setCurrentRepositoryFromQuerystring(page.url.searchParams)

    if (!store.state.currentRepository) {
      error(500, 'currentRepository is undefined')
    }
  })
</script>

<ListContenu
  listContenu={store.state.articles}
  title="Articles"
  atelierPrefix={resolve('/atelier/articles/edit')}
  newContentButtonText="Nouvel article"
  allowModification={false}
/>
