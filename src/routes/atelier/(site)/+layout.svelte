<script lang="ts">
  import { setCurrentRepositoryFromQuerystring } from '#lib/atelier.ts'
  import { page } from '$app/state'
  import { onMount } from 'svelte'
  import type { LayoutProps } from './$types'
  import Loader from '#lib/components/Loader.svelte'

  let loading = $state(true)
  let { children }: LayoutProps = $props()

  onMount(async () => {
    await setCurrentRepositoryFromQuerystring(page.url.searchParams)
    loading = false
  })
</script>

{#if loading}
  <Loader />
{:else}
  {@render children()}
{/if}
