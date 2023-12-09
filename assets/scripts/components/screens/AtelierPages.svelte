<script>
  import ListContenu from './intern/ListContenu.svelte'

  /** @type any */
  export let buildStatus

  /** @type {any[] | undefined} */
  export let pages

  /** @type {boolean | undefined} */
  export let showArticles

  /** @type {ScribouilliGitRepo} */
  export let currentRepository
  
  /** @typedef {import("./../../store.js").ScribouilliState} ScribouilliState */
  /** @type {ScribouilliState["conflict"]}*/
  export let conflict
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
