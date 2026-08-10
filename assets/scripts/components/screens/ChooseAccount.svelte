<script lang="ts">
  import Skeleton from '../Skeleton.svelte'
  import { PROVIDERS } from '../../config'
</script>

<Skeleton>
  <section class="screen" id="choose-account">

    <h2>Se connecter</h2>
    <p>
      Scribouilli a besoin de se connecter à l'application qui hébergera votre petit&nbsp;site
    </p>
    <p>
      Vous pouvez utiliser :
    </p>

    <ul class="descriptions">
      {#each PROVIDERS as provider }
      <li>{@html provider.description}</li>
      {/each}
    </ul>

    <ul class="buttons">
      {#each PROVIDERS as provider }
      <li><a href="./account?provider={provider.id}" class="btn">{provider.name}</a></li>
      {/each}
    </ul>
  </section>
</Skeleton>

<style lang="scss">
  #choose-account {
    max-width: 80ch;
    margin: 0 auto;

    ul.descriptions {
      text-align: left;
      list-style-type: disc;

      margin-bottom: 3rem;

      li {
        margin-bottom: 1rem;
      }
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
