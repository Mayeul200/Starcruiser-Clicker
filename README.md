# Starcruiser Clicker

> Construisez votre fusée pièce par pièce, lancez-la vers les étoiles et exploitez l'espace dans ce clicker spatial gratuit.

![Starcruiser Clicker](images/logo2.webp)

## Jouer

**[Jouer maintenant](https://mayeul200.github.io/Starcruiser-Clicker/)**

100 % gratuit, sans inscription, directement dans le navigateur — PC et mobile. Installable comme une application (PWA).

## Le concept

Vous dirigez un programme spatial naissant :

1. **Cliquez** sur la pièce pour produire des Parts
2. **Construisez des bâtiments** (14 types, de l'Atelier au Trou noir industriel) pour automatiser la production
3. **Assemblez votre fusée** : 10 pièces à acheter, de la tuyère à l'astronaute
4. **Lancez-la !** Votre fusée parcourt des kilomètres réels et atteint de nouvelles planètes : Lune, Mars, Neptune, Proxima Centauri... jusqu'à l'Amas de Virgo
5. **Prestige** : chaque lancement vous donne de la Poussière d'Étoiles à dépenser dans l'Atelier Galactique (améliorations permanentes)

## Caractéristiques

- **Boucle de jeu complète** : clic → production → fusée → voyage → prestige
- **11 planètes** à atteindre, chacune avec son bonus permanent
- **29 améliorations galactiques permanentes** en 5 branches (production, fusée, collection, clic, hors-ligne)
- **Contrats de fabrication** : 5 types de mini-défis (clics, interception de comètes, production...) en 3 difficultés
- **Collection de cartes** : 20 cartes à collectionner pour un bonus de production passif
- **Trophée case** : 30+ succès à débloquer
- **Événements dynamiques** : pluies de comètes à intercepter, éruptions solaires
- **6 langues** : français, anglais, espagnol, allemand, italien, portugais, néerlandais
- **Sauvegarde automatique** + production hors-ligne
- **Responsive** : jouable au doigt comme à la souris

## Technique

Jeu 100 % vanilla (HTML/CSS/JS, aucune dépendance, aucun framework) :

- Rendu canvas optimisé (pool de particules recyclées, transform GPU)
- i18n maison (~900 traductions × 6 langues)
- PWA : installable, service worker, reprise hors-ligne
- Sauvegarde localStorage versionnée avec migration
- Images optimisées WebP (qualité 82, sprites plafonnés à 900px de large)

### Mise à jour du cache PWA

La version du cache du service worker est générée automatiquement depuis le
contenu des fichiers. Après toute modification du jeu, lancer puis committer :

```bash
node tools/bump-cache-version.mjs
```

Le script réécrit `CACHE_NAME` (sw.js) et `APP_CACHE_VERSION` (index.html)
avec le hash du contenu : tout changement de fichier force un nouveau cache,
les joueurs récupèrent la mise à jour au rechargement suivant.

## Licence

Tous droits réservés © Mayeul
