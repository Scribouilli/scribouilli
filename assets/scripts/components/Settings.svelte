<script>
  import Skeleton from "./Skeleton.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  $: enabled = false;

  export let publishedWebsiteURL;
  export let buildStatus;

  const temporaire = () => {
    dispatch("delete-site");
  };
</script>

<Skeleton {publishedWebsiteURL} {buildStatus}>
  <section class="screen" id="settings">
    <h2>Paramètres</h2>
    <div class="wrapper delete-zone">
      <label>
        <input
          type="checkbox"
          on:change={() => {
            enabled = !enabled;
          }}
        />
        Afficher le bouton de suppression
      </label>
      <button on:click={temporaire} disabled={!enabled} class="btn btn__medium">Supprimer le site</button>
    </div>
  </section>
</Skeleton>