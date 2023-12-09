<script>
  import Skeleton from "../Skeleton.svelte";
  import Loader from "../loaders/Loader.svelte";

  export let showWelcome = false;
  export let isFetchingCurrentUserRepos = false;
</script>

<Skeleton>
  <section class="screen" id="welcome">
    {#if showWelcome}
      <h2>Créez votre petit site facilement !</h2>

      <a href="./choose-account" class="btn">C'est parti !</a>
    {:else if isFetchingCurrentUserRepos }
      <h2>Nous regardons si vous avez plusieurs sites Scribouilli…</h2>
      <img
        src="./assets/images/hearts.svg"
        alt="cœur sur toi le temps que ça charge"
      />
    {/if}
  </section>
</Skeleton>
