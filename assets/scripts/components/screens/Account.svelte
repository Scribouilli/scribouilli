<script>
  import Skeleton from "../Skeleton.svelte";

  /** @type {string} */
   export let gitProvider
</script>

<Skeleton>
  {#if gitProvider === 'github.com'}
    <section class="screen" id="account">
      <div>
        <h2>Avez-vous un compte GitHub&nbsp;?</h2>

        <div>
          <a href="./login?provider=github.com" class="btn">Oui, je me connecte</a>
          <a href="./create-account?provider=github.com" class="btn"
            >Non, je veux créer un compte</a
          >
        </div>
      </div>
    </section>
  {/if}

  {#if gitProvider === 'gitlab.com'}
  <section class="screen" id="account">
    <div>
      <h2>Avez-vous un compte sur gitlab.com&nbsp;?</h2>

      <div>
        <a href="./login?provider=gitlab.com" class="btn">Oui, je me connecte</a>
        <a href="./create-account?provider=gitlab.com" class="btn"
          >Non, je veux créer un compte</a
        >
      </div>
    </div>
  </section>
  {/if}

  {#if gitProvider === 'git.scribouilli.org'}
  <section class="screen" id="account">
    <div>
      <h2>Avez-vous un compte sur git.scribouilli.org&nbsp;?</h2>

      <div>
        <a href="./login?provider=git.scribouilli.org" class="btn">Oui, je me connecte</a>
        <a href="./create-account?provider=git.scribouilli.org" class="btn"
          >Non, je veux créer un compte</a
        >
      </div>
    </div>
  </section>
  {/if}

  
</Skeleton>

<style lang="scss">
  #account {
    max-width: 70%;
    margin: 0 auto;

    &> div {
      align-items: center;
      justify-content: flex-start;
      flex-direction: column;
      h2 {
        margin-bottom: 2rem;
      }
    }
  }

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
  }
</style>
