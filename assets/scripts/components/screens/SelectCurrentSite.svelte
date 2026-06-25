<script>
  // @ts-check
  import page from "page";

  import Skeleton from "./../Skeleton.svelte";
  import Loader from "./../loaders/Loader.svelte";

  /**
   * @typedef {Object} Props
   * @property {string | Promise<string> | undefined} currentAccount
   * @property {GithubRepository[]} currentAccountRepositories
   */

  /** @type {Props} */
  let { currentAccount, currentAccountRepositories } = $props();

  /** @type {GithubRepository} */
  let repo = $state()
  let loading = $state(false);

  // @ts-ignore
  const displayRepoName = repo => {
    if (repo.owner.login === currentAccount) {
      return repo.name
    } else {
      return `${repo.owner.login} / ${repo.name}`
    }
  }

  // @ts-ignore
  const onSubmit = (e) => {
    e.preventDefault();

    loading = true;

    page(`/atelier-list-pages?repoName=${repo.name}&account=${repo.owner.login}`);

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
        <form onsubmit={onSubmit}>
          <div>
            <label for="name">Nom de votre site</label>
            <select id="name" bind:value={repo}>
              {#each currentAccountRepositories as repo}
                <option value={repo}>{displayRepoName(repo)}</option>
              {/each}
            </select>
          </div>

          <div class="actions-zone">
            <button type="submit" class="btn__medium btn" disabled={loading}>
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
