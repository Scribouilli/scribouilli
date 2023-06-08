<script>
  // @ts-check

  export let publishedWebsiteURL;
  export let buildStatus;
  export let repositoryURL;
  export let showArticles

  let status = undefined;

  if (buildStatus) {
    status = buildStatus.status;

    buildStatus.subscribe((s) => {
      if (s) {
        status = s;
      }
    });
  }

  $: buildStatusClass = buildStatus ? `build-${status}` : undefined;
</script>

<header>
  <h1><a href="./" class="go-home">Scribouilli</a></h1>

  {#if publishedWebsiteURL}
    <div>
      {#await publishedWebsiteURL}
        (en attente de l'origine)
      {:then url}
        <div>
          <a href={url} class="project-name" target="_blank">{url}</a>
          {#if buildStatusClass}
            <p class={buildStatusClass} />
          {/if}
        </div>
      {/await}

      <nav>
        <ul>
          <li><a href="./atelier-list-pages">Pages</a></li>
          {#if showArticles}
            <li><a href="./atelier-list-articles">Articles</a></li>            
          {/if}
          <li><a href="./settings">Paramètres</a></li>
          <li>
            {#if repositoryURL}
              {#await repositoryURL then urlrepository}
                <a href={urlrepository} target="_blank">Github</a>
              {/await}
            {/if}
          </li>
        </ul>
      </nav>
    </div>
  {/if}
</header>

<style lang="scss">
  [class^="build-"] {
    margin-top: 0.3rem;
  }

  .build-building::after {
    content: "🕰 En cours de publication";
  }

  .build-built::after {
    content: "✅ Site à jour (sinon pensez à actualiser)";
  }

  .build-errored::after {
    content: "❌ Oups il y a peut-être un souci";
  }
</style>
