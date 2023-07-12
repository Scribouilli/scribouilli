<script>
  import {makeAtelierListPageURL} from '../../routes/atelier-list-pages.js'

  export let fileP;
  export let imageDirUrl;
  export let buildStatus;
  export let contenus;
  export let showArticles
  export let currentRepository;

  import Editeur from "./intern/Editeur.svelte";
</script>

<Editeur
  {fileP}
  {imageDirUrl}
  {currentRepository}
  {buildStatus}
  {contenus}
  {showArticles}
  editionTitle="Édition d'une page"
  listPrefix={makeAtelierListPageURL(currentRepository.owner, currentRepository.name)}
  deleteTitle="Supprimer la page"
  on:save
  on:delete
/>
