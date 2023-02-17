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

<Skeleton publishedWebsiteURL={publishedWebsiteURL}>
  <section class="screen" id="atelier-list-pages">
    <div id="pages">
      <h2 class={buildStatusClass}>Pages</h2>

      <a href="./atelier-page" class="btn">Nouvelle page</a>

      <div class="mesPages">
        <h3>Mes pages</h3>

        <ul class="pages-list">
          {#each pages || [] as page}
            <li><a href="./atelier-page?page={page.path}">{page.path}</a></li>
          {/each}
        </ul>
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
    li {
      & + li {
        margin-top: 2rem;
      }
    }
  }
</style>
