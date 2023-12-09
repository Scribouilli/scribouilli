<script>
  import ListContenu from './intern/ListContenu.svelte'

  /** @type any */
  export let buildStatus

  /** @type {any[] | undefined} */
  export let articles

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
