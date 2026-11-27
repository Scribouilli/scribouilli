<script lang="ts">
  import { resolve } from '$app/paths'
</script>

<svelte:head>
  <title>L’atelier de Scribouilli</title>
</svelte:head>

<div class="container">
  <h1>Travailler sur votre site</h1>
  <p>Vous pouvez créer un nouveau site ou partir d'un site existant.</p>

  <div class="action-list">
    <a href={resolve(`/atelier/creer-nouveau-site`)} class="btn">Créer un nouveau site</a>
    <a href={resolve(`/atelier/selectionner-site`)} class="btn"> Partir d'un site existant </a>
  </div>
</div>

<style>
  p {
    text-align: center;
  }
</style>
