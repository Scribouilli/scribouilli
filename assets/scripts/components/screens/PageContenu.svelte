<script>
  export let fileP;
  export let imageDirUrl;
  export let publishedWebsiteURL;
  export let buildStatus;
  export let contenus;
  export let repositoryURL;

  import Editeur from "./intern/Editeur.svelte";
</script>

<Editeur
  {fileP}
  {imageDirUrl}
  {publishedWebsiteURL}
  {buildStatus}
  {repositoryURL}
  {contenus}
  editionTitle="Édition d'une page"
  listPrefix="./atelier-list-pagess"
  deleteTitle="Supprimer la page"
  on:save
  on:delete
/>
