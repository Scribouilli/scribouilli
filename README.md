# scribouilli

## Installation

- Ouvrir un terminal
- Récupérer le repo `git clone git@github.com:daktary-team/scribouilli.git` dans le dossier qui va bien
- Rentrer dans le dossier `scribouilli`
- Faire `npm install`
- Builder le projet avec `npm run dev`
- Lancer le projet avec `npm start`
- Ouvrir dans votre navigateur préféré `http://localhost:3000/`

## Intention 

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
