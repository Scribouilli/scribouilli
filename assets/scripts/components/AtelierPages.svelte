<script>
    export let publishedWebsiteURL
    export let pages
    export let buildStatus

    let status = buildStatus.status;

    buildStatus.subscribe(s => { status = s });

    let buildStatusClass;

    $: buildStatusClass = status === 'building' ? 'build-ing' : 
        (status === 'built' ? 'build-success' : 'build-error')

</script>

<section class="screen" id="atelier-pages">
    {#await publishedWebsiteURL}
    (en attente de l'origine)
    {:then url}
    <h2><a href={url} class="project-name">{ url }</a></h2>
    {/await}
    

    <nav>
        <a href=".">Pages</a>
        <a href="#TODO-articles">Articles</a>
        <a href="#TODO-parametres">Paramètres</a>
    </nav>

    <div id="pages">
        <h3 class={buildStatusClass}>Pages</h3>
        
        <a href="/atelier-create-page">Nouvelle page</a>
        
        <ul class="pages-list">
            {#each pages || [] as page}
            <li>{ page.path }</li>
            {/each}
        </ul>
    </div>
</section>

<style lang="scss">
[class^="build-"] {
    &::after{
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