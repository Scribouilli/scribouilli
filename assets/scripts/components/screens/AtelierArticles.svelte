<script>
  import ListContenu from './intern/ListContenu.svelte'

  /** @typedef {import("./../../store.js").ScribouilliState} ScribouilliState */
  
  /**
   * @typedef {Object} Props
   * @property {any} buildStatus
   * @property {any[] | undefined} articles
   * @property {boolean | undefined} showArticles
   * @property {ScribouilliGitRepo} currentRepository
   * @property {ScribouilliState["conflict"]} conflict
   */

  /** @type {Props} */
  let {
    buildStatus,
    articles,
    showArticles,
    currentRepository,
    conflict
  } = $props();
</script>

<ListContenu
  {currentRepository}
  {buildStatus}
  listContenu={articles}
  {showArticles}
  title="Articles"
  atelierPrefix="./atelier-article"
  newContentButtonText="Nouvel article"
  allowModification={false}
  {conflict}
/>

<style lang="scss">
</style>
