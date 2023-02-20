<script>
  import Skeleton from "./Skeleton.svelte";

  export let publishedWebsiteURL;
  export let buildStatus;
  export let pages;

</script>

<Skeleton {publishedWebsiteURL} {buildStatus}>
  <section class="screen" id="atelier-list-pages">
    <div id="pages">
      <h2>L'atelier — Pages</h2>

      <div class="mesPages">
        <ul class="pages-list">
          {#each pages || [] as page}
            <li><a href="./atelier-page?page={page.path}">{page.title}</a></li>
          {/each}
        </ul>

        <a href="./atelier-page" class="btn btn__medium">Nouvelle page</a>
      </div>
    </div>
  </section>
</Skeleton>

<style lang="scss">
 .pages-list {
    margin-bottom: 4rem;

    li {
      font-size: 1.3rem;
      & + li {
        margin-top: 2rem;
      }

      a {
        text-transform: capitalize;
      }
    }
  }
</style>
