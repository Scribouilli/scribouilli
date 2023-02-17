<script>
  export let publishedWebsiteURL;
</script>


<header>
  <h1>Scribouilli</h1>

  {#if publishedWebsiteURL}
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
  {/if}
</header>