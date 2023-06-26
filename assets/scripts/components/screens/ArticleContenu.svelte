<script>
  export let fileP;
  export let imageDirUrl;
  export let buildStatus;
  export let contenus;
  export let showArticles;
  export let currentRepository;

  import Editeur from "./intern/Editeur.svelte";
</script>

<Editeur
  {fileP}
  {imageDirUrl}
  {buildStatus}
  {contenus}
  {showArticles}
  {currentRepository}
  editionTitle="Édition d'un article"
  listPrefix="./atelier-list-articles"
  deleteTitle="Supprimer l'article"
  on:save
  on:delete
/>
