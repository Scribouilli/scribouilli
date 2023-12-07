<script>
    import Skeleton from "../Skeleton.svelte";
    import {addConflictRemovalAndRedirectToResolution} from
    '../../actions/current-user.js'
    import '../../types.js'

    /** @typedef {import("../../store.js").ScribouilliState} ScribouilliState */

    /** @type {any} */
    export let buildStatus

    /** @type {boolean | undefined} */
    export let showArticles

    /** @type {ScribouilliState["currentRepository"]} */
    export let currentRepository

    /** @type {string | undefined} */
    let repositoryURL
    $: repositoryURL = currentRepository?.publicRepositoryURL;

    /** @type {ScribouilliState["conflict"]} */
    export let conflict;

    /** @type {ScribouilliState["conflict"]} */
    let newConflictOptions;
    $: newConflictOptions = conflict && conflict.map(({message, resolution}) => {
        return {
            message,
            resolution: addConflictRemovalAndRedirectToResolution(resolution)
        }
    })

</script>

<!-- Ne pas montrer la bannière d'avertissement de conflit dans le header dans l'écran de résolution de conflit -->
<Skeleton {currentRepository} {buildStatus} {showArticles} conflict={undefined}>
    <article>
        <h1>Problème de synchronisation</h1>

        <p>
            La version du site web dans l'atelier sur cet ordinateur/téléphone et la version du site web en ligne
            actuellement sont désynchronisées.
            Celà peut être dû au fait que tu as modifié une page directement dans Github/Gitlab ou qu'un.e collègue/ami.e
            travaille sur le site de manière simultannée
        </p>

        <p>
            La conséquence est que, pour le moment, tu ne peux plus mettre à jour le site web depuis l'atelier Scribouilli
            (mais tu peux continuer à modifier ce qu'il y a dans l'atelier)
        </p>

        <p>
            Mais <strong>ça va bien se passer</strong> ! On va résoudre ça tranquillement !<br>
            On va proposer 2 choix : imposer la version actuelle de l'atelier ou ramener l'atelier à la version actuelle
            du site web.<br>
            Dans les deux cas, <strong>des données vont être perdues</strong>, donc ça vaut le coup de
            <strong>prendre le temps</strong> de prendre la bonne décision
        </p>
        <p>
            <strong>Avant de prendre la décision</strong>, ça peut valoir le coup de : <strong>discuter avec les
            autres personnes qui travaillent sur le site</strong> pour se rendre compte des changements qui
            pourraient être perdus en imposant ce qui est actuellement dans ton atelier<br>
            Ou alors <a href={repositoryURL}>d'aller regarder les fichiers dans github/gitlab</a> pour se rendre compte
            de ce qui pourrait être perdu<br>
            Il est encore temps de modifier le contenu de l'atelier
        </p>

        <p> Voici les options :</p>

        <ul class="options">
            {#if newConflictOptions}
                {#each newConflictOptions as {message, resolution}}
                    <li>
                        <p>{message}</p>
                        <button class="btn__medium btn" on:click={resolution}>Je choisis cette option !</button>
                    </li>
                {/each}
            {:else}
                Woops... gros problème, on n'arrive pas à trouver les options. Scribouilli est vraiment très cassé !
                Tu peux prévenir l'équipe ou alors revenir dans quelques heures ou jours
            {/if}
        </ul>
    </article>
</Skeleton>

<style lang="scss">
    article{
        max-width: 60rem;
        margin: 0 auto;

        ul.options{
            display: flex;
            flex-direction: row;
            justify-content: space-around;

            p{
                font-weight: bold;
            }

            li{
                max-width: 25rem;
            }
        }
    }
</style>
