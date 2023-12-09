<script>
  import page from "page";

  import Skeleton from "./../Skeleton.svelte";
  import Loader from "./../loaders/Loader.svelte";

  let loading = false;
  let hasError = false;

  // @ts-ignore
  const onSubmit = (e) => {
    e.preventDefault();
    const template = e.target.name.value;

    loading = true;

    page(`/creer-un-nouveau-site?template=${template}`);
  };
</script>

<Skeleton>
  <section class="screen">
    <h3>Choisir le type de site que vous voulez créer</h3>

    <div class="wrapper">
      <form on:submit={onSubmit}>
        <div>
          <label for="name">Je veux créer :</label>
          <select id="name">
            <option value="site-template">Un petit site simple</option>
            <option value="site-template-framalibre">Un mini-site Framalibre</option>
          </select>
        </div>

        <div class="actions-zone">
          <button type="submit" class="btn__medium btn" disabled={loading}>
            {#if loading}
              <Loader />
            {:else}
              Valider mon choix
            {/if}
          </button>
        </div>
      </form>
    </div>
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
