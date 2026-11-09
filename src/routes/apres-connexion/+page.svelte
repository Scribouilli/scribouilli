<script lang="ts">
  import { page } from '$app/state'
  import * as auth from '#lib/auth.ts'
  import { state } from '#lib/store.svelte.ts'
  import heartsLoader from '#lib/assets/images/hearts.svg'
  import {
    TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
    TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER,
    TOCTOCTOC_OAUTH_PROVIDER_ORIGIN_PARAMETER,
  } from '#lib/config.ts'

  import { fetchCurrentUserRepositories, redirectForRepos } from '#lib/user.ts'
  import { error } from '@sveltejs/kit'
  import { onMount } from 'svelte'

  // TODO: Move in auth.ts
  const storeOAuthProviderAccess = () => {
    const searchParams = page.url.searchParams

    const accessToken = searchParams.get(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER)
    const providerType = searchParams.get(TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER)
    // TODO: vérifier que l’origin est un ID de provider connu dans PROVIDER_MAP
    let origin = searchParams.get(TOCTOCTOC_OAUTH_PROVIDER_ORIGIN_PARAMETER)

    console.log('type', providerType, 'origin', origin)
    if (providerType !== 'github' && providerType !== 'gitlab' && providerType !== 'scribouilli') {
      error(400, `Unknown OAuth provider type: ${providerType}`)
    }

    if (!origin) {
      if (providerType === 'github') {
        origin = 'https://github.com'
      } else {
        throw new TypeError('missing origin')
      }
    }

    const providerId = new URL(origin).hostname

    if (providerType && accessToken) {
      const oAuthProvider = {
        type: providerType,
        accessToken,
        origin,
        id: providerId,
      }

      console.log(oAuthProvider)

      state.oAuthProvider = oAuthProvider
      auth.login(oAuthProvider)
      return oAuthProvider
    }
  }

  onMount(() => {
    storeOAuthProviderAccess()
    fetchCurrentUserRepositories().then(redirectForRepos)
  })
</script>

<section class="screen" id="loader">
  <h2>Nous regardons si vous avez plusieurs sites Scribouilli…</h2>
  <img src={heartsLoader} alt="cœur sur toi le temps que ça charge" />
</section>
