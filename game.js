// ===== DONNÉES DU JEU =====
const ERA = {
    name: "L'Aube de la France",
    buildings: [
        {
            id: "coq-gaulois",
            name: "Coq Gaulois",
            description: "Symbole de la Gaule. Génère des PDG automatiquement.",
            baseCost: 10,
            gain: 0.1,
            count: 0,
            image: "🐓",
            upgrades: [
                { requiredCount: 10, multiplier: 2, name: "Élevage de Coqs", description: "×2 production" },
                { requiredCount: 25, multiplier: 2, name: "Fermes Gauloises", description: "×2 production" },
                { requiredCount: 50, multiplier: 2, name: "Royaume des Coqs", description: "×2 production" },
                { requiredCount: 75, multiplier: 2, name: "Empire des Coqs", description: "×2 production" },
                { requiredCount: 100, multiplier: 2, name: "Légion des Coqs", description: "×2 production" }
            ]
        },
        {
            id: "vercingetorix",
            name: "Vercingétorix",
            description: "Chef gaulois contre Rome. Génère plus de PDG.",
            baseCost: 100,
            gain: 1,
            count: 0,
            image: "🗡️",
            upgrades: [
                { requiredCount: 10, multiplier: 2, name: " Armée Gauloise", description: "×2 production" },
                { requiredCount: 25, multiplier: 2, name: "Légion Gauloise", description: "×2 production" },
                { requiredCount: 50, multiplier: 2, name: "Grand Armée", description: "×2 production" },
                { requiredCount: 75, multiplier: 2, name: "Armées Unifiées", description: "×2 production" },
                { requiredCount: 100, multiplier: 2, name: "Empire Gaulois", description: "×2 production" }
            ]
        },
        {
            id: "charlemagne",
            name: "Charlemagne",
            description: "Empereur des Francs. Génère encore plus de PDG.",
            baseCost: 1000,
            gain: 10,
            count: 0,
            image: "👑",
            upgrades: [
                { requiredCount: 10, multiplier: 2, name: "Cour Impériale", description: "×2 production" },
                { requiredCount: 25, multiplier: 2, name: "Empire Carolingien", description: "×2 production" },
                { requiredCount: 50, multiplier: 2, name: "Royaume Unifié", description: "×2 production" },
                { requiredCount: 75, multiplier: 2, name: "Hégémonie Franque", description: "×2 production" },
                { requiredCount: 100, multiplier: 2, name: "Légende de Charlemagne", description: "×2 production" }
            ]
        },
        {
            id: "notre-dame",
            name: "Cathédrale Notre-Dame",
            description: "Chef-d'œuvre gothique. Génère un flux constant de PDG.",
            baseCost: 10000,
            gain: 100,
            count: 0,
            image: "⛪",
            upgrades: [
                { requiredCount: 10, multiplier: 2, name: "Architecture Gothique", description: "×2 production" },
                { requiredCount: 25, multiplier: 2, name: "Vitraux Sacrés", description: "×2 production" },
                { requiredCount: 50, multiplier: 2, name: "Rosace Céleste", description: "×2 production" },
                { requiredCount: 75, multiplier: 2, name: "Cathédrale Majestueuse", description: "×2 production" },
                { requiredCount: 100, multiplier: 2, name: "Chef-d'œuvre Éternel", description: "×2 production" }
            ]
        },
        {
            id: "fleur-de-lys",
            name: "Fleur de Lys",
            description: "Symbole royal. Génère des PDG avec élégance.",
            baseCost: 100000,
            gain: 1000,
            count: 0,
            image: "🌸",
            upgrades: [
                { requiredCount: 10, multiplier: 2, name: "Blason Royal", description: "×2 production" },
                { requiredCount: 25, multiplier: 2, name: "Héraldique Sacrée", description: "×2 production" },
                { requiredCount: 50, multiplier: 2, name: "Symboles du Pouvoir", description: "×2 production" },
                { requiredCount: 75, multiplier: 2, name: "Dynastie Royale", description: "×2 production" },
                { requiredCount: 100, multiplier: 2, name: "Héritage Éternel", description: "×2 production" }
            ]
        }
    ]
};

// ===== AMÉLIORATIONS DE CLIQUE =====
const CLICK_UPGRADES = [
    { threshold: 100, bonus: 0.01, name: "Maîtrise du Clic", description: "+1% des PDG/s par clic" },
    { threshold: 200, bonus: 0.01, name: "Clic Précis", description: "+1% des PDG/s par clic" },
    { threshold: 500, bonus: 0.01, name: "Clic Puissant", description: "+1% des PDG/s par clic" },
    { threshold: 1000, bonus: 0.01, name: "Clic Expert", description: "+1% des PDG/s par clic" },
    { threshold: 2000, bonus: 0.01, name: "Clic Légendaire", description: "+1% des PDG/s par clic" }
];

// ===== BONUS ALÉATOIRES =====
const RANDOM_BONUSES = [
    {
        id: "druide",
        symbol: "🌿",
        name: "Druide Sacré",
        effect: "auto",
        multiplier: 5,
        duration: 30000,
        tooltip: "×5 PDG/s pendant 30s",
        colorClass: "druide"
    },
    {
        id: "alliance",
        symbol: "🤝",
        name: "Alliance Sacrée",
        effect: "click",
        multiplier: 10,
        duration: 30000,
        tooltip: "×10 PDG/clic pendant 30s",
        colorClass: "alliance"
    }
];

// ===== VARIABLES GLOBALES =====
let score = 0;
let autoGain = 0;
let clickMultiplier = 1;
let autoMultiplier = 1;
let activeRandomBonuses = [];
let buildingMultipliers = {
    "coq-gaulois": 1,
    "vercingetorix": 1,
    "charlemagne": 1,
    "notre-dame": 1,
    "fleur-de-lys": 1
};
let clickPDGTotal = 0;
let clickBonus = 0;
let activatedClickUpgrades = [];
let lastMedalRainTime = 0;

// ===== FONCTIONS DE BASE =====
function addScore(points) {
    const basePoints = points * clickMultiplier;
    const bonusPoints = autoGain * clickBonus;
    const totalPoints = basePoints + bonusPoints;

    score += totalPoints;
    clickPDGTotal += basePoints;

    // Afficher le +X au-dessus de la médaille
    showClickEffect(Math.round(totalPoints));

    updateDisplay();
    saveGame();
    updateBuildingsButtons();
    renderUpgrades();
}

function showClickEffect(value) {
    const container = document.getElementById('click-effects');
    const medal = document.getElementById('medal');
    const medalRect = medal.getBoundingClientRect();
    const centerX = medalRect.left + medalRect.width / 2;
    const centerY = medalRect.top + medalRect.height / 2;

    // Générer une position aléatoire autour de la médaille
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 40; // 80-120px de distance
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    // Créer l'élément +X
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = `+${value}`;
    effect.style.left = `${centerX + offsetX}px`;
    effect.style.top = `${centerY + offsetY}px`;

    // Définir la position finale de l'animation
    const endAngle = angle + (Math.random() - 0.5) * 0.5; // Légère variation
    const endDistance = distance + 50;
    const endX = Math.cos(endAngle) * endDistance;
    const endY = Math.sin(endAngle) * endDistance - 100; // Monter un peu

    effect.style.setProperty('--end-x', `${endX}px`);
    effect.style.setProperty('--end-y', `${endY}px`);

    container.appendChild(effect);

    // Supprimer après l'animation
    setTimeout(() => effect.remove(), 1000);
}

// ===== PLUIE DE MÉDAILLONS =====
function spawnMedalRain() {
    const now = Date.now();

    // Calculer combien de médaillons à faire tomber (basé sur autoGain)
    const medalCount = Math.min(Math.floor(autoGain / 5), 5);

    if (medalCount <= 0) return;

    const container = document.getElementById('medal-rain');
    const medal = document.getElementById('medal');
    const medalRect = medal.getBoundingClientRect();

    for (let i = 0; i < medalCount; i++) {
        // Position aléatoire au-dessus de la zone de clic
        const startX = medalRect.left + Math.random() * medalRect.width;
        const startY = medalRect.top - 20;

        // Position finale aléatoire dans la zone de clic
        const endX = medalRect.left + Math.random() * medalRect.width - medalRect.width / 2;
        const endY = medalRect.top + Math.random() * medalRect.height - 20;

        const medalRain = document.createElement('div');
        medalRain.className = 'medal-rain';
        medalRain.innerHTML = '🏅';
        medalRain.style.left = `${startX}px`;
        medalRain.style.top = `${startY}px`;
        medalRain.style.setProperty('--fall-x', `${endX}px`);
        medalRain.style.setProperty('--fall-y', `${endY}px`);

        container.appendChild(medalRain);

        // Supprimer après l'animation
        setTimeout(() => medalRain.remove(), 2000);
    }

    lastMedalRainTime = now;
}

function updateDisplay() {
    document.getElementById('score-value').textContent = formatNumber(score);
    document.getElementById('gain-value').textContent = formatNumber(autoGain);
}

function formatNumber(num) {
    if (num < 1000) return num.toFixed(num % 1 === 0 ? 0 : 1);
    if (num >= 1000 && num < 1000000) return (num / 1000).toFixed(1) + "K";
    if (num >= 1000000 && num < 1000000000) return (num / 1000000).toFixed(1) + "M";
    return (num / 1000000000).toFixed(1) + "B";
}

// ===== FONCTIONS DE PARAMÈTRES =====
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('active');
}

function exportSave() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (saveData) {
        navigator.clipboard.writeText(saveData)
            .then(() => showToast("✅ Sauvegarde copiée dans le presse-papiers !"))
            .catch(() => {
                prompt("Copiez cette sauvegarde :", saveData);
                showToast("✅ Sauvegarde affichée, copiez-la manuellement.");
            });
    } else {
        showToast("❌ Aucune sauvegarde trouvée.");
    }
}

function importSave() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) {
        showToast("❌ Aucune sauvegarde à importer.");
        return;
    }

    try {
        // Vérifier que c'est un JSON valide
        JSON.parse(importText);
        localStorage.setItem('gloryOfFranceSave', importText);
        showToast("✅ Sauvegarde importée ! Rechargement en cours...");
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (e) {
        showToast("❌ Format invalide. Collez une sauvegarde valide.");
    }
}

function confirmDeleteSave() {
    if (confirm("⚠️ Êtes-vous sûr de vouloir supprimer votre sauvegarde ? Tous vos progrès seront perdus !")) {
        deleteSave();
    }
}

function deleteSave() {
    localStorage.removeItem('gloryOfFranceSave');
    showToast("🗑️ Sauvegarde supprimée !");
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ===== FONCTION POUR METTRE À JOUR LES BOUTONS DES BÂTIMENTS =====
function updateBuildingsButtons() {
    const buildingElements = document.querySelectorAll('.building-item');

    buildingElements.forEach((element, index) => {
        const building = ERA.buildings[index];
        if (!building) return;

        // Formule corrigée : baseCost pour le premier achat, puis baseCost * e^(0.12 * count)
        const currentCost = building.count === 0
            ? building.baseCost
            : Math.floor(building.baseCost * Math.exp(0.12 * building.count));

        const currentGain = building.gain * building.count * buildingMultipliers[building.id] * autoMultiplier;
        const isAffordable = score >= currentCost;

        const button = element.querySelector('button');
        button.textContent = `Acheter (${formatNumber(currentCost)} PDG)`;
        button.disabled = !isAffordable;

        const stats = element.querySelectorAll('.stats span');
        if (stats[0]) stats[0].textContent = `+${formatNumber(currentGain)}/s`;
        if (stats[1]) stats[1].textContent = `Possédé(s) : ${building.count}`;
    });
}

// ===== FONCTION POUR METTRE À JOUR LES AMÉLIORATIONS =====
function renderUpgrades() {
    const container = document.getElementById('upgrades-list');
    container.innerHTML = '';

    // Améliorations de bâtiments
    ERA.buildings.forEach(building => {
        const nextUpgrade = building.upgrades.find(upgrade =>
            building.count >= upgrade.requiredCount &&
            buildingMultipliers[building.id] < (2 ** (building.upgrades.indexOf(upgrade) + 1))
        );

        if (nextUpgrade) {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-item';
            upgradeElement.innerHTML = `
                <h3>${building.name}</h3>
                <p>${nextUpgrade.description}</p>
                <p class="cost">Niveau : ${nextUpgrade.requiredCount} ${building.name}</p>
                <button onclick="buyBuildingUpgrade('${building.id}', ${nextUpgrade.requiredCount})">
                    Activer
                </button>
            `;
            container.appendChild(upgradeElement);
        }
    });

    // Améliorations de clic
    CLICK_UPGRADES.forEach(upgrade => {
        if (clickPDGTotal >= upgrade.threshold && !activatedClickUpgrades.includes(upgrade.threshold)) {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-item';
            upgradeElement.innerHTML = `
                <h3>Amélioration de Clic</h3>
                <p>${upgrade.description}</p>
                <p class="cost">Seuil : ${upgrade.threshold} PDG par clics</p>
                <button onclick="buyClickUpgrade(${upgrade.threshold})">
                    Activer
                </button>
            `;
            container.appendChild(upgradeElement);
        }
    });

    // Si aucune amélioration disponible
    if (container.innerHTML === '') {
        container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: rgba(255,255,255,0.7);">Achetez des bâtiments ou cliquez pour débloquer des améliorations !</p>';
    }
}

// ===== ACHAT DES BÂTIMENTS =====
function buyBuilding(buildingId) {
    const building = ERA.buildings.find(b => b.id === buildingId);
    if (!building) return;

    // Formule corrigée
    const currentCost = building.count === 0
        ? building.baseCost
        : Math.floor(building.baseCost * Math.exp(0.12 * building.count));

    if (score >= currentCost) {
        score -= currentCost;
        building.count++;
        updateDisplay();
        saveGame();
        updateBuildingsButtons();
        renderUpgrades();
    }
}

// ===== ACHAT DES AMÉLIORATIONS DE BÂTIMENTS =====
function buyBuildingUpgrade(buildingId, requiredCount) {
    const building = ERA.buildings.find(b => b.id === buildingId);
    if (!building) return;

    const upgrade = building.upgrades.find(u => u.requiredCount === requiredCount);
    if (!upgrade) return;

    buildingMultipliers[building.id] *= upgrade.multiplier;
    updateDisplay();
    saveGame();
    updateBuildingsButtons();
    renderUpgrades();
}

// ===== ACHAT DES AMÉLIORATIONS DE CLIQUE =====
function buyClickUpgrade(threshold) {
    const upgrade = CLICK_UPGRADES.find(u => u.threshold === threshold);
    if (!upgrade) return;

    clickBonus += upgrade.bonus;
    activatedClickUpgrades.push(threshold);
    updateDisplay();
    saveGame();
    renderUpgrades();
    showToast(`✅ ${upgrade.name} activée !`);
}

// ===== BONUS ALÉATOIRES =====
function spawnRandomBonus() {
    const bonusIndex = Math.floor(Math.random() * RANDOM_BONUSES.length);
    const bonus = RANDOM_BONUSES[bonusIndex];

    const isActive = activeRandomBonuses.some(b => b.id === bonus.id);
    if (isActive) return;

    const x = Math.random() * (window.innerWidth - 150) + 50;
    const y = Math.random() * (window.innerHeight - 200) + 100;

    const bonusElement = document.createElement('div');
    bonusElement.className = `random-bonus ${bonus.colorClass}`;
    bonusElement.innerHTML = bonus.symbol;
    bonusElement.style.left = `${x}px`;
    bonusElement.style.top = `${y}px`;
    bonusElement.setAttribute('data-tooltip', bonus.tooltip);
    bonusElement.setAttribute('data-id', bonus.id);

    document.getElementById('random-bonuses').appendChild(bonusElement);

    const timeout = setTimeout(() => {
        bonusElement.classList.add('clicked');
        setTimeout(() => {
            bonusElement.remove();
        }, 500);
    }, 10000);

    bonusElement.onclick = () => {
        clearTimeout(timeout);
        bonusElement.classList.add('clicked');

        if (bonus.effect === "auto") {
            autoMultiplier = bonus.multiplier;
        } else if (bonus.effect === "click") {
            clickMultiplier = bonus.multiplier;
        }

        activeRandomBonuses.push({
            id: bonus.id,
            effect: bonus.effect,
            multiplier: bonus.multiplier,
            endTime: Date.now() + bonus.duration
        });

        setTimeout(() => {
            bonusElement.remove();
        }, 500);

        setTimeout(() => {
            activeRandomBonuses = activeRandomBonuses.filter(b => b.id !== bonus.id);
            if (bonus.effect === "auto") autoMultiplier = 1;
            if (bonus.effect === "click") clickMultiplier = 1;
            updateDisplay();
        }, bonus.duration);
    };
}

// ===== AFFICHAGE INITIAL =====
function renderBuildings() {
    const container = document.getElementById('buildings-list');
    container.innerHTML = '';

    ERA.buildings.forEach(building => {
        const currentCost = building.count === 0
            ? building.baseCost
            : Math.floor(building.baseCost * Math.exp(0.12 * building.count));

        const currentGain = building.gain * building.count * buildingMultipliers[building.id] * autoMultiplier;
        const isAffordable = score >= currentCost;

        const buildingElement = document.createElement('div');
        buildingElement.className = 'building-item';

        buildingElement.innerHTML = `
            <div class="building-header">
                <span class="building-icon">${building.image}</span>
                <div>
                    <h3>${building.name}</h3>
                    <p>${building.description}</p>
                </div>
            </div>
            <div class="stats">
                <span>+${formatNumber(currentGain)}/s</span>
                <span>Possédé(s) : ${building.count}</span>
            </div>
            <button
                onclick="buyBuilding('${building.id}')"
                ${!isAffordable ? 'disabled' : ''}
            >
                Acheter (${formatNumber(currentCost)} PDG)
            </button>
        `;
        container.appendChild(buildingElement);
    });
}

// ===== BOUCLE PRINCIPALE =====
function gameLoop() {
    let totalGain = 0;
    ERA.buildings.forEach(building => {
        totalGain += building.gain * building.count * buildingMultipliers[building.id];
    });
    autoGain = totalGain * autoMultiplier;
    score += autoGain / 10;

    // Faire pleuvoir des médaillons si autoGain > 0
    if (autoGain > 0 && Date.now() - lastMedalRainTime > 500) {
        spawnMedalRain();
    }

    updateDisplay();
    saveGame();
    updateBuildingsButtons();
}

// ===== TIMERS =====
setInterval(spawnRandomBonus, 60000); // Bonus aléatoires toutes les 60 secondes
setInterval(gameLoop, 100);

// ===== INITIALISATION =====
function init() {
    loadGame();
    updateDisplay();
    renderBuildings();
    renderUpgrades();
}

window.onload = init;
