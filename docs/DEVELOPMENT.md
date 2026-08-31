# 🛠️ Guide de Développement - Glory of France Clicker

Ce guide est destiné aux développeurs qui souhaitent comprendre, modifier ou étendre le code du jeu.

---

## 📋 Table des matières

1. [Architecture du Jeu](#-architecture-du-jeu)
2. [Système de Bâtiments](#-système-de-bâtiments)
3. [Système d'Upgrades](#-système-dupgrades)
4. [Système de Bonus](#-système-de-bonus)
5. [Sauvegarde et Chargement](#-sauvegarde-et-chargement)
6. [Game Loop](#-game-loop)
7. [UI et Rendering](#-ui-et-rendering)
8. [Ajouter un Nouveau Bâtiment](#-ajouter-un-nouveau-bâtiment)
9. [Ajouter un Nouveau Bonus](#-ajouter-un-nouveau-bonus)
10. [Optimisations](#-optimisations)

---

## 🏗️ Architecture du Jeu

### Schéma global

```
┌─────────────────────────────────────────────────────────────┐
│                        Glory of France Clicker                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   BUILDINGS   │    │    CLICK      │    │    BONUS     │  │
│  │  (25 types)   │    │  UPGRADES    │    │  (Random)     │  │
│  │               │    │  (10 levels)  │    │               │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    GAME STATE                            │  │
│  │  - score: number                                        │  │
│  │  - clickPower: number                                   │  │
│  │  - buildings: Building[]                                │  │
│  │  - activeBonuses: Bonus[]                               │  │
│  │  - stats: Stats                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    GAME LOOP                            │  │
│  │  - Update buildings production                         │  │
│  │  - Update UI                                           │  │
│  │  - Check for random bonuses                            │  │
│  │  - Auto-save                                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Flux de données

```
User Action (Click, Buy, etc.)
         ↓
   Event Handler (onclick, etc.)
         ↓
   Game State Update (score, buildings, etc.)
         ↓
   UI Update (renderBuildings, renderUpgrades, etc.)
         ↓
   Save to LocalStorage (auto-save every 30s)
```

---

## 🏛️ Système de Bâtiments

### Structure d'un bâtiment

```javascript
const buildingTemplate = {
  id: "unique-id",           // Identifiant unique
  name: "Display Name",      // Nom affiché
  description: "...",        // Description (avec placeholders)
  baseCost: 100,             // Coût de base
  gain: 10,                 // Gain par seconde (base)
  count: 0,                 // Nombre possédé (initialisé à 0)
  image: "🏛️",              // Emoji ou URL d'image
  unlockCondition: () => score >= X,  // Condition de déblocage
  totalGenerated: 0         // Total généré par ce bâtiment
};
```

### Calcul du prix

Le prix d'un bâtiment augmente à chaque achat selon la formule :

```javascript
function getBuildingPrice(building) {
  return Math.floor(
    building.baseCost * 
    Math.pow(1 + BUILDING_PRICE_GROWTH_RATE, building.count)
  );
}
```

Où `BUILDING_PRICE_GROWTH_RATE = 0.12` (12% d'augmentation par achat)

### Calcul du gain

Le gain total d'un bâtiment dépend de son gain de base et du nombre possédé :

```javascript
function getBuildingGain(building) {
  return building.gain * building.count;
}
```

### Débloquage des bâtiments

Les bâtiments sont débloqués selon leur condition :

```javascript
function canUnlockBuilding(building) {
  return building.unlockCondition();
}
```

Exemples de conditions :
- `() => score >= 10` (Coq Gaulois)
- `() => score >= 20` (Vercingétorix)
- `() => score >= 500` (Charlemagne)
- etc.

### Affichage des bâtiments

Les bâtiments sont rendus dans `renderBuildings()` :

```javascript
function renderBuildings() {
  const list = document.getElementById('buildings-list');
  list.innerHTML = '';
  
  BUILDINGS.forEach(building => {
    if (!canUnlockBuilding(building)) return;
    
    const price = getBuildingPrice(building);
    const canAfford = score >= price;
    
    const element = createBuildingElement(building, price, canAfford);
    list.appendChild(element);
  });
}
```

---

## ⚡ Système d'Upgrades

### Types d'upgrades

#### 1. Click Upgrades (Améliorations de clic)

```javascript
const CLICK_UPGRADES = [
  { threshold: 50, name: "Clic de base", cost: 50 },
  { threshold: 100, name: "Clic Précis", cost: 100 },
  // ... 10 niveaux au total
];
```

Chaque upgrade augmente la puissance de clic (`clickPower`).

#### 2. Building Upgrades (Améliorations de bâtiments)

Les bâtiments peuvent être upgradés jusqu'à 25 fois (selon `BUILDING_UPGRADE_THRESHOLDS`).

```javascript
const BUILDING_UPGRADE_THRESHOLDS = [
  1, 5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500,
  550, 600, 650, 700, 750, 800, 850, 900, 950, 1000
];
```

### Couleurs des upgrades

Les upgrades changent de couleur selon leur niveau :

```javascript
const UPGRADE_COLORS = [
  '#88c9ee', '#66b2ff', '#4499ff', '#2288ff', '#1177ff',
  '#0066ff', '#4444ff', '#6622ff', '#8800ff', '#aa00dd',
  '#cc00bb', '#ee0099', '#ff0077', '#ff0055', '#ff2233',
  '#ff4411', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00',
  '#ffee00', '#ffff00'
];
```

---

## 🎁 Système de Bonus

### Types de bonus

```javascript
const RANDOM_BONUSES = [
  {
    id: "baguette",
    symbol: "🥖",
    name: "Baguette Magique",
    effect: "instant",
    type: "baguette",
    colorClass: "baguette"
  },
  {
    id: "croissant",
    symbol: "🥐",
    name: "Croissant Doré",
    effect: "multiplier",
    type: "croissant",
    multiplier: 10,
    duration: 30000, // 30 secondes
    colorClass: "croissant"
  }
];
```

### Mécanisme de spawn

```javascript
// Spawn un bonus aléatoire toutes les 60 secondes
setInterval(() => {
  if (Math.random() < 0.5) {  // 50% de chance
    spawnRandomBonus();
  }
}, BONUS_SPAWN_INTERVAL_MS);

function spawnRandomBonus() {
  const bonus = RANDOM_BONUSES[Math.floor(Math.random() * RANDOM_BONUSES.length)];
  activeBonuses.push({
    ...bonus,
    id: Date.now(),
    x: Math.random() * (window.innerWidth - 100),
    y: Math.random() * (window.innerHeight - 200)
  });
  renderBonuses();
}
```

### Effets des bonus

- **Instant** (baguette) : Donne un bonus de score immédiat
- **Multiplier** (croissant) : Multiplie le gain par seconde pendant une durée limitée

### Détection des collisions

```javascript
function checkBonusCollisions() {
  activeBonuses.forEach(bonus => {
    // Calculer la distance entre le clic et le bonus
    // Si distance < rayon, activer le bonus
  });
}
```

---

## 💾 Sauvegarde et Chargement

### Structure de la sauvegarde

```javascript
const saveData = {
  version: SAVE_VERSION,  // "5.0.0"
  timestamp: Date.now(),
  score: 0,
  clickPower: 1,
  clickUpgradeLevel: 0,
  buildings: BUILDINGS.map(b => ({
    id: b.id,
    count: b.count,
    totalGenerated: b.totalGenerated
  })),
  stats: {
    totalClicks: 0,
    totalGenerated: 0,
    playtime: 0,
    lastSave: Date.now()
  },
  buyMultiplier: 5
};
```

### Sauvegarde automatique

```javascript
// Sauvegarde toutes les 30 secondes
setInterval(() => {
  saveGame();
}, SAVE_INTERVAL_MS);

function saveGame() {
  const saveData = createSaveData();
  localStorage.setItem('gloryOfFranceSave', JSON.stringify(saveData));
}
```

### Chargement

```javascript
function loadGame() {
  const saved = localStorage.getItem('gloryOfFranceSave');
  if (!saved) return false;
  
  try {
    const data = JSON.parse(saved);
    
    // Vérifier la version
    if (data.version !== SAVE_VERSION) {
      // Migration si nécessaire
      return migrateSave(data);
    }
    
    // Charger les données
    restoreGameState(data);
    return true;
  } catch (e) {
    console.error('Erreur de chargement:', e);
    return false;
  }
}
```

### Export/Import manuel

```javascript
function exportSave() {
  const data = localStorage.getItem('gloryOfFranceSave');
  const textarea = document.getElementById('import-textarea');
  textarea.value = data;
  textarea.select();
  navigator.clipboard.writeText(data);
  showToast('Sauvegarde copiée dans le presse-papiers!');
}

function importSave() {
  const textarea = document.getElementById('import-textarea');
  try {
    const data = JSON.parse(textarea.value);
    localStorage.setItem('gloryOfFranceSave', textarea.value);
    loadGame();
    showToast('Sauvegarde importée avec succès!');
  } catch (e) {
    showToast('Erreur: sauvegarde invalide!');
  }
}
```

---

## 🔄 Game Loop

### Boucle principale

```javascript
// 10 FPS
const gameLoop = setInterval(() => {
  // 1. Mettre à jour les bâtiments
  updateBuildings();
  
  // 2. Mettre à jour l'UI
  updateUI();
  
  // 3. Vérifier les collisions de bonus
  checkBonusCollisions();
  
  // 4. Mettre à jour les bonus actifs
  updateActiveBonuses();
  
  // 5. Mettre à jour les statistiques
  updateStats();
}, GAME_LOOP_INTERVAL_MS);
```

### Update des bâtiments

```javascript
function updateBuildings() {
  BUILDINGS.forEach(building => {
    if (building.count > 0) {
      const gain = getBuildingGain(building);
      const actualGain = applyBonusMultipliers(gain);
      addScore(actualGain / GAME_LOOP_FPS);
      building.totalGenerated += actualGain / GAME_LOOP_FPS;
    }
  });
}
```

### Update de l'UI

```javascript
function updateUI() {
  // Mettre à jour le score
  document.getElementById('score-value').textContent = formatNumber(score);
  
  // Mettre à jour le gain par seconde
  const gps = getScorePerSecond();
  document.getElementById('gain-value').textContent = formatNumber(gps);
  
  // Mettre à jour la barre d'upgrades
  renderUpgrades();
  
  // Mettre à jour la liste des bâtiments
  renderBuildings();
}
```

---

## 🎨 UI et Rendering

### Structure HTML

```html
<!-- Barre du haut -->
<div class="top-bar">
  <div class="top-bar-controls">
    <button onclick="toggleStats()">📊</button>
    <button onclick="toggleSettings()">⚙️</button>
  </div>
</div>

<!-- Grille principale (3 colonnes) -->
<div class="main-grid">
  <!-- Colonne gauche: Mini-jeux -->
  <div class="left-panel">...</div>
  
  <!-- Colonne centrale: Zone de clic -->
  <div class="center-panel">
    <div class="medal" onclick="addScore(1)">🏅</div>
    <div class="counters">...</div>
  </div>
  
  <!-- Colonne droite: Bâtiments -->
  <div class="right-panel">
    <div class="buildings-list" id="buildings-list"></div>
  </div>
</div>

<!-- Modales -->
<div class="modal" id="stats-modal">...</div>
<div class="modal" id="settings-modal">...</div>

<!-- Effets -->
<div class="bonuses-container" id="random-bonuses"></div>
<div class="click-effects" id="click-effects"></div>
<div class="toast" id="toast"></div>
```

### Rendering des bâtiments

```javascript
function createBuildingElement(building, price, canAfford) {
  const div = document.createElement('div');
  div.className = 'building-item';
  div.innerHTML = `
    <div class="building-info">
      <span class="building-emoji">${building.image}</span>
      <span class="building-name">${building.name}</span>
    </div>
    <div class="building-stats">
      <span class="building-gain">+${formatNumber(building.gain)}/s</span>
      <span class="building-count">x${building.count}</span>
    </div>
    <div class="building-price">${formatNumber(price)} G</div>
    <button 
      class="buy-button ${!canAfford ? 'disabled' : ''}"
      onclick="buyBuilding('${building.id}')"
      ${!canAfford ? 'disabled' : ''}
    >
      Acheter ${buyMultiplier > 1 ? `x${buyMultiplier}` : ''}
    </button>
  `;
  return div;
}
```

### Effets visuels

#### Click Effect

```javascript
function createClickEffect(x, y) {
  const effect = document.createElement('div');
  effect.className = 'click-effect';
  effect.style.left = `${x}px`;
  effect.style.top = `${y}px`;
  effect.innerHTML = '+1';
  
  document.getElementById('click-effects').appendChild(effect);
  
  // Animation
  effect.style.transform = 'translate(-50%, -50%) scale(1)';
  effect.style.opacity = '1';
  
  setTimeout(() => {
    effect.style.transform = 'translate(-50%, -50%) scale(1.5)';
    effect.style.opacity = '0';
    setTimeout(() => effect.remove(), 200);
  }, 10);
}
```

#### Toast Notifications

```javascript
function showToast(message, duration = TOAST_DURATION_MS) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  
  setTimeout(() => {
    toast.classList.remove('visible');
  }, duration);
}
```

---

## ✨ Ajouter un Nouveau Bâtiment

### Étapes

1. **Ajouter à la liste BUILDINGS** (dans `script.js`) :

```javascript
const BUILDINGS = [
  // ... bâtiments existants
  {
    id: "nouveau-batiment",
    name: "Nom du Bâtiment",
    description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire",
    baseCost: 1000000000000000000,  // 1 quintillion
    gain: 1000000000000000,        // 1 quadrillion/s
    count: 0,
    image: "🏰",
    unlockCondition: () => score >= 500000000000000000,  // 500 quintillions
    totalGenerated: 0
  }
];
```

2. **Positionner correctement** :
- Les bâtiments sont affichés dans l'ordre du tableau
- Placez-le à la fin pour qu'il apparaisse en bas de la liste

3. **Ajuster les conditions de déblocage** :
- La condition doit être réaliste (score requis)
- Assurez-vous que les bâtiments précédents sont accessibles avant

4. **Tester** :
- Vérifiez que le bâtiment apparaît quand le score est suffisant
- Vérifiez que l'achat fonctionne
- Vérifiez que le gain est correct

---

## 🎁 Ajouter un Nouveau Bonus

### Étapes

1. **Ajouter à la liste RANDOM_BONUSES** :

```javascript
const RANDOM_BONUSES = [
  // ... bonus existants
  {
    id: "nouveau-bonus",
    symbol: "🎉",
    name: "Nom du Bonus",
    effect: "multiplier",  // ou "instant"
    type: "nouveau",
    multiplier: 15,       // Si effect = "multiplier"
    duration: 45000,     // 45 secondes (si effect = "multiplier")
    instantReward: 1000, // Si effect = "instant"
    colorClass: "nouveau"
  }
];
```

2. **Ajouter le style CSS** :

```css
/* Dans style.css */
.bonus.nouveau {
  background: linear-gradient(135deg, #84cc16, #22c55e);
  color: white;
  border: none;
}

.bonus.nouveau::after {
  content: "✨";
  position: absolute;
  top: -10px;
  right: -10px;
}
```

3. **Ajouter l'effet** (si nécessaire) :

Dans `activateBonus()` :

```javascript
case 'nouveau':
  // Appliquer l'effet
  if (bonus.effect === 'instant') {
    addScore(bonus.instantReward);
  } else if (bonus.effect === 'multiplier') {
    activeMultipliers.push({
      multiplier: bonus.multiplier,
      endTime: Date.now() + bonus.duration
    });
  }
  break;
```

4. **Tester** :
- Attendez qu'un bonus apparaisse
- Cliquez dessus pour l'activer
- Vérifiez que l'effet est appliqué

---

## ⚡ Optimisations

### Performances

1. **Limiter le nombre de bâtiments affichés** :

```javascript
const MAX_BUILDING_DISPLAY = 100;

function renderBuildings() {
  // Ne pas afficher plus de MAX_BUILDING_DISPLAY bâtiments
  const buildingsToRender = BUILDINGS.filter(b => canUnlockBuilding(b))
    .slice(0, MAX_BUILDING_DISPLAY);
  
  // ...
}
```

2. **Debounce les mises à jour UI** :

```javascript
let uiUpdateTimeout;

function updateUI() {
  clearTimeout(uiUpdateTimeout);
  uiUpdateTimeout = setTimeout(() => {
    // Mise à jour réelle
  }, 50);  // 50ms de délai
}
```

3. **Utiliser requestAnimationFrame** pour les animations :

```javascript
function animate() {
  // Animation
  requestAnimationFrame(animate);
}
```

### Code

1. **Extraire les fonctions communes** :

```javascript
// Au lieu de :
function renderBuilding1() { /* code */ }
function renderBuilding2() { /* code similaire */ }

// Faire :
function renderBuilding(building) { /* code commun */ }
```

2. **Utiliser des constantes pour les valeurs magiques** :

```javascript
// Au lieu de :
if (score >= 1000) { /* ... */ }

// Faire :
const UNLOCK_THRESHOLD = 1000;
if (score >= UNLOCK_THRESHOLD) { /* ... */ }
```

3. **Documenter les fonctions complexes** :

```javascript
/**
 * Calcule le prix d'un bâtiment en fonction de son nombre
 * @param {Object} building - Le bâtiment
 * @returns {number} Le prix actuel
 */
function getBuildingPrice(building) {
  // ...
}
```

---

## 📊 Statistiques et Debugging

### Statistiques du jeu

```javascript
const stats = {
  totalClicks: 0,           // Nombre total de clics
  totalGenerated: 0,       // Total généré par les bâtiments
  playtime: 0,             // Temps de jeu en secondes
  buildingsBought: 0,      // Nombre total de bâtiments achetés
  upgradesBought: 0,       // Nombre total d'upgrades achetés
  bonusesCollected: 0,    // Nombre de bonus collectés
  lastSave: Date.now()     // Timestamp de la dernière sauvegarde
};
```

### Debugging

1. **Activer les logs** :

```javascript
// Dans le code, ajoutez des logs temporaires
console.log('Score:', score, 'GPS:', getScorePerSecond());
```

2. **Utiliser le debugger du navigateur** :
- Ouvrez les DevTools (F12)
- Allez dans l'onglet "Console" pour voir les logs
- Allez dans l'onglet "Sources" pour mettre des breakpoints

3. **Vérifier le LocalStorage** :
- Dans DevTools, onglet "Application" > "Local Storage"
- Vérifiez la clé `gloryOfFranceSave`

---

## 🎯 Roadmap Technique

### Court terme (1-2 semaines)
- [ ] Optimiser les performances pour les très grands scores
- [ ] Ajouter des tests unitaires
- [ ] Implémenter un système de prestiges
- [ ] Ajouter des mini-jeux

### Moyen terme (1-2 mois)
- [ ] Refactoriser le code en modules ES6
- [ ] Ajouter TypeScript pour le typage
- [ ] Implémenter un système de quêtes
- [ ] Ajouter un leaderboard

### Long terme (3-6 mois)
- [ ] Passer à un framework (React/Vue)
- [ ] Ajouter un backend pour la synchronisation
- [ ] Créer une version mobile native
- [ ] Ajouter un système de crafts

---

## 📚 Ressources pour les Développeurs

### Outils recommandés
- **Éditeur** : VS Code avec extensions ESLint, Prettier
- **Debugging** : Chrome DevTools
- **Design** : Figma pour les mockups
- **Test** : Jest pour les tests unitaires

### Bonnes pratiques
- **Git** : Commits atomiques, messages clairs
- **Code** : Fonctions courtes, noms explicites
- **Tests** : Tester les cas limites
- **Performance** : Éviter les boucles inutiles

---

*Happy coding!* 🇫🇷
