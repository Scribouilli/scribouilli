<script lang="ts">
  import type { BackendType } from "../../types/atelier"
  import Skeleton from "../Skeleton.svelte"

  interface Props {
    href: string
    providerType: BackendType,
    providerId: string,
  }

  let { href, providerType, providerId }: Props = $props();

</script>

<Skeleton>
  {#if providerType === 'github'}
  <section class="screen" id="login">
    <h2>Super, nous allons vous demander les clefs sur la page suivante.</h2>

    <a {href} class="btn">Je me connecte via GitHub</a>
  </section>
  {/if}
  {#if providerType === 'gitlab'}
  <section class="screen" id="login">
    <h2>Super, nous allons vous demander les clefs sur la page suivante.</h2>

    <a {href} class="btn">Je me connecte via {providerId}</a>
  </section>
  {/if}
  {#if providerType === 'scribouilli'}
  <section class="screen" id="login">
    <h2>Super, nous allons vous demander les clefs sur la page suivante.</h2>

    <a {href} class="btn">Je me connecte</a>
  </section>
  {/if}
</Skeleton>

<style>
  #login {
    width: 70%;
    margin: 0 auto;
  }
</style>
