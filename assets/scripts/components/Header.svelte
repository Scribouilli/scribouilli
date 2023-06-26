<script>
  // @ts-check
  export let buildStatus;
  export let currentRepository;
  export let showArticles

  let status = undefined;

  if (buildStatus) {
    status = buildStatus.status;

    buildStatus.subscribe((s) => {
      if (s) {
        status = s;
      }
    });
  }

  $: buildStatusClass = buildStatus ? `build-${status}` : undefined;

  let publishedWebsiteURL = currentRepository?.publishedWebsiteURL
  let repositoryURL = currentRepository?.repositoryURL
  let repoName = currentRepository?.name
  let account = currentRepository?.owner

  let homeURL = './'

  if(repoName && account) {
    homeURL = `./atelier-list-pages?repoName=${repoName}&account=${account}`
  }
</script>

<header>
  <h1><a href="{homeURL}" class="go-home">Scribouilli</a></h1>

  {#if publishedWebsiteURL}
    <div>
      <div>
        <a href="https://{publishedWebsiteURL}" class="project-name" target="_blank">
          {publishedWebsiteURL}
        </a>
        {#if buildStatusClass}
          <p class={buildStatusClass} />
        {/if}
      </div>

      <nav>
        <ul>
          <li>
            <a href="./atelier-list-pages?repoName={repoName}&account={account}">
              Pages
            </a>
          </li>

          {#if showArticles}
          <li>
            <a href="./atelier-list-articles?repoName={repoName}&account={account}">
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
    </div>
  {/if}
</header>

<style lang="scss">
  [class^="build-"] {
    margin-top: 0.3rem;
  }

  .build-building::after {
    content: "🕰 En cours de publication";
  }

  .build-built::after {
    content: "✅ Site à jour (sinon pensez à actualiser)";
  }

  .build-errored::after {
    content: "❌ Oups il y a peut-être un souci";
  }
</style>
