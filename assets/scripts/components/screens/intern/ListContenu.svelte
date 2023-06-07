<script>
  import Skeleton from "../Skeleton.svelte";

  export let publishedWebsiteURL;
  export let buildStatus;
  export let listContenu = [];
  export let repositoryURL;
  export let title;
  export let atelierPrefix;
  export let newContentButtonText;
</script>

<Skeleton {publishedWebsiteURL} {buildStatus} {repositoryURL}>
  <section class="screen">
    <div>
      <h2>{title}</h2>

      <div>
        <ul>
          {#each listContenu.sort() as contenu}
            <li>
              <a href="{atelierPrefix}?article={contenu.path}"
                >{contenu.title}</a
              >
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
