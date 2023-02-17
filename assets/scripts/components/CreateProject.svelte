<script>
  import Skeleton from "./Skeleton.svelte";

  export let publishedWebsiteURL;
  export let createProject;
  export let siteRepoConfig;

  let projectCreationProgressP = undefined;

  function clickListener() {
    projectCreationProgressP = Promise.resolve(createProject).then(
      (createProject) => createProject()
    );
  }
</script>

<Skeleton>
  {#if projectCreationProgressP === undefined}
    <section class="screen" id="create-project">
      <h2>Créez un site</h2>

      {#await siteRepoConfig}
        <div><img src="/assets/images/oval.svg" alt=""></div>
        {:catch}
        {#await publishedWebsiteURL}
          <p>En attente de récupération du nom d'utilisateur·ice</p>
        {:then url}
          <p>Ce site va être créé à l'adresse <br/> <span class="url">{url}</span></p>
        {/await}
      {/await}

      <button class="btn submit" on:click={clickListener}>Créer le site</button>
    </section>
  {:else}
    {#await projectCreationProgressP}
      <section class="screen" id="loader">
        <h2>Nous sommes en train de créer le site !</h2>
        <img
          src="./assets/images/hearts.svg"
          alt="cœur sur toi le temps que ça charge"
        />
      </section>
    {:then url}
    <section class="screen" id="loader">
        <h2>Youpiiiiiiiiiii !!</h2>
        <p>Le site est publié par ici : <a href={url} target="_blank">{url}</a></p>
        <p>
          Pour éditer les pages, rendez-vous dans l'atelier :
        </p>
        <a href="./atelier-list-pages" class="btn">Découvrir l'atelier</a>
      </section>
    {/await}
  {/if}
</Skeleton>

<style lang="scss">
  .url {
    white-space: nowrap;
    color: darkslategray;
  }
</style>
