<script>
  import ListContenu from './intern/ListContenu.svelte'

  /** @type any */
  export let buildStatus

  /** @type {any[] | undefined} */
  export let articles

  /** @type {boolean | undefined} */
  export let showArticles

  /** @typedef {import("./../../store.js").ScribouilliState} ScribouilliState */
  /** @type ScribouilliState["currentRepository"] */
  export let currentRepository
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
/>

<style lang="scss">
</style>
