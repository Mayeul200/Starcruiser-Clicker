# 📜 Changelog - Glory of France Clicker

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 📌 Non publié

### ✨ Nouveautés
- Ajout d'une documentation complète pour les développeurs et contributeurs
- Création de guides détaillés (CONTRIBUTING.md, docs/DEVELOPMENT.md, docs/DEPLOYMENT.md)
- Amélioration significative du README.md avec plus de détails sur le jeu

### 📚 Documentation
- Ajout de `CONTRIBUTING.md` : Guide complet pour contribuer au projet
- Ajout de `CHANGELOG.md` : Historique des changements (ce fichier)
- Ajout de `docs/DEVELOPMENT.md` : Guide technique détaillé pour les développeurs
- Ajout de `docs/DEPLOYMENT.md` : Guide de déploiement multi-plateformes
- Mise à jour du `README.md` : Documentation utilisateur complète

---

## 🏷️ [v1.0.0] - 2024-08-31

### ✨ Première Version Stable

Version initiale complète du jeu Glory of France Clicker.

### 🎮 Fonctionnalités du Jeu

#### Bâtiments (25 au total)
- **Antiquité** : Coq Gaulois, Vercingétorix
- **Moyen Âge** : Charlemagne, Notre-Dame, Fleur de Lys, Saint Louis
- **Renaissance** : Jeanne d'Arc, Louis XIV
- **Révolution** : Révolution, Napoléon
- **Époque Moderne** : Tour Eiffel, De Gaulle, Macron
- **Symboles** : Marianne, Liberté, Égalité, Fraternité
- **Monuments** : Louvre, Champs-Élysées, Arc de Triomphe, Sacré-Cœur
- **Légendaires** : Mont Saint-Michel, Palais de Versailles, Notre-Dame de Paris, République Française

#### Mécaniques de Jeu
- Système de clic avec gain de Gloire
- Achat de bâtiments pour une production automatique
- 10 niveaux d'amélioration de clic
- 25 niveaux d'upgrades pour les bâtiments
- Système de bonus aléatoires (Baguette Magique, Croissant Doré)
- Multiplicateurs d'achat (x1, x5, x50, Max)

#### UI/UX
- Design responsive (mobile, tablette, desktop)
- Interface à 3 colonnes (mini-jeux, zone de clic, bâtiments)
- Barre supérieure avec boutons Statistiques et Paramètres
- Modales pour les statistiques et paramètres
- Effets visuels (animations de clic, bonus)
- Notifications toast
- Thème bleu/blanc/rouge (couleurs du drapeau français)

#### Sauvegarde
- Sauvegarde automatique toutes les 30 secondes
- Export/Import manuel de sauvegarde
- Suppression de sauvegarde
- Système de versionnage (v5.0.0)

#### Statistiques
- Suivi du nombre total de clics
- Suivi de la Gloire totale générée
- Temps de jeu
- Statistiques par bâtiment

### 🛠️ Techniques

#### Frontend
- **Langages** : HTML5, CSS3, JavaScript (ES6+)
- **Pas de framework** : Vanilla JS pour une compatibilité maximale
- **Polices** : Google Fonts - Inter
- **Stockage** : LocalStorage
- **Design** : CSS Flexbox/Grid, animations CSS

#### Architecture
- Game Loop à 10 FPS
- Système de données centralisé (BUILDINGS, CLICK_UPGRADES, etc.)
- Gestion d'état simple
- Rendering optimisé

#### Fichiers
- `index.html` (94 lignes) : Structure HTML
- `script.js` (1249 lignes) : Logique du jeu
- `style.css` (698 lignes) : Styles CSS
- `assets/` : Dossier pour les ressources futures

### 📊 Statistiques
- **25 bâtiments** historiques
- **10 améliorations de clic**
- **25 niveaux d'upgrades** pour les bâtiments
- **2 types de bonus** aléatoires
- **100% compatible mobile**
- **Taille totale** : ~200 Ko (sans assets)

---

## 📅 Historique des Versions

| Version | Date | Description |
|---------|------|-------------|
| v1.0.0 | 2024-08-31 | Première version stable |

---

## 🔮 Roadmap

### 🎯 Prochaines Versions

#### v1.1.0 - Améliorations Mineures
- [ ] Ajout de 5 nouveaux bâtiments historiques
- [ ] Implémentation de 2-3 mini-jeux simples
- [ ] Amélioration des animations
- [ ] Correction des bugs mineurs

#### v1.2.0 - Fonctionnalités Avancées
- [ ] Système de prestiges
- [ ] Ajout de sons et musiques
- [ ] Système de quêtes journalières
- [ ] Leaderboard (classement)

#### v1.3.0 - Refactorisation
- [ ] Migration vers des modules ES6
- [ ] Ajout de TypeScript pour le typage
- [ ] Optimisation des performances
- [ ] Meilleure organisation du code

#### v2.0.0 - Version Majeure
- [ ] Passage à un framework (React/Vue)
- [ ] Ajout d'un backend optionnel
- [ ] Système de comptes utilisateurs
- [ ] Synchronisation multi-appareils
- [ ] Version mobile native

---

## 📝 Format du Changelog

### Types de changements

- `✨ Nouveautés` : Ajout de nouvelles fonctionnalités
- `🐛 Corrections` : Fix de bugs
- `🔄 Changements` : Modifications de fonctionnalités existantes
- `❌ Suppressions` : Retrait de fonctionnalités
- `📚 Documentation` : Mises à jour de la documentation
- `🛠️ Techniques` : Changements techniques/internes
- `🎨 UI/UX` : Améliorations d'interface et d'expérience utilisateur
- `⚡ Performances` : Optimisations de performances
- `🔒 Sécurité` : Corrections de vulnérabilités

### Structure d'une entrée

```markdown
## [version] - date

### type
- description du changement 1
- description du changement 2

### autre_type
- description du changement
```

### Bonnes pratiques

- Une ligne par changement
- Utiliser des verbes d'action (Ajout, Correction, Amélioration, etc.)
- Être concis mais clair
- Lier aux issues/PRs si pertinent (ex: `Closes #123`)

---

## 🤝 Contribution au Changelog

Si vous contribuez au projet et que votre PR ajoute des fonctionnalités ou corrige des bugs, **merci de mettre à jour ce fichier** en conséquence.

### Comment contribuer

1. Ajoutez vos changements dans la section **Non publié** en haut du fichier
2. Suivez le format existant
3. Soyez clair et concis
4. Si votre changement résout une issue, mentionnez-la (ex: `Fix: correction du bug d'affichage des stats (Closes #45)`)

### Exemple de contribution

```markdown
## 📌 Non publié

### ✨ Nouveautés
- Ajout du bâtiment "Cathedrale de Reims" (par @contributeur)

### 🐛 Corrections
- Fix: correction de l'affichage des grands nombres (> 1 trillion)
- Fix: les bonus ne disparaissaient pas après expiration (Closes #23)

### 📚 Documentation
- Mise à jour du guide de déploiement pour Firebase Hosting
```

---

## 📞 Support

Pour signaler un bug ou proposer une amélioration :
- Ouvrez une [issue](https://github.com/Mayeul200/glory-of-france-clicker/issues) sur GitHub
- Ou ouvrez une [discussion](https://github.com/Mayeul200/glory-of-france-clicker/discussions)

---

*Maintenu avec ❤️ pour la France*
