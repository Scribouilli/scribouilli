<script lang="ts">
  import {
    TOCTOCTOC_OAUTH_PROVIDER_ORIGIN_PARAMETER,
    TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
    TOCTOCTOC_ORIGIN,
  } from '#lib/config.ts'
  import type { ScribouilliBackendProvider } from '#lib/providers/index.ts'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
  import type { PageProps } from './$types'
  import { onMount } from 'svelte'

  // TODO: Move in auth.ts
  function redirectURLByProvider(
    { type: providerType, origin }: ScribouilliBackendProvider,
    destination: string,
  ) {
    if (providerType === 'github') {
      return `${TOCTOCTOC_ORIGIN}/github-callback?destination=${destination}`
    } else if (providerType === 'gitlab') {
      return `${TOCTOCTOC_ORIGIN}/gitlab-callback/${origin}/?destination=${destination}`
    } else if (providerType === 'scribouilli') {
      return `${destination}?${TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER}=scribouilli&${TOCTOCTOC_OAUTH_PROVIDER_ORIGIN_PARAMETER}=${origin}`
    } else {
      throw new Error('unreachable')
    }
  }

  // TODO: Move in auth.ts
  function makeLoginHref(
    { clientId, type: providerType, origin }: ScribouilliBackendProvider,
    redirectUrl: string,
  ) {
    if (providerType === 'github') {
      return `${origin}/login/oauth/authorize?client_id=${clientId}&scope=public_repo,user:email,delete_repo&redirect_uri=${redirectUrl}`
    } else if (providerType == 'gitlab') {
      return `${origin}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&scope=api+read_api`
    } else {
      return `${origin}/login?callback=${encodeURIComponent(redirectUrl)}`
    }
  }

  const { data }: PageProps = $props()
  let href: string | undefined = $state()
  const provider = $derived(data.provider)

  onMount(() => {
    const destination = page.url.origin + resolve('/apres-connexion')

    const redirectUrl = redirectURLByProvider(provider, destination)
    href = makeLoginHref(provider, redirectUrl)
  })
</script>

{#if provider}
  {#if provider.type === 'github'}
    <section class="screen" id="login">
      <h2>Super, nous allons vous demander les clefs sur la page suivante.</h2>

      <a {href} class="btn">Je me connecte via GitHub</a>
    </section>
  {/if}
  {#if provider.type === 'gitlab'}
    <section class="screen" id="login">
      <h2>Super, nous allons vous demander les clefs sur la page suivante.</h2>

      <a {href} class="btn">Je me connecte via {provider.id}</a>
    </section>
  {/if}
  {#if provider.type === 'scribouilli'}
    <section class="screen" id="login">
      <h2>Super, nous allons vous demander les clefs sur la page suivante.</h2>

      <a {href} class="btn">Je me connecte</a>
    </section>
  {/if}
{/if}

<style>
  #login {
    width: 70%;
    margin: 0 auto;
  }
</style>
