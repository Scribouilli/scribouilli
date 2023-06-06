<script>
  import Skeleton from "./Skeleton.svelte";
  import Loader from "./Loader.svelte";
  import { createRepositoryForCurrentAccount } from "../actions.js";

  let name = "";
  let loading = false;

  const onSubmit = (e) => {
    e.preventDefault();

    loading = true;

    createRepositoryForCurrentAccount(name)
      .catch((err) => {
        loading = false;

        // handle errors on form?
        console.log(err);
      });
  };

  const validateName = (e) => {
    name = e.target.value;

    // add validation here

    return true
  };
</script>

<Skeleton>
  <section class="screen">
    <h3>Créer un nouveau site</h3>

    <div class="wrapper">
      <form on:submit={onSubmit}>
        <div>
          <label for="name">Nom de votre site</label>
          <input
            bind:value={name}
            on:change={validateName}
            type="text"
            id="name"
            required
          />
        </div>

        <div class="actions-zone">
          <button
            type="submit"
            class="btn__medium btn"
            disabled={loading}
          >
            {#if loading}
              <Loader />
            {:else}
              Créer mon nouveau site
            {/if}
          </button>
        </div>
      </form>
    <div>
  </section>
</Skeleton>
