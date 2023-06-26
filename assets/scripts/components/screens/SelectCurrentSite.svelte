<script>
  import page from "page";

  import Skeleton from "./../Skeleton.svelte";
  import Loader from "./../loaders/Loader.svelte";

  export let currentAccount;
  export let currentAccountRepositories;

  let name = "";
  let loading = false;

  const onSubmit = (e) => {
    e.preventDefault();

    loading = true;

    page(`/atelier-list-pages?repoName=${name}&account=${currentAccount}`)

    loading = false;
  };
</script>

<Skeleton>
  <section class="screen">
    <h3>Choisir le site sur lequel vous souhaitez travailler</h3>

    {#if !currentAccountRepositories}
      <Loader />
    {:else}
      <div class="wrapper">
        <form on:submit={onSubmit}>
          <div>
            <label for="name">Nom de votre site</label>
            <select id="name" bind:value={name}>
              {#each currentAccountRepositories as repo}
                <option value={repo.name}>{repo.name}</option>
              {/each}
            </select>
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
                Choisir ce site
              {/if}
            </button>
          </div>
        </form>
      </div>
    {/if}
  </section>
</Skeleton>

<style lang="scss">
  select {
    font-size: 1.2rem;
    padding: 0.5em;
  }

  .actions-zone {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 6rem;
  }
</style>
