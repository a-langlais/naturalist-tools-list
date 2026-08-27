# Outils naturalistes

Mini site statique recensant des outils open source concus par et pour les naturalistes.

Le projet est volontairement minimaliste : une page HTML, une feuille CSS, un petit script JavaScript et une base de donnees CSV facile a modifier par pull request.

## Structure

```text
.
├── index.html
├── assets/
│   ├── app.js
│   └── styles.css
└── data/
    ├── README.md
    └── tools.csv
```

## Contribuer

Pour proposer un nouvel outil, ouvrez une pull request qui ajoute une ligne dans `data/tools.csv`.

Quelques regles simples :

- ajouter uniquement des projets open source ;
- conserver une seule ligne par outil ;
- utiliser `;` pour les champs a valeurs multiples ;
- renseigner au minimum le nom, le type, les **Créateur·rice(s)**, une description courte, le depot source et la licence ;
- laisser une cellule vide quand l'information n'est pas connue.

La description complete des colonnes se trouve dans `data/README.md`.

#### Licence

La licence du catalogue reste a definir.
