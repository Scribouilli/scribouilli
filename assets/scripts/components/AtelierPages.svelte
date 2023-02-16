<script>
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

<section class="screen" id="atelier-list-pages">
  <header>
    {#await publishedWebsiteURL}
      (en attente de l'origine)
    {:then url}
      <a href={url} class="project-name">{url}</a>
    {/await}

    <nav>
      <ul>
        <li><a href=".">Pages</a></li>
        <li><a href="#TODO-articles">Articles</a></li>
        <li><a href="#TODO-parametres">Paramètres</a></li>
      </ul>
    </nav>
  </header>

  <div id="pages">
    <h2 class={buildStatusClass}>Pages</h2>

    <a href="/atelier-page" class="btn">Nouvelle page</a>

    <div class="mesPages">
      <h3>Mes pages</h3>

      <ul class="pages-list">
        {#each pages || [] as page}
          <li><a href="/atelier-page?page={page.path}">{page.path}</a></li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<style lang="scss">
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 2rem;
  }

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
