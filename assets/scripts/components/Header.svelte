<script>
  // @ts-check
  export let buildStatus
  export let currentRepository
  export let showArticles

  let status

  $: status = buildStatus?.status

  if (buildStatus) {
    buildStatus.subscribe(s => {
      if (s) {
        status = s
      }
    })
  }

  $: buildStatusClass = buildStatus ? `build-${status}` : undefined

  let publishedWebsiteURL
  $: publishedWebsiteURL = currentRepository?.publishedWebsiteURL
  let repositoryURL
  $: repositoryURL = currentRepository?.repositoryURL
  let repoName
  $: repoName = currentRepository?.name
  let account
  $: account = currentRepository?.owner

  $: homeURL =
    repoName && account
      ? `./atelier-list-pages?repoName=${repoName}&account=${account}`
      : './'
</script>

<header>
  {#if publishedWebsiteURL}
    <div>
      <p>
        <a
          href="https://{publishedWebsiteURL}"
          class="project-name"
          target="_blank"
        >
          {publishedWebsiteURL}
        </a>
      </p>
      {#if buildStatusClass}
        <p class={buildStatusClass} />
      {/if}
    </div>
  {/if}

  <h1>
    <a href={homeURL} class="go-home"
      ><img
        src="./assets/images/logo_atelier.png"
        alt="L'atelier de Scribouilli"
      /></a
    >
  </h1>

  {#if publishedWebsiteURL}
    <nav>
      <ul>
        <li>
          <a href="./atelier-list-pages?repoName={repoName}&account={account}">
            Pages
          </a>
        </li>

        {#if showArticles}
          <li>
            <a
              href="./atelier-list-articles?repoName={repoName}&account={account}"
            >
              Articles
            </a>
          </li>
        {/if}

        <li>
          <a href="./settings?repoName={repoName}&account={account}">
            Paramètres
          </a>
        </li>
        <li>
          {#if repositoryURL}
            {#await repositoryURL then urlrepository}
              <a href={urlrepository} target="_blank">GitHub</a>
            {/await}
          {/if}
        </li>
      </ul>
    </nav>
  {/if}
</header>

<style lang="scss">
  [class^='build-'] {
    margin-top: 0.3rem;
  }

  .build-building::after {
    content: '🕰 En cours de publication (2-3 min)';
  }

  .build-built::after {
    content: '✅ Site à jour';
  }

  .build-errored::after {
    content: '🕰 En cours de publication (15 min max)';
  }
</style>
