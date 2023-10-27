<script>
  import {makeAtelierListArticlesURL} from '../../routes/atelier-list-articles.js'
  import '../../../types.js'

  /** @type {Promise<EditeurFile>} */
  export let fileP;

  /** @type any */
  export let buildStatus;

  /** @type {FileContenu[]} */
  export let contenus;

  /** @type {boolean} */
  export let showArticles;

  /** @typedef {import("./../../store.js").ScribouilliState} ScribouilliState */
  /** @type ScribouilliState["currentRepository"] */
  export let currentRepository;

  import Editeur from "./intern/Editeur.svelte";
</script>

<Editeur
  {fileP}
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
