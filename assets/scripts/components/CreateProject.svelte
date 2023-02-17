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

<Skeleton {publishedWebsiteURL}>
  {#if projectCreationProgressP === undefined}
    <section class="screen" id="create-project">
      <h2>Créez un site</h2>

      {#await siteRepoConfig}
        (Vérification de l'existance de votre site)
      {:catch}
        {#await publishedWebsiteURL}
          (En attente de récupération du nom d'utilisateur-ice)
        {:then url}
          <h3>
            Ce site va être créé à l'adresse <span class="url">{url}</span>
          </h3>
        {/await}
      {/await}

      <button class="btn submit" on:click={clickListener}>Créer le site</button>
    </section>
  {:else}
    {#await projectCreationProgressP}
      <section class="screen" id="loader">
        <h2>Nous sommes en train de créer l'espace de publication</h2>
        <img
          src="./assets/images/hearts.svg"
          alt="cœur sur toi le temps que ça charge"
        />
      </section>
    {:then url}
      <section class="screen" id="loader">
        <h2>Youpiiiiiiiiiii !!</h2>
        <p>Le site est publié par ici : <a href={url}>{url}</a></p>
        <p>
          Pour rajouter des pages, c'est <a href="./atelier-list-pages"
            >par là</a
          >
        </p>
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
