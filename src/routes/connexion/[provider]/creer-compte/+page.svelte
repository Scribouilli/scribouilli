<script lang="ts">
  import NewTabLink from '#lib/components/NewTabLink.svelte'
  import { resolve } from '$app/paths'

  import type { PageProps } from './$types'
  const { data }: PageProps = $props()
  const provider = $derived(data.provider)
</script>

{#if provider}
  <section class="container">
    <div>
      {#if provider.type === 'github'}
        <h1>Créer un compte GitHub</h1>
      {:else}
        <h1>Créer un compte sur {provider.id}</h1>
      {/if}

      <div class="config-content">{@html provider.signupInstructions}</div>

      {#if provider.signupEnabled}
        <div class="action-list">
          <NewTabLink href={provider.signupLink ?? ''} class="btn">
            Créer un compte {provider.name}
          </NewTabLink>
          <a
            href={resolve(`/connexion/[provider]/se-connecter`, { provider: provider.id })}
            class="btn">J'ai créé un compte</a
          >
        </div>
      {/if}
    </div>
  </section>
{/if}
