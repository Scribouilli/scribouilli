<script lang="ts">
  import { onMount } from 'svelte'
  import Loader from '#lib/components/Loader.svelte'
  import type { LayoutProps } from './$types'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import { handleErrors } from '#lib/error.ts'

  let { children }: LayoutProps = $props()

  let atelier = getAtelier()
  let loading = $state(true)

  onMount(async () => {
    try {
      console.log(atelier)
      await Promise.all([atelier.repoList.refresh(), atelier.account.refresh()])
      loading = false
    } catch (e) {
      console.error('Failed to load resources: ', e)
      handleErrors(e)
    }
  })
</script>

{#if loading}
  <Loader />
{:else}
  {@render children()}
{/if}
