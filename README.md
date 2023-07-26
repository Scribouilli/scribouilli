# scribouilli

## Installation

- Ouvrir un terminal
- Récupérer le repo `git clone git@github.com:lechappeebelle/scribouilli.git` dans le dossier qui va bien
- Rentrer dans le dossier `scribouilli`
- Faire `npm install`
- Builder le projet avec `npm run dev` (?)
- Lancer le projet avec `npm start` dans un autre terminal
- Ouvrir dans votre navigateur préféré `http://localhost:8080/`

## Intention

0/
Permettre à des non-informaticiennes

- de créer un petit site rapidement / facilement
- avoir une relation saine et sereine avec son contenu

## Schema

```mermaid
sequenceDiagram;
    participant A as Scribouilli
    participant B as Github Auth
    participant C as File moi les clefs
    participant D as Mon Compte Github
    A->>B: Demande l'authentification à
    B->>C: Vérifie les clefs auprès de
    C->>B: Montre les infos à
    B->>A: Donne son feu vert à
    A->>D: Peut utiliser
```

## Benchmark (-->Wix/Wordpress)

### Wix = logiciel privateur

- "liberté de créer, gérer et développer"
- "site professionnel" (boutique, blog, réservation)
- "personnalisable", "sur-mesure" (mais "template"), "questionnaire", "modèle design"
- "mobile"
- "visibilité", "référencement", "développez votre entreprise", "image de marque"
- impression de dynamisme
- impression de rapidité
- "gratuit"
- "facile"
- "Bénéficiez d'une solution tout-en-un : hébergement Web fiable et gratuit, sécurité maximale, référencement puissant et assistance 24h/24."
- "Plus de 180 millions de personnes dans le monde ont déjà choisi Wix pour créer un site Web gratuit."

### Wordpress = logiciel libre dont le format nécessite une machine pour être lu

- en anglais
- "Create a place for your business, your interests, or anything else—with the open source platform that powers the web."
- "dream it, build it", "custom", "flexible design tools"
- "intuitive"
- "powerful features" (store, mailing list, portfolio, social feed, analytics)
- "Own what you make", "Your content, your design, and your data always belong to you.", "open source community"
- "community", "around the world", "spirit of open source", "share", "freedom", "contribute", "Let’s shape the future of the web together."
- "as stable and secure as possible"
- adapté à tous les profils ("Whether you’re an entrepreneur, professional developer, or first-time blogger")

## Note

Pour rendre accessible une nouvelle route :

- créer un lien symbolique qui pointe vers `index.html` ;
  - `ln -s index.html <ma-route.html>`
- créer la route dans [assets/scripts/scripts.js]

## Développement

- Forker le repo
- modifier les settings
  - donner les droits en écriture a _github action_
  - pour déployer la branche `online`
- ajouter votre url (ex: yaf.github.io) dans [Scribouilli/toctoctoc/allowlist.csv](https://github.com/Scribouilli/toctoctoc/blob/main/allowlist.csv)

Voilà à quoi ça peut ressembler : [github.com/yaf/scribouilli](https://github.com/yaf/scribouilli)

Une fois les développements réalisé, vous pouvez faire une PR dans Scribouilli, en précisant votre url de développement pour que l'on puisse tester la modification.

Des pre-commit hooks sont installés automatiquement avec `husky`. Si jamais il sont trop contraignants,
il est possible de les ignorer avec l'option `--no-verify` de `git commit`.