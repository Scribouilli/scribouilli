<script>
  export let publishedWebsiteURL;
</script>

<header>
  <h1><a href="./" class="go-home">Scribouilli</a></h1>

  <div>
    {#if publishedWebsiteURL}
      {#await publishedWebsiteURL}
        (en attente de l'origine)
      {:then url}
        <a href={url} class="project-name" target="_blank">{url}</a>
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
