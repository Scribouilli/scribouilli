<script>
  import {makeAtelierListPageURL} from '../../routes/atelier-list-pages.js'
  import './../../types.js'

  /** @type {Promise<EditeurFile>} */
  export let fileP;

  /** @type any */
  export let buildStatus;

  /** @type {FileContenu[]} */
  export let contenus;

  /** @type {boolean} */
  export let showArticles

  /** @typedef {import("./../../store.js").ScribouilliState} ScribouilliState */
  /** @type ScribouilliState["currentRepository"] */
  export let currentRepository;

  import Editeur from "./intern/Editeur.svelte";
</script>

<Editeur
  {fileP}
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
