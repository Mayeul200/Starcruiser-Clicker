// ============================================
// GLORY OF FRANCE CLICKER - MAIN SCRIPT
// Version Optimisée
// ============================================

// ============================================
// TOOLTIP GLOBAL
// ============================================
const tooltip = document.createElement('div');
tooltip.className = 'upgrade-tooltip';
document.body.appendChild(tooltip);

function showTooltip(text, x, y) {
    tooltip.textContent = text;
    tooltip.style.top = y + 'px';
    tooltip.style.left = x + 'px';
    tooltip.style.transform = 'translate(-50%, -120%)';
    tooltip.classList.add('visible');
}

function hideTooltip() {
    tooltip.classList.remove('visible');
}

// ============================================
// CONSTANTES GLOBALES
// ============================================
const BUILDING_PRICE_GROWTH_RATE = 0.12;
const GAME_LOOP_FPS = 10;
const GAME_LOOP_INTERVAL_MS = 100;
const BONUS_SPAWN_INTERVAL_MS = 60000;
const SAVE_INTERVAL_MS = 30000;
const TOAST_DURATION_MS = 3000;
const MAX_BUILDING_DISPLAY = 100;
const BUILDING_UPDATE_INTERVAL_MS = 500;

// ============================================
// DONNÉES DU JEU
// ============================================
const BUILDINGS = [
    { id: "coq-gaulois", name: "Coq Gaulois", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 10, gain: 0.1, count: 0, image: "\ud83d\udc13", unlockCondition: () => true, totalGenerated: 0 },
    { id: "vercingetorix", name: "Vercingétorix", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 100, gain: 1, count: 0, image: "\ud83d\udde1\ufe0f", unlockCondition: () => score >= 20, totalGenerated: 0 },
    { id: "charlemagne", name: "Charlemagne", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000, gain: 10, count: 0, image: "\ud83d\udc51", unlockCondition: () => score >= 500, totalGenerated: 0 },
    { id: "notre-dame", name: "Notre-Dame", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 10000, gain: 100, count: 0, image: "\u26ea", unlockCondition: () => score >= 5000, totalGenerated: 0 },
    { id: "fleur-de-lys", name: "Fleur de Lys", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 50000, gain: 1000, count: 0, image: "\ud83c\udf38", unlockCondition: () => score >= 25000, totalGenerated: 0 },
    { id: "saint-louis", name: "Saint Louis", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 100000, gain: 500, count: 0, image: "\ud83d\udc68\u200d\u2696\ufe0f", unlockCondition: () => score >= 50000, totalGenerated: 0 },
    { id: "joan-of-arc", name: "Jeanne d'Arc", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 200000, gain: 2000, count: 0, image: "\ud83d\udee1\ufe0f", unlockCondition: () => score >= 100000, totalGenerated: 0 },
    { id: "louis-xiv", name: "Louis XIV", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000000, gain: 10000, count: 0, image: "\u2600\ufe0f", unlockCondition: () => score >= 1000000, totalGenerated: 0 },
    { id: "revolution", name: "Révolution", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 5000000, gain: 50000, count: 0, image: "\ud83c\udfad", unlockCondition: () => score >= 2000000, totalGenerated: 0 },
    { id: "napoleon", name: "Napoléon", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 50000000, gain: 500000, count: 0, image: "\ud83c\udfa8", unlockCondition: () => score >= 50000000, totalGenerated: 0 },
    { id: "tour-eiffel", name: "Tour Eiffel", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 200000000, gain: 2000000, count: 0, image: "\ud83c\udfdb\ufe0f", unlockCondition: () => score >= 100000000, totalGenerated: 0 },
    { id: "de-gaulle", name: "De Gaulle", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000000000, gain: 10000000, count: 0, image: "\ud83c\udf96\ufe0f", unlockCondition: () => score >= 1000000000, totalGenerated: 0 },
    { id: "macron", name: "Macron", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 5000000000, gain: 50000000, count: 0, image: "\ud83d\udcbc", unlockCondition: () => score >= 2000000000, totalGenerated: 0 },
    { id: "marianne", name: "Marianne", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 25000000000, gain: 250000000, count: 0, image: "\ud83d\udc69\u200d\ud83d\udcbc", unlockCondition: () => score >= 10000000000, totalGenerated: 0 },
    { id: "liberte", name: "Liberté", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 100000000000, gain: 1000000000, count: 0, image: "\ud83c\udff3\ufe0f\u200d\ud83c\udf08", unlockCondition: () => score >= 50000000000, totalGenerated: 0 },
    { id: "egalite", name: "Égalité", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 500000000000, gain: 5000000000, count: 0, image: "\u2696\ufe0f", unlockCondition: () => score >= 250000000000, totalGenerated: 0 },
    { id: "fraternite", name: "Fraternité", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 2500000000000, gain: 25000000000, count: 0, image: "\ud83d\udc6b", unlockCondition: () => score >= 1000000000000, totalGenerated: 0 },
    { id: "louvre", name: "Louvre", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 10000000000000, gain: 100000000000, count: 0, image: "\ud83c\udfa8", unlockCondition: () => score >= 5000000000000, totalGenerated: 0 },
    { id: "champs-elysees", name: "Champs-Élysées", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 50000000000000, gain: 500000000000, count: 0, image: "\ud83c\udf0d", unlockCondition: () => score >= 25000000000000, totalGenerated: 0 },
    { id: "arc-de-triomphe", name: "Arc de Triomphe", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 250000000000000, gain: 2500000000000, count: 0, image: "\ud83d\uddfc", unlockCondition: () => score >= 100000000000000, totalGenerated: 0 },
    { id: "sacre-coeur", name: "Sacré-Cœur", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000000000000000, gain: 10000000000000, count: 0, image: "\u26ea", unlockCondition: () => score >= 500000000000000, totalGenerated: 0 },
    { id: "mont-saint-michel", name: "Mont Saint-Michel", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 5000000000000000, gain: 50000000000000, count: 0, image: "\ud83d\uddfc", unlockCondition: () => score >= 2000000000000000, totalGenerated: 0 },
    { id: "palais-versailles", name: "Palais de Versailles", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 25000000000000000, gain: 250000000000000, count: 0, image: "\ud83c\udfa8", unlockCondition: () => score >= 10000000000000000, totalGenerated: 0 },
    { id: "notre-dame-de-paris", name: "Notre-Dame de Paris", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 100000000000000000, gain: 1000000000000000, count: 0, image: "\u26ea", unlockCondition: () => score >= 50000000000000000, totalGenerated: 0 },
    { id: "republique-francaise", name: "République Française", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 500000000000000000, gain: 5000000000000000, count: 0, image: "\ud83c\uddeb\ud83c\uddf7", unlockCondition: () => score >= 200000000000000000, totalGenerated: 0 }
];

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

const BUILDING_UPGRADE_THRESHOLDS = [1, 5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000];

const UPGRADE_COLORS = [
    '#88c9ee', '#66b2ff', '#4499ff', '#2288ff', '#1177ff',
    '#0066ff', '#4444ff', '#6622ff', '#8800ff', '#aa00dd',
    '#cc00bb', '#ee0099', '#ff0077', '#ff0055', '#ff2233',
    '#ff4411', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00',
    '#ffee00', '#ffff00'
];

const RANDOM_BONUSES = [
    { id: "baguette", symbol: "\ud83e\udd56", name: "Baguette Magique", effect: "instant", type: "baguette", colorClass: "baguette" },
    { id: "croissant", symbol: "\ud83e\udd50", name: "Croissant Doré", effect: "multiplier", type: "croissant", multiplier: 10, duration: 30000, colorClass: "croissant" }
];

const SAVE_VERSION = "4.0.0";

// ============================================
// VARIABLES GLOBALES
// ============================================
let score = 0;
let gloryPerSecond = 0;
let autoMultiplier = 1;
let clickMultiplier = 1;
let activeRandomBonuses = [];
let autoMultipliers = [1];
let clickMultipliers = [1];
let buildingUpgrades = {};
let buildingUpgradeCosts = {};
let totalGloryFromClicks = 0;
let activatedClickUpgrades = [];
let unlockedBuildings = new Set();
let totalGeneratedByBuilding = {};
let lastSaveTime = 0;
let lastBuildingsUpdate = 0;
let gameStartTime = 0;
let buyMultiplier = 1;
let clickedBonusesCount = 0;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function initGlobals() {
    BUILDINGS.forEach(building => {
        totalGeneratedByBuilding[building.id] = totalGeneratedByBuilding[building.id] || 0;
        buildingUpgrades[building.id] = buildingUpgrades[building.id] || [];
    });
}

function findBuildingById(buildingId) {
    return BUILDINGS.find(b => b.id === buildingId);
}

function calculateBuildingGain(building) {
    const upgradeMultiplier = getBuildingUpgradeMultiplier(building.id);
    return building.gain * building.count * autoMultiplier * upgradeMultiplier;
}

function calculateUnitBuildingGain(building) {
    const upgradeMultiplier = getBuildingUpgradeMultiplier(building.id);
    return building.gain * autoMultiplier * upgradeMultiplier;
}

function getBuildingUpgradeMultiplier(buildingId) {
    const upgrades = buildingUpgrades[buildingId] || [];
    return Math.pow(2, upgrades.length);
}

function isBuildingUpgradeAvailable(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building) return false;
    
    const upgrades = buildingUpgrades[buildingId] || [];
    const thresholdIndex = BUILDING_UPGRADE_THRESHOLDS.indexOf(threshold);
    
    if (building.count >= threshold && !buildingUpgradeCosts[buildingId]?.[threshold]) {
        getBuildingUpgradeFixedCost(buildingId, threshold);
    }
    
    return building.count >= threshold &&
           !upgrades.includes(threshold) &&
           (thresholdIndex === 0 || upgrades.includes(BUILDING_UPGRADE_THRESHOLDS[thresholdIndex - 1]));
}

function getBuildingTooltip(building) {
    const unitGain = calculateUnitBuildingGain(building);
    const totalGain = calculateBuildingGain(building);
    const percent = gloryPerSecond > 0 ? ((totalGain / gloryPerSecond) * 100).toFixed(2) : 0;
    return building.description
        .replace('{gain}', formatNumber(unitGain))
        .replace('{percent}', percent)
        .replace('{total}', formatNumber(totalGeneratedByBuilding[building.id] || 0));
}

function getBuildingUpgradeFixedCost(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building) return 0;
    
    if (buildingUpgradeCosts[buildingId] && buildingUpgradeCosts[buildingId][threshold] !== undefined) {
        return buildingUpgradeCosts[buildingId][threshold];
    }
    
    const unitGain = building.gain * getBuildingUpgradeMultiplier(building.id);
    const cost = Math.floor(threshold * unitGain * 5);
    
    if (!buildingUpgradeCosts[buildingId]) {
        buildingUpgradeCosts[buildingId] = {};
    }
    buildingUpgradeCosts[buildingId][threshold] = cost;
    
    return cost;
}

function calculateBuildingCost(building) {
    return building.count === 0
        ? building.baseCost
        : Math.floor(building.baseCost * Math.exp(BUILDING_PRICE_GROWTH_RATE * building.count));
}

// Fonction de formatage optimisée
function formatNumber(num, isTotalScore) {
    if (num === 0) return "0";
    
    const absNum = Math.abs(num);
    
    // Nombres < 1000
    if (absNum < 1000) {
        return num % 1 === 0 ? Math.round(num).toLocaleString() : num.toFixed(1).toLocaleString();
    }
    
    // Nombres entre 1000 et 999999
    if (absNum < 1000000) {
        return num % 1 === 0 ? Math.round(num).toLocaleString() : num.toFixed(1).toLocaleString();
    }
    
    // Nombres >= 1M avec suffixes
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "De", "Ud", "Dd", "Td", "Qad", "Qid", "Sd", "Spd"];
    const tier = Math.min(Math.floor(Math.log10(absNum) / 3), suffixes.length - 1);
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;
    
    // Déterminer le nombre de décimales
    const scaledAbs = Math.abs(scaled);
    const decimals = scaledAbs >= 100 ? (isTotalScore ? 3 : 2) : (scaledAbs >= 10 ? 3 : 3);
    
    return scaled.toFixed(decimals).toLocaleString() + " " + suffix;
}

function updateAutoMultiplier() {
    autoMultiplier = autoMultipliers.reduce((a, b) => a * b, 1);
}

function updateClickMultiplier() {
    clickMultiplier = clickMultipliers.reduce((a, b) => a * b, 1);
}

function resetMultipliers() {
    autoMultipliers = [1];
    clickMultipliers = [1];
    updateAutoMultiplier();
    updateClickMultiplier();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), TOAST_DURATION_MS);
}

// ============================================
// SAUVEGARDE / CHARGEMENT
// ============================================

function saveGame() {
    const saveData = {
        score: score,
        gloryPerSecond: gloryPerSecond,
        autoMultiplier: autoMultiplier,
        clickMultiplier: clickMultiplier,
        totalGloryFromClicks: totalGloryFromClicks,
        activatedClickUpgrades: [...activatedClickUpgrades],
        unlockedBuildings: Array.from(unlockedBuildings),
        autoMultipliers: [...autoMultipliers],
        clickMultipliers: [...clickMultipliers],
        buildingUpgrades: {},
        buildingUpgradeCosts: {},
        totalGeneratedByBuilding: {},
        clickedBonusesCount: clickedBonusesCount,
        activeRandomBonuses: activeRandomBonuses.map(bonus => ({
            id: bonus.id,
            effect: bonus.effect,
            multiplier: bonus.multiplier,
            endTime: bonus.endTime
        })),
        buildings: BUILDINGS.map(building => ({
            id: building.id,
            count: building.count
        })),
        lastSave: Date.now(),
        gameStartTime: gameStartTime,
        version: SAVE_VERSION
    };

    for (const buildingId in buildingUpgrades) {
        saveData.buildingUpgrades[buildingId] = [...buildingUpgrades[buildingId]];
    }
    for (const buildingId in totalGeneratedByBuilding) {
        saveData.totalGeneratedByBuilding[buildingId] = totalGeneratedByBuilding[buildingId];
    }
    for (const buildingId in buildingUpgradeCosts) {
        saveData.buildingUpgradeCosts[buildingId] = {...buildingUpgradeCosts[buildingId]};
    }

    localStorage.setItem('gloryOfFranceSave', JSON.stringify(saveData));
    lastSaveTime = Date.now();
}

function loadGame() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (!saveData) return;

    try {
        const parsed = JSON.parse(saveData);

        if (parsed.version && parsed.version !== SAVE_VERSION) {
            console.warn("Version de sauvegarde différente, migration possible");
        }

        // Charger les variables principales
        score = parsed.score || 0;
        gloryPerSecond = parsed.gloryPerSecond || parsed.autoGain || 0;
        autoMultiplier = parsed.autoMultiplier || 1;
        clickMultiplier = parsed.clickMultiplier || 1;
        totalGloryFromClicks = parsed.totalGloryFromClicks || parsed.clickGloireTotal || 0;
        clickedBonusesCount = parsed.clickedBonusesCount || 0;
        
        activatedClickUpgrades = parsed.activatedClickUpgrades || [];
        unlockedBuildings = new Set(parsed.unlockedBuildings || []);
        gameStartTime = parsed.gameStartTime || 0;

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

        // Charger les coûts fixes des améliorations
        if (parsed.buildingUpgradeCosts) {
            for (const buildingId in parsed.buildingUpgradeCosts) {
                buildingUpgradeCosts[buildingId] = {...parsed.buildingUpgradeCosts[buildingId]};
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

            activeRandomBonuses.forEach(bonus => {
                if (bonus.effect === "auto" || bonus.effect === "both" || bonus.effect === "multiplier") {
                    if (bonus.multiplier && !autoMultipliers.includes(bonus.multiplier)) {
                        autoMultipliers.push(bonus.multiplier);
                    }
                }
                if (bonus.effect === "click" || bonus.effect === "both") {
                    if (bonus.multiplier && !clickMultipliers.includes(bonus.multiplier)) {
                        clickMultipliers.push(bonus.multiplier);
                    }
                }
            });
            updateAutoMultiplier();
            updateClickMultiplier();
        }

        // Charger les comptes des bâtiments
        if (parsed.buildings) {
            parsed.buildings.forEach(savedBuilding => {
                const building = BUILDINGS.find(b => b.id === savedBuilding.id);
                if (building) {
                    building.count = savedBuilding.count || 0;
                }
            });
        } else if (parsed.eras) {
            parsed.eras.forEach(savedEra => {
                savedEra.buildings.forEach(savedBuilding => {
                    const building = BUILDINGS.find(b => b.id === savedBuilding.id);
                    if (building) {
                        building.count = savedBuilding.count || 0;
                    }
                });
            });
        }

        // Filtrer les bonus expirés et recalculer les multiplicateurs
        const now = Date.now();
        activeRandomBonuses = activeRandomBonuses.filter(bonus => bonus.endTime >= now);
        
        resetMultipliers();
        activeRandomBonuses.forEach(bonus => {
            if (bonus.effect === "auto" || bonus.effect === "both" || bonus.effect === "multiplier") {
                if (bonus.multiplier) autoMultipliers.push(bonus.multiplier);
            }
            if (bonus.effect === "click" || bonus.effect === "both") {
                if (bonus.multiplier) clickMultipliers.push(bonus.multiplier);
            }
        });
        updateAutoMultiplier();
        updateClickMultiplier();
        
        if (autoMultipliers.length === 1) autoMultiplier = 1;
        if (clickMultipliers.length === 1) clickMultiplier = 1;

        initGlobals();

    } catch (e) {
        console.error("Erreur de chargement :", e);
        localStorage.removeItem('gloryOfFranceSave');
        showToast("\u26a0\ufe0f Sauvegarde corrompue. Nouvelle partie.");
    }
}

function exportSave() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (saveData) {
        navigator.clipboard.writeText(saveData)
            .then(() => showToast("\u2705 Sauvegarde copiée !"))
            .catch(() => showToast("\u274c Échec de la copie."));
    } else {
        showToast("\u274c Aucune sauvegarde.");
    }
}

function importSave() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) { showToast("\u274c Rien à importer."); return; }
    try {
        const testParse = JSON.parse(importText);
        if (testParse.version && testParse.buildings && testParse.buildingUpgrades) {
            localStorage.setItem('gloryOfFranceSave', importText);
            showToast("\u2705 Importé ! Redémarrage...");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast("\u274c Format invalide.");
        }
    } catch (e) {
        showToast("\u274c Format invalide.");
    }
}

function confirmDeleteSave() {
    if (confirm("\u26a0\ufe0f Supprimer la sauvegarde ? Tous vos progrès seront PERDUS !")) {
        deleteSave();
    }
}

function deleteSave() {
    localStorage.removeItem('gloryOfFranceSave');
    showToast("\ud83d\uddd1\ufe0f Supprimé !");
    setTimeout(() => window.location.reload(), 1000);
}

// ============================================
// GESTION DES BÂTIMENTS
// ============================================

function setBuyMultiplier(multiplier) {
    buyMultiplier = multiplier;
    
    document.querySelectorAll('.multiplier-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (multiplier === 'max') {
        document.getElementById('multiplier-max').classList.add('active');
        showToast("Multiplicateur: Max");
    } else {
        document.getElementById(`multiplier-x${multiplier}`).classList.add('active');
        showToast(`Multiplicateur: x${multiplier}`);
    }
    
    updateAllBuildingButtons();
}

function buyBuilding(buildingId) {
    const building = findBuildingById(buildingId);
    if (!building) return;

    const buildingsToBuy = buyMultiplier === 'max' ? calculateMaxAffordable(building) : buyMultiplier;
    
    let totalCost = 0;
    for (let i = 0; i < buildingsToBuy; i++) {
        totalCost += calculateBuildingCost({...building, count: building.count + i});
    }

    if (buildingsToBuy > 0) {
        score -= totalCost;
        building.count += buildingsToBuy;
        unlockedBuildings.add(building.id);
        updateDisplay();
        saveGame();
        hideTooltip();
        updateAllBuildingButtons();
        renderUpgrades();
        checkBuildingUnlocks();
        const maxText = buyMultiplier === 'max' ? ' (Max)' : '';
        showToast(`\u2705 +${buildingsToBuy} ${building.name}${maxText}`);
    } else {
        showToast("\u274c Pas assez de Gloire");
    }
}

function calculateMaxAffordable(building) {
    let maxAffordable = 0;
    let cumulativeCost = 0;
    let i = 0;
    while (true) {
        const costForOne = calculateBuildingCost({...building, count: building.count + i});
        if (cumulativeCost + costForOne <= score) {
            cumulativeCost += costForOne;
            maxAffordable++;
            i++;
        } else {
            break;
        }
        if (i > 100000) break; // Sécurité
    }
    return maxAffordable;
}

function buyClickUpgrade(threshold) {
    const upgrade = CLICK_UPGRADES.find(u => u.threshold === threshold);
    if (!upgrade) return;
    
    if (activatedClickUpgrades.includes(threshold)) {
        showToast("\u2705 Déjà activée !");
        return;
    }
    
    if (score < upgrade.cost) {
        showToast("\u274c Pas assez de Gloire");
        return;
    }
    
    score -= upgrade.cost;
    activatedClickUpgrades.push(threshold);
    updateDisplay();
    saveGame();
    hideTooltip();
    renderUpgrades();
    updateAllBuildingButtons();
    showToast(`\u2705 ${upgrade.name} activée`);
}

function buyBuildingUpgrade(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building || !isBuildingUpgradeAvailable(buildingId, threshold)) return;
    
    const cost = getBuildingUpgradeFixedCost(buildingId, threshold);
    
    if (score < cost) {
        showToast("\u274c Pas assez de Gloire");
        return;
    }
    
    score -= cost;
    
    if (!buildingUpgrades[buildingId]) {
        buildingUpgrades[buildingId] = [];
    }
    
    buildingUpgrades[buildingId].push(threshold);
    updateDisplay();
    saveGame();
    hideTooltip();
    renderUpgrades();
    updateAllBuildingButtons();
    showToast('+ ' + building.name + ' improved x2 (-' + formatNumber(cost) + ' G)');
}

function updateBuildingButton(buildingId) {
    const element = document.getElementById(`building-${buildingId}`);
    if (!element) return;

    const building = findBuildingById(buildingId);
    if (!building) return;

    const buildingsToShow = buyMultiplier === 'max' ? calculateMaxAffordable(building) : buyMultiplier;
    const buildingsToShowLimited = Math.min(buildingsToShow, MAX_BUILDING_DISPLAY);
    
    let totalCost = 0;
    for (let i = 0; i < buildingsToShowLimited; i++) {
        totalCost += calculateBuildingCost({...building, count: building.count + i});
    }
    
    const totalGain = calculateBuildingGain(building);
    const isAffordable = score >= totalCost;
    
    const displayCost = buyMultiplier === 'max' && calculateMaxAffordable(building) > MAX_BUILDING_DISPLAY
        ? formatNumber(totalCost) + "+"
        : formatNumber(totalCost);

    if (building.count > 0) {
        element.classList.remove('not-purchased');
    } else {
        element.classList.add('not-purchased');
    }

    const button = element.querySelector('button');
    const productionSpan = element.querySelector('.building-production');
    const ownershipDiv = element.querySelector('.building-ownership');

    if (button) {
        button.disabled = !isAffordable || buildingsToShow === 0;
        button.textContent = `${displayCost} Gloire`;
    }
    if (productionSpan) productionSpan.textContent = `${formatNumber(totalGain)}/s`;
    if (ownershipDiv) ownershipDiv.textContent = `Possédé : ${building.count}`;

    element.setAttribute('data-tooltip', getBuildingTooltip(building));
}

function updateAllBuildingButtons() {
    document.querySelectorAll('.building-item').forEach(element => {
        const buildingId = element.id.replace('building-', '');
        updateBuildingButton(buildingId);
    });
}

function checkBuildingUnlocks() {
    let needsRerender = false;
    BUILDINGS.forEach(building => {
        if (building.unlockCondition() && !unlockedBuildings.has(building.id)) {
            unlockedBuildings.add(building.id);
            needsRerender = true;
        }
    });
    if (needsRerender) {
        renderBuildings();
    }
}

function renderBuildings() {
    const container = document.getElementById('buildings-list');
    container.innerHTML = '';

    BUILDINGS.forEach(building => {
        if (building.unlockCondition() || unlockedBuildings.has(building.id)) {
            if (building.unlockCondition() && !unlockedBuildings.has(building.id)) {
                unlockedBuildings.add(building.id);
            }
            renderBuilding(building);
        }
    });
}

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
        <div class="building-left">
            <div class="building-name-icon">
                <span class="building-name">${building.name}</span>
                <span class="building-icon">${building.image}</span>
            </div>
            <div class="building-ownership">
                Possédé : ${building.count}
            </div>
        </div>
        <div class="building-right">
            <button onclick="buyBuilding('${building.id}')" ${!isAffordable ? 'disabled' : ''}>
                ${formatNumber(currentCost)} Gloire
            </button>
            <div class="building-production">${formatNumber(totalGain)}/s</div>
        </div>
    `;

    buildingElement.addEventListener('mouseenter', () => {
        buildingElement.setAttribute('data-tooltip', getBuildingTooltip(building));
    });

    container.appendChild(buildingElement);
}

// ============================================
// GESTION DES AMÉLIORATIONS
// ============================================

function renderUpgrades() {
    const container = document.getElementById('upgrades-container');
    container.innerHTML = '';

    // Améliorations de clic
    CLICK_UPGRADES.forEach(upgrade => {
        if (totalGloryFromClicks >= upgrade.threshold && !activatedClickUpgrades.includes(upgrade.threshold)) {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-icon';
            upgradeElement.innerHTML = '\ud83d\udcb0';
            
            upgradeElement.addEventListener('mouseenter', (e) => {
                const rect = e.target.getBoundingClientRect();
                showTooltip(`Multiplication x2 - ${formatNumber(upgrade.cost)} Gloire`, rect.left + rect.width/2, rect.top);
            });
            upgradeElement.addEventListener('mouseleave', hideTooltip);
            
            upgradeElement.onclick = () => buyClickUpgrade(upgrade.threshold);
            container.appendChild(upgradeElement);
        }
    });
    
    // Améliorations de bâtiments
    BUILDING_UPGRADE_THRESHOLDS.forEach(threshold => {
        BUILDINGS.forEach(building => {
            if (isBuildingUpgradeAvailable(building.id, threshold)) {
                const thresholdIndex = BUILDING_UPGRADE_THRESHOLDS.indexOf(threshold);
                const color = UPGRADE_COLORS[thresholdIndex];
                const cost = getBuildingUpgradeFixedCost(building.id, threshold);
                
                const upgradeElement = document.createElement('div');
                upgradeElement.className = 'upgrade-icon';
                upgradeElement.style.background = color;
                upgradeElement.innerHTML = building.image;
                
                upgradeElement.addEventListener('mouseenter', (e) => {
                    const rect = e.target.getBoundingClientRect();
                    showTooltip(`Multiplication x2 - ${formatNumber(cost)} Gloire`, rect.left + rect.width/2, rect.top);
                });
                upgradeElement.addEventListener('mouseleave', hideTooltip);
                
                upgradeElement.onclick = () => buyBuildingUpgrade(building.id, threshold);
                container.appendChild(upgradeElement);
            }
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
    bonusElement.style.transform = 'scale(0.1)';
    bonusElement.style.opacity = '0';
    
    document.getElementById('random-bonuses').appendChild(bonusElement);

    setTimeout(() => {
        bonusElement.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-in';
        bonusElement.style.transform = 'scale(1)';
        bonusElement.style.opacity = '1';
    }, 10);

    const timeout = setTimeout(() => {
        bonusElement.classList.add('clicked');
        setTimeout(() => bonusElement.remove(), 500);
    }, 10000);

    bonusElement.onclick = () => {
        clearTimeout(timeout);
        bonusElement.classList.add('clicked');
        clickedBonusesCount++;

        if (bonus.id === "baguette") {
            const oneMinuteProduction = gloryPerSecond * 60;
            score += oneMinuteProduction;
            showToast(`\u2705 ${bonus.name} : +${formatNumber(oneMinuteProduction)} Gloire !`);
        } 
        else if (bonus.id === "croissant") {
            if (!autoMultipliers.includes(bonus.multiplier)) {
                autoMultipliers.push(bonus.multiplier);
                updateAutoMultiplier();
            }

            activeRandomBonuses.push({
                id: bonus.id,
                effect: bonus.effect,
                multiplier: bonus.multiplier,
                endTime: Date.now() + bonus.duration
            });

            showToast(`\u2705 ${bonus.name} : \u00d7${bonus.multiplier} Gloire/s pendant ${bonus.duration/1000}s`);

            setTimeout(() => {
                activeRandomBonuses = activeRandomBonuses.filter(b => b.id !== bonus.id);
                autoMultipliers = autoMultipliers.filter(m => m !== bonus.multiplier);
                updateAutoMultiplier();
                updateDisplay();
                showToast(`\u23f0 ${bonus.name} expir\u00e9`);
            }, bonus.duration);
        }

        setTimeout(() => bonusElement.remove(), 500);
    };
}

// ============================================
// EFFETS VISUELS
// ============================================

function addScore(points) {
    const clickBonus = activatedClickUpgrades.length * 0.01 * gloryPerSecond;
    const basePoints = points + clickBonus;
    const totalPoints = basePoints * clickMultiplier;

    score += totalPoints;
    totalGloryFromClicks += basePoints;

    showClickEffect(Math.round(totalPoints));

    const medal = document.getElementById('medal');
    medal.style.transform = 'scale(0.95)';
    setTimeout(() => { medal.style.transform = 'scale(1)'; }, 100);

    updateDisplay();
    saveGame();
    updateAllBuildingButtons();
    renderUpgrades();
    checkBuildingUnlocks();
}

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

// ============================================
// BOUCLE PRINCIPALE
// ============================================

function gameLoop() {
    let totalGain = 0;

    BUILDINGS.forEach(building => {
        const buildingGain = calculateBuildingGain(building);
        totalGain += buildingGain;

        if (building.count > 0) {
            totalGeneratedByBuilding[building.id] = (totalGeneratedByBuilding[building.id] || 0) + (buildingGain * 0.1);
        }
    });

    gloryPerSecond = totalGain;
    score += gloryPerSecond / GAME_LOOP_FPS;

    if (Date.now() - lastBuildingsUpdate > BUILDING_UPDATE_INTERVAL_MS) {
        lastBuildingsUpdate = Date.now();
        updateAllBuildingButtons();
    }
    updateDisplay();
    checkBuildingUnlocks();
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

function getClickPower() {
    const basePower = 1;
    const clickBonus = activatedClickUpgrades.length * 0.01 * gloryPerSecond;
    return (basePower + clickBonus) * clickMultiplier;
}

function getTotalBuildingsOwned() {
    return BUILDINGS.reduce((total, building) => total + building.count, 0);
}

function getGameDuration() {
    if (!gameStartTime) return "N/A";
    
    const durationMs = Date.now() - gameStartTime;
    
    if (durationMs < 60000) return Math.floor(durationMs / 1000) + "s";
    if (durationMs < 3600000) return Math.floor(durationMs / 60000) + "min";
    if (durationMs < 86400000) return Math.floor(durationMs / 3600000) + "h";
    return Math.floor(durationMs / 86400000) + "j";
}

function renderStats() {
    const container = document.getElementById('stats-body');
    container.innerHTML = '';

    container.innerHTML += '<h4 style="margin: 0 0 8px; color: #2563eb; font-size: 1.1rem;">Statistiques Globales</h4>';

    const globalStats = [
        { label: "Gloire Actuelle", value: formatNumber(score, true) },
        { label: "Gloire total généré", value: formatNumber(calculateTotalGenerated()) },
        { label: "Gloire par seconde", value: formatNumber(gloryPerSecond) },
        { label: "Clics totaux", value: formatNumber(totalGloryFromClicks) },
        { label: "Gloire par Clic", value: formatNumber(getClickPower()) },
        { label: "Nombre de Bâtiments Possédés", value: formatNumber(getTotalBuildingsOwned()) },
        { label: "Partie Commencée depuis", value: getGameDuration() },
        { label: "Bonus temporaires Cliqués", value: clickedBonusesCount }
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

    container.innerHTML += '<h4 style="margin: 16px 0 8px; color: #2563eb; font-size: 1.1rem;">Améliorations</h4>';
    container.innerHTML += '<h5 style="margin: 8px 0 4px; color: #64748b; font-size: 0.9rem;">Améliorations de Clic:</h5>';
    
    if (activatedClickUpgrades.length > 0) {
        activatedClickUpgrades.forEach(threshold => {
            const upgrade = CLICK_UPGRADES.find(u => u.threshold === threshold);
            if (upgrade) {
                const statElement = document.createElement('div');
                statElement.style.display = 'flex';
                statElement.style.justifyContent = 'space-between';
                statElement.style.padding = '4px 0';
                statElement.style.fontSize = '0.85rem';
                statElement.style.color = '#64748b';
                statElement.innerHTML = `<span>\u2713 ${upgrade.name}</span>`;
                container.appendChild(statElement);
            }
        });
    } else {
        const statElement = document.createElement('div');
        statElement.style.padding = '4px 0';
        statElement.style.fontSize = '0.85rem';
        statElement.style.color = '#94a3b8';
        statElement.textContent = 'Aucune amélioration de clic';
        container.appendChild(statElement);
    }

    container.innerHTML += '<h5 style="margin: 12px 0 4px; color: #64748b; font-size: 0.9rem;">Améliorations de Bâtiments:</h5>';
    
    let hasBuildingUpgrades = false;
    BUILDINGS.forEach(building => {
        const upgrades = buildingUpgrades[building.id] || [];
        if (upgrades.length > 0) {
            hasBuildingUpgrades = true;
            const statElement = document.createElement('div');
            statElement.style.display = 'flex';
            statElement.style.justifyContent = 'space-between';
            statElement.style.padding = '4px 0';
            statElement.style.fontSize = '0.85rem';
            statElement.style.color = '#64748b';
            statElement.innerHTML = `<span>${building.image} ${building.name}: ${upgrades.length} niveau(x)</span>`;
            container.appendChild(statElement);
        }
    });

    if (!hasBuildingUpgrades) {
        const statElement = document.createElement('div');
        statElement.style.padding = '4px 0';
        statElement.style.fontSize = '0.85rem';
        statElement.style.color = '#94a3b8';
        statElement.textContent = 'Aucune amélioration de bâtiment';
        container.appendChild(statElement);
    }

    container.innerHTML += '<h4 style="margin: 16px 0 8px; color: #2563eb; font-size: 1.1rem;">Trophées</h4>';
    container.innerHTML += '<div style="padding: 8px 0; font-size: 0.9rem; color: #94a3b8;">Bientôt disponible...</div>';
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
    document.getElementById('score-value').textContent = formatNumber(score, true);
    document.getElementById('gain-value').textContent = formatNumber(gloryPerSecond);
    updateBonusTimer();
}

function updateBonusTimer() {
    const timerElement = document.getElementById('bonus-timer');
    if (!timerElement) return;
    
    const activeBonuses = activeRandomBonuses.filter(b => b.id === 'croissant');
    if (activeBonuses.length === 0) {
        timerElement.textContent = '';
        timerElement.style.display = 'none';
        return;
    }
    
    const bonus = activeBonuses[0];
    const remainingTime = Math.max(0, bonus.endTime - Date.now());
    const seconds = Math.ceil(remainingTime / 1000);
    
    timerElement.textContent = `\u23f3 x${bonus.multiplier} (${seconds}s)`;
    timerElement.style.display = 'block';
}

// ============================================
// INITIALISATION
// ============================================

function init() {
    initGlobals();
    loadGame();
    updateDisplay();
    renderBuildings();
    renderUpgrades();
    checkBuildingUnlocks();
}

// ============================================
// TIMERS
// ============================================

setInterval(spawnRandomBonus, BONUS_SPAWN_INTERVAL_MS);
setInterval(gameLoop, GAME_LOOP_INTERVAL_MS);
setInterval(() => {
    if (Date.now() - lastSaveTime > SAVE_INTERVAL_MS) {
        saveGame();
    }
}, 10000);

window.onload = function() {
    init();
    if (!gameStartTime) {
        gameStartTime = Date.now();
    }
};
