#!/usr/bin/env python3
"""
Système de prestige pour Glory of France Clicker
Thème : France - Remplacer les bâtiments par des monuments/éléments français
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
# ÉTAPE 1: Remplacer les 25 bâtiments par 15 éléments français
# ============================================

new_buildings = '''const BUILDINGS = [
    { id: "baguette", name: "Boulangerie", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 10, gain: 0.1, count: 0, image: "🥖", unlockCondition: () => true, totalGenerated: 0 },
    { id: "fromage", name: "Fromagerie", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 100, gain: 1, count: 0, image: "🧀", unlockCondition: () => score >= 20, totalGenerated: 0 },
    { id: "vin", name: "Vignoble", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 1000, gain: 10, count: 0, image: "🍷", unlockCondition: () => score >= 500, totalGenerated: 0 },
    { id: "cafe", name: "Café", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 10000, gain: 100, count: 0, image: "☕", unlockCondition: () => score >= 5000, totalGenerated: 0 },
    { id: "tour-eiffel", name: "Tour Eiffel", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 50000, gain: 1000, count: 0, image: "🗼", unlockCondition: () => score >= 25000, totalGenerated: 0 },
    { id: "louvre", name: "Louvre", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 100000, gain: 500, count: 0, image: "🏛️", unlockCondition: () => score >= 50000, totalGenerated: 0 },
    { id: "notre-dame", name: "Notre-Dame", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 200000, gain: 2000, count: 0, image: "⛪", unlockCondition: () => score >= 100000, totalGenerated: 0 },
    { id: "chateau", name: "Château", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 1000000, gain: 10000, count: 0, image: "🏰", unlockCondition: () => score >= 1000000, totalGenerated: 0 },
    { id: "arc-triomphe", name: "Arc de Triomphe", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 5000000, gain: 50000, count: 0, image: "🏛️", unlockCondition: () => score >= 2000000, totalGenerated: 0 },
    { id: "lyon", name: "Lyon", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 50000000, gain: 500000, count: 0, image: "🏙️", unlockCondition: () => score >= 50000000, totalGenerated: 0 },
    { id: "marseille", name: "Marseille", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 200000000, gain: 2000000, count: 0, image: "🌊", unlockCondition: () => score >= 100000000, totalGenerated: 0 },
    { id: "bordeaux", name: "Bordeaux", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 1000000000, gain: 10000000, count: 0, image: "🍷", unlockCondition: () => score >= 1000000000, totalGenerated: 0 },
    { id: "normandie", name: "Normandie", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 5000000000, gain: 50000000, count: 0, image: "🐄", unlockCondition: () => score >= 2000000000, totalGenerated: 0 },
    { id: "alsace", name: "Alsace", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 25000000000, gain: 250000000, count: 0, image: "🍺", unlockCondition: () => score >= 10000000000, totalGenerated: 0 },
    { id: "provence", name: "Provence", description: "Production unitaire: +{gain} Pièces/s\\n% de la production totale: {percent}%\\nTotal généré: {total} Pièces", baseCost: 500000000000, gain: 5000000000, count: 0, image: "🌻", unlockCondition: () => score >= 500000000000, totalGenerated: 0 }
];'''

# Trouver et remplacer la constante BUILDINGS
buildings_start = script.find('const BUILDINGS = [')
buildings_end = script.find('];', buildings_start)
# Trouver le vrai ] qui ferme le tableau (en comptant les [)
open_brackets = 0
real_end = buildings_start
for i in range(buildings_start, len(script)):
    if script[i] == '[':
        open_brackets += 1
    elif script[i] == ']':
        open_brackets -= 1
        if open_brackets == 0:
            real_end = i + 1
            break

script = script[:buildings_start] + new_buildings + script[real_end:]

# ============================================
# ÉTAPE 2: Mettre à jour les seuils et couleurs (15 bâtiments)
# ============================================

new_thresholds = '''const BUILDING_UPGRADE_THRESHOLDS = [1, 5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500];'''

thresholds_start = script.find('const BUILDING_UPGRADE_THRESHOLDS = [')
thresholds_end = script.find('];', thresholds_start) + 2
script = script[:thresholds_start] + new_thresholds + script[thresholds_end:]

new_colors = '''const UPGRADE_COLORS = [
    '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe',
    '#dbeafe', '#eff6ff', '#86efac', '#4ade80', '#22c55e',
    '#16a34a', '#15803d', '#059669', '#047857', '#065f46'
];'''

colors_start = script.find('const UPGRADE_COLORS = [')
colors_end = script.find('];', colors_start) + 2
script = script[:colors_start] + new_colors + script[colors_end:]

# ============================================
# ÉTAPE 3: Ajouter MISSIONS et PRESTIGE_UPGRADES avant CLICK_UPGRADES
# ============================================

missions = '''const MISSIONS = [
    { id: "village", name: "Village", threshold: 10000000, points: 1, description: "Fonder un village français" },
    { id: "ville", name: "Ville", threshold: 100000000, points: 2, description: "Construire une ville" },
    { id: "departement", name: "Département", threshold: 1000000000, points: 3, description: "Unifier un département" },
    { id: "region", name: "Région", threshold: 10000000000, points: 5, description: "Conquérir une région" },
    { id: "royaume", name: "Royaume", threshold: 100000000000, points: 8, description: "Établir un royaume" },
    { id: "empire", name: "Empire", threshold: 1000000000000, points: 12, description: "Créer un empire" },
    { id: "republique", name: "République", threshold: 10000000000000, points: 18, description: "Fonder la République" },
    { id: "glory", name: "Gloire de la France", threshold: 100000000000000, points: 25, description: "Atteindre la Gloire Suprême" }
];

const PRESTIGE_UPGRADES = [
    { id: "artisanat", cost: 1, effect: "production", multiplier: 1.05, name: "Artisanat", description: "+5% production" },
    { id: "revolution", cost: 1, effect: "click", multiplier: 1.1, name: "Révolution", description: "+10% par clic" },
    { id: "economie", cost: 2, effect: "cost", value: 0.02, name: "Économie", description: "-2% coût bâtiments" },
    { id: "savoir", cost: 2, effect: "duration", multiplier: 1.1, name: "Savoir", description: "+10% durée bonus" },
    { id: "automatisation", cost: 3, effect: "autoClick", rate: 0.1, name: "Automatisation", description: "+0.1 Pièces/s" },
    { id: "centralisation", cost: 5, effect: "production", multiplier: 1.15, name: "Centralisation", description: "+15% production" },
    { id: "grandeur", cost: 10, effect: "production", multiplier: 1.25, name: "Grandeur", description: "+25% production" },
    { id: "suprématie", cost: 20, effect: "production", multiplier: 1.5, name: "Suprématie", description: "+50% production" }
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
            showToast(`🇫🇷 Mission accomplie: ${mission.name}! +${mission.points} Points de Gloire`);
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
    
    showToast(`🇫🇷 Mission ${nextMission.name} lancée! Nouvelle partie avec vos améliorations`);
}

function buyPrestigeUpgrade(upgradeId) {
    const upgrade = PRESTIGE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    if (purchasedPrestigeUpgrades[upgradeId]) {
        showToast("✅ Déjà acheté!");
        return;
    }
    
    if (missionPoints < upgrade.cost) {
        showToast("❌ Pas assez de Points de Gloire");
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
                <span class="mission-reward">+${mission.points} Points de Gloire</span>
            </div>
            <div class="mission-status">
                ${isUnlocked ? '<span class="status-icon">✅</span>' : (canAfford ? '<span class="status-icon">🇫🇷</span>' : '<span class="status-icon">🔒</span>')}
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
                <span class="prestige-upgrade-cost">${formatNumber(upgrade.cost)} Points de Gloire</span>
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
# Trouver la fin de la fonction
insert_pos = script.find('\n', delete_save_end + 1)
if insert_pos == -1:
    insert_pos = delete_save_end + 1
script = script[:insert_pos] + mission_functions + script[insert_pos:]

# ============================================
# ÉTAPE 12: Mettre à jour saveData dans saveGame()
# ============================================

# Remplacer tout le saveData avec la version complète incluant prestige
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

# Trouver et remplacer le saveData existant
old_save_data_start = script.find('const saveData = {')
# Trouver le } final
save_data_end = script.find('};', old_save_data_start)
script = script[:old_save_data_start] + new_save_data + script[save_data_end + 2:]

# ============================================
# ÉTAPE 13: Mettre à jour loadGame() pour charger les données de prestige
# ============================================

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
# ÉTAPE 14: Mettre à jour gameLoop
# ============================================

# Ajouter autoClickRate
old_game_loop = '''    partsPerSecond = totalGain;
    score += partsPerSecond / GAME_LOOP_FPS;'''

new_game_loop = '''    partsPerSecond = totalGain;
    score += partsPerSecond / GAME_LOOP_FPS;
    score += autoClickRate / GAME_LOOP_FPS;'''

script = script.replace(old_game_loop, new_game_loop)

# Ajouter checkMissions et updateProgressBar
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
    { id: "first-mission", name: "Première Mission", description: "Accomplir votre première mission pour la France", icon: "🇫🇷", threshold: 1, type: "mission", unlocked: false },
    { id: "explorer", name: "Explorateur", description: "Accomplir 5 missions pour la France", icon: "🌍", threshold: 5, type: "mission", unlocked: false }
'''

# Trouver la fin de TROPHIES array (avant le ];)
trophies_start = script.find('const TROPHIES = [')
# Compter les crochets pour trouver la fin
open_brackets = 0
found_start = False
trophies_end = trophies_start
for i in range(trophies_start, len(script)):
    if script[i] == '[':
        open_brackets += 1
        found_start = True
    elif script[i] == ']':
        open_brackets -= 1
        if found_start and open_brackets == 0:
            trophies_end = i
            break

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
        { label: "Points de Gloire", value: formatNumber(missionPoints) },
        { label: "Missions accomplies", value: unlockedMissions.size + "/" + MISSIONS.length }'''

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
                <h2>🇫🇷 Missions pour la France</h2>
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
                <h2>🏆 Boutique de Gloire</h2>
                <button onclick="togglePrestigeShop()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="prestige-points">
                    <span>Points de Gloire: </span>
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
# Trouver le bouton stats
buttons_html = '''        <button onclick="toggleMissions()" class="action-btn mission-btn" title="Missions">
            <span>🇫🇷 Missions</span>
        </button>
        <button onclick="togglePrestigeShop()" class="action-btn prestige-btn" title="Prestige">
            <span>🏆 Gloire</span>
        </button>
'''

# Trouver le bouton stats
stats_btn_pos = html.find('<button onclick="toggleStats()"')
# Trouver la fin de ce bouton
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

# Ajouter après le conteneur principal
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
    background: linear-gradient(90deg, #0055a4, #ffffff, #bf0000);
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
    border-color: #0055a4;
    background: rgba(0, 85, 164, 0.1);
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
    color: #fbbf24;
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
    border: 2px solid #0055a4;
}

.prestige-points span:first-child {
    color: #94a3b8;
    font-weight: 500;
}

.prestige-points span:last-child {
    color: #fbbf24;
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
    border-color: #0055a4;
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
    background: #0055a4;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}

.prestige-upgrade-item button:hover:not(:disabled) {
    background: #003d73;
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
    border: 2px solid #0055a4;
    border-radius: 50px;
    color: #f1f5f9;
    cursor: pointer;
    font-weight: 600;
    z-index: 1000;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
}

.action-btn:hover {
    background: rgba(0, 85, 164, 0.2);
    border-color: #475569;
    transform: translateY(-2px);
}

.mission-btn {
    left: 20px;
}

.prestige-btn {
    right: 20px;
}

/* Modal adjustments */
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

print("\n🇫🇷🎉 Implémentation du système de prestige pour Glory of France Clicker terminée!")
