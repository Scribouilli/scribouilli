<script>
  import Skeleton from '../Skeleton.svelte'
</script>

<Skeleton>
  <section class="screen" id="choose-account">
    
    <h2>Choisir un compte</h2>
    <p>
      Pour pouvoir publier votre contenu, il faut que Scribouilli se connecte
      à un compte, soit sur <a href="https://gitlab.com/" target="_blank">gitlab.com</a>, 
      <!-- soit sur <a href="https://git.scrbouilli.org/" target="_blank">git.scrbouilli.org</a>, -->
      soit sur <a href="https://github.com/" target="_blank">GitHub</a>.
    </p>

    <ul class="descriptions">
      <li>
        Sur gitlab.com, on peut vous demander de saisir une carte de paiement, même pour un usage complètement gratuit
      </li>
      <!--
        <li>
          Sur git.scrbouilli.org, vous nous laissez votre email et nous vous envoyons une invitation 
          sous dans la journée ou le lendemain
        </li>
      -->
      <li>Github.com est contrôlé par Microsoft</li>
    </ul>

    <ul class="buttons">
      <li><a href="./account#gitlab.com" class="btn">gitlab.com</a></li>
      <!--<li><a href="./account#git.scrbouilli.org" class="btn">git.scrbouilli.org</a></li>-->
      <li><a href="./account#github.com" class="btn">github.com</a></li>
    </ul>
  </section>
</Skeleton>

<style lang="scss">
  #choose-account {
    max-width: 70%;
    margin: 0 auto;

    ul.descriptions {
      text-align: left;
      list-style: '- ';

      margin-bottom: 1rem;
    }

    ul.buttons{
      display: flex;
      flex-direction: row;
      justify-content: space-around;

      margin-bottom: 1rem;
    }
  }

  p {
    font-size: 1.5rem;
  }
</style>
