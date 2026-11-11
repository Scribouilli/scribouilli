<script lang="ts">
  import { onMount } from 'svelte'
  import { logout } from '#lib/user.ts'
  import Loader from '#lib/components/Loader.svelte'
  import type { LayoutProps } from './$types'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'

  let { children }: LayoutProps = $props()

  let atelier = getAtelier()

  onMount(async () => {
    try {
      console.log(atelier)
      await Promise.all([atelier.repoList.refresh(), atelier.account.refresh()])
    } catch (e) {
      console.error('Failed to load resources: ', e)
      logout()
    }
  })
</script>

{#if atelier.status !== 'ready'}
  <Loader />
{:else}
  {@render children()}
{/if}
