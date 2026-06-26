<script lang="ts">
  import { makeAtelierListPageURL } from '../../routes/urls.ts'
  import ScribouilliGitRepo from '../../scribouilliGitRepo.ts'
  import type { EditeurFile } from '../../types/atelier.ts'
  import type { BuildStatus } from '../../types/git.ts'
  import Loader from '../loaders/Loader.svelte'
  import Skeleton from '../Skeleton.svelte'
  import Editeur from "./intern/Editeur.svelte";
  
  interface Props {
    fileP: Promise<EditeurFile>
    buildStatus: BuildStatus
    contenus: {path: string }[]
    showArticles: boolean
    currentRepository: ScribouilliGitRepo
    onDelete: () => void
    onSave: (file: EditeurFile) => void
  }

  let {
    fileP,
    buildStatus,
    contenus,
    showArticles,
    currentRepository,
    onDelete,
    onSave,
  }: Props = $props();
</script>

<Skeleton {currentRepository} {buildStatus} {showArticles}>
  {#await fileP}
    <Loader />
  {:then file} 
    <Editeur
      {file}
      {contenus}
      editionTitle="Édition d'une page"
      listPrefix={makeAtelierListPageURL(currentRepository)}
      deleteTitle="Supprimer la page"
      {onDelete}
      {onSave}
    />
  {/await}
</Skeleton>
