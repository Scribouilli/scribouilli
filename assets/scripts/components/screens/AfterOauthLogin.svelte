<script>
  import Skeleton from "./../Skeleton.svelte";
  import SiteCreationLoader from "./../loaders/SiteCreationLoader.svelte";

  /**
   * @typedef {Object} Props
   * @property {Promise<GithubRepository[]|Void>} currentUserReposP
   */

  /** @type {Props} */
  let { currentUserReposP } = $props();
  
</script>

<Skeleton>
  <section class="screen" id="loader">
    {#await currentUserReposP}
        <h2>Nous regardons si vous avez plusieurs sites Scribouilli…</h2>
        <img
        src="./assets/images/hearts.svg"
        alt="cœur sur toi le temps que ça charge"
        />
    {:then}
        <SiteCreationLoader />
    {/await}
  </section>
</Skeleton>
