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
        <h2>Nous sommes en train de créer le site&nbsp;!</h2>
        <h3>Cela peut prendre 2-3minutes ...</h3>
        <img
          src="./assets/images/hearts.svg"
          alt="cœur sur toi le temps que ça charge"
        />
        <div>
          <p> Pendant le chargement, vous pouvez&nbsp;: </p>
          <ul>
            <li> lire un article pour apprendre à <a href="https://flus.fr/carnet/markdown.html" target="_blank">bidouiller avec du Markdown</a>.</li>
            <li> ou chanter une petite chanson.
          </ul>
        </div>
      </section>
    {:then url}
    <section class="screen" id="loader">
        <h2>Youpiiiiiiiiiii&nbsp;!!</h2>
        <p>Le site est publié par ici&nbsp;: <a href={url} target="_blank">{url}</a></p>
        <p>
          Pour éditer les pages, rendez-vous dans l'atelier&nbsp;:
        </p>
        <a href="./atelier-list-pages" class="btn">Découvrir l'atelier</a>
      </section>
    {/await}
  {/if}
</Skeleton>

<style lang="scss">
  #loader {
  width: 70%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  }
  p {
  margin-top: 3rem
  }
  .url {
    white-space: nowrap;
    color: darkslategray;
  }
  ul {
    margin-top: 1.25rem;
    text-align: left
  }
  li {
    list-style: disc;
    margin-top: 0.8rem;
    margin-bottom: 0.8rem
  }
</style>
