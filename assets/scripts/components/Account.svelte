<script>
  import Skeleton from "./Skeleton.svelte";
  export let publishedWebsiteURL
</script>

<Skeleton {publishedWebsiteURL}>
  <section class="screen" id="account">
    <h2>
      Pour pouvoir publier votre contenu, il faut que Scribouilli se connecte à
      un compte Github.
    </h2>

    <a href="./login" class="btn">J'ai déjà un compte</a>
    <!-- <a href="#create-account">Pas de compte</a> -->
  </section>
</Skeleton>
