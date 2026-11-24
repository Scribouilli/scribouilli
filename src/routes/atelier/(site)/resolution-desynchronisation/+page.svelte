<script lang="ts">
  import { addConflictRemovalAndRedirectToResolution } from '#lib/user.ts'
  import Loader from '#lib/components/Loader.svelte'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import SavingLoader from '#lib/components/SavingLoader.svelte'

  const atelier = getAtelier()
  let conflicts = $derived(atelier.repo.conflicts)
  let newConflictOptions = $derived(
    conflicts &&
      conflicts.map(({ message, resolution }) => {
        return {
          message,
          resolution: addConflictRemovalAndRedirectToResolution(resolution, atelier.repo),
        }
      }),
  )
</script>

<svelte:head>
  <title>Désynchronisation — L’atelier de Scribouilli</title>
</svelte:head>

<div class="container">
  <h1>Votre site ne peut plus se mettre à jour</h1>

  <p>Le contenu de votre site a été modifié à 2 endroits différents :</p>

  <ul class="list-with-dot">
    <li>Soit par 2 personnes en même temps, sur 2 ordinateurs différents</li>
    <li>Soit à la fois dans l'atelier et sur votre code dans ScribouGit / Gitlab / Github</li>
  </ul>

  <p>
    Cela provoque un conflit car les modifications se trouvent sur la même page. <br />
    <strong>C'est à vous de choisir lesquelles conserver</strong>. <br />
    Attention, les autres modifications <strong>seront perdues</strong>.
  </p>

  <p>Vous pouvez choisir le contenu :</p>

  <ul class="list-with-dot">
    <li>qui se trouve dans l'atelier</li>
    <li>qui se trouve sur le site web</li>
  </ul>

  <p>
    Vous pouvez prendre le temps de retourner voir dans l'atelier ou sur votre site web quels sont
    les contenus présents avant de faire votre choix.
  </p>

  <h2>Que préférez-vous ?</h2>

  {#if atelier.repo.status === 'ready'}
    {#if newConflictOptions}
      <div class="action-list">
        {#each newConflictOptions as { message, resolution }}
          <button class="btn" onclick={resolution}>{message}</button>
        {/each}
      </div>
    {:else}
      <p>
        Woops… gros problème, nous n'arrivons pas à trouver les options. Scribouilli est vraiment
        très cassé !<br />
        Vous pouvez prévenir l'équipe ou alors revenir dans quelques heures ou jours.
      </p>
    {/if}
  {:else if atelier.repo.status === 'sync'}
    <SavingLoader />
  {:else}
    <Loader />
  {/if}
</div>
