<script>
  import Skeleton from "./../Skeleton.svelte";
  import SiteCreationLoader from "./../loaders/SiteCreationLoader.svelte";
  import '../../../types.js'

  /** @type {Promise<GithubRepository[]|Void>} */
  export let currentUserReposP;
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
