<script>

  /** @type {any} */
  export let buildStatus

  /** @typedef {import("./../store.js").ScribouilliState} ScribouilliState */
  /** @type {ScribouilliState["currentRepository"] | undefined} */
  export let currentRepository

  /** @type {boolean} */
  export let showArticles

  /** @type {string} */
  let status

  $: status = buildStatus?.status

  if (buildStatus) {
    // @ts-ignore
    buildStatus.subscribe(s => {
      if (s) {
        status = s
      }
    })
  }

  $: buildStatusClass = buildStatus ? `build-${status}` : undefined

  /** @type {string | undefined} */
  let publishedWebsiteURL
  $: publishedWebsiteURL = currentRepository?.publishedWebsiteURL

  /** @type {string | undefined} */
  let repositoryURL
  $: repositoryURL = currentRepository?.repositoryURL

  /** @type {string | undefined} */
  let repoName
  $: repoName = currentRepository?.name

  /** @type {string | undefined} */
  let account
  $: account = currentRepository?.owner

  /** @type {string | undefined} */
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

  .build-in_progress::after {
    content: '🕰 En cours de publication (2-3 min)';
  }

  .build-success::after {
    content: '✅ Site à jour';
  }

  .build-error::after {
    content: '🕰 En cours de publication (15 min max)';
  }
</style>
