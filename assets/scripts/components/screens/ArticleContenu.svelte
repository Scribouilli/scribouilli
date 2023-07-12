<script>
  import {makeAtelierListArticlesURL} from '../../routes/atelier-list-articles.js'

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
  listPrefix={makeAtelierListArticlesURL(currentRepository.owner, currentRepository.name)}
  deleteTitle="Supprimer l'article"
  on:save
  on:delete
/>
