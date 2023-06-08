<script>
  export let fileP;
  export let imageDirUrl;
  export let publishedWebsiteURL;
  export let buildStatus;
  export let contenus;
  export let repositoryURL;
  export let showArticles

  import Editeur from "./intern/Editeur.svelte";
</script>

<Editeur
  {fileP}
  {imageDirUrl}
  {publishedWebsiteURL}
  {buildStatus}
  {repositoryURL}
  {contenus}
  {showArticles}
  editionTitle="Édition d'un article"
  listPrefix="./atelier-list-articles"
  deleteTitle="Supprimer l'article"
  on:save
  on:delete
/>
