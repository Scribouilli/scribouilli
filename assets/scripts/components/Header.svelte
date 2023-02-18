<script>
  export let publishedWebsiteURL;
  export let buildStatus;

  let status = buildStatus?.status;

  buildStatus?.subscribe((s) => {
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

<header>
  <h1><a href="./" class="go-home">Scribouilli</a></h1>

  <div>
    {#if publishedWebsiteURL}
      {#await publishedWebsiteURL}
        (en attente de l'origine)
      {:then url}
        <div>
          <a href={url} class="project-name" target="_blank">{url}</a>
          <span class= {buildStatusClass}></span>
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

  .build-ing::after {
    content: "🕰";
  }

  .build-success::after {
    content: "✅";
  }

  .build-error::after {
    content: "❌";
  }

</style>