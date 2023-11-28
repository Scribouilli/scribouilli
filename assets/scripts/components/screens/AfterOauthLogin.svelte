<script>
    import Skeleton from "./../Skeleton.svelte";
    import SiteCreationLoader from "./../loaders/SiteCreationLoader.svelte";
    import './../../types.js'
    /** @type {Promise<GithubRepository[]|Void>} */
    export let currentUserReposP;
    /** @type {string} */
    export let type;
  </script>
  
  <Skeleton>
    <section class="screen" id="loader">
        {#if type === 'gitlab'}
            <h2>Login depuis gitlab détecté (et on ne sait pas encore le gérer)</h2>
        {:else}
            {#await currentUserReposP}
                <h2>Nous regardons si vous avez plusieurs sites Scribouilli…</h2>
                <img
                src="./assets/images/hearts.svg"
                alt="cœur sur toi le temps que ça charge"
                />
            {:then}
                <SiteCreationLoader />
            {/await}
        {/if}
        


      
    </section>
  </Skeleton>