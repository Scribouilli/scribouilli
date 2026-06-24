<script lang="ts">
  import ScribouilliGitRepo from '../../scribouilliGitRepo'
  import type { ScribouilliState } from './../../store.js'
  import ListContenu from './intern/ListContenu.svelte'

  interface Props {
    buildStatus: any
    pages: any[] | undefined
    showArticles: boolean | undefined
    currentRepository: ScribouilliGitRepo
    conflict: ScribouilliState["conflict"]
  }

  let {
    buildStatus,
    pages,
    showArticles,
    currentRepository,
    conflict
  }: Props = $props();
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
