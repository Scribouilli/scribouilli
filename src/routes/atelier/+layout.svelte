<script lang="ts">
  import { onMount } from 'svelte'
  import { setProvider, setRepos, setUser } from '#lib/context.ts'
  import { fetchUser, logout } from '#lib/user.ts'
  import Loader from '#lib/components/Loader.svelte'
  import type { LayoutProps } from './$types'
  import * as storage from '#lib/storage.ts'

  let loading = $state(true)
  let { children }: LayoutProps = $props()

  const provider = storage.loadProvider()

  onMount(async () => {
    if (!provider) {
      logout()
    } else {
      if (await provider.api.isSessionActive()) {
        let [repos, user] = await Promise.all([
          provider.api.getCurrentUserRepositories(),
          fetchUser(provider),
        ])

        // TODO: Réimplémenter les set / get avec un $state normal
        setRepos(repos)
        setUser(user)
        setProvider(provider)
        loading = false
      } else {
        logout()
      }
    }
  })
</script>

{#if loading}
  <Loader />
{:else}
  {@render children()}
{/if}
