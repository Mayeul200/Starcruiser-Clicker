// ============================================
// STARSHIP CLICKER - MAIN SCRIPT
// Version 2.0.0
// ============================================

// ============================================
// GLOBAL TOOLTIP
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
// GLOBAL CONSTANTS
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
// GAME DATA
// ============================================

// ============================================
// ============================================
// ROCKET_PARTS avec tailles proportionnelles
// Hauteur totale: 454px (centrée verticalement)
// ============================================
const ROCKET_PARTS = [
    { id: "workshop", name: "Atelier", description: "Fabrique des pieces: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 10, gain: 0.1, count: 0, image: "\ud83d\udee0\ufe0f", imgPath: "images/rocket/workshop.png", x: 20, y: 555, width: 220, height: 220, order: 1, unlockCondition: () => true, totalGenerated: 0 },
    { id: "nozzles", name: "Tuyères", description: "Propulsion: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 100, gain: 1, count: 0, image: "\ud83c\udfaf", imgPath: "images/rocket/nozzles.PNG", x: 50, y: 646, width: 40, height: 20, order: 2, unlockCondition: () => score >= 50, totalGenerated: 0 },
    { id: "engines", name: "Moteurs", description: "Moteurs principaux: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 1000, gain: 10, count: 0, image: "\ud83d\udd25", imgPath: "images/rocket/engines.png", x: 50, y: 595, width: 40, height: 51, order: 3, unlockCondition: () => score >= 500, totalGenerated: 0 },
    { id: "fuel-tank", name: "Réservoir", description: "Carburant: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 10000, gain: 100, count: 0, image: "\u26fd", imgPath: "images/rocket/fuel-tank.png", x: 50, y: 537, width: 40, height: 58, order: 4, unlockCondition: () => score >= 5000, totalGenerated: 0 },
    { id: "rocket-body", name: "Corps", description: "Structure: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 100000, gain: 1000, count: 0, image: "\ud83d\udfeb", imgPath: "images/rocket/body.png", x: 50, y: 337, width: 40, height: 200, order: 5, unlockCondition: () => score >= 25000, totalGenerated: 0 },
    { id: "boosters-left", name: "Boosters Gauche", description: "Propulsion supplémentaire: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 1000000, gain: 10000, count: 0, image: "\ud83d\ude80", imgPath: "images/rocket/boosters-left.png", x: 45.8, y: 373, width: 50, height: 300, order: 6, unlockCondition: () => score >= 100000, totalGenerated: 0 },
    { id: "boosters-right", name: "Boosters Droit", description: "Propulsion supplémentaire: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 1000000, gain: 10000, count: 0, image: "\ud83d\ude80", imgPath: "images/rocket/boosters-right.png", x: 54.2, y: 373, width: 50, height: 300, order: 6, unlockCondition: () => score >= 100000, totalGenerated: 0 },
    { id: "cockpit", name: "Cockpit", description: "Poste de pilotage: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 10000000, gain: 100000, count: 0, image: "\ud83d\udc68\u200d\ud83d\ude80", imgPath: "images/rocket/cockpit.png", x: 50, y: 292, width: 45, height: 45, order: 7, unlockCondition: () => score >= 1000000, totalGenerated: 0 },
    { id: "shield", name: "Bouclier", description: "Protection: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 100000000, gain: 1000000, count: 0, image: "\ud83d\udee1\ufe0f", imgPath: "images/rocket/shield.png", x: 50, y: 233, width: 45, height: 59, order: 8, unlockCondition: () => score >= 10000000, totalGenerated: 0 },
    { id: "launch-pad", name: "Pas de tir", description: "Lancement: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 1000000000, gain: 10000000, count: 0, image: "\ud83d\ude80", imgPath: "images/rocket/launch-pad.png",x: 60.2, y: 205, width: 190, height: 481, order: 9, unlockCondition: () => score >= 100000000, totalGenerated: 0 },
    { id: "astronaut", name: "Astronaute", description: "Pilote: +{gain} Parts/s\n% de la production: {percent}%\nTotal genere: {total} Parts", baseCost: 10000000000, gain: 100000000, count: 0, image: "\ud83d\udc69\u200d\ud83d\ude80", imgPath: "images/rocket/astronaut.png", x: 40, y: 635, width: 25, height: 60, order: 10, unlockCondition: () => score >= 1000000000, totalGenerated: 0 },
];

// Alias pour compatibilité
const BUILDINGS = ROCKET_PARTS;




const CLICK_UPGRADES = [
    { threshold: 50, name: "Basic Launch", cost: 50 },
    { threshold: 100, name: "Precise Click", cost: 100 },
    { threshold: 250, name: "Powerful Launch", cost: 250 },
    { threshold: 500, name: "Expert Engineer", cost: 500 },
    { threshold: 1000, name: "Rocket Scientist", cost: 1000 },
    { threshold: 2500, name: "Space Pioneer", cost: 2500 },
    { threshold: 5000, name: "Galactic Click", cost: 5000 },
    { threshold: 10000, name: "Cosmic Master", cost: 10000 },
    { threshold: 25000, name: "Interstellar Power", cost: 25000 },
    { threshold: 50000, name: "Universal Click", cost: 50000 }
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
    { id: "meteor", symbol: "🌠", name: "Meteor Shower", effect: "instant", type: "meteor", colorClass: "meteor" },
    { id: "flare", symbol: "☀️", name: "Solar Flare", effect: "multiplier", type: "flare", multiplier: 10, duration: 30000, colorClass: "flare" }
];

const SAVE_VERSION = "2.0.0";

// ============================================
// TROPH\u0009ES
// ============================================
const TROPHIES = [
    // Parts per second milestones
    { id: "pps-1", name: "First Parts", description: "Reach 1 Parts per second", icon: "🚀", threshold: 1, type: "pps", unlocked: false },
    { id: "pps-10", name: "Liftoff", description: "Reach 10 Parts per second", icon: "🚀", threshold: 10, type: "pps", unlocked: false },
    { id: "pps-100", name: "Orbit Achieved", description: "Reach 100 Parts per second", icon: "🛰️", threshold: 100, type: "pps", unlocked: false },
    { id: "pps-1000", name: "Space Speed", description: "Reach 1,000 Parts per second", icon: "💨", threshold: 1000, type: "pps", unlocked: false },
    { id: "pps-10000", name: "Galactic Speed", description: "Reach 10,000 Parts per second", icon: "🌌", threshold: 10000, type: "pps", unlocked: false },
    { id: "pps-100000", name: "Warp Speed", description: "Reach 100,000 Parts per second", icon: "⚡", threshold: 100000, type: "pps", unlocked: false },
    { id: "pps-1000000", name: "Light Speed", description: "Reach 1,000,000 Parts per second", icon: "💫", threshold: 1000000, type: "pps", unlocked: false },
    
    // Building upgrades
    { id: "first-upgrade", name: "First Upgrade", description: "Buy your first building upgrade", icon: "🪚", threshold: 1, type: "building-upgrade", unlocked: false },
    { id: "five-upgrades", name: "Upgrade Master", description: "Have 5 building upgrades", icon: "👷‍♂️", threshold: 5, type: "building-upgrade", unlocked: false },
    { id: "ten-upgrades", name: "Engineering Genius", description: "Have 10 building upgrades", icon: "👨‍🔬", threshold: 10, type: "building-upgrade", unlocked: false },
    { id: "twenty-upgrades", name: "Upgrade Legend", description: "Have 20 building upgrades", icon: "🏆", threshold: 20, type: "building-upgrade", unlocked: false },
    
    // Click upgrades
    { id: "first-click-upgrade", name: "First Launch", description: "Buy your first click upgrade", icon: "🚀", threshold: 1, type: "click-upgrade", unlocked: false },
    { id: "all-click-upgrades", name: "Launch Master", description: "Unlock all click upgrades", icon: "👨‍🚀", threshold: CLICK_UPGRADES.length, type: "click-upgrade", unlocked: false },
    
    // Buildings
    { id: "first-building", name: "First Component", description: "Buy your first building", icon: "⚙️", threshold: 1, type: "building", unlocked: false },
    { id: "ten-buildings", name: "Space Builder", description: "Own 10 buildings in total", icon: "🏗️", threshold: 10, type: "building", unlocked: false },
    { id: "hundred-buildings", name: "Space Architect", description: "Own 100 buildings in total", icon: "🏭", threshold: 100, type: "building", unlocked: false },
    { id: "thousand-buildings", name: "Galactic Builder", description: "Own 1,000 buildings in total", icon: "🌌", threshold: 1000, type: "building", unlocked: false },
    
    // Total score
    { id: "score-1000", name: "Small Start", description: "Reach 1,000 Parts", icon: "🪐", threshold: 1000, type: "score", unlocked: false },
    { id: "score-1000000", name: "Millionaire", description: "Reach 1,000,000 Parts", icon: "💰", threshold: 1000000, type: "score", unlocked: false },
    { id: "score-1000000000", name: "Billionaire", description: "Reach 1,000,000,000 Parts", icon: "💎", threshold: 1000000000, type: "score", unlocked: false },
    
    // Bonus
    { id: "first-bonus", name: "First Bonus", description: "Click your first random bonus", icon: "🌠", threshold: 1, type: "bonus", unlocked: false },
    { id: "ten-bonuses", name: "Bonus Hunter", description: "Click 10 random bonuses", icon: "🎯", threshold: 10, type: "bonus", unlocked: false },
    
    // Special
    { id: "all-buildings", name: "Space Collector", description: "Unlock all building types", icon: "🌌", threshold: BUILDINGS.length, type: "building-types", unlocked: false }
];

// ============================================
// GLOBAL VARIABLES
// ============================================
let score = 0;
let partsPerSecond = 0;
let autoMultiplier = 1;
let clickMultiplier = 1;
let activeRandomBonuses = [];
let autoMultipliers = [1];
let clickMultipliers = [1];
let buildingUpgrades = {};
let buildingUpgradeCosts = {};
let totalPartsFromClicks = 0;
let activatedClickUpgrades = [];
let unlockedBuildings = new Set();
let totalGeneratedByBuilding = {};
let lastSaveTime = 0;
let lastBuildingsUpdate = 0;
let gameStartTime = 0;
let buyMultiplier = 1;
let clickedBonusesCount = 0;
let unlockedTrophies = new Set();

// ============================================
// ROCKET LAUNCH SYSTEM (Prestige)
// ============================================
let maxDistance = 0;
let prestigeMultiplier = 1;
let rocketsLaunched = 0;
let lastLaunchDistance = 0;


// ============================================
// ROCKET CONSTRUCTION DATA
// ============================================
const ROCKET_PART_POSITIONS = {
    'nozzles': { position: 'bottom', emoji: '⛽', name: 'Tuyères', class: 'rocket-engine' },
    'engines': { position: 'bottom', emoji: '⛽', name: 'Moteurs', class: 'rocket-engine' },
    'fuel-tank': { position: 'middle', emoji: '⛽', name: 'Réservoir', class: 'rocket-body' },
    'rocket-body': { position: 'middle', emoji: '⛽', name: 'Corps', class: 'rocket-body' },
    'wings': { position: 'sides', emoji: '✈️', name: 'Stabilisateurs', class: 'rocket-wings' },
    'cockpit': { position: 'top', emoji: '♁', name: 'Cockpit', class: 'rocket-nose' },
    'shield': { position: 'top', emoji: '♁', name: 'Bouclier', class: 'rocket-nose' },
    'launch-pad': { position: 'bottom', emoji: '♁', name: 'Pas de tir', class: 'rocket-engine' },
    'astronaut': { position: 'top', emoji: '♁', name: 'Astronaute', class: 'rocket-nose' }
};

// Track which parts have been unlocked/built
let rocketPartsBuilt = new Set();

let isLaunching = false;

// ============================================
// SPACE MAP SYSTEM (Planets & Bonuses)
// ============================================
const PLANETS = [
    { id: 'earth', name: 'Earth', emoji: '\uD83C\uDF0D', distanceRequired: 0, bonusPercent: 0, color: '#10b981', imgPath: 'images/planets/earth.png' },
    { id: 'moon', name: 'Moon', emoji: '\uD83D\uDD11', distanceRequired: 384000, bonusPercent: 1, color: '#a9a9a9', imgPath: 'images/planets/moon.png' },
    { id: 'mars', name: 'Mars', emoji: '\u2642', distanceRequired: 225000000, bonusPercent: 2, color: '#ef4444', imgPath: 'images/planets/mars.png' },
    { id: 'neptune', name: 'Neptune', emoji: '\u2645', distanceRequired: 4500000000, bonusPercent: 3, color: '#06b6d4', imgPath: 'images/planets/neptune.png' },
    { id: 'pluto', name: 'Pluto', emoji: '\u2646', distanceRequired: 5900000000, bonusPercent: 5, color: '#8b5cf6', imgPath: 'images/planets/pluto.png' },
    { id: 'oort-cloud', name: 'Oort Cloud', emoji: '\u2728', distanceRequired: 9461000000000, bonusPercent: 8, color: '#f59e0b', imgPath: 'images/planets/oort-cloud.png' },
    { id: 'proxima-centauri', name: 'Proxima Centauri', emoji: '\u2609', distanceRequired: 40130000000000, bonusPercent: 12, color: '#10b981', imgPath: 'images/planets/proxima-centauri.png' },
    { id: 'sirius', name: 'Sirius', emoji: '\u2609', distanceRequired: 81400000000000, bonusPercent: 15, color: '#3b82f6', imgPath: 'images/planets/sirius.png' },
    { id: 'milky-way-center', name: 'Milky Way Center', emoji: '\uD83C\uDF0C', distanceRequired: 246000000000000, bonusPercent: 20, color: '#fbbf24', imgPath: 'images/planets/milky-way-center.png' },
    { id: 'andromeda', name: 'Andromeda', emoji: '\uD83C\uDF0C', distanceRequired: 23650000000000000, bonusPercent: 25, color: '#ec4899', imgPath: 'images/planets/andromeda.png' },
    { id: 'virgo-cluster', name: 'Virgo Cluster', emoji: '\u2728', distanceRequired: 51300000000000000, bonusPercent: 30, color: '#a855f7', imgPath: 'images/planets/virgo-cluster.png' }
];

let unlockedPlanets = new Set();
let planetBonuses = {}; // {planetId: bonusMultiplier}

// ============================================
// UTILITY FUNCTIONS
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
    const percent = partsPerSecond > 0 ? ((totalGain / partsPerSecond) * 100).toFixed(2) : 0;
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
// SAVE / LOAD
// ============================================

function saveGame() {
    const saveData = {
        score: score,
        partsPerSecond: partsPerSecond,
        autoMultiplier: autoMultiplier,
        clickMultiplier: clickMultiplier,
        totalPartsFromClicks: totalPartsFromClicks,
        activatedClickUpgrades: [...activatedClickUpgrades],
        unlockedBuildings: Array.from(unlockedBuildings),
        autoMultipliers: [...autoMultipliers],
        clickMultipliers: [...clickMultipliers],
        buildingUpgrades: {},
        buildingUpgradeCosts: {},
        totalGeneratedByBuilding: {},
        clickedBonusesCount: clickedBonusesCount,
        unlockedTrophies: Array.from(unlockedTrophies),
        maxDistance: maxDistance,
        prestigeMultiplier: prestigeMultiplier,
        rocketsLaunched: rocketsLaunched,
        unlockedPlanets: Array.from(unlockedPlanets),
        planetBonuses: {...planetBonuses},
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

    localStorage.setItem('starshipClickerSave', JSON.stringify(saveData));
    lastSaveTime = Date.now();
}

function loadGame() {
    const saveData = localStorage.getItem('starshipClickerSave');
    if (!saveData) return;

    try {
        const parsed = JSON.parse(saveData);

        if (parsed.version && parsed.version !== SAVE_VERSION) {
            console.warn("Version de sauvegarde différente, migration possible");
        }

        // Charger les variables principales
        score = parsed.score || 0;
        partsPerSecond = parsed.partsPerSecond || parsed.autoGain || 0;
        autoMultiplier = parsed.autoMultiplier || 1;
        clickMultiplier = parsed.clickMultiplier || 1;
        totalPartsFromClicks = parsed.totalPartsFromClicks || parsed.clickPartsTotal || 0;
        clickedBonusesCount = parsed.clickedBonusesCount || 0;
        unlockedTrophies = new Set(parsed.unlockedTrophies || []);
        
        // Charger le système de prestige
        maxDistance = parsed.maxDistance || 0;
        prestigeMultiplier = parsed.prestigeMultiplier || 1;
        rocketsLaunched = parsed.rocketsLaunched || 0;
        
        activatedClickUpgrades = parsed.activatedClickUpgrades || [];
        unlockedBuildings = new Set(parsed.unlockedBuildings || []);
        gameStartTime = parsed.gameStartTime || 0;

        // Charger les multiplicateurs
        autoMultipliers = parsed.autoMultipliers || [1];
        clickMultipliers = parsed.clickMultipliers || [1];
        updateAutoMultiplier();
        updateClickMultiplier();

        // Charger les upgrades des buildings
        if (parsed.buildingUpgrades) {
            for (const buildingId in parsed.buildingUpgrades) {
                buildingUpgrades[buildingId] = [...parsed.buildingUpgrades[buildingId]];
            }
        }

        // Charger les coûts fixes des upgrades
        if (parsed.buildingUpgradeCosts) {
            for (const buildingId in parsed.buildingUpgradeCosts) {
                buildingUpgradeCosts[buildingId] = {...parsed.buildingUpgradeCosts[buildingId]};
            }
        }

        // Charger le total généré par building
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

        // Charger les comptes des buildings
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
        localStorage.removeItem('starshipClickerSave');
        showToast("\u26a0\ufe0f Sauvegarde corrompue. Nouvelle partie.");
    }
}

function exportSave() {
    const saveData = localStorage.getItem('starshipClickerSave');
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
            localStorage.setItem('starshipClickerSave', importText);
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
    if (confirm("\u26a0\ufe0f Delete la sauvegarde ? Tous vos progrès seront PERDUS !")) {
        deleteSave();
    }
}

function deleteSave() {
    localStorage.removeItem('starshipClickerSave');
    showToast("\ud83d\uddd1\ufe0f Supprimé !");
    setTimeout(() => window.location.reload(), 1000);
}

// ============================================
// BUILDINGS MANAGEMENT
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
        updateConstructionScene();
        saveGame();
        hideTooltip();
        updateAllBuildingButtons();
        renderUpgrades();
        checkBuildingUnlocks();
        const maxText = buyMultiplier === 'max' ? ' (Max)' : '';
        showToast(`\u2705 +${buildingsToBuy} ${building.name}${maxText}`);
        // Mettre à jour la scène de construction
        updateConstructionScene();
        // Mettre à jour la construction de la fusée
        if (building.count === buildingsToBuy) {
            highlightNewRocketPart(building.id);
        } else {
            updateRocketConstruction();
        }
        checkTrophies();
    } else {
        showToast("\u274c Pas assez de Parts");
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
        showToast("\u2705 Already activated!");
        return;
    }
    
    if (score < upgrade.cost) {
        showToast("\u274c Pas assez de Parts");
        return;
    }
    
    score -= upgrade.cost;
    activatedClickUpgrades.push(threshold);
    updateDisplay();
    saveGame();
    hideTooltip();
    renderUpgrades();
    updateAllBuildingButtons();
    showToast(`\u2705 ${upgrade.name} activated`);
}

function buyBuildingUpgrade(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building || !isBuildingUpgradeAvailable(buildingId, threshold)) return;
    
    const cost = getBuildingUpgradeFixedCost(buildingId, threshold);
    
    if (score < cost) {
        showToast("\u274c Pas assez de Parts");
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
    checkTrophies();
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
        button.textContent = `${displayCost} Parts`;
    }
    if (productionSpan) productionSpan.textContent = `${formatNumber(totalGain)}/s`;
    if (ownershipDiv) ownershipDiv.textContent = `Owned: ${building.count}`;

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
    buildingElement.className = 'building-item ' + building.id + (building.count === 0 ? ' not-purchased' : '');
    buildingElement.id = `building-${building.id}`;
    buildingElement.setAttribute('data-tooltip', getBuildingTooltip(building));

    // Créer la structure avec l'image du bâtiment en arrière-plan
    const imageUrl = building.imgPath || '';
    const imageHtml = imageUrl ? `<img src="${imageUrl}" class="building-image" alt="${building.name}" width="${building.width || 84}" height="${building.height || 84}">` : '';

    buildingElement.innerHTML = `
        <div class="building-left">
            <div class="building-name-icon">
                <span class="building-name">${building.name}</span>
            </div>
            <div class="building-ownership">
                Owned: ${building.count}
            </div>
        </div>
        <div class="building-center">
            ${imageHtml}
        </div>
        <div class="building-right">
            <button onclick="buyBuilding('${building.id}')" ${!isAffordable ? 'disabled' : ''}>
                ${formatNumber(currentCost)} Parts
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
// ROCKET LAUNCH SYSTEM
// ============================================

function checkRocketReady() {
    // Vérifier si toutes les pièces sont débloquées (count > 0)
    return ROCKET_PARTS.every(part => part.count > 0);
}

function calculateDistance() {
    // Calculer la distance basée sur le score et le nombre de pièces
    const partsUnlocked = ROCKET_PARTS.filter(part => part.count > 0).length;
    const totalScore = Math.max(score, 0) + 1; // Éviter les valeurs négatives
    const logDistance = Math.log(totalScore) * 1000;
    const partsBonus = partsUnlocked * 100;
    const baseDistance = Math.floor(logDistance + partsBonus);
    
    // S'assurer que prestigeMultiplier est un nombre valide
    const multiplier = isNaN(prestigeMultiplier) ? 1 : prestigeMultiplier;
    
    return baseDistance * multiplier;
}

function getCurrentDistance() {
    // Retourne la dernière distance calculée au lancement
    return lastLaunchDistance;
}

function launchRocket() {
    if (!checkRocketReady()) {
        showToast("❌ Fusée pas encore prête ! Il manque des pièces.");
        return;
    }
    
    if (isLaunching) {
        showToast("⏳ Lancement en cours...");
        return;
    }
    
    isLaunching = true;
    
    // Calculer la distance
    const distance = calculateDistance();
    
    // Animation de lancement (à améliorer plus tard)
    const medal = document.getElementById('medal');
    medal.style.transform = 'scale(0.8)';
    medal.style.transition = 'transform 0.5s';
    
    setTimeout(() => {
        medal.style.transform = 'translateY(-200px) scale(1.5)';
        medal.style.opacity = '0';
        medal.style.transition = 'all 2s';
    }, 500);
    
    // Après l'animation, afficher la carte spatiale AVANT le reset
    setTimeout(() => {
        medal.style.transform = 'scale(1)';
        medal.style.opacity = '1';
        medal.style.transition = 'none';
        
        // Afficher la carte spatiale avec la progression
        lastLaunchDistance = distance;
        showSpaceMap(distance);
        updateSpaceProgress();
        updateRocketConstruction();
        isLaunching = false;
        showToast(`🚀 Mission réussie ! Distance: ${formatNumber(distance)} km`);
    }, 2500);
}

function showLaunchResults(distance) {
    const modal = document.getElementById('launch-results-modal');
    const distanceElement = document.getElementById('launch-results-distance');
    const multiplierElement = document.getElementById('launch-results-multiplier');
    const rocketsElement = document.getElementById('launch-results-rockets');
    
    // Protéger contre NaN et undefined
    const safeDistance = isNaN(distance) || distance === undefined ? 0 : distance;
    const safeMultiplier = isNaN(prestigeMultiplier) || prestigeMultiplier === undefined ? 1 : prestigeMultiplier;
    const safeRockets = rocketsLaunched === undefined ? 0 : rocketsLaunched;
    
    distanceElement.textContent = formatNumber(safeDistance) + ' km';
    multiplierElement.textContent = safeMultiplier.toFixed(2);
    rocketsElement.textContent = safeRockets;
    
    modal.classList.add('active');
}

function closeLaunchResults() {
    document.getElementById('launch-results-modal').classList.remove('active');
}

// ============================================
// SPACE MAP FUNCTIONS
// ============================================

function calculatePlanetProgress(distance) {
    // Trouver quelle planète on atteint et le pourcentage entre les planètes
    let currentPlanetIndex = -1;
    let nextPlanetIndex = -1;
    let progressPercent = 0;

    for (let i = PLANETS.length - 1; i >= 0; i--) {
        if (distance >= PLANETS[i].distanceRequired) {
            currentPlanetIndex = i;
            break;
        }
    }

    if (currentPlanetIndex === -1) {
        // Pas encore atteint la Lune
        return {
            currentPlanet: null,
            nextPlanet: PLANETS[0],
            progressPercent: Math.round((distance / PLANETS[0].distanceRequired) * 100)
        };
    }

    if (currentPlanetIndex === PLANETS.length - 1) {
        // Amas de la Vierge atteint (max)
        return {
            currentPlanet: PLANETS[currentPlanetIndex],
            nextPlanet: null,
            progressPercent: 100
        };
    }

    // Calculer le progrès vers la prochaine planète
    const currentPlanet = PLANETS[currentPlanetIndex];
    const nextPlanet = PLANETS[currentPlanetIndex + 1];
    const distanceBetween = nextPlanet.distanceRequired - currentPlanet.distanceRequired;
    const distanceFromCurrent = distance - currentPlanet.distanceRequired;
    progressPercent = Math.round((distanceFromCurrent / distanceBetween) * 100);

    return {
        currentPlanet: currentPlanet,
        nextPlanet: nextPlanet,
        progressPercent: progressPercent
    };
}

function getNextTwoPlanets(distance) {
    // Retourne uniquement les 2 prochaines planètes à atteindre
    const progress = calculatePlanetProgress(distance);
    const currentIndex = progress.currentPlanet ? PLANETS.findIndex(p => p.id === progress.currentPlanet.id) : -1;
    
    let nextPlanets = [];
    
    if (currentIndex === -1) {
        // Pas encore atteint la Lune, afficher Lune et Mars
        nextPlanets = [PLANETS[0], PLANETS[1]];
    } else if (currentIndex >= PLANETS.length - 2) {
        // A atteint ou dépassé l'avant-dernière planète
        nextPlanets = [PLANETS[PLANETS.length - 2], PLANETS[PLANETS.length - 1]];
    } else {
        // Afficher la planète actuelle et la prochaine
        nextPlanets = [PLANETS[currentIndex], PLANETS[currentIndex + 1]];
    }
    
    return nextPlanets;
}

function checkNewPlanetsUnlocked(distance) {
    const newlyUnlocked = [];
    
    PLANETS.forEach(planet => {
        if (distance >= planet.distanceRequired && !unlockedPlanets.has(planet.id)) {
            unlockedPlanets.add(planet.id);
            planetBonuses[planet.id] = planet.bonusPercent / 100;
            newlyUnlocked.push(planet);
        }
    });
    
    return newlyUnlocked;
}

function getTotalPlanetBonus() {
    let total = 1;
    Object.values(planetBonuses).forEach(bonus => {
        total += bonus;
    });
    return total;
}

function showSpaceMap(distance) {
    const modal = document.getElementById('space-map-modal');
    const mapContainer = document.getElementById('space-map-container');
    const progressText = document.getElementById('space-progress-text');
    const newUnlocksContainer = document.getElementById('new-planets-unlocked');
    
    // Calculer la progression
    const progress = calculatePlanetProgress(distance);
    
    // Mettre à jour le texte de progression
    if (progress.currentPlanet) {
        if (progress.nextPlanet) {
            progressText.innerHTML = `Tu as atteint <strong>${progress.currentPlanet.emoji} ${progress.currentPlanet.name}</strong> ! En route vers ${progress.nextPlanet.emoji} ${progress.nextPlanet.name} (${progress.progressPercent}%)`;
        } else {
            progressText.innerHTML = `F\u00e9licitations ! Tu as atteint <strong>${progress.currentPlanet.emoji} ${progress.currentPlanet.name}</strong>, la dernière planète !`;
        }
    } else {
        progressText.innerHTML = `En route vers <strong>${progress.nextPlanet.emoji} ${progress.nextPlanet.name}</strong> (${progress.progressPercent}%)`;
    }
    
    // Vérifier les nouvelles planètes débloquées
    const newlyUnlocked = checkNewPlanetsUnlocked(distance);
    
    // Afficher les nouvelles planètes débloquées
    newUnlocksContainer.innerHTML = '';
    if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(planet => {
            const planetElement = document.createElement('div');
            planetElement.className = 'new-planet-item';
            planetElement.innerHTML = `
                <span class="planet-emoji">${planet.emoji}</span>
                <span class="planet-name">${planet.name}</span>
                <span class="planet-bonus">+${planet.bonusPercent}% Parts/s</span>
            `;
            planetElement.style.borderColor = planet.color;
            planetElement.style.color = planet.color;
            newUnlocksContainer.appendChild(planetElement);
        });
    } else {
        newUnlocksContainer.innerHTML = '<p class="no-new-planets">Aucune nouvelle planète débloquée</p>';
    }
    
    // Dessiner la carte de l'espace
    drawSpaceMap(distance);
    
    // Afficher le modal
    modal.classList.add('active');
}

function drawSpaceMap(distance) {
    const container = document.getElementById('space-map-container');
    const progress = calculatePlanetProgress(distance);
    
    container.innerHTML = '';
    
    PLANETS.forEach((planet, index) => {
        const planetElement = document.createElement('div');
        planetElement.className = 'space-planet';
        
        const isUnlocked = unlockedPlanets.has(planet.id) || distance >= planet.distanceRequired;
        const isCurrent = progress.currentPlanet && progress.currentPlanet.id === planet.id;
        const isNext = progress.nextPlanet && progress.nextPlanet.id === planet.id;
        
        let className = 'space-planet';
        if (isUnlocked) className += ' unlocked';
        if (isCurrent) className += ' current';
        if (isNext) className += ' next';
        
        planetElement.className = className;
        
        // Utiliser l'image si disponible, sinon l'emoji
        let planetHtml = '';
        if (planet.imgPath) {
            planetHtml = `<img src="${planet.imgPath}" class="planet-image" alt="${planet.name}" style="width: 40px; height: 40px;">`;
        } else {
            planetHtml = `<span class="planet-emoji">${planet.emoji}</span>`;
        }
        
        planetElement.innerHTML = `
            ${planetHtml}
            <span class="planet-name">${planet.name}</span>
            <span class="planet-distance">${formatNumber(planet.distanceRequired)} km</span>
        `;
        
        planetElement.style.setProperty('--planet-color', planet.color);
        
        // Positionner les planètes (layout horizontal)
        const position = (index / (PLANETS.length - 1)) * 100;
        planetElement.style.left = `${position}%`;
        
        // Ajouter la ligne de connexion (sauf pour la dernière)
        if (index < PLANETS.length - 1) {
            const nextPlanet = PLANETS[index + 1];
            const isNextUnlocked = unlockedPlanets.has(nextPlanet.id) || distance >= nextPlanet.distanceRequired;
            
            const line = document.createElement('div');
            line.className = 'space-connection';
            if (isUnlocked && isNextUnlocked) {
                line.classList.add('active');
            }
            line.style.left = `${position}%`;
            line.style.width = `${100 / (PLANETS.length - 1)}%`;
            container.appendChild(line);
        }
        
        container.appendChild(planetElement);
    });
    
    // Ajouter le vaisseau spatial
    if (progress.currentPlanet || progress.progressPercent > 0) {
        const spaceship = document.createElement('div');
        spaceship.className = 'spaceship';
        spaceship.innerHTML = '\u{1F680}';
        
        // Calculer la position du vaisseau
        let shipPosition = 0;
        if (progress.currentPlanet) {
            const currentIndex = PLANETS.findIndex(p => p.id === progress.currentPlanet.id);
            const nextIndex = currentIndex + 1;
            
            if (nextIndex < PLANETS.length && progress.nextPlanet) {
                // Entre deux planètes
                const startPos = (currentIndex / (PLANETS.length - 1)) * 100;
                const endPos = (nextIndex / (PLANETS.length - 1)) * 100;
                shipPosition = startPos + (endPos - startPos) * (progress.progressPercent / 100);
            } else {
                // Sur la dernière planète
                shipPosition = 100;
            }
        } else {
            // Avant la première planète
            const firstPlanetPos = 0;
            const secondPlanetPos = 100 / (PLANETS.length - 1);
            shipPosition = firstPlanetPos + (secondPlanetPos - firstPlanetPos) * (progress.progressPercent / 100);
        }
        
        spaceship.style.left = `${shipPosition}%`;
        container.appendChild(spaceship);
    }
}

function confirmSpaceMapAndReset() {
    closeSpaceMap();
    
    // Appliquer le reset avec les bonus
    if (lastLaunchDistance > maxDistance) {
        maxDistance = lastLaunchDistance;
    }
    rocketsLaunched++;
    prestigeMultiplier = 1 + (isNaN(maxDistance) ? 0 : maxDistance / 1000000);
    
    // Appliquer les bonus des planètes au prestigeMultiplier
    const planetBonus = getTotalPlanetBonus();
    prestigeMultiplier *= (isNaN(planetBonus) ? 1 : planetBonus);
    
    // Reset du score mais garder les pièces et les bonus
    score = 0;
    BUILDINGS.forEach(b => b.count = 0);
    unlockedBuildings = new Set();
    totalPartsFromClicks = 0;
    activatedClickUpgrades = [];
    buildingUpgrades = {};
    buildingUpgradeCosts = {};
    totalGeneratedByBuilding = {};
    
    updateDisplay();
    saveGame();
    renderBuildings();
    renderUpgrades();
    
    // Afficher le modal de résultats
    showLaunchResults(lastLaunchDistance);
    isLaunching = false;
        updateSpaceProgress();
        updateRocketConstruction();
}

function closeSpaceMap() {
    document.getElementById('space-map-modal').classList.remove('active');
}

// ============================================
// SPACE PROGRESS SIDEBAR UPDATE
// ============================================

function updateSpaceProgress() {
    // Utiliser uniquement la distance du dernier lancement
    const distance = lastLaunchDistance > 0 ? lastLaunchDistance : 0;
    const progress = calculatePlanetProgress(distance);
    
    // Mettre à jour l'affichage de la planète actuelle
    const planetDisplay = document.getElementById('current-planet-display');
    if (planetDisplay) {
        if (progress.currentPlanet) {
            if (progress.nextPlanet) {
                planetDisplay.innerHTML = `${progress.currentPlanet.emoji} ${progress.currentPlanet.name}: ${progress.progressPercent}%`;
            } else {
                planetDisplay.innerHTML = `${progress.currentPlanet.emoji} ${progress.currentPlanet.name}: 100%`;
            }
        } else {
            planetDisplay.innerHTML = `🌌 En route: ${progress.progressPercent}%`;
        }
    }
    
    // Mettre à jour la mini-carte
    updateMiniSpaceMap(distance);
    
    // Mettre à jour les stats
    const sidebarDistance = document.getElementById('sidebar-distance');
    const sidebarBonus = document.getElementById('sidebar-bonus');
    const sidebarPlanets = document.getElementById('sidebar-planets');
    
    if (sidebarDistance) {
        sidebarDistance.textContent = formatNumber(distance) + ' km';
    }
    if (sidebarBonus) {
        const totalBonus = getTotalPlanetBonus();
        sidebarBonus.textContent = 'x' + totalBonus.toFixed(2);
    }
    if (sidebarPlanets) {
        const unlockedCount = unlockedPlanets.size;
        sidebarPlanets.textContent = unlockedCount + '/11';
    }
}

function updateMiniSpaceMap(distance) {
    const container = document.getElementById('mini-space-map');
    if (!container) return;
    
    container.innerHTML = '';
    
    const progress = calculatePlanetProgress(distance);
    const nextTwoPlanets = getNextTwoPlanets(distance);
    
    // Dessiner uniquement les 2 prochaines planètes
    nextTwoPlanets.forEach((planet, index) => {
        const planetElement = document.createElement('div');
        planetElement.className = 'space-planet';
        
        const isUnlocked = unlockedPlanets.has(planet.id) || distance >= planet.distanceRequired;
        const isCurrent = progress.currentPlanet && progress.currentPlanet.id === planet.id;
        
        if (isUnlocked) planetElement.classList.add('unlocked');
        if (isCurrent) planetElement.classList.add('current');
        
        // Utiliser l'image si disponible, sinon l'emoji
        if (planet.imgPath) {
            planetElement.innerHTML = `<img src="${planet.imgPath}" class="planet-image" alt="${planet.name}">`;
        } else {
            planetElement.innerHTML = `<span class="planet-emoji">${planet.emoji}</span>`;
        }
        planetElement.style.setProperty('--planet-color', planet.color);
        
        // Positionner les planètes (0% et 100% pour les 2 prochaines)
        const position = index === 0 ? 0 : 100;
        planetElement.style.left = `${position}%`;
        
        // Ajouter la ligne de connexion entre les 2 planètes
        if (index === 0 && nextTwoPlanets.length > 1) {
            const line = document.createElement('div');
            line.className = 'space-connection';
            const isNextUnlocked = unlockedPlanets.has(nextTwoPlanets[1].id) || distance >= nextTwoPlanets[1].distanceRequired;
            
            if (isUnlocked && isNextUnlocked) {
                line.classList.add('active');
            }
            line.style.left = '0%';
            line.style.width = '100%';
            container.appendChild(line);
        }
        
        container.appendChild(planetElement);
    });
    
    // Ajouter le vaisseau spatial
    if (progress.currentPlanet || progress.progressPercent > 0) {
        const spaceship = document.createElement('div');
        spaceship.className = 'spaceship';
        spaceship.innerHTML = '🚀';
        
        // Calculer la position du vaisseau entre les 2 prochaines planètes
        let shipPosition = 0;
        const nextTwoPlanets = getNextTwoPlanets(distance);
        
        if (nextTwoPlanets.length === 0) {
            shipPosition = 0;
        } else if (nextTwoPlanets.length === 1) {
            // Si une seule planète (dernière), le vaisseau est à la fin
            shipPosition = 100;
        } else {
            // Position entre les 2 planètes
            const firstPlanet = nextTwoPlanets[0];
            const secondPlanet = nextTwoPlanets[1];
            
            if (progress.currentPlanet && progress.currentPlanet.id === secondPlanet.id) {
                shipPosition = 100; // Sur la deuxième planète
            } else if (progress.currentPlanet && progress.currentPlanet.id === firstPlanet.id) {
                // Entre la première et la deuxième
                shipPosition = progress.progressPercent;
            } else {
                // Avant la première planète
                shipPosition = 0;
            }
        }
        
        spaceship.style.left = `${shipPosition}%`;
        container.appendChild(spaceship);
    }
}

// ============================================
// ROCKET CONSTRUCTION FUNCTIONS
// ============================================

function updateRocketConstruction() {
    const rocketBase = document.getElementById('rocket-base');
    if (!rocketBase) return;
    
    // Clear existing parts
    rocketBase.innerHTML = '';
    
    // Add rocket structure
    const rocketStructure = document.createElement('div');
    rocketStructure.className = 'rocket-structure';
    
    // Add each part that has been built (count > 0)
    ROCKET_PARTS.forEach(part => {
        // Skip workshop (it's the atelier, not part of the rocket)
        if (part.id === 'workshop') return;
        
        if (part.count > 0 && !rocketPartsBuilt.has(part.id)) {
            rocketPartsBuilt.add(part.id);
        }
        
        if (rocketPartsBuilt.has(part.id)) {
            const partElement = document.createElement('div');
            partElement.className = 'section-part unlocked';
            partElement.innerHTML = part.image;
            partElement.title = part.name;
            
            // Position based on part type
            if (part.id === 'wings') {
                // Wings go on both sides
                const leftWing = partElement.cloneNode(true);
                leftWing.classList.add('rocket-wings');
                rocketStructure.appendChild(leftWing);
                
                const rightWing = partElement.cloneNode(true);
                rightWing.classList.add('rocket-wings', 'right');
                rocketStructure.appendChild(rightWing);
            } else {
                partElement.classList.add(getRocketPartClass(part.id));
                rocketStructure.appendChild(partElement);
            }
        }
    });
    
    rocketBase.appendChild(rocketStructure);
    
    // Add floating parts list
    addFloatingPartsList();
}

function getRocketPartClass(partId) {
    const positions = {
        'nozzles': 'rocket-engine',
        'engines': 'rocket-engine',
        'fuel-tank': 'rocket-body',
        'rocket-body': 'rocket-body',
        'cockpit': 'rocket-nose',
        'shield': 'rocket-nose',
        'launch-pad': 'rocket-engine',
        'astronaut': 'rocket-nose'
    };
    return positions[partId] || 'rocket-body';
}

function addFloatingPartsList() {
    const rocketBase = document.getElementById('rocket-base');
    if (!rocketBase) return;
    
    // Create floating parts list
    const partsList = document.createElement('div');
    partsList.className = 'rocket-parts-list';
    partsList.style.marginTop = '15px';
    partsList.style.display = 'flex';
    partsList.style.flexWrap = 'wrap';
    partsList.style.gap = '8px';
    partsList.style.justifyContent = 'center';
    
    // Add each built part
    ROCKET_PARTS.forEach(part => {
        if (part.id === 'workshop') return; // Skip workshop
        
        if (rocketPartsBuilt.has(part.id)) {
            const partElement = document.createElement('div');
            partElement.className = 'rocket-part';
            partElement.innerHTML = `
                <span class="part-emoji">${part.image}</span>
                <span class="part-name">${part.name}</span>
                <span class="part-count">x${part.count}</span>
            `;
            partsList.appendChild(partElement);
        }
    });
    
    rocketBase.appendChild(partsList);
}

function highlightNewRocketPart(partId) {
    // Add visual feedback when a new part is bought
    if (partId === 'workshop') return; // Skip workshop
    
    // Update rocket construction display
    updateRocketConstruction();
}




// ============================================
// UPGRADES MANAGEMENT
// ============================================

function renderUpgrades() {
    const container = document.getElementById('upgrades-container');
    container.innerHTML = '';

    // Upgrades de clic
    CLICK_UPGRADES.forEach(upgrade => {
        if (totalPartsFromClicks >= upgrade.threshold && !activatedClickUpgrades.includes(upgrade.threshold)) {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-icon';
            upgradeElement.innerHTML = '\ud83d\udcb0';
            
            upgradeElement.addEventListener('mouseenter', (e) => {
                const rect = e.target.getBoundingClientRect();
                showTooltip(`Multiplies x2 - ${formatNumber(upgrade.cost)} Parts`, rect.left + rect.width/2, rect.top);
            });
            upgradeElement.addEventListener('mouseleave', hideTooltip);
            
            upgradeElement.onclick = () => buyClickUpgrade(upgrade.threshold);
            container.appendChild(upgradeElement);
        }
    });
    
    // Upgrades de buildings
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
                    showTooltip(`Multiplies x2 - ${formatNumber(cost)} Parts`, rect.left + rect.width/2, rect.top);
                });
                upgradeElement.addEventListener('mouseleave', hideTooltip);
                
                upgradeElement.onclick = () => buyBuildingUpgrade(building.id, threshold);
                container.appendChild(upgradeElement);
            }
        });
    });
}

// ============================================
// BONUSES MANAGEMENT
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

        if (bonus.id === "meteor") {
            const oneMinuteProduction = partsPerSecond * 60;
            score += oneMinuteProduction;
            showToast(`\u2705 ${bonus.name}: +${formatNumber(oneMinuteProduction)} Parts!`);
        } 
        else if (bonus.id === "flare") {
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

            showToast(`\u2705 ${bonus.name}: ×${bonus.multiplier} Parts/s for ${bonus.duration/1000}s`);

            setTimeout(() => {
                activeRandomBonuses = activeRandomBonuses.filter(b => b.id !== bonus.id);
                autoMultipliers = autoMultipliers.filter(m => m !== bonus.multiplier);
                updateAutoMultiplier();
                updateDisplay();
                showToast(`\u23f0 ${bonus.name} expir\u00e9`);
            }, bonus.duration);
        }

        setTimeout(() => bonusElement.remove(), 500);
        checkTrophies();
    };
}

// ============================================
// VISUAL EFFECTS
// ============================================

function addScore(points) {
    const clickBonus = activatedClickUpgrades.length * 0.01 * partsPerSecond;
    const basePoints = points + clickBonus;
    const totalPoints = basePoints * clickMultiplier;

    score += totalPoints;
    totalPartsFromClicks += basePoints;

    showClickEffect(Math.round(totalPoints));

    const medal = document.getElementById('medal');
    medal.style.transform = 'scale(0.95)';
    setTimeout(() => { medal.style.transform = 'scale(1)'; }, 100);

    updateDisplay();
    saveGame();
    updateAllBuildingButtons();
    renderUpgrades();
    checkBuildingUnlocks();
    checkTrophies();
}

function showClickEffect(value) {
    const container = document.getElementById('click-effects');
    const medal = document.getElementById('medal');
    const medalRect = medal.getBoundingClientRect();
    const centerX = medalRect.left + medalRect.width / 2;
    const centerY = medalRect.top + medalRect.height / 2;

    // Envoyer dans toutes les directions (N, S, E, W) depuis le centre
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;  // 50-150px
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
// MAIN GAME LOOP
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

    partsPerSecond = totalGain;
    score += partsPerSecond / GAME_LOOP_FPS;

    if (Date.now() - lastBuildingsUpdate > BUILDING_UPDATE_INTERVAL_MS) {
        lastBuildingsUpdate = Date.now();
        updateAllBuildingButtons();
    }
    updateDisplay();
        updateSpaceProgress();
        updateRocketConstruction();
    checkBuildingUnlocks();
    checkTrophies();
}

// ============================================
// STATISTICS
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
    const clickBonus = activatedClickUpgrades.length * 0.01 * partsPerSecond;
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

// ============================================
// GESTION DES TROPH\u001aES
// ============================================

function getTotalBuildingUpgrades() {
    let count = 0;
    for (const buildingId in buildingUpgrades) {
        count += buildingUpgrades[buildingId].length;
    }
    return count;
}

function getUnlockedBuildingTypes() {
    return BUILDINGS.filter(b => b.count > 0).length;
}

function checkTrophies() {
    let changed = false;
    
    TROPHIES.forEach(trophy => {
        if (!unlockedTrophies.has(trophy.id)) {
            let unlocked = false;
            
            switch (trophy.type) {
                case 'pps':
                    unlocked = partsPerSecond >= trophy.threshold;
                    break;
                case 'building-upgrade':
                    unlocked = getTotalBuildingUpgrades() >= trophy.threshold;
                    break;
                case 'click-upgrade':
                    unlocked = activatedClickUpgrades.length >= trophy.threshold;
                    break;
                case 'building':
                    unlocked = getTotalBuildingsOwned() >= trophy.threshold;
                    break;
                case 'score':
                    unlocked = score >= trophy.threshold;
                    break;
                case 'bonus':
                    unlocked = clickedBonusesCount >= trophy.threshold;
                    break;
                case 'building-types':
                    unlocked = getUnlockedBuildingTypes() >= trophy.threshold;
                    break;
            }
            
            if (unlocked) {
                unlockedTrophies.add(trophy.id);
                changed = true;
                showToast(`Trophee debloque : ${trophy.name}!`);
            }
        }
    });
    
    return changed;
}

function renderTrophies() {
    const container = document.createElement('div');
    container.style.marginTop = '8px';
    
    const trophiesGrid = document.createElement('div');
    trophiesGrid.style.display = 'grid';
    trophiesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(60px, 1fr))';
    trophiesGrid.style.gap = '8px';
    trophiesGrid.style.marginTop = '8px';
    
    TROPHIES.forEach(trophy => {
        const trophyElement = document.createElement('div');
        trophyElement.className = 'trophy-icon';
        trophyElement.style.width = '50px';
        trophyElement.style.height = '50px';
        trophyElement.style.borderRadius = '50%';
        trophyElement.style.display = 'flex';
        trophyElement.style.alignItems = 'center';
        trophyElement.style.justifyContent = 'center';
        trophyElement.style.fontSize = '1.5rem';
        trophyElement.style.cursor = 'pointer';
        trophyElement.style.position = 'relative';
        trophyElement.style.transition = 'all 0.2s';
        trophyElement.style.border = '2px solid #e2e8f0';
        trophyElement.style.background = '#f8fafc';
        
        if (unlockedTrophies.has(trophy.id)) {
            trophyElement.style.background = '#dbeafe';
            trophyElement.style.borderColor = '#2563eb';
            trophyElement.style.opacity = '1';
        } else {
            trophyElement.style.opacity = '0.4';
            trophyElement.style.filter = 'grayscale(100%)';
        }
        
        trophyElement.innerHTML = trophy.icon;
        
        trophyElement.addEventListener('mouseenter', (e) => {
            const rect = e.target.getBoundingClientRect();
            const name = trophy.name;
            const description = trophy.description;
            const isUnlocked = unlockedTrophies.has(trophy.id);
            const status = isUnlocked ? 'Debloque' : 'Verrouille';
            showTooltip(`${name}\n${description}\n${status}`, rect.left + rect.width/2, rect.top);
        });
        trophyElement.addEventListener('mouseleave', hideTooltip);
        
        trophiesGrid.appendChild(trophyElement);
    });
    
    container.appendChild(trophiesGrid);
    return container;
}

function renderStats() {
    const container = document.getElementById('stats-body');
    container.innerHTML = '';
    container.innerHTML += '<h4 style="margin: 0 0 8px; color: #2563eb; font-size: 1.1rem;">Global Stats</h4>';
    const globalStats = [
        { label: "Current Parts", value: formatNumber(score, true) },
        { label: "Total Parts generated", value: formatNumber(calculateTotalGenerated()) },
        { label: "Parts per second", value: formatNumber(partsPerSecond) },
        { label: "Parts per Click", value: formatNumber(getClickPower()) },
        { label: "Total Buildings Owned", value: formatNumber(getTotalBuildingsOwned()) },
        { label: "Game started", value: getGameDuration() },
        { label: "Bonuses clicked", value: clickedBonusesCount }
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

    container.innerHTML += '<h4 style="margin: 16px 0 8px; color: #2563eb; font-size: 1.1rem;">Upgrades</h4>';
    container.innerHTML += '<h5 style="margin: 8px 0 4px; color: #64748b; font-size: 0.9rem;">Upgrades de Clic:</h5>';
    
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
        statElement.textContent = 'Aucune upgrade de clic';
        container.appendChild(statElement);
    }

    container.innerHTML += '<h5 style="margin: 12px 0 4px; color: #64748b; font-size: 0.9rem;">Upgrades de Buildings:</h5>';
    
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
        statElement.textContent = 'Aucune upgrade de building';
        container.appendChild(statElement);
    }

    container.innerHTML += '<h4 style="margin: 16px 0 8px; color: #2563eb; font-size: 1.1rem;">Trophies</h4>';
    const trophiesSection = renderTrophies();
    container.appendChild(trophiesSection);
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
// DISPLAY
// ============================================

function updateDisplay() {
    document.getElementById('score-value').textContent = formatNumber(score, true);
    document.getElementById('gain-value').textContent = formatNumber(partsPerSecond);
    updateBonusTimer();
}

function updateBonusTimer() {
    const timerElement = document.getElementById('bonus-timer');
    if (!timerElement) return;
    
    const activeBonuses = activeRandomBonuses.filter(b => b.id === 'flare');
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
// INITIALIZATION
// ============================================

function init() {
    initGlobals();
    loadGame();
    
    // ===== DEBUG: DONNER TOUTES LES PIÈCES POUR TESTER =====
    // À SUPPRIMER APRES LES TESTS
    ROCKET_PARTS.forEach(part => {
        part.count = 1;
    });
    
    updateDisplay();
    renderBuildings();
    renderUpgrades();
    checkBuildingUnlocks();
    checkTrophies();
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



// ============================================
// ROCKET CONSTRUCTION SCENE
// ============================================

// Track constructed parts
let constructedParts = new Set();

function updateConstructionScene() {
    const container = document.getElementById('rocket-parts-container');
    if (!container) return;

    // Ne pas vider le conteneur, on va juste ajouter les nouvelles pièces
    // container.innerHTML = '';

    ROCKET_PARTS.forEach(part => {
        // L'atelier s'affiche toujours, les autres pièces si count > 0
        const shouldDisplay = part.id === "workshop" || part.count > 0;
        
        // Vérifier si la pièce existe déjà dans le DOM
        const existingPiece = container.querySelector(`.rocket-piece.${part.id}`);
        
        if (shouldDisplay && !existingPiece) {
            // La pièce n'existe pas encore, la créer
            const piece = document.createElement('div');
            piece.className = `rocket-piece ${part.id}`;
            piece.title = part.name;
            
            // Positionnement en pixels pour empilement parfait
            const x = part.x || 50;
            const y = part.y || 0;
            const width = part.width || 150;
            const height = part.height || 150;
            
            // Appliquer les styles de position
            piece.style.left = x + '%';
            piece.style.top = y + 'px';
            piece.style.width = width + 'px';
            piece.style.height = height + 'px';
            piece.style.zIndex = '3';
            
            // Use image if available, fallback to emoji
            if (part.imgPath) {
                const img = document.createElement('img');
                img.src = part.imgPath;
                img.alt = part.name;
                img.loading = 'lazy';
                piece.appendChild(img);
            } else {
                piece.textContent = part.image;
            }
            
            // Ajouter le label pour l'atelier
            if (part.id === "workshop") {
                const label = document.createElement('span');
                label.className = 'workshop-label';
                label.textContent = part.name;
                piece.appendChild(label);
            }
            
            // Animation de chute depuis le haut
            piece.style.opacity = '0';
            piece.style.transform = 'translate(-50%, -200px) scale(0.8)';
            
            requestAnimationFrame(() => {
                piece.style.transition = 'all 0.6s ease-out';
                piece.style.opacity = '1';
                piece.style.transform = 'translate(-50%, 0) scale(1)';
            });
            
            // Marquer comme construite
            if (!constructedParts.has(part.id)) {
                constructedParts.add(part.id);
                piece.classList.add('new', 'unlocked');
                setTimeout(() => {
                    piece.classList.remove('new');
                }, 600);
            } else {
                piece.classList.add('unlocked');
            }
            
            container.appendChild(piece);
        }
    });
    
    // Check if rocket is complete
    checkRocketComplete();
}

function checkRocketComplete() {
    const allParts = ROCKET_PARTS.filter(p => p.id !== 'workshop');
    const allConstructed = allParts.every(p => constructedParts.has(p.id));
    
    const scene = document.getElementById('construction-scene-100x100');
    if (allConstructed && scene) {
        scene.classList.add('rocket-complete');
        showToast("🚀 Fusée complète ! Prête pour le décollage !");
    } else if (scene) {
        scene.classList.remove('rocket-complete');
    }
}

// Call in buyBuilding
// (À intégrer dans la fonction existante)

// Call in gameLoop
// (À intégrer dans la fonction existante)

// Initialize on start
// (À intégrer dans initGame)
