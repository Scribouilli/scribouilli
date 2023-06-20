<script>
  import Skeleton from "./Skeleton.svelte";
  import Loader from "./loaders/Loader.svelte";

  export let currentUserReposP;
</script>

<Skeleton>
  <section class="screen" id="loader">
    {#await currentUserReposP}
      <h2>Nous regardons si vous avez plusieurs sites Scribouilli…</h2>
      <img
        src="./assets/images/hearts.svg"
        alt="cœur sur toi le temps que ça charge"
      />
    {:then}
      <h2>Nous sommes en train de créer le site&nbsp;!</h2>
      <p>Cela peut prendre 2-3 minutes…</p>
      <img
        src="./assets/images/hearts.svg"
        alt="cœur sur toi le temps que ça charge"
      />
      <div>
        <p>Pendant le chargement, vous pouvez&nbsp;:</p>
        <ul>
          <li>
            lire un article pour apprendre à <a
              href="https://flus.fr/carnet/markdown.html"
              target="_blank">bidouiller avec du Markdown</a
            >.
          </li>
          <li>ou chanter une petite chanson.</li>
        </ul>
      </div>
    {/await}
  </section>
</Skeleton>
