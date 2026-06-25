<script lang="ts">
  import Skeleton from "./../Skeleton.svelte";
  import SiteCreationLoader from "./../loaders/SiteCreationLoader.svelte";
  import type { GithubRepository } from "../../types/git";

  interface Props {
    currentUserReposP: Promise<GithubRepository[] | void>
  }

  let { currentUserReposP }: Props = $props();
  
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
