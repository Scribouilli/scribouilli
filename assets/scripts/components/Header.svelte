<script>
  export let publishedWebsiteURL;
  export let buildStatus;

  let status = undefined;

  if (buildStatus) {
    status = buildStatus.status;

    buildStatus.subscribe((s) => {
      console.debug("Header subscribe ", s);
      if (s) {
        status = s;
      }
    });
  }

  $: buildStatusClass = buildStatus ? `build-${status}` : undefined;
</script>

<header>
  <h1><a href="./" class="go-home">Scribouilli</a></h1>

  <div>
    {#if publishedWebsiteURL}
      {#await publishedWebsiteURL}
        (en attente de l'origine)
      {:then url}
        <div>
          <a href={url} class="project-name" target="_blank">{url}</a>
          {#if buildStatusClass}
            <span class={buildStatusClass} />
          {/if}
        </div>
      {/await}

      <nav>
        <ul>
          <li><a href="./atelier-list-pages">Pages</a></li>
          <li><a href="./settings">Paramètres</a></li>
        </ul>
      </nav>
    {/if}
  </div>
</header>

<style lang="scss">
  [class^="build-"] {
    &::after {
      margin-left: 1rem;
    }
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
