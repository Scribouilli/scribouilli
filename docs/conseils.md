# Conseils et erreurs communes

## Erreur: `TYPE is not exported by FICHIER`

Si on a cette erreur quand on compile, c'est qu'on importe un type comme si
c'était une valeur. Il faut changer:

```ts
import { TYPE } from "FICHIER"
```

en

```ts
import type { TYPE } from "FICHIER"
```

ou en

```ts
import { type TYPE } from "FICHIER"
```

Le préfixe `type` permet d'importer juste la définition de type et est ignorée
par Svelte, tout en permettant à TypeScript de comprendre les types.

La différence entre les deux se voit si on importe plusieurs choses depuis ce
fichier : dans le premier cas, on ne peut lister que des types dans les
accolades, dans le second cas on doit mettre le préfixe `type` devant chaque
type mais on peut aussi importer des valeurs.