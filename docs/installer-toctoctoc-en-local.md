# Installer toctoctoc en local

## C'est quoi toctoctoc ? 

[toctoctoc](https://github.com/Scribouilli/toctoctoc) est un serveur générique 
qui permet de s'authentifier à un service d'identité via OAuth. 

Dans le cas de Scribouilli, il permet de s'authentifier via GitHub, GitLab et 
Scribougit (qui est une instance de GitLab).

Par défaut, Scribouilli en local fonctionne avec l'authentification à GitHub sur
le serveur de production de toctoctoc. 

Pour s'authentifier avec GitLab, il est nécessaire d'installer une
instance de [toctoctoc](https://github.com/Scribouilli/toctoctoc) en local. 


## Installation

Dans cette installation, on va installer un serveur toctoctoc qui permet 
l'authentification via GitLab et qui sera accessible à l'URL http://localhost:4000.

### 1. Prérequis

- [Node.js](https://nodejs.org/en/download/) >=20

### 2. Créer une application OAuth dans GitLab

- Se connecter à GitLab. 
- Dans le menu en haut à droite, sélectionner son avatar.
- Choisir `Modifier le profil`.
- Dans la barre de gauche, choisir `Accès` > `Applications`.
- Cliquer sur `Ajouter une nouvelle application`.
- Remplir les informations : 
  - Nom : toctoctoc
  - URI de retour (redirect URI) : http://localhost:4000/gitlab-callback 
  - Confidentiel : non
  - Autorisation d'accès de l'appareil : oui
  - Scopes : `read_repository`, `write_repository`, `email`.
- Enregistrer l'application.
- Garder de côté l'identifiant de l'application GitLab et son secret. On en 
  aura besoin pour la suite.

### 3. Installer le serveur toctoctoc en local

Cloner le dépôt git : 
```
git clone git@github.com:Scribouilli/toctoctoc.git
```

Installer les dépendances : 
```
npm install --ignore-scripts
```

### 4. Définir les variables d'environnement

Dans un fichier `.env`, on définit les variables d'environnement suivantes : 
```
PORT=4000
HOST=localhost
TOCTOCTOC_ORIGIN=http://localhost:4000
```

Lancer le serveur une première fois avec : 
```
npm run start:no-config
```

### 4. Configurer GitLab en tant que service d'authentification

- Aller sur l'URL : http://localhost:4000/oauth-services-config.
- Cliquer sur le bouton `Renew` pour obtenir une clé de déchiffrage (`OAUTH_SERVICES_DECRYPTION_KEY`).
- Dans `JSON configuration content`, copier la configuration suivante avec 
  l'identifiant GitLab et son secret qu'on a mis de côté précédemment : 
```
{
    "gitlab": [
        {
            "origin": "https://gitlab.com",
            "client_id": "identifiant",
            "client_secret": "secret"
        }
    ]
}
```
- Dans le fichier `.env`, ajouter la ligne `OAUTH_SERVICES_DECRYPTION_KEY` avec 
  la clé de déchiffrage qu'on vient juste de générer : 

```
OAUTH_SERVICES_DECRYPTION_KEY=ma_clé_de_chiffrage
PORT=4000
HOST=localhost
TOCTOCTOC_ORIGIN=http://localhost:4000
```

- Mettre à jour le fichier `oauth-services.json.encrypted` à la racine du dépôt avec le 
  contenu chiffré de la configuration (qu'on a généré dans le champ `Encrypted`).

## Tester avec Scribouilli en local

toctoctoc est maintenant accessible sur http://localhost:4000.

Dans le dépôt de Scribouilli, ouvrir le fichier `assets/scripts/routes/login.ts`.
En haut du fichier, mettre en commentaire la variable `TOCTOCTOC_ORIGIN` qui pointe
vers le serveur toctoctoc de production et ajouter une variable qui pointe sur
son serveur local de toctoctoc : 
```ts
// assets/scripts/routes/login.ts

/* const TOCTOCTOC_ORIGIN = `https://toctoctoc.lechappeebelle.team` */
const TOCTOCTOC_ORIGIN = `http://localhost:4000`
``` 

- Relancer le build de Scribouilli avec `npm run dev`
- et le lancer avec `npm start` dans un autre terminal.

On peut maintenant se connecter à GitLab sur son Scribouilli local 🎉
