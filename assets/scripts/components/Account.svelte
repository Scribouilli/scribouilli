<script>
  import Skeleton from "./Skeleton.svelte";
</script>

<Skeleton>
  <section class="screen" id="account">
    <h2>Avez-vous un compte Github ?</h2>

    <p>
      Pour pouvoir publier votre contenu, il faut que Scribouilli se connecte à
      un compte <a href="https://github.com">Github</a>.
    </p>

    <div>
      <a href="./login" class="btn">Oui, je me connecte</a>
      <a href="https://github.com/signup" target="_blank" class="btn">Non, je veux en créer un</a>
    </div>
  </section>
</Skeleton>

<style>
  #account {
    max-width: 70%;
    margin: 0 auto;
  }
  div {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
  }
  h2 {
    margin-bottom: 2rem;
  }
  p {
    font-size: 1.5rem;
    margin-bottom: 4rem;
  }
</style>