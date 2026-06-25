<script lang="ts">
  import { makeAtelierListPageURL } from '../../routes/urls.ts'
  import ScribouilliGitRepo from '../../scribouilliGitRepo.ts'
  import type { EditeurFile, FileContenu } from '../../types/atelier.ts'
  import Editeur from "./intern/Editeur.svelte";
  
  interface Props {
    fileP: Promise<EditeurFile>
    buildStatus: any
    contenus: FileContenu[]
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
