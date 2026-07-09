# Scribouilli

[Scribouilli](https://scribouilli.org) est un outil pour créer un petit site
facilement. L'intention, c'est de permettre à des non-informaticiennes de créer
un petit site rapidement / facilement et d'avoir une relation saine et sereine
avec son contenu.

## Installation

- Ouvrir un terminal
- Récupérer le repo `git clone git@github.com:lechappeebelle/scribouilli.git` dans le dossier qui va bien
- Rentrer dans le dossier `scribouilli`
- Faire `npm install`
- Builder le projet avec `npm run dev`
- Lancer le projet avec `npm start` dans un autre terminal
- Ouvrir dans votre navigateur préféré `http://localhost:8080/`

## Développement

- Forker le repo sur votre compte
- Modifier les settings
  - Donner les droits en écriture a _github action_
  - Pour déployer la branche `online`
- Ajouter votre origine github pages (ex: `yaf.github.io`) dans [Scribouilli/toctoctoc/allowlist.csv](https://github.com/Scribouilli/toctoctoc/blob/main/allowlist.csv)

Voilà à quoi ça peut ressembler : [github.com/yaf/scribouilli](https://github.com/yaf/scribouilli)

Une fois les développements réalisés, vous pouvez faire une PR dans Scribouilli, en précisant votre url de développement pour que l'on puisse tester la modification.


### Pour tester avec gitlab/scribougit

À cause d'une [limitation du oauth gitlab](https://github.com/Scribouilli/scribouilli/issues/149), tester sur gitlab/scribougit nécéssite de déployer [toctoctoc](https://github.com/Scribouilli/toctoctoc) en local

La marche à suivre est la suivante : 
- Créer une app sur [gitlab](https://gitlab.com/-/user_settings/applications) ou [scribougit](https://git.scribouilli.org/-/user_settings/applications) 
  - avec les *scopes* `api` et `read_api`
  - avec la `Redirect URI` à `http://localhost:4000/` (ou le port que vous comptez utiliser pour toctoctoc en local)
  - noter l'`Application ID` et le `Secret` quelque part
- Créer un fichier **secret** `oauth-services.json` en copiant et remplissant: 
```json
{
    "gitlab": [
        {
            "origin": "<origine de l'instance gitlab où a été créée l'app. https://git.scribouilli.org ou https://gitlab.com>",
            "client_id": "<mettre l'Application ID>",
            "client_secret": "<mettre le Secret ID>"
        }
    ]
}
```
  - ⚠️ la sécurité de l'app gitlab créée dépend du fait de garder ce fichier secret.\
  Le nom `oauth-services.json` a été ajouté au .gitginore de ce repo pour aider à stocker les infos en clair dans le repo sans risque de les versionner

ICIIIIIIIIIIIIIIIII
- (PPP) rajouter la doc pour chiffrer la config....... ou alors modifier toctoctoc pour charger une config non-chiffrée ?
- ajouter un allowlist (PPP)
ICIIIIIIIIIIIIIIIII


Pour le moment, il n'est pas possible de tester en local des sites hébergés sur gitlab ou scribougit (`git.scribouilli.org`)
On peut le faire, mais ça demande de changer la config de toctoctoc en prod (et donc, ça casse la prod pour les sites ; une histoire de `redirect_uri`)


### Outils de développement

Des pre-commit hooks sont installés automatiquement avec `husky`. Si jamais il sont trop contraignants,
il est possible de les ignorer avec l'option `--no-verify` de `git commit`.

Vous pouvez également lancer les tests en local avec :

```
npm run test
```

### Note

Pour rendre accessible une nouvelle route :

- créer un lien symbolique qui pointe vers `index.html` ;
  - `ln -s index.html <ma-route.html>`
- créer la route dans [assets/scripts/scripts.js]

## Schema

```mermaid
sequenceDiagram;
    participant A as Scribouilli
    participant B as Service d'identification OAuth
    participant C as toctoctoc
    participant D as Mon Compte GitHub
    A->>B: Demande l'authentification à
    B->>C: Vérifie les clefs auprès de
    C->>B: Montre les infos à
    B->>A: Donne son feu vert à
    A->>D: Peut utiliser
```

- `Service d'identification OAuth` : le service OAuth actuellement implémenté est [celui de GitHub](https://docs.github.com/en/apps/oauth-apps). On va intégrer prochainement GitLab.
- `toctoctoc` : un [serveur générique](https://github.com/Scribouilli/toctoctoc)
  qui permet de se connecter à un service d'identification OAuth.

## Ressources

- Notre [benchmark](/docs/benchmark.md) de départ
