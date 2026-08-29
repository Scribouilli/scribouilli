<script lang="ts">
  import { ScribouilliBackendProvider } from "../../types/atelier"
  import Skeleton from "../Skeleton.svelte"

  interface Props {
    provider: ScribouilliBackendProvider
  }

  let { provider }: Props = $props();

</script>

<Skeleton>
  <section class="screen">
    <div>
      {#if provider.type === 'github' }
        <h2>Créer un compte GitHub</h2>
      {:else}
        <h2>Créer un compte sur { provider.id }</h2>
      {/if}

      <div class="config-content">{@html provider.signupInstructions }</div>

      {#if provider.signupEnabled }
      <div class="btn-list">
        <a href="{ provider.signupLink }" target="_blank" class="btn"
          >Créer un compte { provider.name }</a
        >
        <a href="./login?provider={ provider.id }" class="btn">J'ai créé un compte</a>
      </div>
      {/if}
    </div>
  </section>
</Skeleton>

<style lang="scss">
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
