# Outils naturalistes

Mini site statique recensant des outils open source utiles aux naturalistes et aux métiers de l'écologie.

Le projet est volontairement minimaliste : une page HTML, une feuille CSS, un petit script JavaScript et une base de données CSV facile à modifier par pull request.

## Le catalogue

Le catalogue rassemble différents projets utiles à la pratique naturaliste : logiciels, applications, bibliothèques, outils matériels et autres projets techniques open source.

Cette liste est non exhaustive et évoluera au fil des contributions.

Les informations peuvent être incomplètes ou ne pas refléter exactement la présentation officielle d'un projet, notamment lorsqu'une fiche est proposée par une personne extérieure à son équipe. Les corrections sont bienvenues via pull request.

Les contributions doivent respecter les licences, marques, conditions d'utilisation et préférences des projets présentés. Lorsque cela est nécessaire ou souhaitable, merci de demander l'accord des équipes concernées avant de proposer une entrée.

## Contribuer

Pour proposer un nouvel outil, ouvrez une pull request ajoutant une ligne dans `data/tools.csv`.

Quelques règles simples :

* ajouter uniquement des projets pertinents ;
* conserver une seule ligne par outil ;
* utiliser `;` pour les champs à valeurs multiples ;
* renseigner au minimum le nom, le type, les créateur·rices, une description courte, le dépôt source et la licence ;
* laisser une cellule vide lorsque l'information n'est pas connue.

La description des colonnes se trouve dans [`data/README.md`](data/README.md).

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

## Licence

La licence du code et des données du catalogue reste à définir.
