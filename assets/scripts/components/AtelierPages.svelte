<script>
  import Skeleton from "./Skeleton.svelte";

  export let publishedWebsiteURL;
  export let pages;
  export let buildStatus;

  let status = buildStatus.status;

  buildStatus.subscribe((s) => {
    status = s;
  });

  let buildStatusClass;

  $: buildStatusClass =
    status === "building"
      ? "build-ing"
      : status === "built"
      ? "build-success"
      : "build-error";
</script>

<Skeleton {publishedWebsiteURL}>
  <section class="screen" id="atelier-list-pages">
    <div id="pages">
      <h2 class={buildStatusClass}>Pages</h2>

      <div class="mesPages">
        <ul class="pages-list">
          {#each pages || [] as page}
            <li><a href="./atelier-page?page={page.path}">{page.path}</a></li>
          {/each}
        </ul>

        <a href="./atelier-page" class="btn btn__medium">Nouvelle page</a>
      </div>
    </div>
  </section>
</Skeleton>

<style lang="scss">
  [class^="build-"] {
    &::after {
      margin-left: 1rem;
    }
  }

  .build-ing::after {
    content: "🕰";
  }

  .build-success::after {
    content: "✅";
  }

  .build-error::after {
    content: "❌";
  }

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
