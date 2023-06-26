<script>
  import Skeleton from "./../Skeleton.svelte";
  import SiteCreationLoader from "./../loaders/SiteCreationLoader.svelte";
  import { createRepositoryForCurrentAccount } from "../../actions.js";

  let name = "";
  let loading = false;
  let hasError = false

  const onSubmit = (e) => {
    e.preventDefault();

    loading = true;

    createRepositoryForCurrentAccount(name)
      .catch(() => {
        loading = false;
        hasError = true;
      });
  };
</script>

<Skeleton>
  <section class="screen">
    {#if loading}
      <SiteCreationLoader />
    {:else}
      <h3>Créer un nouveau site</h3>

      <div class="wrapper">
        <form on:submit|preventDefault={onSubmit}>
          <div>
            <label for="name">Nom de votre site</label>
            <input
              bind:value={name}
              type="text"
              id="name"
              required
            />
          </div>

          <div class="actions-zone">
            {#if hasError}
              <div class="error-message">
                Il y a un <strong>souci de notre côté</strong>. Vous pouvez
                réessayer dans une heure ou demain. Si le problème persiste,
                vous pouvez nous contacter.
              </div>
            {:else}
              <button
                type="submit"
                class="btn__medium btn"
                disabled={loading}
              >
                Créer mon nouveau site
              </button>
            {/if}
          </div>
        </form>
      </div>
    {/if}
  </section>
</Skeleton>

<style lang="scss">
  .actions-zone {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 6rem;
  }

</style>
