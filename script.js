// ============================================
// GLORY OF FRANCE CLICKER - MAIN SCRIPT
// ============================================

// LISTE PLATE DES BÂTIMENTS (sans ères)
const BUILDINGS = [
    { id: "coq-gaulois", name: "Coq Gaulois", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 10, gain: 0.1, count: 0, image: "🐓", unlockCondition: () => true, totalGenerated: 0 },
    { id: "vercingetorix", name: "Vercingétorix", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 100, gain: 1, count: 0, image: "🗡️", unlockCondition: () => score >= 20, totalGenerated: 0 },
    { id: "charlemagne", name: "Charlemagne", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000, gain: 10, count: 0, image: "👑", unlockCondition: () => score >= 500, totalGenerated: 0 },
    { id: "notre-dame", name: "Notre-Dame", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 10000, gain: 100, count: 0, image: "⛪", unlockCondition: () => score >= 5000, totalGenerated: 0 },
    { id: "fleur-de-lys", name: "Fleur de Lys", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 50000, gain: 1000, count: 0, image: "🌸", unlockCondition: () => score >= 25000, totalGenerated: 0 },
    { id: "saint-louis", name: "Saint Louis", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 100000, gain: 500, count: 0, image: "👨‍⚖️", unlockCondition: () => score >= 50000, totalGenerated: 0 },
    { id: "joan-of-arc", name: "Jeanne d'Arc", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 200000, gain: 2000, count: 0, image: "🛡️", unlockCondition: () => score >= 100000, totalGenerated: 0 },
    { id: "louis-xiv", name: "Louis XIV", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000000, gain: 10000, count: 0, image: "☀️", unlockCondition: () => score >= 1000000, totalGenerated: 0 },
    { id: "revolution", name: "Révolution", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 5000000, gain: 50000, count: 0, image: "🎭", unlockCondition: () => score >= 2000000, totalGenerated: 0 },
    { id: "napoleon", name: "Napoléon", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 50000000, gain: 500000, count: 0, image: "🎨", unlockCondition: () => score >= 50000000, totalGenerated: 0 },
    { id: "tour-eiffel", name: "Tour Eiffel", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 200000000, gain: 2000000, count: 0, image: "🏛️", unlockCondition: () => score >= 100000000, totalGenerated: 0 },
    { id: "de-gaulle", name: "De Gaulle", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000000000, gain: 10000000, count: 0, image: "🎖️", unlockCondition: () => score >= 1000000000, totalGenerated: 0 },
    { id: "macron", name: "Macron", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 5000000000, gain: 50000000, count: 0, image: "💼", unlockCondition: () => score >= 2000000000, totalGenerated: 0 },
    { id: "marianne", name: "Marianne", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 25000000000, gain: 250000000, count: 0, image: "👩‍💼", unlockCondition: () => score >= 10000000000, totalGenerated: 0 },
    { id: "liberte", name: "Liberté", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 100000000000, gain: 1000000000, count: 0, image: "🏳️‍🌈", unlockCondition: () => score >= 50000000000, totalGenerated: 0 },
    { id: "egalite", name: "Égalité", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 500000000000, gain: 5000000000, count: 0, image: "⚖️", unlockCondition: () => score >= 250000000000, totalGenerated: 0 },
    { id: "fraternite", name: "Fraternité", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 2500000000000, gain: 25000000000, count: 0, image: "👫", unlockCondition: () => score >= 1000000000000, totalGenerated: 0 },
    { id: "louvre", name: "Louvre", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 10000000000000, gain: 100000000000, count: 0, image: "🎨", unlockCondition: () => score >= 5000000000000, totalGenerated: 0 },
    { id: "champs-elysees", name: "Champs-Élysées", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 50000000000000, gain: 500000000000, count: 0, image: "🌍", unlockCondition: () => score >= 25000000000000, totalGenerated: 0 },
    { id: "arc-de-triomphe", name: "Arc de Triomphe", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 250000000000000, gain: 2500000000000, count: 0, image: "🗼", unlockCondition: () => score >= 100000000000000, totalGenerated: 0 },
    { id: "sacre-coeur", name: "Sacré-Cœur", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 1000000000000000, gain: 10000000000000, count: 0, image: "⛪", unlockCondition: () => score >= 500000000000000, totalGenerated: 0 },
    { id: "mont-saint-michel", name: "Mont Saint-Michel", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 5000000000000000, gain: 50000000000000, count: 0, image: "🗼", unlockCondition: () => score >= 2000000000000000, totalGenerated: 0 },
    { id: "palais-versailles", name: "Palais de Versailles", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 25000000000000000, gain: 250000000000000, count: 0, image: "🎨", unlockCondition: () => score >= 10000000000000000, totalGenerated: 0 },
    { id: "notre-dame-de-paris", name: "Notre-Dame de Paris", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 100000000000000000, gain: 1000000000000000, count: 0, image: "⛪", unlockCondition: () => score >= 50000000000000000, totalGenerated: 0 },
    { id: "republique-francaise", name: "République Française", description: "Production unitaire : +{gain} G/s\n% de la production totale : {percent}%\nTotal généré : {total} Gloire", baseCost: 500000000000000000, gain: 5000000000000000, count: 0, image: "🇫🇷", unlockCondition: () => score >= 200000000000000000, totalGenerated: 0 }];

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
    { id: "baguette", symbol: "🥖", name: "Baguette Magique", effect: "instant", type: "baguette", colorClass: "baguette" },
    { id: "croissant", symbol: "🥐", name: "Croissant Doré", effect: "multiplier", type: "croissant", multiplier: 10, duration: 30000, colorClass: "croissant" }
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
let buildingUpgradeCosts = {}; // {buildingId: {threshold: fixedCost, ...}}
let clickGloireTotal = 0;
let activatedClickUpgrades = [];
let unlockedBuildings = new Set();
let totalGeneratedByBuilding = {};
let lastSaveTime = 0;
let lastBuildingsUpdate = 0;
let buyMultiplier = 1; // Multiplicateur d'achat (1, 5, 50)

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Initialisation des structures de données
function initGlobals() {
    BUILDINGS.forEach(building => {
        totalGeneratedByBuilding[building.id] = totalGeneratedByBuilding[building.id] || 0;
        buildingUpgrades[building.id] = buildingUpgrades[building.id] || [];
    });
}

// Trouve un bâtiment par son ID
function findBuildingById(buildingId) {
    return BUILDINGS.find(b => b.id === buildingId);
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
    
    // Calculer le prix fixe si le bâtiment a atteint le seuil et que ce n'est pas déjà fait
    if (building.count >= threshold && !buildingUpgradeCosts[buildingId]?.[threshold]) {
        getBuildingUpgradeFixedCost(buildingId, threshold);
    }
    
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


// Calcule le coût FIXE d'une amélioration de bâtiment (au moment du débloquage)
function getBuildingUpgradeFixedCost(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building) return 0;
    
    // Si le coût est déjà calculé, le retourner
    if (buildingUpgradeCosts[buildingId] && buildingUpgradeCosts[buildingId][threshold] !== undefined) {
        return buildingUpgradeCosts[buildingId][threshold];
    }
    
    // Calculer le coût : nombre_de_bâtiments * production_unitaire * 5
    const unitGain = building.gain * getBuildingUpgradeMultiplier(building.id);
    const cost = Math.floor(threshold * unitGain * 5);
    
    // Stocker le coût fixe
    if (!buildingUpgradeCosts[buildingId]) {
        buildingUpgradeCosts[buildingId] = {};
    }
    buildingUpgradeCosts[buildingId][threshold] = cost;
    
    return cost;
}
// Calcule le coût actuel d'un bâtiment
function calculateBuildingCost(building) {
    return building.count === 0
        ? building.baseCost
        : Math.floor(building.baseCost * Math.exp(0.12 * building.count));
}

// Formate les nombres pour toujours afficher entre 4 et 6 chiffres significatifs
// Exemples: 0.2 -> 0.2, 3456 -> 3 456, 3 456 000 -> 3.456M, 34 456 000 -> 34.456M
function formatNumber(num, isTotalScore) {
    if (num === 0) return "0";
    
    let absNum = Math.abs(num);
    
    // Pour les nombres < 1000, on affiche avec 1 décimale si nécessaire
    if (absNum < 1000) {
        if (num % 1 === 0) {
            return Math.round(num).toLocaleString();
        } else {
            return num.toFixed(1).toLocaleString();
        }
    }
    
    // Pour les nombres entre 1000 et 999999, on affiche sans suffixe avec séparateurs
    if (absNum < 1000000) {
        if (num % 1 === 0) {
            return Math.round(num).toLocaleString();
        } else {
            return num.toFixed(1).toLocaleString();
        }
    }
    
    // Pour les nombres >= 1M, on utilise des suffixes avec TOUJOURS 4-6 chiffres significatifs
    // On trouve le bon exposant pour que la partie numérique ait 4-6 chiffres
    let exponent = 0;
    let suffix = "";
    let normalized = absNum;
    
    // Trouver l'exposant qui donne 4-6 chiffres avant le suffixe
    const suffixes = ["", " Thousand", " Million", " Billion", " Trillion", " Quadrillion", " Quintillion"];
    for (let i = suffixes.length - 1; i >= 0; i--) {
        const testExponent = i * 3;
        const testNormalized = absNum / Math.pow(10, testExponent);
        if (testNormalized >= 1 && testNormalized < 1000) {
            exponent = testExponent;
            suffix = suffixes[i];
            normalized = num / Math.pow(10, exponent);
            break;
        }
    }
    
    // Formater avec le bon nombre de décimales pour garder 4-6 chiffres significatifs
    let normalizedAbs = Math.abs(normalized);
    if (normalizedAbs >= 100) {
        // 3 chiffres avant la virgule -> 2 décimales pour les suffixes, 3 pour le score total
        const decimals = (isTotalScore !== undefined && isTotalScore) ? 3 : 2;
        return normalized.toFixed(decimals).toLocaleString() + " " + suffix;
    } else if (normalizedAbs >= 10) {
        // 2 chiffres avant la virgule -> 3 décimales pour 5 chiffres
        return normalized.toFixed(3).toLocaleString() + " " + suffix;
    } else {
        // 1 chiffre avant la virgule -> 3 décimales pour 4 chiffres
        return normalized.toFixed(3).toLocaleString() + " " + suffix;
    }
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

const SAVE_VERSION = "3.0.0";

function saveGame() {
    const saveData = {
        score: score,
        autoGain: autoGain,
        autoMultiplier: autoMultiplier,
        clickMultiplier: clickMultiplier,
        clickGloireTotal: clickGloireTotal,
        activatedClickUpgrades: [...activatedClickUpgrades],
        unlockedBuildings: Array.from(unlockedBuildings),
                autoMultipliers: [...autoMultipliers],
        clickMultipliers: [...clickMultipliers],
        buildingUpgrades: {},
        buildingUpgradeCosts: {},
        totalGeneratedByBuilding: {},
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
        version: SAVE_VERSION
    };

    // Copie les données des bâtiments
    for (const buildingId in buildingUpgrades) {
        saveData.buildingUpgrades[buildingId] = [...buildingUpgrades[buildingId]];
    }
    for (const buildingId in totalGeneratedByBuilding) {
        saveData.totalGeneratedByBuilding[buildingId] = totalGeneratedByBuilding[buildingId];
    }
    // Copie les coûts fixes des améliorations
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

        // Vérification de la version
        if (parsed.version && parsed.version !== SAVE_VERSION) {
            console.warn("Version de sauvegarde différente, migration possible");
        }

        score = parsed.score || 0;
        autoGain = parsed.autoGain || 0;
        autoMultiplier = parsed.autoMultiplier || 1;
        clickMultiplier = parsed.clickMultiplier || 1;
        clickGloireTotal = parsed.clickGloireTotal || 0;
        
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

        // Charger les bonus actifs (compatibilité avec anciens et nouveaux bonus)
        if (parsed.activeRandomBonuses) {
            activeRandomBonuses = parsed.activeRandomBonuses.map(bonus => ({
                id: bonus.id,
                effect: bonus.effect,
                multiplier: bonus.multiplier,
                endTime: bonus.endTime
            }));

            // Appliquer les multiplicateurs des bonus actifs (seulement pour les bonus de type multiplier)
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

        // Charger les comptes des bâtiments (nouveau format)
        if (parsed.buildings) {
            parsed.buildings.forEach(savedBuilding => {
                const building = BUILDINGS.find(b => b.id === savedBuilding.id);
                if (building) {
                    building.count = savedBuilding.count || 0;
                }
            });
        }
        // Charger les comptes des bâtiments (ancien format avec ères)
        else if (parsed.eras) {
            parsed.eras.forEach(savedEra => {
                savedEra.buildings.forEach(savedBuilding => {
                    const building = BUILDINGS.find(b => b.id === savedBuilding.id);
                    if (building) {
                        building.count = savedBuilding.count || 0;
                    }
                });
            });
        }

        // Filtrer les bonus expirés
        const now = Date.now();
        activeRandomBonuses = activeRandomBonuses.filter(bonus => bonus.endTime >= now);
        
        // Recalculer les multiplicateurs après filtrage
        autoMultipliers = [1];
        clickMultipliers = [1];
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
        if (testParse.version && testParse.buildings && testParse.buildingUpgrades) {
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
// Définit le multiplicateur d'achat
function setBuyMultiplier(multiplier) {
    buyMultiplier = multiplier;
    
    // Mettre à jour les classes actives des boutons
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

// ============================================

// Achat d'un bâtiment
function buyBuilding(buildingId) {
    const building = findBuildingById(buildingId);
    if (!building) return;

    // Calculer le nombre de bâtiments à acheter (mode max ou multiplicateur)
    let buildingsToBuy = buyMultiplier === 'max' ? calculateMaxAffordable(building) : buyMultiplier;
    
    // Calculer le coût total
    let totalCost = 0;
    for (let i = 0; i < buildingsToBuy; i++) {
        const costForOne = calculateBuildingCost({...building, count: building.count + i});
        totalCost += costForOne;
    }

    if (buildingsToBuy > 0) {
        score -= totalCost;
        building.count += buildingsToBuy;
        unlockedBuildings.add(building.id);
        updateDisplay();
        saveGame();
        renderBuildings();
        updateAllBuildingButtons();
        renderUpgrades();
        checkBuildingUnlocks();
        const maxText = buyMultiplier === 'max' ? ' (Max)' : '';
        showToast(`✅ +${buildingsToBuy} ${building.name}${maxText}`);
    } else {
        showToast("❌ Pas assez de Gloire");
    }
}

// Calcule le nombre maximum de bâtiments achetables
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
        // Sécurité : éviter une boucle infinie
        if (i > 100000) break;
    }
    return maxAffordable;
}

// Achat d'une amélioration de clic
function buyClickUpgrade(threshold) {
    const upgrade = CLICK_UPGRADES.find(u => u.threshold === threshold);
    if (!upgrade) return;
    
    // Vérifier si déjà achetée
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
    renderUpgrades();
    updateAllBuildingButtons();
    showToast(`✅ ${upgrade.name} activée`);
}

// Achat d'une amélioration de bâtiment
function buyBuildingUpgrade(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building || !isBuildingUpgradeAvailable(buildingId, threshold)) return;
    
    // Calculer le coût FIXE (déjà calculé au débloquage)
    const cost = getBuildingUpgradeFixedCost(buildingId, threshold);
    
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
    renderUpgrades();
    updateAllBuildingButtons();
    showToast('+ ' + building.name + ' improved x2 (-' + formatNumber(cost) + ' G)');
}

// Met à jour un seul bouton de bâtiment (sans modifier le DOM inutilement)
function updateBuildingButton(buildingId) {
    const element = document.getElementById(`building-${buildingId}`);
    if (!element) return;

    const building = findBuildingById(buildingId);
    if (!building) return;

    // Calculer le coût total pour buyMultiplier bâtiments
    let buildingsToShow = buyMultiplier === 'max' ? calculateMaxAffordable(building) : buyMultiplier;
    
    // Limiter buildingsToShow pour éviter des boucles trop longues dans l'affichage
    if (buildingsToShow > 100) {
        buildingsToShow = 100; // On affiche le coût pour 100 maximum pour l'estimation
    }
    
    let totalCost = 0;
    for (let i = 0; i < buildingsToShow; i++) {
        const costForOne = calculateBuildingCost({...building, count: building.count + i});
        totalCost += costForOne;
    }
    
    const totalGain = calculateBuildingGain(building);
    const isAffordable = score >= totalCost;
    
    // Formater le coût pour l'affichage
    const displayCost = buyMultiplier === 'max' && calculateMaxAffordable(building) > 100
        ? formatNumber(totalCost) + "+"
        : formatNumber(totalCost);

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
        button.disabled = !isAffordable || buildingsToShow === 0;
        button.textContent = `${displayCost} Gloire`;
    }
    if (productionSpan) productionSpan.textContent = `${formatNumber(totalGain)}/s`;
    if (ownershipSpan) ownershipSpan.textContent = `Possédé : ${building.count}`;

    // Mettre à jour le tooltip dynamiquement
    element.setAttribute('data-tooltip', getBuildingTooltip(building));
}

// Met à jour tous les boutons de bâtiments
function updateAllBuildingButtons() {
    document.querySelectorAll('.building-item').forEach(element => {
        const buildingId = element.id.replace('building-', '');
        updateBuildingButton(buildingId);
    });
}

// Vérifie les déblocages des bâtiments
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

// Affiche les bâtiments
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

    // Mettre à jour le tooltip au survol
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
        BUILDINGS.forEach(building => {
            if (isBuildingUpgradeAvailable(building.id, threshold)) {
                const thresholdIndex = BUILDING_UPGRADE_THRESHOLDS.indexOf(threshold);
                const color = UPGRADE_COLORS[thresholdIndex];
                const cost = getBuildingUpgradeFixedCost(building.id, threshold);
                
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

    // Animation d'apparition progressive
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

        if (bonus.id === "baguette") {
            // Bonus instantané : 1 minute de production totale
            const oneMinuteProduction = autoGain * 60;
            score += oneMinuteProduction;
            showToast(`✅ ${bonus.name} : +${formatNumber(oneMinuteProduction)} Gloire !`);
        } 
        else if (bonus.id === "croissant") {
            // Bonus multiplicateur x10 pendant 30 secondes
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

            showToast(`✅ ${bonus.name} : ×${bonus.multiplier} Gloire/s pendant ${bonus.duration/1000}s`);

            setTimeout(() => {
                activeRandomBonuses = activeRandomBonuses.filter(b => b.id !== bonus.id);
                autoMultipliers = autoMultipliers.filter(m => m !== bonus.multiplier);
                updateAutoMultiplier();
                updateDisplay();
                showToast(`⏰ ${bonus.name} expiré`);
            }, bonus.duration);
        }

        setTimeout(() => bonusElement.remove(), 500);
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
    
    // Appliquer le multiplicateur de clic
    const totalPoints = basePoints * clickMultiplier;

    score += totalPoints;
    clickGloireTotal += basePoints;

    showClickEffect(Math.round(totalPoints));

    // Récupérer la position du clic
    const medal = document.getElementById('medal');
    const medalRect = medal.getBoundingClientRect();
    medal.style.transform = 'scale(0.95)';
    setTimeout(() => { medal.style.transform = 'scale(1)'; }, 100);

    updateDisplay();
    saveGame();
    updateAllBuildingButtons();
    renderUpgrades();
    checkBuildingUnlocks();
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

// Pluie de médaillons
function gameLoop() {
    let totalGain = 0;

    BUILDINGS.forEach(building => {
        const buildingGain = calculateBuildingGain(building);
        totalGain += buildingGain;

        if (building.count > 0) {
            // Ajouter la production réelle à chaque itération (gameLoop tourne 10x/seconde, donc *0.1 = /10)
            totalGeneratedByBuilding[building.id] = (totalGeneratedByBuilding[building.id] || 0) + (buildingGain * 0.1);
        }
    });

    autoGain = totalGain;
    score += autoGain / 10;

    if (Date.now() - lastBuildingsUpdate > 500) { lastBuildingsUpdate = Date.now(); updateAllBuildingButtons(); }
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

    BUILDINGS.forEach(building => {
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
    document.getElementById('gain-value').textContent = formatNumber(autoGain);
    updateBonusTimer();
}

// Met à jour l'affichage du timer des bonus actifs
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
    
    timerElement.textContent = `⏳ x${bonus.multiplier} (${seconds}s)`;
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
