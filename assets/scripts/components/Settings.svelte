<script>
  import Skeleton from "./Skeleton.svelte";

  $: enabled = false;

  export let publishedWebsiteURL;
</script>

<Skeleton {publishedWebsiteURL}>
  <section class="screen" id="settings">
    <h2>Settings</h2>
    <label>
      <input type="checkbox" on:change={(enabled = !enabled)} />
      Activer la suppression du site
    </label>
    <button type="button" disabled={!enabled}>Supprimer le site</button>
  </section>
</Skeleton>
