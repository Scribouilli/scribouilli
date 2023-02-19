<script>
  import Skeleton from "./Skeleton.svelte";
</script>

<Skeleton>
  <section class="screen" id="account">
    <div id="question_github">
      <h2>Avez-vous un compte Github&nbsp;?</h2>

      <p>
        Pour pouvoir publier votre contenu, il faut que Scribouilli se connecte à
        un compte <a href="https://github.com" target="_blank">Github</a>.
      </p>

      <div>
        <a href="./login" class="btn">Oui, je me connecte</a>
        <a href="#creer_compte_github" class="btn">Non, je veux créer un compte</a>
      </div>
    </div>
    <div id="creer_compte_github">
      <h2>Créer un compte Github</h2>
      <p>
        Pour pouvoir publier votre contenu, il faut que Scribouilli se connecte à
      un compte <a href="https://github.com" target="_blank">Github</a>.
      </p>
      <p>La création va se passer sur Gtihub.com.</p>
      <p>Elle comporte 3 étapes :</p>
      <ol>
        <li>Rentrez votre mail, mot de passe, et votre nom d'utilisateur·ice</li>
        <li>Ouvrez le mail que Github vous a envoyé, et copiez le code pour confirmer votre compte</li>
        <li>Dès que le code est validé, <em>revenez sur Scribouilli</em> et cliquez sur <a href="./login">"J'ai créé un compte"</a></li>
      </ol>
      
      <div>
        <a href="https://github.com/signup" target="_blank" class="btn">Créer un compte Github</a>
        <a href="./login" class="btn">J'ai créé un compte</a>
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
  #question_github p {
    margin-bottom: 4rem;
  }
  em {
    font-weight: bold;
  }
  ol {
    text-align: left;
  }
  ol li {
    margin-bottom: 1rem;
  }
  #creer_compte_github {
    margin-top: 20rem;
    margin-bottom: 4rem;
  }
</style>
