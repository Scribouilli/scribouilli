<script lang="ts">
  import { resolve } from '$app/paths'

  import type { PageProps } from './$types'
  const { data }: PageProps = $props()
  const provider = $derived(data.provider)
</script>

{#if provider}
  <section class="container">
    <div>
      {#if provider.type === 'github'}
        <h2>Avez-vous un compte GitHub&nbsp;?</h2>
      {:else}
        <h2>Avez-vous un compte sur {provider.id}&nbsp;?</h2>
      {/if}

      <div class="action-list">
        <a
          href={resolve(`/connexion/[provider]/se-connecter`, { provider: provider.id })}
          class="btn">Oui, je me connecte</a
        >
        <a
          href={resolve(`/connexion/[provider]/creer-compte`, { provider: provider.id })}
          class="btn">Non, je veux créer un compte</a
        >
      </div>
    </div>
  </section>
{/if}

<style lang="css">
  h2 {
    margin-bottom: 2rem;
  }
</style>
