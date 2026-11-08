<script lang="ts">
  import { PROVIDERS_MAP } from '#lib/config.ts'
  import type { ScribouilliBackendProvider } from '#lib/providers/index.ts'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
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
  <section class="screen" id="account">
    <div>
      {#if provider.type === 'github'}
        <h2>Avez-vous un compte GitHub&nbsp;?</h2>
      {:else}
        <h2>Avez-vous un compte sur {provider.id}&nbsp;?</h2>
      {/if}

      <div>
        <a href={resolve(`/login?provider=${provider.id}`)} class="btn">Oui, je me connecte</a>
        <a href={resolve(`/create-account?provider=${provider.id}`)} class="btn"
          >Non, je veux créer un compte</a
        >
      </div>
    </div>
  </section>
{/if}

<style lang="css">
  #account {
    max-width: 70%;
    margin: 0 auto;

    & > div {
      align-items: center;
      justify-content: flex-start;
      flex-direction: column;
      h2 {
        margin-bottom: 2rem;
      }
    }
  }

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
  }
</style>
