<script lang="ts">
  import { resolve } from '$app/paths'

  import type { PageProps } from './$types'
  const { data }: PageProps = $props()
  const provider = $derived(data.provider)
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
