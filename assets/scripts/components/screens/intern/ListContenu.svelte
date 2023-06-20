<script>
  import Skeleton from "../../Skeleton.svelte";

  export let buildStatus;
  export let listContenu = [];
  export let title;
  export let atelierPrefix;
  export let newContentButtonText;
  export let showArticles
  export let currentRepository = undefined;
</script>

<Skeleton {currentRepository} {buildStatus} {showArticles}>
  <section class="screen">
    <div>
      <h2>{title}</h2>

      <div>
        <ul>
          {#each listContenu.sort() as contenu}
            <li>
              <a href="{atelierPrefix}?path={contenu.path}">{contenu.title}</a>
            </li>
          {/each}
        </ul>

        <a href={atelierPrefix} class="btn btn__medium"
          >{newContentButtonText}</a
        >
      </div>
    </div>
  </section>
</Skeleton>

<style lang="scss">
  ul {
    margin-bottom: 4rem;

    li {
      font-size: 1.3rem;
      & + li {
        margin-top: 2rem;
      }

      a {
        text-transform: capitalize;
      }
    }
  }
</style>
