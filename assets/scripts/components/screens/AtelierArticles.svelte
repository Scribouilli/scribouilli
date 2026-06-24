<script lang="ts">
  import ScribouilliGitRepo from '../../scribouilliGitRepo'
  import type { ScribouilliState } from './../../store.ts'
  import ListContenu from './intern/ListContenu.svelte'

  interface Props {
    buildStatus: any
    articles: any[] | undefined
    showArticles: boolean | undefined
    currentRepository: ScribouilliGitRepo
    conflict: ScribouilliState["conflict"]
  }

  let {
    buildStatus,
    articles,
    showArticles,
    currentRepository,
    conflict
  }: Props = $props();
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
