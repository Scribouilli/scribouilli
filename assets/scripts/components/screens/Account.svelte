<script lang="ts">
  import { ScribouilliBackendProvider } from "../../types/atelier"
  import Skeleton from "../Skeleton.svelte";

  interface Props {
    provider: ScribouilliBackendProvider
  }

  let { provider }: Props = $props();
</script>

<Skeleton>
  <section class="screen" id="account">
    <div>
      {#if provider.type === 'github' }
        <h2>Avez-vous un compte GitHub&nbsp;?</h2>
      {:else}
        <h2>Avez-vous un compte sur { provider.id }&nbsp;?</h2>
      {/if}

      <div>
        <a href="./login?provider={ provider.id }" class="btn">Oui, je me connecte</a>
        <a href="./create-account?provider={ provider.id }" class="btn"
          >Non, je veux créer un compte</a
        >
      </div>
    </div>
  </section>
</Skeleton>

<style lang="scss">
  #account {
    max-width: 70%;
    margin: 0 auto;

    &> div {
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
