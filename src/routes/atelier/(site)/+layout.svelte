<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import type { LayoutProps } from './$types'
  import { getCurrentRepoFromQueryString } from '#lib/atelier.ts'
  import Loader from '#lib/components/Loader.svelte'
  import { getProvider, setCurrentRepo } from '#lib/context.ts'

  let loading = $state(true)
  let { children }: LayoutProps = $props()

  onMount(async () => {
    const provider = getProvider()

    const repo = await getCurrentRepoFromQueryString(provider, page.url.searchParams)
    setCurrentRepo(repo)
    loading = false
  })
</script>

{#if loading}
  <Loader />
{:else}
  {@render children()}
{/if}
