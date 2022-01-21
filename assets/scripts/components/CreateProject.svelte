<script>
    export let origin;
    export let createProject;

    let projectCreationProgressP = undefined;

    function clickListener(){
        projectCreationProgressP = createProject()
    }

</script>

{#if projectCreationProgressP === undefined}
    <section class="screen" id="create-project">
        <h2>Créez un projet</h2>

        {#await origin}
        {:then value}
        <h3>Ce projet va être créé à l'adresse https://{origin}/ </h3>

        
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




