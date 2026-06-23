<script>
  import {makeAtelierListArticlesURL} from '../../routes/atelier-list-articles.js'

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
  {buildStatus}
  {contenus}
  {showArticles}
  {currentRepository}
  editionTitle="Édition d'un article"
  listPrefix={makeAtelierListArticlesURL(currentRepository)}
  deleteTitle="Supprimer l'article"
  {onDelete}
  {onSave}
/>
