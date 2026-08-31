# 🤝 Guide de Contribution - Glory of France Clicker

Merci de votre intérêt pour contribuer à **Glory of France Clicker** ! Ce guide vous explique comment participer au développement du jeu.

---

## 📋 Table des matières

1. [Code de conduite](#-code-de-conduite)
2. [Comment contribuer](#-comment-contribuer)
3. [Configuration du projet](#-configuration-du-projet)
4. [Structure du code](#-structure-du-code)
5. [Conventions de code](#-conventions-de-code)
6. [Soumettre une contribution](#-soumettre-une-contribution)
7. [Signaler un bug](#-signaler-un-bug)
8. [Proposer une fonctionnalité](#-proposer-une-fonctionnalité)
9. [Ressources utiles](#-ressources-utiles)

---

## 🎯 Code de conduite

En participant à ce projet, vous acceptez de respecter les règles suivantes :

- **Soyez respectueux** : Pas de propos insultants, discriminatoires ou haineux
- **Soyez constructif** : Les critiques doivent être bienveillantes et productives
- **Respectez le travail des autres** : Ne modifiez pas le code des autres sans discussion préalable
- **Documentez votre code** : Ajoutez des commentaires pour expliquer les changements complexes
- **Suivez les conventions** : Respectez le style de code existant

---

## 💡 Comment contribuer

Il existe plusieurs façons de contribuer :

### 🐛 Signaler des bugs
- Ouvrez une [issue](https://github.com/Mayeul200/glory-of-france-clicker/issues) avec une description claire
- Incluez les étapes pour reproduire le bug
- Précisez votre navigateur et version

### 💻 Développer de nouvelles fonctionnalités
- Forkez le dépôt
- Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
- Commitez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
- Poussez vers la branche (`git push origin feature/ma-fonctionnalite`)
- Ouvrez une Pull Request

### 📚 Améliorer la documentation
- Corrigez les fautes d'orthographe
- Ajoutez des explications manquantes
- Améliorez la structure et la lisibilité

### 🎨 Contribuer au design
- Proposez de nouveaux styles CSS
- Créez des animations
- Suggérez des améliorations d'UI/UX

### 🌍 Traduire le jeu
- Le jeu est actuellement en français
- Les traductions en d'autres langues sont les bienvenues

---

## ⚙️ Configuration du projet

### Prérequis
- Git
- Un éditeur de code (VS Code, Sublime Text, etc.)
- Un navigateur web moderne
- Optionnel : Node.js pour les outils de développement

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/Mayeul200/glory-of-france-clicker.git
cd glory-of-france-clicker

# Créer une branche de développement
git checkout -b dev/ma-contribution
```

### Lancer le jeu localement

```bash
# Avec Python 3
python3 -m http.server 8000

# Avec Node.js
npx serve

# Avec PHP
php -S localhost:8000
```

Ouvrez [http://localhost:8000](http://localhost:8000) dans votre navigateur.

---

## 🏗️ Structure du code

### Architecture générale

```
index.html          # Structure HTML (3 colonnes)
├── script.js       # Logique du jeu
│   ├── Constants   # Constantes globales
│   ├── Data        # Données des bâtiments, upgrades, bonus
│   ├── Game State  # État du jeu (score, bâtiments, etc.)
│   ├── Game Loop   # Boucle de jeu principale
│   ├── UI Functions # Fonctions d'interface
│   ├── Save/Load   # Sauvegarde et chargement
│   └── Utilities   # Fonctions utilitaires
└── style.css       # Styles CSS
```

### Fichier `script.js` - Structure détaillée

#### 1. **Constantes Globales** (Lignes 1-30)
```javascript
// Exemples :
BUILDING_PRICE_GROWTH_RATE = 0.12    // Taux d'augmentation des prix
GAME_LOOP_FPS = 10                    // Frames par seconde du game loop
SAVE_INTERVAL_MS = 30000             // Intervalle de sauvegarde auto
```

#### 2. **Données du Jeu** (Lignes 31-150)
- `BUILDINGS` : Array de 25 objets bâtiment
  - Chaque bâtiment a : id, name, description, baseCost, gain, count, image, unlockCondition
- `CLICK_UPGRADES` : Array de 10 niveaux d'amélioration de clic
- `BUILDING_UPGRADE_THRESHOLDS` : Seuil pour les upgrades de bâtiments
- `UPGRADE_COLORS` : Palette de couleurs pour les upgrades
- `RANDOM_BONUSES` : Bonus aléatoires (baguette, croissant)

#### 3. **État du Jeu** (Lignes 151-200)
```javascript
let score = 0;              // Score actuel
let buildings = [];        // Bâtiments achetés
let clickPower = 1;         // Puissance de clic
let buyMultiplier = 5;      // Multiplicateur d'achat
let activeBonuses = [];     // Bonus actifs
let stats = {};            // Statistiques
```

#### 4. **Fonctions Principales**

**Game Loop** (Lignes 200-250)
- `gameLoop()` : Boucle principale (10 FPS)
- `updateBuildings()` : Met à jour la production des bâtiments
- `updateUI()` : Met à jour l'interface

**Gestion du Score** (Lignes 250-300)
- `addScore(amount)` : Ajoute des points
- `getScorePerSecond()` : Calcule le gain par seconde
- `getTotalGenerated()` : Calcule le total généré

**Bâtiments** (Lignes 300-450)
- `buyBuilding(id)` : Acheter un bâtiment
- `getBuildingPrice(id)` : Calcule le prix actuel
- `getBuildingGain(id)` : Calcule le gain actuel
- `canAfford(id)` : Vérifie si on peut acheter
- `unlockBuilding(id)` : Débloque un bâtiment

**Améliorations** (Lignes 450-550)
- `buyClickUpgrade()` : Acheter une amélioration de clic
- `getClickUpgradeLevel()` : Niveau actuel
- `applyClickUpgradeEffects()` : Applique les effets

**Bonus** (Lignes 550-650)
- `spawnRandomBonus()` : Fait apparaître un bonus
- `activateBonus(type)` : Active un bonus
- `removeBonus(id)` : Supprime un bonus
- `checkBonusCollisions()` : Vérifie les collisions

**Sauvegarde** (Lignes 650-800)
- `saveGame()` : Sauvegarde le jeu
- `loadGame()` : Charge une sauvegarde
- `exportSave()` : Export manuel
- `importSave(data)` : Import manuel
- `resetGame()` : Réinitialise le jeu

**UI** (Lignes 800-1100)
- `renderBuildings()` : Affiche les bâtiments
- `renderUpgrades()` : Affiche les améliorations
- `renderStats()` : Affiche les statistiques
- `showToast(message)` : Affiche une notification
- `toggleStats()` : Affiche/masque les stats
- `toggleSettings()` : Affiche/masque les paramètres

**Effets Visuels** (Lignes 1100-1200)
- `createClickEffect(x, y)` : Effet de clic
- `showBonusEffect(bonus)` : Animation de bonus
- `animateScoreGain(amount)` : Animation de gain

**Utilitaires** (Lignes 1200-1249)
- `formatNumber(num)` : Formate les grands nombres
- `timeAgo(timestamp)` : Formate le temps écoulé
- `generateId()` : Génère un ID unique

### Fichier `style.css` - Structure

#### 1. **Variables CSS** (Lignes 1-20)
```css
:root {
  --primary-color: #1e40af;
  --secondary-color: #3b82f6;
  --accent-color: #ef4444;
  --background-color: #f8fafc;
  --text-color: #1e293b;
  --panel-bg: rgba(255, 255, 255, 0.8);
}
```

#### 2. **Reset & Base** (Lignes 21-50)
- Reset des styles par défaut
- Styles de base pour body, h1, h2, etc.

#### 3. **Layout** (Lignes 51-150)
- `.top-bar` : Barre supérieure
- `.main-grid` : Grille principale (3 colonnes)
- `.left-panel`, `.center-panel`, `.right-panel` : Panneaux

#### 4. **Composants UI** (Lignes 151-400)
- `.medal` : La médaille cliquable
- `.counters` : Compteurs de score
- `.buildings-list` : Liste des bâtiments
- `.building-item` : Élément de bâtiment
- `.upgrades-bar` : Barre des améliorations
- `.modal` : Fenêtres modales
- `.toast` : Notifications

#### 5. **Animations** (Lignes 401-500)
- `@keyframes clickEffect` : Effet de clic
- `@keyframes bonusSpawn` : Apparition des bonus
- `@keyframes pulse` : Effet de pulsation
- `@keyframes fadeIn` : Fondu d'entrée

#### 6. **Responsive** (Lignes 501-698)
- Media queries pour mobile, tablette, desktop
- Adaptation des tailles et espacements

---

## 📝 Conventions de code

### JavaScript

#### Nommage
- **Variables** : `camelCase` (ex: `currentScore`, `buildingList`)
- **Constantes** : `UPPER_SNAKE_CASE` (ex: `MAX_BUILDINGS`, `GAME_VERSION`)
- **Fonctions** : `camelCase` (ex: `calculateScore()`, `renderBuilding()`)
- **Classes** : `PascalCase` (non utilisé actuellement, mais à adopter si ajout de classes)

#### Structure
```javascript
// Fonction typique
function functionName(parameter1, parameter2) {
  // Commentaire expliquant la fonction
  
  // Logique
  const result = parameter1 + parameter2;
  
  return result;
}
```

#### Commentaires
- **Fonctions** : Ajoutez un commentaire JSDoc pour les fonctions complexes
- **Logique complexe** : Expliquez les algorithmes non évidents
- **TODO** : Utilisez `// TODO:` pour les tâches futures
- **FIXME** : Utilisez `// FIXME:` pour les bugs connus

#### Bonnes pratiques
- Évitez les variables globales (utilisez des modules si possible)
- Préférez `const` à `let` quand la variable ne change pas
- Utilisez des fonctions pures quand possible
- Gérez les erreurs avec try/catch pour les opérations critiques

### CSS

#### Nommage
- **Classes** : `kebab-case` (ex: `.building-item`, `.score-counter`)
- **IDs** : `kebab-case` (ex: `#score-value`, `#buildings-list`)
- **Variables** : `--kebab-case` (ex: `--primary-color`, `--panel-bg`)

#### Structure
```css
/* Sélecteur */
.selector {
  /* Propriété: valeur; */
  property: value;
}

/* Commentaire pour les sections */
/* ===== Barre supérieure ===== */
.top-bar {
  display: flex;
  justify-content: space-between;
}
```

#### Bonnes pratiques
- Utilisez les variables CSS pour les couleurs et tailles
- Évitez `!important` (sauf cas exceptionnel)
- Préférez Flexbox/Grid aux floats
- Utilisez des unités relatives (em, rem, %) quand possible

### HTML

#### Structure
- Indentation : 2 espaces
- Attributs : ordre alphabétique
- Balises auto-fermantes : utilisez `/` (ex: `<img />`)

#### Bonnes pratiques
- Utilisez des attributs sémantiques (`alt`, `title`, `aria-*`)
- Évitez les balises obsolètes (`<font>`, `<center>`, etc.)
- Utilisez des balises sémantiques (`<header>`, `<main>`, `<footer>`, etc.)

---

## 🚀 Soumettre une contribution

### 1. Forkez le dépôt
- Allez sur [GitHub](https://github.com/Mayeul200/glory-of-france-clicker)
- Cliquez sur "Fork" en haut à droite

### 2. Clonez votre fork
```bash
git clone https://github.com/votre-username/glory-of-france-clicker.git
cd glory-of-france-clicker
```

### 3. Créez une branche
```bash
# Pour une nouvelle fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite

# Pour un bug fix
git checkout -b fix/nom-du-bug

# Pour de la documentation
git checkout -b docs/amelioration-docs
```

### 4. Faites vos modifications
- Modifiez les fichiers nécessaires
- Testez vos changements localement
- Assurez-vous que tout fonctionne

### 5. Commitez vos changements
```bash
# Ajoutez les fichiers modifiés
git add .

# Commitez avec un message clair
git commit -m "Ajout: nouvelle fonctionnalité de mini-jeu"
git commit -m "Fix: correction du bug d'affichage des stats"
git commit -m "Docs: amélioration du README"
```

### 6. Poussez vers votre fork
```bash
# Poussez la branche vers votre fork
git push origin feature/nouvelle-fonctionnalite
```

### 7. Ouvrez une Pull Request
- Allez sur le dépôt original
- Cliquez sur "Pull Requests" puis "New Pull Request"
- Sélectionnez votre branche
- Ajoutez une description claire de vos changements
- Soumettez la PR

### 8. Attendez la revue
- Un mainteneur reviendra votre PR
- Des modifications peuvent être demandées
- Une fois approuvée, votre contribution sera mergée !

---

## 🐛 Signaler un bug

Pour signaler un bug efficacement :

### 1. Vérifiez que le bug n'a pas déjà été signalé
- Consultez les [issues existantes](https://github.com/Mayeul200/glory-of-france-clicker/issues)

### 2. Créez une nouvelle issue
- Cliquez sur "New Issue" sur GitHub
- Utilisez le template de bug report si disponible

### 3. Incluez les informations suivantes

```markdown
## Description
Décrivez clairement le bug.

## Étapes pour reproduire
1. Allez sur...
2. Cliquez sur...
3. Faites...
4. Le bug se produit

## Comportement attendu
Ce qui devrait se passer.

## Comportement actuel
Ce qui se passe réellement.

## Environnement
- Navigateur : [Chrome/Firefox/Safari/Edge]
- Version du navigateur : [ex: 120.0]
- Appareil : [Desktop/Mobile/Tablette]
- Système d'exploitation : [Windows/macOS/Linux/iOS/Android]

## Captures d'écran
Ajoutez des captures si pertinent.

## Informations supplémentaires
Toute autre information utile.
```

---

## 💡 Proposer une fonctionnalité

Pour proposer une nouvelle fonctionnalité :

### 1. Vérifiez que la fonctionnalité n'a pas déjà été proposée
- Consultez les [issues](https://github.com/Mayeul200/glory-of-france-clicker/issues) et [discussions](https://github.com/Mayeul200/glory-of-france-clicker/discussions)

### 2. Créez une nouvelle issue ou discussion
- Cliquez sur "New Issue" ou "New Discussion"
- Utilisez le template de feature request si disponible

### 3. Incluez les informations suivantes

```markdown
## Description de la fonctionnalité
Décrivez clairement la fonctionnalité souhaitée.

## Problème résolu
Quel problème cette fonctionnalité résoud-elle ?

## Solution proposée
Comment implémenteriez-vous cette fonctionnalité ?

## Exemples
Des exemples concrets d'utilisation.

## Avantages
Pourquoi cette fonctionnalité serait-elle utile ?

## Priorité
- [ ] Faible
- [ ] Moyenne
- [ ] Élevée
- [ ] Critique
```

---

## 📚 Ressources utiles

### Documentation
- [MDN Web Docs](https://developer.mozilla.org/) - Référence JavaScript, HTML, CSS
- [JavaScript.info](https://javascript.info/) - Tutoriels JavaScript
- [CSS Tricks](https://css-tricks.com/) - Astuces CSS

### Outils
- [VS Code](https://code.visualstudio.com/) - Éditeur de code recommandé
- [GitHub Desktop](https://desktop.github.com/) - Client Git graphique
- [Figma](https://www.figma.com/) - Outil de design (pour les mockups)
- [Canva](https://www.canva.com/) - Création d'images

### Communautés
- [Stack Overflow](https://stackoverflow.com/) - Questions techniques
- [Reddit r/webdev](https://www.reddit.com/r/webdev/) - Communauté webdev
- [Discord JavaScript](https://discord.gg/javascript) - Communauté JS

---

## 🎓 Bonnes pratiques pour les contributeurs

### 1. Commencez petit
- Ne prenez pas de tâches trop grosses pour votre première contribution
- Commencez par des corrections de bugs ou de la documentation

### 2. Testez vos changements
- Testez sur plusieurs navigateurs (Chrome, Firefox, Edge)
- Testez sur mobile (si possible)
- Vérifiez que les anciennes fonctionnalités fonctionnent toujours

### 3. Documentez votre code
- Ajoutez des commentaires pour le code complexe
- Mettez à jour la documentation si nécessaire
- Expliquez vos choix dans la PR

### 4. Suivez le style existant
- Respectez les conventions de nommage
- Suivez la structure du code
- Maintenez la cohérence avec le reste du codebase

### 5. Soyez patient
- Les revues de code peuvent prendre du temps
- Soyez ouvert aux feedbacks
- Améliorez vos compétences avec chaque contribution

---

## 🏆 Contributeurs

Merci à tous ceux qui ont contribué au projet !

<!-- Liste générée automatiquement -->
<!-- CONTRIBUTORS-LIST-START -->
<!-- CONTRIBUTORS-LIST-END -->

---

## 📞 Support

Si vous avez des questions sur la contribution :
- Ouvrez une [discussion](https://github.com/Mayeul200/glory-of-france-clicker/discussions)
- Contactez le mainteneur principal

---

*Merci de contribuer à Glory of France Clicker !* 🇫🇷
