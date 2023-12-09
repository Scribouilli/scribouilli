<script>
  import Skeleton from '../Skeleton.svelte'
</script>

<Skeleton>
  <section class="screen" id="choose-account">
    
    <h2>Se connecter</h2>
    <p>
      Scribouilli a besoin de se connecter à l'application qui hébergera votre petit site.
      Vous pouvez : 
    </p>

    <ul class="descriptions">
      <li>
        Utiliser <a href="https://gitlab.com/">gitlab.com</a> qui est un hébergeur professionnel 
        (si vous n'avez pas encore de compte, gitlb.com vous demandera votre numéro de carte de crédit, 
        même pour un usage gratuit)
      </li>
      <li>
        Sur <a href="https://git.scribouilli.org/">git.scribouilli.org</a>, qui est notre application d'hébergement
        (si vous n'avez pas encore en compte, nous prendrons le temps de valider votre compte manuellement)
      </li>
      <li>Utiliser Microsoft GitHub® si vous le connaissez déjà</li>
    </ul>

    <ul class="buttons">
      <li><a href="./account?provider=gitlab.com" class="btn">gitlab.com</a></li>
      <li><a href="./account?provider=git.scribouilli.org" class="btn">git.scribouilli.org</a></li>
      <li><a href="./account?provider=github.com" class="btn">github.com</a></li>
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
