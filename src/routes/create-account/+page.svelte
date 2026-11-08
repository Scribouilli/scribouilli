<script lang="ts">
  import { PROVIDERS_MAP } from '#lib/config.ts'
  import type { ScribouilliBackendProvider } from '#lib/providers/index.ts'
  import { page } from '$app/state'
  import { resolve } from '$app/paths'
  import { error } from '@sveltejs/kit'
  import { onMount } from 'svelte'

  let provider: ScribouilliBackendProvider | undefined = $state()

  onMount(() => {
    const providerId = page.url.searchParams.get('provider')

    if (!providerId) {
      error(400, `Missing 'provider' parameter`)
    }

    provider = PROVIDERS_MAP.get(providerId)

    if (!provider) {
      error(404, `Unkown provider ${providerId}`)
    }
  })
</script>

{#if provider}
  <section class="screen">
    <div>
      {#if provider.type === 'github'}
        <h2>Créer un compte GitHub</h2>
      {:else}
        <h2>Créer un compte sur {provider.id}</h2>
      {/if}

      <div class="config-content">{@html provider.signupInstructions}</div>

      {#if provider.signupEnabled}
        <div class="btn-list">
          <a href={provider.signupLink} target="_blank" class="btn"
            >Créer un compte {provider.name}</a
          >
          <a href={resolve(`/login?provider=${provider.id}`)} class="btn">J'ai créé un compte</a>
        </div>
      {/if}
    </div>
  </section>
{/if}

<style lang="css">
  .screen {
    max-width: 70%;
    margin: 0 auto;

    & > div {
      display: flex;
      justify-content: center;
      flex-direction: column;
      font-size: 1.5rem;
    }
  }

  .screen h2 {
    margin-bottom: 2rem;
  }

  .btn-list {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
    margin-top: 4rem;
  }
</style>
