<script>
  import Skeleton from "./Skeleton.svelte";

  export let href;
  export let publishedWebsiteURL;
</script>

<Skeleton {publishedWebsiteURL}>
  <section class="screen" id="login">
    <h2>Super, nous allons demander les clés sur la page suivante.</h2>

    <a id="github-login" {href} class="btn">Connexion Github</a>
  </section>
</Skeleton>
