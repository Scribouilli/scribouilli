<script>
  import Skeleton from "./Skeleton.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher()
  $: enabled = false;

  export let publishedWebsiteURL;

   const temporaire = () => {
    dispatch("delete-site")
   }
</script>

<Skeleton {publishedWebsiteURL}>
  <section class="screen" id="settings">
    <h2>Settings</h2>
    <label>
      <input type="checkbox" on:change={() => {enabled = !enabled}} />
      Activer la suppression du site
    </label>
    <button on:click={temporaire} disabled={!enabled}>Supprimer le site</button>
  </section>
</Skeleton>
