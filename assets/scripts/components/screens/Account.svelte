<script>
  import Skeleton from "../Skeleton.svelte";
</script>

<Skeleton>
  <section class="screen" id="account">
    <div id="question_github">
      <h2>Avez-vous un compte GitHub&nbsp;?</h2>

      <p>
        Pour pouvoir publier votre contenu, il faut que Scribouilli se connecte
        à un compte <a href="https://github.com" target="_blank">GitHub</a>.
      </p>

      <div>
        <a href="./login" class="btn">Oui, je me connecte</a>
        <a href="./create-github-account" class="btn"
          >Non, je veux créer un compte</a
        >
      </div>
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
  }
  #question_github {
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
  }
  #question_github p {
    margin-bottom: 4rem;
  }
</style>
