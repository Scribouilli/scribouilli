<script>
  import Skeleton from "./Skeleton.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  $: enabled = false;

  export let publishedWebsiteURL;

  const temporaire = () => {
    dispatch("delete-site");
  };
</script>

<Skeleton {publishedWebsiteURL}>
  <section class="screen" id="settings">
    <h2>Settings</h2>
    <div class="wrapper">
      <label>
        <input
          type="checkbox"
          on:change={() => {
            enabled = !enabled;
          }}
        />
        Activer la suppression du site
      </label>
      <button on:click={temporaire} disabled={!enabled} class="btn btn__medium">Supprimer le site</button>
    </div>
  </section>
</Skeleton>

<style lang="scss">
  .wrapper {
    padding: 2rem 1rem;
    width: 500px;
    background: white;
    border-radius: 16px;
  }

  label {
    font-weight: normal;
    cursor: pointer;
  }

  .btn {
    margin-top: 2rem;
    color: crimson;
    background: none;
    border-color: crimson;

    &:disabled {
      display: none;
    }

    &:hover {
      box-shadow: 0 0 0 1px crimson inset;
    }
  }
</style>
