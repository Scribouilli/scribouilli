<script>
  import Skeleton from "./Skeleton.svelte";

  export let publishedWebsiteURL
</script>

<Skeleton {publishedWebsiteURL}>
  <section class="screen" id="welcome">
    <h2>Un espace collaboratif <br /> de publication de contenu.</h2>

    <a href="./account" class="btn">Créer un espace</a>
    <!-- <a href="#account">Rejoindre un espace</a> -->
  </section>
</Skeleton>
