# Schéma de la base de données

La base canonique est `data/tools.csv`. Chaque ligne décrit un outil open source utile aux naturalistes.

## Colonnes

| Colonne             | Description                                                        | Exemple                                                   |
| ------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| `id`                | Identifiant stable en minuscules, sans espace.                     | `cartoflore`                                              |
| `name`              | Nom public de l'outil.                                             | `CartoFlore`                                              |
| `type`              | Type de projet.                                                    | `logiciel`, `plug-in`, `hardware`, `plateforme`           |
| `creators`          | **Créateur·rice(s)**, collectif ou organisation à mettre en avant. | `Collectif CartoFlore;Atelier PhytoLibre`                 |
| `creators_url`      | Sites publics des **Créateur·rice(s)**, dans le même ordre.        | `https://example.org/collectif-cartoflore;https://example.org/atelier-phytolibre` |
| `short_description` | Résumé court affiché dans la liste.                                | `Cartographie collaborative des observations botaniques.` |
| `long_description`  | Description plus complète affichée dans le panneau de métadonnées. | `Outil de saisie et de visualisation...`                  |
| `homepage_url`      | Site officiel ou documentation.                                    | `https://example.org/cartoflore`                          |
| `repository_url`    | Dépôt source public.                                               | `https://github.com/example/cartoflore`                   |
| `license`           | Licence open source.                                               | `GPL-3.0`                                                 |
| `topics`            | Thèmes séparés par `;`.                                            | `botanique;cartographie;inventaire`                       |
| `platforms`         | Plateformes séparées par `;`.                                      | `web;mobile`                                              |
| `languages`         | Langues d'interface séparées par `;`.                              | `fr;en`                                                   |
| `status`            | État du projet.                                                    | `actif`, `stable`, `experimental`, `archive`              |
| `icon`              | Nom du fichier d'icône placé dans `data/img/`, si disponible.      | `cartoflore.png`                                          |
| `year`              | Année de référence du projet.                                      | `2026`                                                    |

## Catégories et formats disponibles

Les valeurs ci-dessous servent de base commune pour garder les filtres lisibles. Elles peuvent être complétées par pull request si un nouvel outil ne rentre pas bien dans les catégories existantes.

| Colonne             | Valeurs ou format recommandé                                                                                                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | Texte court en minuscules, sans espace. Utiliser `-` si besoin.                                                                                                                                                                                |
| `name`              | Texte libre.                                                                                                                                                                                                                                   |
| `type`              | `logiciel`, `plug-in`, `hardware`, `plateforme`, `bibliothèque`, `jeu-de-données`, `modèle`, `documentation`                                                                                                                                   |
| `creators`          | Valeurs séparées par `;` : personne, collectif, laboratoire, association, entreprise ou communauté.                                                                                                                                            |
| `creators_url`      | URLs séparées par `;`, dans le même ordre que `creators`. Laisser une position vide si un·e créateur·rice n'a pas de site connu.                                                                                                                |
| `short_description` | Texte libre, idéalement une phrase courte.                                                                                                                                                                                                     |
| `long_description`  | Texte libre, une à trois phrases.                                                                                                                                                                                                              |
| `homepage_url`      | URL du site officiel, de la documentation ou de la page projet.                                                                                                                                                                                |
| `repository_url`    | URL du dépôt source public.                                                                                                                                                                                                                    |
| `license`           | Identifiant de licence, par exemple `MIT`, `GPL-3.0`, `AGPL-3.0`, `Apache-2.0`, `BSD-3-Clause`, `MPL-2.0`, `CeCILL-2.1`.                                                                                                                       |
| `topics`            | Valeurs séparées par `;` : `botanique`, `faune`, `fonge`, `cartographie`, `inventaire`, `terrain`, `acoustique`, `analyse`, `herbier`, `collections`, `taxonomie`, `photo-identification`, `science-participative`, `biodiversité`, `données`. |
| `platforms`         | Valeurs séparées par `;` : `web`, `desktop`, `mobile`, `android`, `ios`, `cli`, `plugin-qgis`, `api`, `embarqué`.                                                                                                                              |
| `languages`         | Codes langue séparés par `;` : `fr`, `en`, `es`, `de`, `it`, `pt`, `nl`.                                                                                                                                                                       |
| `status`            | `actif`, `stable`, `experimental`, `archive`, `inconnu`.                                                                                                                                                                                       |
| `icon`              | Nom de fichier uniquement, par exemple `cartoflore.png`. Le fichier correspondant doit être placé dans `data/img/`. Laisser vide pour afficher les initiales du projet.                                                                        |
| `year`              | Année au format `YYYY`.                                                                                                                                                                                                                        |

## Règles de contribution

- Garder une seule ligne par outil.
- Utiliser `;` pour les champs à valeurs multiples.
- Préférer des identifiants courts, stables et lisibles.
- Laisser une cellule vide si l'information est inconnue.
- Vérifier que le dépôt source est public et que la licence est open source.
