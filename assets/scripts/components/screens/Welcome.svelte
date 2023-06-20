<script>
  import Skeleton from "../Skeleton.svelte";

  export let showWelcome = false;
</script>

<Skeleton>
  <section class="screen" id="welcome">
    {#if showWelcome}
      <h2>Créez votre petit site facilement !</h2>

      <a href="./account" class="btn">C'est parti !</a>
    {/if}
  </section>
</Skeleton>
