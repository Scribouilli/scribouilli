<script>
  import Skeleton from '../../Skeleton.svelte'

  export let buildStatus
  export let listContenu = []
  export let title
  export let atelierPrefix
  export let newContentButtonText
  export let showArticles
  export let currentRepository

  let repoName
  $: repoName = currentRepository.name

  let account
  $: account = currentRepository.owner
</script>

<Skeleton {currentRepository} {buildStatus} {showArticles}>
  <section class="screen">
    <div>
      <header>
        <h2>
          {title}
        </h2>
        <a
          href="{atelierPrefix}?repoName={repoName}&account={account}"
          class="btn btn__medium">{newContentButtonText}</a
        >
      </header>

      <div>
        <ul>
          {#each listContenu.sort() as contenu}
            <li>
              <span>{contenu.title}</span>

              <a
                href="{atelierPrefix}?path={contenu.path}&repoName={repoName}&account={account}"
              >
                Modifier</a
              >
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </section>
</Skeleton>

<style lang="scss">
  ul {
    margin: auto;
    margin-bottom: 4rem;
    text-align: left;
    width: 22em;

    li {
      font-size: 1.3rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1em;
      padding: 1rem;
      position: relative;

      & + li {
        border-top: 1px solid black;
      }

      a::before {
        content: ' ';
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
    }
  }

  header {
    border: none;
    gap: 5em;
    width: 26em;
    justify-content: space-between;
    margin: auto;
    margin-bottom: 1.5rem;
    padding: 0;

    & > * {
      flex: 0 1 auto;
    }

    h2 {
      margin: 0.2em 0;
    }
  }
</style>
