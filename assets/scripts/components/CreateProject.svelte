<script>
    export let publishedWebsiteURL;
    export let createProject;

    let projectCreationProgressP = undefined;

    function clickListener(){
        projectCreationProgressP = Promise.resolve(createProject)
            .then(createProject => createProject())
    }

</script>

{#if projectCreationProgressP === undefined}
    <section class="screen" id="create-project">
        <h2>Créez un projet</h2>

        {#await publishedWebsiteURL}
        (en attente de l'origine)
        {:then url}
        <h3>Ce projet va être créé à l'adresse <span class="url">{url}</span> </h3>
        {/await}    

        <button class="btn submit" on:click={clickListener}>Créer le projet</button>
    </section>
{:else}
    {#await projectCreationProgressP}

    <section class="screen" id="loader">
        <h2>Nous sommes en train de créer l'espace de publication</h2>
        <img src="assets/images/hearts.svg" alt="cœur sur toi le temps que ça charge">
    </section>

    {/await}
{/if}


<style lang="scss">
    .url{
        white-space: nowrap;
        color: darkslategray;
    }
</style>

