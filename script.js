// ============================================
// GLORY OF FRANCE CLICKER - MAIN SCRIPT
// ============================================

// DONNÉES DU JEU (5 ÈRES)
const ERAS = [
    {
        id: "aube-france",
        name: "L'Aube de la France",
        requiredScore: 0,
        buildings: [
            { id: "coq-gaulois", name: "Coq Gaulois", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 10, gain: 0.1, count: 0, image: "🐓", unlockCondition: () => true, totalGenerated: 0 },
            { id: "vercingetorix", name: "Vercingétorix", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 100, gain: 1, count: 0, image: "🗡️", unlockCondition: () => score >= 20, totalGenerated: 0 },
            { id: "charlemagne", name: "Charlemagne", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000, gain: 10, count: 0, image: "👑", unlockCondition: () => score >= 500, totalGenerated: 0 },
            { id: "notre-dame", name: "Notre-Dame", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 10000, gain: 100, count: 0, image: "⛪", unlockCondition: () => score >= 5000, totalGenerated: 0 },
            { id: "fleur-de-lys", name: "Fleur de Lys", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 100000, gain: 1000, count: 0, image: "🌸", unlockCondition: () => score >= 25000, totalGenerated: 0 }
        ]
    },
    {
        id: "construction-france",
        name: "La Construction de la France",
        requiredScore: 50000,
        buildings: [
            { id: "saint-louis", name: "Saint Louis", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 50000, gain: 500, count: 0, image: "👨‍⚖️", unlockCondition: () => score >= 50000, totalGenerated: 0 },
            { id: "joan-of-arc", name: "Jeanne d'Arc", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 200000, gain: 2000, count: 0, image: "🛡️", unlockCondition: () => score >= 100000, totalGenerated: 0 }
        ]
    },
    {
        id: "expansion-revolution",
        name: "L'Expansion et la Révolution",
        requiredScore: 1000000,
        buildings: [
            { id: "louis-xiv", name: "Louis XIV", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000000, gain: 10000, count: 0, image: "☀️", unlockCondition: () => score >= 1000000, totalGenerated: 0 },
            { id: "revolution", name: "Révolution", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 5000000, gain: 50000, count: 0, image: "🎭", unlockCondition: () => score >= 2000000, totalGenerated: 0 }
        ]
    },
    {
        id: "ere-moderne",
        name: "L'Ère Moderne",
        requiredScore: 50000000,
        buildings: [
            { id: "napoleon", name: "Napoléon", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 50000000, gain: 500000, count: 0, image: "🎨", unlockCondition: () => score >= 50000000, totalGenerated: 0 },
            { id: "tour-eiffel", name: "Tour Eiffel", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 200000000, gain: 2000000, count: 0, image: "🏛️", unlockCondition: () => score >= 100000000, totalGenerated: 0 }
        ]
    },
    {
        id: "france-contemporaine",
        name: "La France Contemporaine",
        requiredScore: 1000000000,
        buildings: [
            { id: "de-gaulle", name: "De Gaulle", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000000000, gain: 10000000, count: 0, image: "🎖️", unlockCondition: () => score >= 1000000000, totalGenerated: 0 },
            { id: "macron", name: "Macron", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 5000000000, gain: 50000000, count: 0, image: "💼", unlockCondition: () => score >= 2000000000, totalGenerated: 0 }
        ]
    }
];

// Améliorations de clic (barre du haut) - Coût = seuil
const CLICK_UPGRADES = [
    { threshold: 50, name: "Clic de base", cost: 50 },
    { threshold: 100, name: "Clic Précis", cost: 100 },
    { threshold: 250, name: "Clic Puissant", cost: 250 },
    { threshold: 500, name: "Clic Expert", cost: 500 },
    { threshold: 1000, name: "Clic Légendaire", cost: 1000 },
    { threshold: 2500, name: "Clic Divin", cost: 2500 },
    { threshold: 5000, name: "Clic Impérial", cost: 5000 },
    { threshold: 10000, name: "Clic Suprême", cost: 10000 },
    { threshold: 25000, name: "Clic Ultime", cost: 25000 },
    { threshold: 50000, name: "Clic Mythique", cost: 50000 }
];

// Building upgrade thresholds (per building individually)
const BUILDING_UPGRADE_THRESHOLDS = [1, 5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000];

// Colors for each upgrade tier (gradient: light blue -> dark blue -> purple -> pink -> red -> orange -> yellow)
const UPGRADE_COLORS = [
    '#88c9ee', '#66b2ff', '#4499ff', '#2288ff', '#1177ff',
    '#0066ff', '#4444ff', '#6622ff', '#8800ff', '#aa00dd',
    '#cc00bb', '#ee0099', '#ff0077', '#ff0055', '#ff2233',
    '#ff4411', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00',
    '#ffee00', '#ffff00'
];

// Bonus aléatoires
const RANDOM_BONUSES = [
    { id: "druide", symbol: "🌿", name: "Druide Sacré", effect: "auto", multiplier: 5, duration: 30000, tooltip: "×5 Gloire/s pendant 30s", colorClass: "druide" },
    { id: "alliance", symbol: "🤝", name: "Alliance Sacrée", effect: "click", multiplier: 10, duration: 30000, tooltip: "×10 Gloire/clic pendant 30s", colorClass: "alliance" },
    { id: "marianne", symbol: "👩‍💼", name: "Marianne", effect: "both", multiplier: 3, duration: 45000, tooltip: "×3 Gloire/s ET ×3 Gloire/clic pendant 45s", colorClass: "marianne" },
    { id: "napoleon-bonus", symbol: "🎨", name: "Stratège Génial", effect: "auto", multiplier: 8, duration: 25000, tooltip: "×8 Gloire/s pendant 25s", colorClass: "napoleon" }
];

// Variables globales
let score = 0;
let autoGain = 0;
let autoMultiplier = 1;
let clickMultiplier = 1;
let activeRandomBonuses = [];
let autoMultipliers = [1];
let clickMultipliers = [1];
let buildingUpgrades = {}; // {buildingId: [threshold1, threshold2, ...]}
let clickGloireTotal = 0;
let activatedClickUpgrades = [];
let unlockedBuildings = new Set();
let lastMedalRainTime = 0;
let totalGeneratedByBuilding = {};
let lastSaveTime = 0;
let lastUpgradesRender = 0;
let lastBuildingsUpdate = 0;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Initialisation des structures de données
function initGlobals() {
    ERAS.forEach(era => {
        era.buildings.forEach(building => {
            totalGeneratedByBuilding[building.id] = totalGeneratedByBuilding[building.id] || 0;
            buildingUpgrades[building.id] = buildingUpgrades[building.id] || [];
        });
    });
}

// Trouve un bâtiment par son ID
function findBuildingById(buildingId) {
    for (const era of ERAS) {
        const building = era.buildings.find(b => b.id === buildingId);
        if (building) return building;
    }
    return null;
}

// Calcule le gain d'un bâtiment (factorisé)
function calculateBuildingGain(building) {
    const upgradeMultiplier = getBuildingUpgradeMultiplier(building.id);
    return building.gain * building.count * autoMultiplier * upgradeMultiplier;
}

// Calcule le gain unitaire d'un bâtiment
function calculateUnitBuildingGain(building) {
    const upgradeMultiplier = getBuildingUpgradeMultiplier(building.id);
    return building.gain * autoMultiplier * upgradeMultiplier;
}

// Returns the multiplier for a building (2^n where n = number of upgrades)
function getBuildingUpgradeMultiplier(buildingId) {
    const upgrades = buildingUpgrades[buildingId] || [];
    return Math.pow(2, upgrades.length);
}

// Checks if a building upgrade is available (sequential purchase required)
function isBuildingUpgradeAvailable(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building) return false;
    
    const upgrades = buildingUpgrades[buildingId] || [];
    const thresholdIndex = BUILDING_UPGRADE_THRESHOLDS.indexOf(threshold);
    
    return building.count >= threshold &&
           !upgrades.includes(threshold) &&
           (thresholdIndex === 0 || upgrades.includes(BUILDING_UPGRADE_THRESHOLDS[thresholdIndex - 1]));
}

// Génère le tooltip pour un bâtiment
function getBuildingTooltip(building) {
    const unitGain = calculateUnitBuildingGain(building);
    const totalGain = calculateBuildingGain(building);
    const percent = autoGain > 0 ? ((totalGain / autoGain) * 100).toFixed(2) : 0;
    return building.description
        .replace('{gain}', formatNumber(unitGain))
        .replace('{percent}', percent)
        .replace('{total}', formatNumber(totalGeneratedByBuilding[building.id] || 0));
}

// Calcule le coût actuel d'un bâtiment
function calculateBuildingCost(building) {
    return building.count === 0
        ? building.baseCost
        : Math.floor(building.baseCost * Math.exp(0.12 * building.count));
}

// Formate les nombres
function formatNumber(num) {
    if (num < 1000) return num.toFixed(num % 1 === 0 ? 0 : 1);
    if (num < 1000000) return (num / 1000).toFixed(1) + "K";
    if (num < 1000000000) return (num / 1000000).toFixed(1) + "M";
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + "B";
    return (num / 1000000000000).toFixed(1) + "T";
}

// Fonction pour recalculer le multiplicateur auto global
function updateAutoMultiplier() {
    autoMultiplier = autoMultipliers.reduce((a, b) => a * b, 1);
}

// Fonction pour recalculer le multiplicateur de clic global
function updateClickMultiplier() {
    clickMultiplier = clickMultipliers.reduce((a, b) => a * b, 1);
}

// Affiche un toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
}

// ============================================
// SAUVEGARDE / CHARGEMENT
// ============================================

const SAVE_VERSION = "2.1.0";

function saveGame() {
    const saveData = {
        score: score,
        autoGain: autoGain,
        autoMultiplier: autoMultiplier,
        clickMultiplier: clickMultiplier,
        clickGloireTotal: clickGloireTotal,
        activatedClickUpgrades: [...activatedClickUpgrades],
        unlockedBuildings: Array.from(unlockedBuildings),
        lastMedalRainTime: lastMedalRainTime,
        autoMultipliers: [...autoMultipliers],
        clickMultipliers: [...clickMultipliers],
        buildingUpgrades: {},
        totalGeneratedByBuilding: {},
        activeRandomBonuses: activeRandomBonuses.map(bonus => ({
            id: bonus.id,
            effect: bonus.effect,
            multiplier: bonus.multiplier,
            endTime: bonus.endTime
        })),
        eras: ERAS.map(era => ({
            id: era.id,
            buildings: era.buildings.map(building => ({
                id: building.id,
                count: building.count
            }))
        })),
        lastSave: Date.now(),
        version: SAVE_VERSION
    };

    // Copie les données des bâtiments
    for (const buildingId in buildingUpgrades) {
        saveData.buildingUpgrades[buildingId] = [...buildingUpgrades[buildingId]];
    }
    for (const buildingId in totalGeneratedByBuilding) {
        saveData.totalGeneratedByBuilding[buildingId] = totalGeneratedByBuilding[buildingId];
    }

    localStorage.setItem('gloryOfFranceSave', JSON.stringify(saveData));
    lastSaveTime = Date.now();
}

function loadGame() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (!saveData) return;

    try {
        const parsed = JSON.parse(saveData);

        // Vérification de la version
        if (parsed.version && parsed.version !== SAVE_VERSION) {
            console.warn("Version de sauvegarde différente, migration possible");
        }

        score = parsed.score || 0;
        autoGain = parsed.autoGain || 0;
        autoMultiplier = parsed.autoMultiplier || 1;
        clickMultiplier = parsed.clickMultiplier || 1;
        clickGloireTotal = parsed.clickGloireTotal || 0;
        lastMedalRainTime = parsed.lastMedalRainTime || 0;

        activatedClickUpgrades = parsed.activatedClickUpgrades || [];
        unlockedBuildings = new Set(parsed.unlockedBuildings || []);

        // Charger les multiplicateurs
        autoMultipliers = parsed.autoMultipliers || [1];
        clickMultipliers = parsed.clickMultipliers || [1];
        updateAutoMultiplier();
        updateClickMultiplier();

        // Charger les upgrades des bâtiments
        if (parsed.buildingUpgrades) {
            for (const buildingId in parsed.buildingUpgrades) {
                buildingUpgrades[buildingId] = [...parsed.buildingUpgrades[buildingId]];
            }
        }

        // Charger le total généré par bâtiment
        if (parsed.totalGeneratedByBuilding) {
            for (const buildingId in parsed.totalGeneratedByBuilding) {
                totalGeneratedByBuilding[buildingId] = parsed.totalGeneratedByBuilding[buildingId] || 0;
            }
        }

        // Charger les bonus actifs
        if (parsed.activeRandomBonuses) {
            activeRandomBonuses = parsed.activeRandomBonuses.map(bonus => ({
                id: bonus.id,
                effect: bonus.effect,
                multiplier: bonus.multiplier,
                endTime: bonus.endTime
            }));

            // Appliquer les multiplicateurs des bonus actifs
            activeRandomBonuses.forEach(bonus => {
                if (bonus.effect === "auto" || bonus.effect === "both") {
                    if (!autoMultipliers.includes(bonus.multiplier)) {
                        autoMultipliers.push(bonus.multiplier);
                    }
                }
                if (bonus.effect === "click" || bonus.effect === "both") {
                    if (!clickMultipliers.includes(bonus.multiplier)) {
                        clickMultipliers.push(bonus.multiplier);
                    }
                }
            });
            updateAutoMultiplier();
            updateClickMultiplier();
        }

        // Charger les comptes des bâtiments
        if (parsed.eras) {
            parsed.eras.forEach(savedEra => {
                const era = ERAS.find(e => e.id === savedEra.id);
                if (era) {
                    savedEra.buildings.forEach(savedBuilding => {
                        const building = era.buildings.find(b => b.id === savedBuilding.id);
                        if (building) {
                            building.count = savedBuilding.count || 0;
                        }
                    });
                }
            });
        }

        // Filtrer les bonus expirés
        const now = Date.now();
        activeRandomBonuses = activeRandomBonuses.filter(bonus => bonus.endTime >= now);
        
        // Recalculer les multiplicateurs après filtrage
        autoMultipliers = [1];
        clickMultipliers = [1];
        activeRandomBonuses.forEach(bonus => {
            if (bonus.effect === "auto" || bonus.effect === "both") {
                autoMultipliers.push(bonus.multiplier);
            }
            if (bonus.effect === "click" || bonus.effect === "both") {
                clickMultipliers.push(bonus.multiplier);
            }
        });
        updateAutoMultiplier();
        updateClickMultiplier();
        
        if (autoMultipliers.length === 1) {
            autoMultiplier = 1;
        }
        if (clickMultipliers.length === 1) {
            clickMultiplier = 1;
        }

        // Initialiser les structures pour les nouveaux bâtiments
        initGlobals();

    } catch (e) {
        console.error("Erreur de chargement :", e);
        localStorage.removeItem('gloryOfFranceSave');
        showToast("⚠️ Sauvegarde corrompue. Nouvelle partie.");
    }
}

// Export de la sauvegarde
function exportSave() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (saveData) {
        navigator.clipboard.writeText(saveData)
            .then(() => showToast("✅ Sauvegarde copiée !"))
            .catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = saveData;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast("✅ Sauvegarde copiée !");
            });
    } else {
        showToast("❌ Aucune sauvegarde.");
    }
}

// Import de la sauvegarde
function importSave() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) { showToast("❌ Rien à importer."); return; }
    try {
        const testParse = JSON.parse(importText);
        if (testParse.version && testParse.eras && testParse.buildingUpgrades) {
            localStorage.setItem('gloryOfFranceSave', importText);
            showToast("✅ Importé ! Redémarrage...");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast("❌ Format invalide.");
        }
    } catch (e) {
        showToast("❌ Format invalide.");
    }
}

// Confirmation de suppression
function confirmDeleteSave() {
    if (confirm("⚠️ Supprimer la sauvegarde ? Tous vos progrès seront PERDUS !")) {
        deleteSave();
    }
}

// Suppression de la sauvegarde
function deleteSave() {
    localStorage.removeItem('gloryOfFranceSave');
    showToast("🗑️ Supprimé !");
    setTimeout(() => window.location.reload(), 1000);
}

// ============================================
// GESTION DES BÂTIMENTS
// ============================================

// Achat d'un bâtiment
function buyBuilding(buildingId) {
    const building = findBuildingById(buildingId);
    if (!building) return;

    const currentCost = calculateBuildingCost(building);

    if (score >= currentCost) {
        score -= currentCost;
        building.count++;
        unlockedBuildings.add(building.id);
        updateDisplay();
        saveGame();
        renderBuildings();
        if (Date.now() - lastUpgradesRender > 500) { lastUpgradesRender = Date.now(); renderUpgrades(); }
        checkEraUnlocks();
        showToast(`✅ +1 ${building.name}`);
    } else {
        showToast("❌ Pas assez de Gloire");
    }
}

// Achat d'une amélioration de clic
function buyClickUpgrade(threshold) {
    const upgrade = CLICK_UPGRADES.find(u => u.threshold === threshold);
    if (!upgrade) return;
    
    // Vérifier si déjà achetée (SOLUTION 2)
    if (activatedClickUpgrades.includes(threshold)) {
        showToast("✅ Déjà activée !");
        return;
    }
    
    // Vérifier si on a assez de Gloire
    if (score < upgrade.cost) {
        showToast("❌ Pas assez de Gloire");
        return;
    }
    
    // Retirer le coût
    score -= upgrade.cost;
    activatedClickUpgrades.push(threshold);
    updateDisplay();
    saveGame();
    if (Date.now() - lastUpgradesRender > 500) { lastUpgradesRender = Date.now(); renderUpgrades(); }
    showToast(`✅ ${upgrade.name} activée`);
}

// Achat d'une amélioration de bâtiment
function buyBuildingUpgrade(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building || !isBuildingUpgradeAvailable(buildingId, threshold)) return;
    
    // Calculer le coût : x5 la production UNITAIRE du bâtiment (SOLUTION 5)
    const unitGain = building.gain * getBuildingUpgradeMultiplier(building.id);
    const cost = Math.floor(unitGain * 5 * building.count);
    
    // Vérifier si on a assez de Gloire
    if (score < cost) {
        showToast("❌ Pas assez de Gloire");
        return;
    }
    
    // Retirer le coût
    score -= cost;
    
    if (!buildingUpgrades[buildingId]) {
        buildingUpgrades[buildingId] = [];
    }
    
    buildingUpgrades[buildingId].push(threshold);
    updateDisplay();
    saveGame();
    if (Date.now() - lastUpgradesRender > 500) { lastUpgradesRender = Date.now(); renderUpgrades(); }
    renderBuildings();
    showToast('+ ' + building.name + ' improved x2 (-' + formatNumber(cost) + ' G)');
}

// Met à jour un seul bouton de bâtiment (sans modifier le DOM inutilement)
function updateBuildingButton(buildingId) {
    const element = document.getElementById(`building-${buildingId}`);
    if (!element) return;

    const building = findBuildingById(buildingId);
    if (!building) return;

    const currentCost = calculateBuildingCost(building);
    const totalGain = calculateBuildingGain(building);
    const isAffordable = score >= currentCost;

    // Mettre à jour la classe not-purchased
    if (building.count > 0) {
        element.classList.remove('not-purchased');
    } else {
        element.classList.add('not-purchased');
    }

    const button = element.querySelector('button');
    const productionSpan = element.querySelector('.building-production');
    const ownershipSpan = element.querySelector('.building-ownership span');

    if (button) {
        button.disabled = !isAffordable;
        button.textContent = `${formatNumber(currentCost)} Gloire`;
    }
    if (productionSpan) productionSpan.textContent = `${formatNumber(totalGain)}/s`;
    if (ownershipSpan) ownershipSpan.textContent = `Possédé : ${building.count}`;

    // SOLUTION 7: Mettre à jour le tooltip dynamiquement
    element.setAttribute('data-tooltip', getBuildingTooltip(building));
}

// Met à jour tous les boutons de bâtiments
function updateAllBuildingButtons() {
    document.querySelectorAll('.building-item').forEach(element => {
        const buildingId = element.id.replace('building-', '');
        updateBuildingButton(buildingId);
    });
}

// Vérifie les déblocages des ères et bâtiments
function checkEraUnlocks() {
    let needsRerender = false;
    ERAS.forEach(era => {
        era.buildings.forEach(building => {
            if (building.unlockCondition() && !unlockedBuildings.has(building.id)) {
                unlockedBuildings.add(building.id);
                needsRerender = true;
            }
        });
    });
    if (needsRerender) {
        renderBuildings();
    }
}

// Affiche les bâtiments
function renderBuildings() {
    const container = document.getElementById('buildings-list');
    container.innerHTML = '';

    ERAS.forEach(era => {
        if (score >= era.requiredScore || era.requiredScore === 0) {
            era.buildings.forEach(building => {
                if (building.unlockCondition() || unlockedBuildings.has(building.id)) {
                    if (building.unlockCondition() && !unlockedBuildings.has(building.id)) {
                        unlockedBuildings.add(building.id);
                    }
                    renderBuilding(building);
                }
            });
        }
    });
}

// Affiche un bâtiment
function renderBuilding(building) {
    const container = document.getElementById('buildings-list');
    const currentCost = calculateBuildingCost(building);
    const totalGain = calculateBuildingGain(building);
    const isAffordable = score >= currentCost;

    const buildingElement = document.createElement('div');
    buildingElement.className = 'building-item' + (building.count === 0 ? ' not-purchased' : '');
    buildingElement.id = `building-${building.id}`;
    buildingElement.setAttribute('data-tooltip', getBuildingTooltip(building));

    buildingElement.innerHTML = `
        <div class="building-info">
            <div class="building-name-icon">
                <span class="building-name">${building.name}</span>
                <span class="building-icon">${building.image}</span>
            </div>
            <div class="building-ownership">
                <span>Possédé : ${building.count}</span>
            </div>
        </div>
        <span class="building-production">${formatNumber(totalGain)}/s</span>
        <button onclick="buyBuilding('${building.id}')" ${!isAffordable ? 'disabled' : ''}>
            ${formatNumber(currentCost)} Gloire
        </button>
    `;

    // SOLUTION 7: Mettre à jour le tooltip au survol
    buildingElement.addEventListener('mouseenter', () => {
        buildingElement.setAttribute('data-tooltip', getBuildingTooltip(building));
    });

    container.appendChild(buildingElement);
}

// ============================================
// GESTION DES AMÉLIORATIONS
// ============================================

// Affiche les améliorations dans la barre du haut
function renderUpgrades() {
    const container = document.getElementById('upgrades-list');
    container.innerHTML = '';

    // Améliorations de clic
    CLICK_UPGRADES.forEach(upgrade => {
        if (clickGloireTotal >= upgrade.threshold && !activatedClickUpgrades.includes(upgrade.threshold)) {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-item';
            upgradeElement.textContent = upgrade.name + ' (' + formatNumber(upgrade.cost) + ' G)';
            upgradeElement.onclick = () => buyClickUpgrade(upgrade.threshold);
            container.appendChild(upgradeElement);
        }
    });
    
    // Améliorations de bâtiments
    BUILDING_UPGRADE_THRESHOLDS.forEach(threshold => {
        ERAS.forEach(era => {
            era.buildings.forEach(building => {
                if (isBuildingUpgradeAvailable(building.id, threshold)) {
                    const thresholdIndex = BUILDING_UPGRADE_THRESHOLDS.indexOf(threshold);
                    const color = UPGRADE_COLORS[thresholdIndex];
                    const unitGain = building.gain * getBuildingUpgradeMultiplier(building.id);
                    const cost = Math.floor(unitGain * 5 * building.count);
                    
                    const upgradeElement = document.createElement('div');
                    upgradeElement.className = 'upgrade-item';
                    upgradeElement.style.background = color;
                    upgradeElement.style.color = 'white';
                    upgradeElement.innerHTML = '<span>' + building.image + ' ' + building.name + ' ×2 (' + formatNumber(cost) + ' G)</span>';
                    upgradeElement.onclick = () => buyBuildingUpgrade(building.id, threshold);
                    container.appendChild(upgradeElement);
                }
            });
        });
    });
}

// ============================================
// GESTION DES BONUS ALÉATOIRES
// ============================================

function spawnRandomBonus() {
    const bonusIndex = Math.floor(Math.random() * RANDOM_BONUSES.length);
    const bonus = RANDOM_BONUSES[bonusIndex];
    if (activeRandomBonuses.some(b => b.id === bonus.id)) return;

    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = Math.random() * (window.innerHeight - 150) + 50;

    const bonusElement = document.createElement('div');
    bonusElement.className = `random-bonus ${bonus.colorClass}`;
    bonusElement.innerHTML = bonus.symbol;
    bonusElement.style.left = `${x}px`;
    bonusElement.style.top = `${y}px`;
    bonusElement.setAttribute('data-tooltip', bonus.tooltip + ` (${bonus.duration/1000}s)`);

    document.getElementById('random-bonuses').appendChild(bonusElement);

    const timeout = setTimeout(() => {
        bonusElement.classList.add('clicked');
        setTimeout(() => bonusElement.remove(), 500);
    }, 10000);

    bonusElement.onclick = () => {
        clearTimeout(timeout);
        bonusElement.classList.add('clicked');

        // SOLUTION 1: Gérer les bonus click
        if (bonus.effect === "auto" || bonus.effect === "both") {
            if (!autoMultipliers.includes(bonus.multiplier)) {
                autoMultipliers.push(bonus.multiplier);
                updateAutoMultiplier();
            }
        }
        if (bonus.effect === "click" || bonus.effect === "both") {
            if (!clickMultipliers.includes(bonus.multiplier)) {
                clickMultipliers.push(bonus.multiplier);
                updateClickMultiplier();
            }
        }

        activeRandomBonuses.push({
            id: bonus.id,
            effect: bonus.effect,
            multiplier: bonus.multiplier,
            endTime: Date.now() + bonus.duration
        });

        setTimeout(() => bonusElement.remove(), 500);

        // SOLUTION 14: Ajouter timer dans le toast
        showToast(`✅ ${bonus.name} activé (${bonus.duration/1000}s)`);

        setTimeout(() => {
            activeRandomBonuses = activeRandomBonuses.filter(b => b.id !== bonus.id);
            
            // SOLUTION 4: Retirer le multiplicateur du tableau
            if (bonus.effect === "auto" || bonus.effect === "both") {
                autoMultipliers = autoMultipliers.filter(m => m !== bonus.multiplier);
                updateAutoMultiplier();
            }
            if (bonus.effect === "click" || bonus.effect === "both") {
                clickMultipliers = clickMultipliers.filter(m => m !== bonus.multiplier);
                updateClickMultiplier();
            }
            
            updateDisplay();
            showToast(`⏰ ${bonus.name} expiré`);
        }, bonus.duration);

    };
}

// ============================================
// EFFETS VISUELS
// ============================================

// Ajoute des points
function addScore(points) {
    // NOUVELLE MÉCANIQUE : 1 + (nombre_améliorations * 1% * autoGain)
    const clickBonus = activatedClickUpgrades.length * 0.01 * autoGain;
    const basePoints = points + clickBonus;
    
    // SOLUTION 1: Appliquer le multiplicateur de clic
    const totalPoints = basePoints * clickMultiplier;

    score += totalPoints;
    clickGloireTotal += basePoints;

    showClickEffect(Math.round(totalPoints));

    const medal = document.getElementById('medal');
    medal.style.transform = 'scale(0.95)';
    setTimeout(() => { medal.style.transform = 'scale(1)'; }, 100);

    updateDisplay();
    saveGame();
    renderBuildings();
    if (Date.now() - lastUpgradesRender > 500) { lastUpgradesRender = Date.now(); renderUpgrades(); }
    checkEraUnlocks();
}

// Affiche l'effet +X
function showClickEffect(value) {
    const container = document.getElementById('click-effects');
    const medal = document.getElementById('medal');
    const medalRect = medal.getBoundingClientRect();
    const centerX = medalRect.left + medalRect.width / 2;
    const centerY = medalRect.top + medalRect.height / 2;

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 30;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = `+${formatNumber(value)}`;
    effect.style.left = `${centerX + offsetX}px`;
    effect.style.top = `${centerY + offsetY}px`;

    container.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

// Pluie de médaillons (bug corrigé)
function spawnMedalRain() {
    const now = Date.now();
    const medalCount = Math.min(Math.floor(autoGain / 5), 5);
    if (medalCount <= 0) return;

    const container = document.getElementById('medal-rain');
    const medal = document.getElementById('medal');
    const medalRect = medal.getBoundingClientRect();

    for (let i = 0; i < medalCount; i++) {
        const startX = medalRect.left + Math.random() * medalRect.width;
        const startY = medalRect.top - 20;

        const medalRain = document.createElement('div');
        medalRain.className = 'medal-rain';
        medalRain.innerHTML = '🏅';
        medalRain.style.left = `${startX}px`;
        medalRain.style.top = `${startY}px`;

        container.appendChild(medalRain);
        setTimeout(() => medalRain.remove(), 2000);
    }
    lastMedalRainTime = now; // Bug corrigé : mise à jour de lastMedalRainTime
}

// ============================================
// BOUCLE PRINCIPALE
// ============================================

function gameLoop() {
    let totalGain = 0;

    ERAS.forEach(era => {
        era.buildings.forEach(building => {
            const buildingGain = calculateBuildingGain(building);
            totalGain += buildingGain;

            if (building.count > 0) {
                // SOLUTION 3: Ajouter la production réelle à chaque itération (gameLoop tourne 10x/seconde, donc *0.1 = /10)
                totalGeneratedByBuilding[building.id] = (totalGeneratedByBuilding[building.id] || 0) + (buildingGain * 0.1);
            }
        });
    });

    autoGain = totalGain;
    score += autoGain / 10;

    // Pluie de médaillons si gain automatique > 0 (bug corrigé)
    if (autoGain > 0 && Date.now() - lastMedalRainTime > 500) {
        spawnMedalRain();
    }
    if (Date.now() - lastBuildingsUpdate > 500) { lastBuildingsUpdate = Date.now(); updateAllBuildingButtons(); }
    updateDisplay();
    checkEraUnlocks();
}

// ============================================
// STATISTIQUES
// ============================================

function calculateTotalGenerated() {
    let total = 0;
    for (const key in totalGeneratedByBuilding) {
        total += totalGeneratedByBuilding[key];
    }
    return total;
}

function renderStats() {
    const container = document.getElementById('stats-body');
    container.innerHTML = '';

    const globalStats = [
        { label: "Score total", value: formatNumber(score) },
        { label: "Gloire par seconde", value: formatNumber(autoGain) },
        { label: "Clics totaux", value: formatNumber(clickGloireTotal) },
        { label: "Gloire total généré", value: formatNumber(calculateTotalGenerated()) }
    ];

    globalStats.forEach(stat => {
        const statElement = document.createElement('div');
        statElement.style.display = 'flex';
        statElement.style.justifyContent = 'space-between';
        statElement.style.padding = '8px 0';
        statElement.style.borderBottom = '1px solid #e2e8f0';
        statElement.innerHTML = `
            <span style="color: #64748b; font-size: 0.9rem;">${stat.label}</span>
            <span style="color: #2563eb; font-weight: 600;">${stat.value}</span>
        `;
        container.appendChild(statElement);
    });

    container.innerHTML += '<h4 style="margin: 16px 0 8px; color: #2563eb; font-size: 1rem;">Par bâtiment</h4>';

    ERAS.forEach(era => {
        era.buildings.forEach(building => {
            if (building.count > 0) {
                const buildingGain = calculateBuildingGain(building);
                const percent = autoGain > 0 ? ((buildingGain / autoGain) * 100).toFixed(2) : 0;

                const buildingStatElement = document.createElement('div');
                buildingStatElement.style.display = 'flex';
                buildingStatElement.style.justifyContent = 'space-between';
                buildingStatElement.style.padding = '6px 0';
                buildingStatElement.style.fontSize = '0.9rem';
                buildingStatElement.innerHTML = `
                    <span>${building.image} ${building.name}</span>
                    <span style="color: #64748b;">+${formatNumber(buildingGain)}/s (${percent}%)</span>
                `;
                container.appendChild(buildingStatElement);
            }
        });
    });
}

// ============================================
// MODALS
// ============================================

function toggleSettings() {
    document.getElementById('settings-modal').classList.toggle('active');
}

function toggleStats() {
    const modal = document.getElementById('stats-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        renderStats();
    }
}

// ============================================
// AFFICHAGE
// ============================================

function updateDisplay() {
    document.getElementById('score-value').textContent = formatNumber(score);
    document.getElementById('gain-value').textContent = formatNumber(autoGain);
}

// ============================================
// INITIALISATION
// ============================================

function init() {
    initGlobals();
    loadGame();
    updateDisplay();
    renderBuildings();
    if (Date.now() - lastUpgradesRender > 500) { lastUpgradesRender = Date.now(); renderUpgrades(); }
    checkEraUnlocks();
}

// ============================================
// TIMERS
// ============================================

// Spawn random bonus toutes les 60 secondes
setInterval(spawnRandomBonus, 60000);

// Game loop toutes les 100ms
setInterval(gameLoop, 100);

// Sauvegarde automatique toutes les 30 secondes
setInterval(() => {
    if (Date.now() - lastSaveTime > 30000) {
        saveGame();
    }
}, 10000);

// Initialisation au chargement
window.onload = init;
