<script>
  import ListContenu from './intern/ListContenu.svelte'

  /** @typedef {import("./../../store.js").ScribouilliState} ScribouilliState */
  
  /**
   * @typedef {Object} Props
   * @property {any} buildStatus
   * @property {any[] | undefined} pages
   * @property {boolean | undefined} showArticles
   * @property {ScribouilliGitRepo} currentRepository
   * @property {ScribouilliState["conflict"]} conflict
   */

  /** @type {Props} */
  let {
    buildStatus,
    pages,
    showArticles,
    currentRepository,
    conflict
  } = $props();
</script>

<ListContenu
  {currentRepository}
  {buildStatus}
  listContenu={pages}
  {showArticles}
  title="Pages"
  atelierPrefix="./atelier-page"
  newContentButtonText="Nouvelle page"
  allowModification={true}
  {conflict}
/>

<style lang="scss">
</style>
