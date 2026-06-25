<script>
  import {makeAtelierListPageURL} from '../../routes/urls.js'
  import Editeur from "./intern/Editeur.svelte";
  /**
   * @typedef {Object} Props
   * @property {Promise<EditeurFile>} fileP
   * @property {any} buildStatus
   * @property {FileContenu[]} contenus
   * @property {boolean} showArticles
   * @property {ScribouilliGitRepo} currentRepository
   * @property {() => void} onDelete
   * @property {(file: EditeurFile) => void} onSave
   */

  /** @type {Props} */
  let {
    fileP,
    buildStatus,
    contenus,
    showArticles,
    currentRepository,
    onDelete,
    onSave,
  } = $props();
</script>

<Editeur
  {fileP}
  {currentRepository}
  {buildStatus}
  {contenus}
  {showArticles}
  editionTitle="Édition d'une page"
  listPrefix={makeAtelierListPageURL(currentRepository)}
  deleteTitle="Supprimer la page"
  {onDelete}
  {onSave}
/>
