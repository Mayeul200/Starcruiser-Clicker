#!/usr/bin/env python3
"""
Complete prestige system implementation for Glory of France Clicker
Replaces Starship Clicker with France-themed prestige system
"""

import re

# Lire les fichiers
with open('/workspace/github__Mayeul200__glory-of-france-clicker/script.js', 'r', encoding='utf-8') as f:
    script = f.read()

with open('/workspace/github__Mayeul200__glory-of-france-clicker/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('/workspace/github__Mayeul200__glory-of-france-clicker/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# ============================================
# ÉTAPE 1: Remplacer les bâtiments (25 -> 15 pièces de fusée)
# ============================================

new_buildings = '''const BUILDINGS = [
    { id: "nose-cone", name: "Cône de nez", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 10, gain: 0.1, count: 0, image: "🚀", unlockCondition: () => true, totalGenerated: 0 },
    { id: "cockpit", name: "Cockpit", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 100, gain: 1, count: 0, image: "👨‍🚀", unlockCondition: () => score >= 20, totalGenerated: 0 },
    { id: "crew-capsule", name: "Capsule", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 1000, gain: 10, count: 0, image: "🛸", unlockCondition: () => score >= 500, totalGenerated: 0 },
    { id: "fuel-tank", name: "Réservoir", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 10000, gain: 100, count: 0, image: "⛽", unlockCondition: () => score >= 5000, totalGenerated: 0 },
    { id: "rocket-engine", name: "Moteur", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 50000, gain: 1000, count: 0, image: "🔥", unlockCondition: () => score >= 25000, totalGenerated: 0 },
    { id: "side-booster", name: "Booster", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 100000, gain: 500, count: 0, image: "💥", unlockCondition: () => score >= 50000, totalGenerated: 0 },
    { id: "avionics", name: "Avionique", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 200000, gain: 2000, count: 0, image: "📡", unlockCondition: () => score >= 100000, totalGenerated: 0 },
    { id: "structural-frame", name: "Structure", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 1000000, gain: 10000, count: 0, image: "🏗️", unlockCondition: () => score >= 1000000, totalGenerated: 0 },
    { id: "heat-shield", name: "Bouclier", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 5000000, gain: 50000, count: 0, image: "🛡️", unlockCondition: () => score >= 2000000, totalGenerated: 0 },
    { id: "landing-gear", name: "Train d'atterrissage", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 50000000, gain: 500000, count: 0, image: "✈️", unlockCondition: () => score >= 50000000, totalGenerated: 0 },
    { id: "payload-bay", name: "Soute", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 200000000, gain: 2000000, count: 0, image: "📦", unlockCondition: () => score >= 100000000, totalGenerated: 0 },
    { id: "rcs", name: "RCS", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 1000000000, gain: 10000000, count: 0, image: "🎯", unlockCondition: () => score >= 1000000000, totalGenerated: 0 },
    { id: "solar-panels", name: "Panneaux solaires", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 5000000000, gain: 50000000, count: 0, image: "☀️", unlockCondition: () => score >= 2000000000, totalGenerated: 0 },
    { id: "comm-array", name: "Antenne", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 25000000000, gain: 250000000, count: 0, image: "📡", unlockCondition: () => score >= 10000000000, totalGenerated: 0 },
    { id: "life-support", name: "Support vie", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 500000000000, gain: 5000000000, count: 0, image: "💨", unlockCondition: () => score >= 500000000000, totalGenerated: 0 }
];'''

# Trouver et remplacer la constante BUILDINGS
buildings_start = script.find('const BUILDINGS = [')
buildings_end = script.find('];', buildings_start) + 2
script = script[:buildings_start] + new_buildings + script[buildings_end:]

# ============================================
# ÉTAPE 2: Mettre à jour les seuils et couleurs
# ============================================

new_thresholds = '''const BUILDING_UPGRADE_THRESHOLDS = [1, 5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500];'''

thresholds_start = script.find('const BUILDING_UPGRADE_THRESHOLDS = [')
thresholds_end = script.find('];', thresholds_start) + 2
script = script[:thresholds_start] + new_thresholds + script[thresholds_end:]

new_colors = '''const UPGRADE_COLORS = [
    '#88c9ee', '#66b2ff', '#4499ff', '#2288ff', '#1177ff',
    '#0066ff', '#4444ff', '#6622ff', '#8800ff', '#aa00dd',
    '#cc00bb', '#ee0099', '#ff0077', '#ff0055', '#ff2233'
];'''

colors_start = script.find('const UPGRADE_COLORS = [')
colors_end = script.find('];', colors_start) + 2
script = script[:colors_start] + new_colors + script[colors_end:]

# ============================================
# ÉTAPE 3: Ajouter MISSIONS et PRESTIGE_UPGRADES avant CLICK_UPGRADES
# ============================================

missions = '''const MISSIONS = [
    { id: "suborbital", name: "Vol suborbital", threshold: 10000000, points: 1, description: "Premier vol dans l'espace" },
    { id: "earth-orbit", name: "Orbite terrestre", threshold: 100000000, points: 2, description: "Mise en orbite autour de la Terre" },
    { id: "moon-flyby", name: "Survol lunaire", threshold: 1000000000, points: 3, description: "Passage près de la Lune" },
    { id: "moon-landing", name: "Alunissage", threshold: 10000000000, points: 5, description: "Atterrissage sur la Lune" },
    { id: "mars-orbit", name: "Orbite martienne", threshold: 100000000000, points: 8, description: "Mise en orbite autour de Mars" },
    { id: "mars-landing", name: "Atterrissage Mars", threshold: 1000000000000, points: 12, description: "Atterrissage sur Mars" },
    { id: "asteroid-belt", name: "Ceinture d'astéroïdes", threshold: 10000000000000, points: 18, description: "Exploration de la ceinture d'astéroïdes" },
    { id: "interstellar", name: "Interstellaire", threshold: 100000000000000, points: 25, description: "Premier voyage interstellaire" }
];

const PRESTIGE_UPGRADES = [
    { id: "engine-boost", cost: 1, effect: "production", multiplier: 1.05, name: "Boost Moteur", description: "+5% production" },
    { id: "click-power", cost: 1, effect: "click", multiplier: 1.1, name: "Puissance Clic", description: "+10% par clic" },
    { id: "cost-reduction", cost: 2, effect: "cost", value: 0.02, name: "Réduction Coût", description: "-2% coût bâtiments" },
    { id: "bonus-duration", cost: 2, effect: "duration", multiplier: 1.1, name: "Durée Bonus", description: "+10% durée bonus" },
    { id: "auto-clicker", cost: 3, effect: "autoClick", rate: 0.1, name: "Clic Automatique", description: "+0.1 Pièces/s" },
    { id: "mission-control", cost: 5, effect: "production", multiplier: 1.15, name: "Contrôle Mission", description: "+15% production" },
    { id: "warp-drive", cost: 10, effect: "production", multiplier: 1.25, name: "Moteur Warp", description: "+25% production" },
    { id: "quantum-leap", cost: 20, effect: "production", multiplier: 1.5, name: "Saut Quantique", description: "+50% production" }
];

'''

# Trouver CLICK_UPGRADES et insérer avant
click_upgrades_pos = script.find('const CLICK_UPGRADES = [')
script = script[:click_upgrades_pos] + missions + script[click_upgrades_pos:]

# ============================================
# ÉTAPE 4: Mettre à jour SAVE_VERSION
# ============================================

script = script.replace('const SAVE_VERSION = "2.0.0";', 'const SAVE_VERSION = "4.0.0";')

# ============================================
# ÉTAPE 5: Ajouter les variables de prestige après unlockedTrophies
# ============================================

prestige_vars = '''
// Prestige System
let missionPoints = 0;
let unlockedMissions = new Set();
let purchasedPrestigeUpgrades = {};
let productionBoost = 1;
let clickBoost = 1;
let costReduction = 0;
let bonusDurationBoost = 1;
let autoClickRate = 0;
'''

# Trouver unlockedTrophies et ajouter après
unlocked_trophies_pos = script.find('let unlockedTrophies = new Set();')
unlocked_trophies_end = script.find('\n', unlocked_trophies_pos) + 1
script = script[:unlocked_trophies_end] + prestige_vars + script[unlocked_trophies_end:]

# ============================================
# ÉTAPE 6: Mettre à jour calculateBuildingCost avec costReduction
# ============================================

old_cost_func = '''    return building.count === 0
        ? building.baseCost
        : Math.floor(building.baseCost * Math.exp(BUILDING_PRICE_GROWTH_RATE * building.count));'''

new_cost_func = '''    const baseCost = building.baseCost * (1 - costReduction);
    return building.count === 0
        ? Math.floor(baseCost)
        : Math.floor(baseCost * Math.exp(BUILDING_PRICE_GROWTH_RATE * building.count));'''

script = script.replace(old_cost_func, new_cost_func)

# ============================================
# ÉTAPE 7: Mettre à jour calculateBuildingGain avec productionBoost
# ============================================

script = script.replace(
    'return building.gain * building.count * autoMultiplier * upgradeMultiplier;',
    'return building.gain * building.count * autoMultiplier * upgradeMultiplier * productionBoost;'
)

# ============================================
# ÉTAPE 8: Mettre à jour calculateUnitBuildingGain avec productionBoost
# ============================================

script = script.replace(
    'return building.gain * autoMultiplier * upgradeMultiplier;',
    'return building.gain * autoMultiplier * upgradeMultiplier * productionBoost;'
)

# ============================================
# ÉTAPE 9: Mettre à jour getClickPower avec clickBoost
# ============================================

old_click_power = '''    const basePower = 1;
    const clickBonus = activatedClickUpgrades.length * 0.01 * partsPerSecond;
    return (basePower + clickBonus) * clickMultiplier;'''

new_click_power = '''    const basePower = 1;
    const clickBonus = activatedClickUpgrades.length * 0.01 * partsPerSecond;
    return (basePower + clickBonus) * clickMultiplier * clickBoost;'''

script = script.replace(old_click_power, new_click_power)

# ============================================
# ÉTAPE 10: Mettre à jour addScore avec clickBoost
# ============================================

old_add_score = '''    const clickBonus = activatedClickUpgrades.length * 0.01 * partsPerSecond;
    const basePoints = points + clickBonus;
    const totalPoints = basePoints * clickMultiplier;'''

new_add_score = '''    const clickBonus = activatedClickUpgrades.length * 0.01 * partsPerSecond;
    const basePoints = points + clickBonus;
    const totalPoints = basePoints * clickMultiplier * clickBoost;'''

script = script.replace(old_add_score, new_add_score)

# ============================================
# ÉTAPE 11: Ajouter les fonctions de mission après deleteSave()
# ============================================

mission_functions = '''
// ============================================
// MISSION SYSTEM
// ============================================

function checkMissions() {
    MISSIONS.forEach(mission => {
        if (!unlockedMissions.has(mission.id) && score >= mission.threshold) {
            unlockedMissions.add(mission.id);
            missionPoints += mission.points;
            showToast(`🚀 Mission accomplie: ${mission.name}! +${mission.points} Points de prestige`);
            saveGame();
        }
    });
}

function launchMission() {
    const availableMissions = MISSIONS.filter(m => !unlockedMissions.has(m.id));
    if (availableMissions.length === 0) {
        showToast("✅ Toutes les missions sont accomplies!");
        return;
    }
    
    const nextMission = availableMissions[0];
    if (score < nextMission.threshold) {
        showToast(`❌ Il faut ${formatNumber(nextMission.threshold)} Pièces pour la prochaine mission`);
        return;
    }
    
    // Soft reset - keep prestige upgrades
    const currentPrestigeUpgrades = {...purchasedPrestigeUpgrades};
    const currentMissionPoints = missionPoints;
    const currentUnlockedMissions = new Set(unlockedMissions);
    
    // Reset game state
    score = 0;
    partsPerSecond = 0;
    autoMultiplier = 1;
    clickMultiplier = 1;
    totalPartsFromClicks = 0;
    activatedClickUpgrades = [];
    unlockedBuildings = new Set();
    autoMultipliers = [1];
    clickMultipliers = [1];
    buildingUpgrades = {};
    buildingUpgradeCosts = {};
    totalGeneratedByBuilding = {};
    clickedBonusesCount = 0;
    activeRandomBonuses = [];
    
    BUILDINGS.forEach(building => {
        building.count = 0;
    });
    
    // Restore prestige
    missionPoints = currentMissionPoints;
    unlockedMissions = currentUnlockedMissions;
    purchasedPrestigeUpgrades = currentPrestigeUpgrades;
    
    // Re-apply prestige effects
    productionBoost = 1;
    clickBoost = 1;
    costReduction = 0;
    bonusDurationBoost = 1;
    autoClickRate = 0;
    
    for (const upgradeId in purchasedPrestigeUpgrades) {
        applyPrestigeUpgradeEffect(upgradeId);
    }
    
    gameStartTime = Date.now();
    lastSaveTime = 0;
    
    updateDisplay();
    renderBuildings();
    renderUpgrades();
    renderMissionsPanel();
    renderPrestigeUpgrades();
    updateMissionPointsDisplay();
    updateProgressBar();
    saveGame();
    
    showToast(`🚀 Mission ${nextMission.name} lancée! Nouvelle partie avec vos améliorations de prestige`);
}

function buyPrestigeUpgrade(upgradeId) {
    const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    if (purchasedPrestigeUpgrades[upgradeId]) {
        showToast("✅ Déjà acheté!");
        return;
    }
    
    if (missionPoints < upgrade.cost) {
        showToast("❌ Pas assez de Points de prestige");
        return;
    }
    
    missionPoints -= upgrade.cost;
    purchasedPrestigeUpgrades[upgradeId] = true;
    applyPrestigeUpgradeEffect(upgradeId);
    
    updateMissionPointsDisplay();
    renderPrestigeUpgrades();
    saveGame();
    showToast(`✅ ${upgrade.name} acheté! ${upgrade.description}`);
}

function applyPrestigeUpgradeEffect(upgradeId) {
    const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    switch (upgrade.effect) {
        case "production":
            productionBoost *= upgrade.multiplier;
            break;
        case "click":
            clickBoost *= upgrade.multiplier;
            break;
        case "cost":
            costReduction += upgrade.value;
            break;
        case "duration":
            bonusDurationBoost *= upgrade.multiplier;
            break;
        case "autoClick":
            autoClickRate += upgrade.rate;
            break;
    }
}

function updateMissionPointsDisplay() {
    const mpElement = document.getElementById('mission-points');
    if (mpElement) {
        mpElement.textContent = formatNumber(missionPoints);
    }
}

function updateProgressBar() {
    const availableMissions = MISSIONS.filter(m => !unlockedMissions.has(m.id));
    if (availableMissions.length === 0) {
        const progressBar = document.getElementById('mission-progress-bar');
        const progressText = document.getElementById('mission-progress-text');
        if (progressBar) progressBar.style.width = '100%';
        if (progressText) progressText.textContent = 'Toutes les missions accomplies!';
        return;
    }
    
    const nextMission = availableMissions[0];
    const progress = Math.min(100, (score / nextMission.threshold) * 100);
    
    const progressBar = document.getElementById('mission-progress-bar');
    const progressText = document.getElementById('mission-progress-text');
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    if (progressText) {
        progressText.textContent = `Prochaine: ${nextMission.name} (${formatNumber(score)}/${formatNumber(nextMission.threshold)} Pièces)`;
    }
}

function renderMissionsPanel() {
    const container = document.getElementById('missions-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    MISSIONS.forEach(mission => {
        const missionElement = document.createElement('div');
        missionElement.className = 'mission-item' + (unlockedMissions.has(mission.id) ? ' unlocked' : '');
        
        const isUnlocked = unlockedMissions.has(mission.id);
        const canAfford = score >= mission.threshold;
        
        missionElement.innerHTML = `
            <div class="mission-info">
                <span class="mission-name">${mission.name}</span>
                <span class="mission-description">${mission.description}</span>
                <span class="mission-reward">+${mission.points} Points de prestige</span>
            </div>
            <div class="mission-status">
                ${isUnlocked ? '<span class="status-icon">✅</span>' : (canAfford ? '<span class="status-icon">🚀</span>' : '<span class="status-icon">🔒</span>')}
            </div>
        `;
        
        container.appendChild(missionElement);
    });
}

function renderPrestigeUpgrades() {
    const container = document.getElementById('prestige-upgrades-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    PRESTIGE_UPGRADES.forEach(upgrade => {
        const isPurchased = purchasedPrestigeUpgrades[upgrade.id];
        const canAfford = missionPoints >= upgrade.cost && !isPurchased;
        
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'prestige-upgrade-item' + (isPurchased ? ' purchased' : '') + (canAfford ? ' affordable' : '');
        
        upgradeElement.innerHTML = `
            <div class="prestige-upgrade-info">
                <span class="prestige-upgrade-name">${upgrade.name}</span>
                <span class="prestige-upgrade-description">${upgrade.description}</span>
                <span class="prestige-upgrade-cost">${formatNumber(upgrade.cost)} Points de prestige</span>
            </div>
            <button onclick="buyPrestigeUpgrade('${upgrade.id}')" ${isPurchased ? 'disabled' : ''}>
                ${isPurchased ? 'Acheté' : 'Acheter'}
            </button>
        `;
        
        container.appendChild(upgradeElement);
    });
}

function toggleMissions() {
    const modal = document.getElementById('missions-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        renderMissionsPanel();
        updateProgressBar();
    }
}

function togglePrestigeShop() {
    const modal = document.getElementById('prestige-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        renderPrestigeUpgrades();
        updateMissionPointsDisplay();
    }
}
'''

# Trouver deleteSave() et ajouter après
delete_save_pos = script.find('function deleteSave() {')
delete_save_end = script.find('}', delete_save_pos)
# Trouver la fin de la fonction (le } qui ferme deleteSave)
# On cherche le prochain ; ou fin de ligne après le }
insert_pos = script.find('\n', delete_save_end + 1)
if insert_pos == -1:
    insert_pos = delete_save_end + 1
script = script[:insert_pos] + mission_functions + script[insert_pos:]

# ============================================
# ÉTAPE 12: Mettre à jour saveData dans saveGame()
# ============================================

# Trouver et remplacer la partie saveData dans saveGame
old_save_data_start = script.find('const saveData = {')
old_save_data_end = script.find('};', old_save_data_start)

# Extraire ce qui est avant version: SAVE_VERSION
save_data_before = script[old_save_data_start:script.find('version: SAVE_VERSION', old_save_data_start)]

# Construire le nouveau saveData
new_save_data = '''const saveData = {
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
        version: SAVE_VERSION,
        // Missions & Prestige
        missionPoints: missionPoints,
        unlockedMissions: Array.from(unlockedMissions),
        purchasedPrestigeUpgrades: {...purchasedPrestigeUpgrades},
        productionBoost: productionBoost,
        clickBoost: clickBoost,
        costReduction: costReduction,
        bonusDurationBoost: bonusDurationBoost,
        autoClickRate: autoClickRate
    };'''

# Remplacer tout le saveData
save_data_end_final = script.find('};', old_save_data_start) + 2
script = script[:old_save_data_start] + new_save_data + script[save_data_end_final:]

# ============================================
# ÉTAPE 13: Mettre à jour loadGame() pour charger les données de prestige
# ============================================

# Trouver la partie où on charge les variables dans loadGame
# On ajoute le chargement des données de prestige après unlockedTrophies

load_prestige = '''
        // Charger les données de prestige
        missionPoints = parsed.missionPoints || 0;
        unlockedMissions = new Set(parsed.unlockedMissions || []);
        purchasedPrestigeUpgrades = parsed.purchasedPrestigeUpgrades || {};
        productionBoost = parsed.productionBoost || 1;
        clickBoost = parsed.clickBoost || 1;
        costReduction = parsed.costReduction || 0;
        bonusDurationBoost = parsed.bonusDurationBoost || 1;
        autoClickRate = parsed.autoClickRate || 0;
        
        // Réappliquer les effets des améliorations de prestige
        for (const upgradeId in purchasedPrestigeUpgrades) {
            applyPrestigeUpgradeEffect(upgradeId);
        }
'''

# Trouver unlockedTrophies dans loadGame
load_trophies_pos = script.find('unlockedTrophies = new Set(parsed.unlockedTrophies || []);')
load_trophies_end = script.find('\n', load_trophies_pos) + 1
script = script[:load_trophies_end] + load_prestige + script[load_trophies_end:]

# ============================================
# ÉTAPE 14: Mettre à jour gameLoop pour inclure autoClickRate et checkMissions
# ============================================

# Trouver gameLoop et ajouter autoClickRate
old_game_loop = '''    partsPerSecond = totalGain;
    score += partsPerSecond / GAME_LOOP_FPS;'''

new_game_loop = '''    partsPerSecond = totalGain;
    score += partsPerSecond / GAME_LOOP_FPS;
    score += autoClickRate / GAME_LOOP_FPS;'''

script = script.replace(old_game_loop, new_game_loop)

# Ajouter checkMissions dans gameLoop
old_game_loop_end = '''    updateDisplay();
    checkBuildingUnlocks();
    checkTrophies();'''

new_game_loop_end = '''    updateDisplay();
    checkBuildingUnlocks();
    checkTrophies();
    checkMissions();
    updateProgressBar();'''

script = script.replace(old_game_loop_end, new_game_loop_end)

# ============================================
# ÉTAPE 15: Ajouter les trophées de mission
# ============================================

mission_trophies = ''',
    // Missions
    { id: "first-mission", name: "Première Mission", description: "Accomplir votre première mission spatiale", icon: "🚀", threshold: 1, type: "mission", unlocked: false },
    { id: "space-explorer", name: "Explorateur Spatial", description: "Accomplir 5 missions spatiales", icon: "🌌", threshold: 5, type: "mission", unlocked: false }
'''

# Trouver la fin de TROPHIES array (avant le ];)
trophies_end = script.rfind('];', script.find('const TROPHIES = ['))
# Insérer avant le ]
script = script[:trophies_end] + mission_trophies + script[trophies_end:]

# ============================================
# ÉTAPE 16: Mettre à jour checkTrophies pour inclure le type "mission"
# ============================================

old_trophy_case = '''                case 'building-types':
                    unlocked = getUnlockedBuildingTypes() >= trophy.threshold;
                    break;'''

new_trophy_case = '''                case 'building-types':
                    unlocked = getUnlockedBuildingTypes() >= trophy.threshold;
                    break;
                case 'mission':
                    unlocked = unlockedMissions.size >= trophy.threshold;
                    break;'''

script = script.replace(old_trophy_case, new_trophy_case)

# ============================================
# ÉTAPE 17: Mettre à jour renderStats pour inclure les missions
# ============================================

old_stats = '''        { label: "Bonuses clicked", value: clickedBonusesCount }'''

new_stats = '''        { label: "Bonuses clicked", value: clickedBonusesCount },
        { label: "Prestige Points", value: formatNumber(missionPoints) },
        { label: "Missions completed", value: unlockedMissions.size + "/" + MISSIONS.length }'''

script = script.replace(old_stats, new_stats)

# ============================================
# ÉCRITURE DE SCRIPT.JS
# ============================================

with open('/workspace/github__Mayeul200__glory-of-france-clicker/script.js', 'w', encoding='utf-8') as f:
    f.write(script)

print("✅ script.js mis à jour")

# ============================================
# MODIFICATION DE INDEX.HTML
# ============================================

# Ajouter les modales de missions et prestige avant la fermeture de body
missions_modal = '''    <!-- MISSIONS MODAL -->
    <div id="missions-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>🚀 Missions Spatiales</h2>
                <button onclick="toggleMissions()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="mission-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" id="mission-progress-bar"></div>
                    </div>
                    <div id="mission-progress-text" class="progress-text"></div>
                </div>
                <div id="missions-list" class="missions-list"></div>
            </div>
        </div>
    </div>

    <!-- PRESTIGE MODAL -->
    <div id="prestige-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>🏆 Boutique de Prestige</h2>
                <button onclick="togglePrestigeShop()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="prestige-points">
                    <span>Points de prestige: </span>
                    <span id="mission-points">0</span>
                </div>
                <div id="prestige-upgrades-list" class="prestige-upgrades-list"></div>
            </div>
        </div>
    </div>
'''

# Trouver la fermeture de body
body_end = html.rfind('</body>')
html = html[:body_end] + missions_modal + html[body_end:]

# Ajouter les boutons de missions et prestige
# Trouver le conteneur principal ou ajouter avant </body>
# Ajouter après le bouton stats

buttons_html = '''        <button onclick="toggleMissions()" class="action-btn mission-btn" title="Missions">
            <span>🚀 Missions</span>
        </button>
        <button onclick="togglePrestigeShop()" class="action-btn prestige-btn" title="Prestige">
            <span>🏆 Prestige</span>
        </button>
'''

# Trouver le bouton stats
stats_btn_pos = html.find('<button onclick="toggleStats()"')
# Trouver la fin de ce bouton (le >)
stats_btn_end = html.find('>', stats_btn_pos) + 1
# Trouver la fin de la ligne ou le prochain </button>
next_btn = html.find('</button>', stats_btn_end) + 9
html = html[:next_btn] + buttons_html + html[next_btn:]

# Ajouter la barre de progression
progress_bar_html = '''    <div class="mission-progress-container">
        <div class="mission-progress-bar" id="mission-progress-bar"></div>
        <div class="mission-progress-text" id="mission-progress-text"></div>
    </div>
'''

# Ajouter avant le conteneur principal ou après le titre
# Trouver le conteneur principal
main_container_pos = html.find('<div class="container">')
html = html[:main_container_pos] + progress_bar_html + html[main_container_pos:]

# ÉCRITURE DE INDEX.HTML
with open('/workspace/github__Mayeul200__glory-of-france-clicker/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ index.html mis à jour")

# ============================================
# MODIFICATION DE STYLE.CSS
# ============================================

# Ajouter les styles pour les missions et prestige
prestige_styles = '''
/* ============================================
   MISSIONS & PRESTIGE STYLES
   ============================================ */

/* Progress Bar */
.mission-progress-container {
    width: 100%;
    background: #1e293b;
    border-radius: 8px;
    padding: 8px;
    margin-bottom: 16px;
    box-sizing: border-box;
}

.mission-progress-bar {
    height: 20px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    border-radius: 10px;
    width: 0%;
    transition: width 0.3s ease;
}

.mission-progress-text {
    text-align: center;
    color: #94a3b8;
    font-size: 0.85rem;
    margin-top: 4px;
}

/* Missions Modal */
#missions-modal .modal-content {
    max-width: 600px;
    width: 90%;
}

#missions-modal .modal-body {
    max-height: 400px;
    overflow-y: auto;
}

.missions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.mission-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #0f172a;
    border-radius: 8px;
    border: 2px solid #334155;
    transition: all 0.2s;
}

.mission-item:hover {
    background: #1e293b;
    border-color: #475569;
}

.mission-item.unlocked {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
}

.mission-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.mission-name {
    color: #f1f5f9;
    font-weight: 600;
    font-size: 1rem;
}

.mission-description {
    color: #94a3b8;
    font-size: 0.85rem;
}

.mission-reward {
    color: #22c55e;
    font-size: 0.8rem;
    font-weight: 500;
}

.mission-status {
    font-size: 1.5rem;
}

.status-icon {
    font-size: 1.2rem;
}

/* Prestige Modal */
#prestige-modal .modal-content {
    max-width: 500px;
    width: 90%;
}

#prestige-modal .modal-body {
    max-height: 400px;
    overflow-y: auto;
}

.prestige-points {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #0f172a;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 2px solid #3b82f6;
}

.prestige-points span:first-child {
    color: #94a3b8;
    font-weight: 500;
}

.prestige-points span:last-child {
    color: #3b82f6;
    font-weight: 700;
    font-size: 1.2rem;
}

.prestige-upgrades-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.prestige-upgrade-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #0f172a;
    border-radius: 8px;
    border: 2px solid #334155;
    transition: all 0.2s;
}

.prestige-upgrade-item:hover {
    background: #1e293b;
}

.prestige-upgrade-item.purchased {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
    opacity: 0.7;
}

.prestige-upgrade-item.affordable {
    border-color: #3b82f6;
}

.prestige-upgrade-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.prestige-upgrade-name {
    color: #f1f5f9;
    font-weight: 600;
    font-size: 1rem;
}

.prestige-upgrade-description {
    color: #94a3b8;
    font-size: 0.85rem;
}

.prestige-upgrade-cost {
    color: #fbbf24;
    font-size: 0.8rem;
    font-weight: 500;
}

.prestige-upgrade-item button {
    padding: 8px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}

.prestige-upgrade-item button:hover:not(:disabled) {
    background: #2563eb;
}

.prestige-upgrade-item button:disabled {
    background: #64748b;
    cursor: not-allowed;
}

/* Action Buttons */
.action-btn {
    position: fixed;
    bottom: 20px;
    padding: 12px 20px;
    background: rgba(15, 23, 42, 0.9);
    border: 2px solid #3b82f6;
    border-radius: 50px;
    color: #f1f5f9;
    cursor: pointer;
    font-weight: 600;
    z-index: 1000;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
}

.action-btn:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: #60a5fa;
    transform: translateY(-2px);
}

.mission-btn {
    left: 20px;
}

.prestige-btn {
    right: 20px;
}

/* Modal adjustments for missions and prestige */
.modal {
    z-index: 2000;
}

.modal-content {
    background: #0f172a;
    border: 2px solid #334155;
    border-radius: 16px;
    max-height: 90vh;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 2px solid #334155;
    background: rgba(0, 0, 0, 0.3);
}

.modal-header h2 {
    margin: 0;
    color: #f1f5f9;
    font-size: 1.25rem;
}

.close-btn {
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;
}

.close-btn:hover {
    color: #f1f5f9;
    background: rgba(255, 255, 255, 0.1);
}

.modal-body {
    padding: 20px;
    color: #e2e8f0;
}
'''

# Ajouter à la fin de style.css
with open('/workspace/github__Mayeul200__glory-of-france-clicker/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Trouver la fin du fichier et ajouter avant
css = css.rstrip() + '\n\n' + prestige_styles

with open('/workspace/github__Mayeul200__glory-of-france-clicker/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("✅ style.css mis à jour")

# ============================================
# VÉRIFICATION DE SYNTAXE
# ============================================

import subprocess
result = subprocess.run(['node', '-c', '/workspace/github__Mayeul200__glory-of-france-clicker/script.js'], 
                       capture_output=True, text=True)
if result.returncode == 0:
    print("✅ Syntaxe JavaScript valide")
else:
    print("❌ Erreur de syntaxe JavaScript:")
    print(result.stderr)
    # Essayer de trouver la ligne
    if "Unexpected" in result.stderr:
        lines = result.stderr.split('\n')
        for line in lines:
            if 'script.js' in line:
                print(f"  {line}")

print("\n🎉 Implémentation du système de prestige terminée!")
