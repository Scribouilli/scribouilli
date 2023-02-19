<script>
  export let publishedWebsiteURL;
  export let buildStatus;

  buildStatus?.checkStatus()

  let status = buildStatus?.status;
  console.debug("Header buildstatus ", buildStatus);

  console.debug("Header status ", status);

  buildStatus?.subscribe((s) => {
      console.debug("Header subscribe ", s);
      if (s) {
        status = s;
      }
    });

  $: buildStatusClass = `build-${status}`;
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
          <span class={buildStatusClass} />
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
    content: "🕰";
  }

  .build-built::after {
    content: "✅";
  }

  .build-error::after {
    content: "❌";
  }
</style>
