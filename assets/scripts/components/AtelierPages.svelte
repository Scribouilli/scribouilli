<script>
    export let publishedWebsiteURL
    export let pages
</script>

<section class="screen" id="atelier-pages">
    {#await publishedWebsiteURL}
    (en attente de l'origine)
    {:then url}
    <h2><a href={url} class="project-name">{ url }</a></h2>
    {/await}
    

    <nav>
        <a href="#atelier-pages">Pages</a>
        <a href="#atelier-articles">Articles</a>
        <a href="#atelier-parametres">Paramètres</a>
    </nav>

    <div id="pages">
        <h3>Pages</h3>
        
        <a href="/atelier-create-page">Nouvelle page</a>
        
        <ul class="pages-list">
            {#each pages || [] as page}
            <li>{ page.path }</li>
            {/each}
        </ul>
    </div>
</section>