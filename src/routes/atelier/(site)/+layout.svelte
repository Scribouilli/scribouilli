<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import type { LayoutProps } from './$types'
  import Loader from '#lib/components/Loader.svelte'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import SavingLoader from '#lib/components/SavingLoader.svelte'

  let loading = $state(true)
  const { children }: LayoutProps = $props()
  const atelier = getAtelier()

  onMount(async () => {
    console.log('loading repo')
    const repoPath = page.url.searchParams.get('repoPath')
    const owner = page.url.searchParams.get('account')
    await atelier.loadRepo(repoPath, owner)
    console.log('repo loaded')
    loading = false
  })
</script>

{#if loading}
  <Loader />
{:else}
  <!-- only hide the children instead of re-rendering them to keep state when repo is syncing -->
  {#if atelier.repo.status === 'sync'}
    <SavingLoader />
  {/if}
  <div hidden={atelier.repo.status === 'sync'}>
    {@render children()}
  </div>
{/if}
