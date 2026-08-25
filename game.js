// ============================================
// GLORY OF FRANCE CLICKER - MAIN GAME LOGIC
// Structure inspirée de Cookie Clicker
// ============================================

// ============================================
// DONNÉES DU JEU (5 ÈRES)
const ERAS = [
    {
        id: "aube-france",
        name: "L'Aube de la France",
        requiredScore: 0,
        buildings: [
            {
                id: "coq-gaulois",
                name: "Coq Gaulois",
                description: "Symbole de la Gaule. Génère des PDG automatiquement.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 10,
                gain: 0.1,
                count: 0,
                image: "🐓",
                unlockCondition: () => true,
                totalGenerated: 0
            },
            {
                id: "vercingetorix",
                name: "Vercingétorix",
                description: "Chef gaulois contre Rome. Génère plus de PDG.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 100,
                gain: 1,
                count: 0,
                image: "🗡️",
                unlockCondition: () => score >= 20,
                totalGenerated: 0
            },
            {
                id: "charlemagne",
                name: "Charlemagne",
                description: "Premier empereur des Francs. Génère encore plus de PDG.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 1000,
                gain: 10,
                count: 0,
                image: "👑",
                unlockCondition: () => score >= 500,
                totalGenerated: 0
            },
            {
                id: "notre-dame",
                name: "Cathédrale Notre-Dame",
                description: "Chef-d'œuvre gothique. Génère un flux constant de PDG.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 10000,
                gain: 100,
                count: 0,
                image: "⛪",
                unlockCondition: () => score >= 5000,
                totalGenerated: 0
            },
            {
                id: "fleur-de-lys",
                name: "Fleur de Lys",
                description: "Symbole royal. Génère des PDG avec élégance.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 100000,
                gain: 1000,
                count: 0,
                image: "🌸",
                unlockCondition: () => score >= 25000,
                totalGenerated: 0
            }
        ]
    },
    {
        id: "construction-france",
        name: "La Construction de la France",
        requiredScore: 50000,
        buildings: [
            {
                id: "saint-louis",
                name: "Saint Louis",
                description: "Roi juste et pieux. Génère des PDG avec sagesse.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 50000,
                gain: 500,
                count: 0,
                image: "👨‍⚖️",
                unlockCondition: () => score >= 50000,
                totalGenerated: 0
            },
            {
                id: "joan-of-arc",
                name: "Jeanne d'Arc",
                description: "Héroïne nationale. Génère des PDG avec courage.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 200000,
                gain: 2000,
                count: 0,
                image: "🛡️",
                unlockCondition: () => score >= 100000,
                totalGenerated: 0
            }
        ]
    },
    {
        id: "expansion-revolution",
        name: "L'Expansion et la Révolution",
        requiredScore: 1000000,
        buildings: [
            {
                id: "louis-xiv",
                name: "Louis XIV",
                description: "Le Roi-Soleil. Génère des PDG avec magnificence.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 1000000,
                gain: 10000,
                count: 0,
                image: "☀️",
                unlockCondition: () => score >= 1000000,
                totalGenerated: 0
            },
            {
                id: "revolution",
                name: "Révolution Française",
                description: "Liberté, Égalité, Fraternité. Génère des PDG avec passion.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 5000000,
                gain: 50000,
                count: 0,
                image: "🎭",
                unlockCondition: () => score >= 2000000,
                totalGenerated: 0
            }
        ]
    },
    {
        id: "ere-moderne",
        name: "L'Ère Moderne",
        requiredScore: 50000000,
        buildings: [
            {
                id: "napoleon",
                name: "Napoléon Bonaparte",
                description: "Empereur des Français. Génère des PDG avec stratégie.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 50000000,
                gain: 500000,
                count: 0,
                image: "🎖️",
                unlockCondition: () => score >= 50000000,
                totalGenerated: 0
            },
            {
                id: "tour-eiffel",
                name: "Tour Eiffel",
                description: "Symbole de Paris. Génère des PDG avec élégance.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 200000000,
                gain: 2000000,
                count: 0,
                image: "🗼",
                unlockCondition: () => score >= 100000000,
                totalGenerated: 0
            }
        ]
    },
    {
        id: "france-contemporaine",
        name: "La France Contemporaine",
        requiredScore: 1000000000,
        buildings: [
            {
                id: "de-gaulle",
                name: "Charles de Gaulle",
                description: "Fondateur de la Ve République. Génère des PDG avec autorité.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 1000000000,
                gain: 10000000,
                count: 0,
                image: "🕊️",
                unlockCondition: () => score >= 1000000000,
                totalGenerated: 0
            },
            {
                id: "macron",
                name: "Emmanuel Macron",
                description: "Président moderne. Génère des PDG avec innovation.\n\nProduction actuelle: +{gain}/s\nNombre possédé: {count}\nPourcentage de production: {percent}%\nPDG total généré: {total}",
                baseCost: 5000000000,
                gain: 50000000,
                count: 0,
                image: "💼",
                unlockCondition: () => score >= 2000000000,
                totalGenerated: 0
            }
        ]
    }
];

// Améliorations de clic (pour la barre du haut)
const CLICK_UPGRADES = [
    { threshold: 100, bonus: 0.01, name: "Maîtrise du Clic", description: "+1% PDG/s par clic" },
    { threshold: 200, bonus: 0.01, name: "Clic Précis", description: "+1% PDG/s par clic" },
    { threshold: 500, bonus: 0.01, name: "Clic Puissant", description: "+1% PDG/s par clic" },
    { threshold: 1000, bonus: 0.01, name: "Clic Expert", description: "+1% PDG/s par clic" },
    { threshold: 2000, bonus: 0.01, name: "Clic Légendaire", description: "+1% PDG/s par clic" },
    { threshold: 5000, bonus: 0.02, name: "Clic Divin", description: "+2% PDG/s par clic" },
    { threshold: 10000, bonus: 0.03, name: "Clic Impérial", description: "+3% PDG/s par clic" },
    { threshold: 20000, bonus: 0.05, name: "Clic Suprême", description: "+5% PDG/s par clic" },
    { threshold: 50000, bonus: 0.1, name: "Clic Ultime", description: "+10% PDG/s par clic" },
    { threshold: 100000, bonus: 0.2, name: "Clic Mythique", description: "+20% PDG/s par clic" }
];

// Bonus aléatoires
const RANDOM_BONUSES = [
    { id: "druide", symbol: "🌿", name: "Druide Sacré", effect: "auto", multiplier: 5, duration: 30000, tooltip: "×5 PDG/s pendant 30s", colorClass: "druide" },
    { id: "alliance", symbol: "🤝", name: "Alliance Sacrée", effect: "click", multiplier: 10, duration: 30000, tooltip: "×10 PDG/clic pendant 30s", colorClass: "alliance" },
    { id: "marianne", symbol: "👩‍💼", name: "Marianne", effect: "both", multiplier: 3, duration: 45000, tooltip: "×3 PDG/s ET ×3 PDG/clic pendant 45s", colorClass: "marianne" },
    { id: "napoleon-bonus", symbol: "🎖️", name: "Stratège Génial", effect: "auto", multiplier: 8, duration: 25000, tooltip: "×8 PDG/s pendant 25s", colorClass: "napoleon" }
];

// Variables globales
let score = 0;
let autoGain = 0;
let clickMultiplier = 1;
let autoMultiplier = 1;
let activeRandomBonuses = [];
let buildingMultipliers = {};
let clickPDGTotal = 0;
let clickBonus = 0;
let activatedClickUpgrades = [];
let lastMedalRainTime = 0;
let currentEraIndex = 0;
let totalGeneratedByBuilding = {};

// Initialisation
function initGlobals() {
    ERAS.forEach(era => {
        era.buildings.forEach(building => {
            buildingMultipliers[building.id] = buildingMultipliers[building.id] || 1;
            totalGeneratedByBuilding[building.id] = totalGeneratedByBuilding[building.id] || 0;
        });
    });
}

// Ajoute des points
function addScore(points) {
    const basePoints = points * clickMultiplier;
    const bonusPoints = autoGain * clickBonus;
    const totalPoints = basePoints + bonusPoints;

    score += totalPoints;
    clickPDGTotal += basePoints;

    showClickEffect(Math.round(totalPoints));

    const medal = document.getElementById('medal');
    medal.classList.add('clicked');
    setTimeout(() => medal.classList.remove('clicked'), 300);

    updateDisplay();
    saveGame();
    updateBuildingsButtons();
    renderUpgrades();
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
    const distance = 80 + Math.random() * 40;
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
        setTimeout(() => medalRain.remove(), 2000);
    }
    lastMedalRainTime = now;
}

// Met à jour l'affichage
function updateDisplay() {
    document.getElementById('score-value').textContent = formatNumber(score);
    document.getElementById('gain-value').textContent = formatNumber(autoGain);
}

// Formate les nombres
function formatNumber(num) {
    if (num < 1000) return num.toFixed(num % 1 === 0 ? 0 : 1);
    if (num < 1000000) return (num / 1000).toFixed(1) + "K";
    if (num < 1000000000) return (num / 1000000).toFixed(1) + "M";
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + "B";
    return (num / 1000000000000).toFixed(1) + "T";
}

// Toggle modals
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

// Export/Import/Delete
function exportSave() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (saveData) {
        navigator.clipboard.writeText(saveData)
            .then(() => showToast("✅ Sauvegarde copiée !"))
            .catch(() => { prompt("Copiez :", saveData); showToast("✅ Copié manuellement."); });
    } else {
        showToast("❌ Aucune sauvegarde.");
    }
}

function importSave() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) { showToast("❌ Rien à importer."); return; }
    try {
        JSON.parse(importText);
        localStorage.setItem('gloryOfFranceSave', importText);
        showToast("✅ Importé ! Redémarrage...");
        setTimeout(() => window.location.reload(), 1000);
    } catch (e) { showToast("❌ Format invalide."); }
}

function confirmDeleteSave() {
    if (confirm("⚠️ Supprimer la sauvegarde ? Tous vos progrès seront PERDUS !")) {
        deleteSave();
    }
}

function deleteSave() {
    localStorage.removeItem('gloryOfFranceSave');
    showToast("🗑️ Supprimé !");
    setTimeout(() => window.location.reload(), 1000);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
}

// Statistiques
function renderStats() {
    const container = document.getElementById('stats-body');
    container.innerHTML = '';

    // Statistiques globales
    const globalStats = [
        { label: "Score total", value: formatNumber(score) },
        { label: "PDG par seconde", value: formatNumber(autoGain) },
        { label: "Clics totaux", value: formatNumber(clickPDGTotal) },
        { label: "PDG total généré", value: formatNumber(calculateTotalGenerated()) }
    ];

    const globalStatsElement = document.createElement('div');
    globalStatsElement.className = 'stats-grid';

    globalStats.forEach(stat => {
        const statElement = document.createElement('div');
        statElement.className = 'stat-item';
        statElement.innerHTML = `
            <span class="stat-label">${stat.label}</span>
            <span class="stat-value">${stat.value}</span>
        `;
        globalStatsElement.appendChild(statElement);
    });

    container.appendChild(globalStatsElement);

    // Statistiques par bâtiment
    const statsByBuilding = document.createElement('div');
    statsByBuilding.className = 'building-stats';
    statsByBuilding.innerHTML = '<h4 style="color: var(--bleu-france); margin-bottom: 12px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">Statistiques par bâtiment</h4>';

    const statsList = document.createElement('div');
    statsList.className = 'stats-list';

    ERAS.forEach(era => {
        era.buildings.forEach(building => {
            if (building.count > 0) {
                const buildingGain = building.gain * building.count * buildingMultipliers[building.id] * autoMultiplier;
                const percent = autoGain > 0 ? ((buildingGain / autoGain) * 100).toFixed(2) : 0;

                const buildingStatElement = document.createElement('div');
                buildingStatElement.className = 'building-stat-item';
                buildingStatElement.innerHTML = `
                    <div class="building-stat-header">
                        <span class="building-stat-icon">${building.image}</span>
                        <span class="building-stat-name">${building.name}</span>
                    </div>
                    <div class="building-stat-details">
                        <div class="stat-detail">
                            <span class="detail-label">Possédés:</span>
                            <span class="detail-value">${building.count}</span>
                        </div>
                        <div class="stat-detail">
                            <span class="detail-label">Production:</span>
                            <span class="detail-value">${formatNumber(buildingGain)}/s</span>
                        </div>
                        <div class="stat-detail">
                            <span class="detail-label">Pourcentage:</span>
                            <span class="detail-value">${percent}%</span>
                        </div>
                        <div class="stat-detail">
                            <span class="detail-label">Total généré:</span>
                            <span class="detail-value">${formatNumber(totalGeneratedByBuilding[building.id] || 0)}</span>
                        </div>
                    </div>
                `;
                statsList.appendChild(buildingStatElement);
            }
        });
    });

    statsByBuilding.appendChild(statsList);
    container.appendChild(statsByBuilding);
}

function calculateTotalGenerated() {
    let total = 0;
    for (const key in totalGeneratedByBuilding) {
        total += totalGeneratedByBuilding[key];
    }
    return total;
}

// Affiche les améliorations dans la barre du haut
function renderUpgrades() {
    const container = document.getElementById('upgrades-list');
    container.innerHTML = '';

    CLICK_UPGRADES.forEach(upgrade => {
        if (clickPDGTotal >= upgrade.threshold && !activatedClickUpgrades.includes(upgrade.threshold)) {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-item';
            upgradeElement.innerHTML = `<span class="upgrade-name">${upgrade.name}</span>`;
            upgradeElement.onclick = () => buyClickUpgrade(upgrade.threshold);
            container.appendChild(upgradeElement);
        }
    });
}

// Affiche les bâtiments
function renderBuildings() {
    const container = document.getElementById('buildings-list');
    container.innerHTML = '';

    ERAS.forEach(era => {
        if (score >= era.requiredScore || era.requiredScore === 0) {
            era.buildings.forEach(building => {
                if (building.unlockCondition()) {
                    renderBuilding(building);
                }
            });
        }
    });
}

function renderBuilding(building) {
    const container = document.getElementById('buildings-list');

    const currentCost = building.count === 0
        ? building.baseCost
        : Math.floor(building.baseCost * Math.exp(0.12 * building.count));

    const currentGain = building.gain * building.count * buildingMultipliers[building.id] * autoMultiplier;
    const percent = autoGain > 0 ? ((currentGain / autoGain) * 100).toFixed(2) : 0;

    const isAffordable = score >= currentCost;

    const buildingElement = document.createElement('div');
    buildingElement.className = 'building-item';
    buildingElement.id = `building-${building.id}`;

    const tooltip = building.description
        .replace('{gain}', formatNumber(currentGain))
        .replace('{count}', building.count)
        .replace('{percent}', percent)
        .replace('{total}', formatNumber(totalGeneratedByBuilding[building.id] || 0));

    buildingElement.setAttribute('data-tooltip', tooltip);

    buildingElement.innerHTML = `
        <div class="building-content">
            <span class="building-name">${building.name}</span>
            <span class="building-icon">${building.image}</span>
        </div>
        <span class="building-cost">${formatNumber(currentCost)} PDG</span>
        <button onclick="buyBuilding('${building.id}')" ${!isAffordable ? 'disabled' : ''}>
            Acheter
        </button>
    `;

    container.appendChild(buildingElement);
}

function updateBuildingsButtons() {
    document.querySelectorAll('.building-item').forEach(element => {
        const buildingId = element.id.replace('building-', '');
        const building = findBuildingById(buildingId);
        if (!building) return;

        const currentCost = building.count === 0
            ? building.baseCost
            : Math.floor(building.baseCost * Math.exp(0.12 * building.count));

        const currentGain = building.gain * building.count * buildingMultipliers[building.id] * autoMultiplier;
        const percent = autoGain > 0 ? ((currentGain / autoGain) * 100).toFixed(2) : 0;
        const isAffordable = score >= currentCost;

        const button = element.querySelector('button');
        const costSpan = element.querySelector('.building-cost');

        if (button) button.disabled = !isAffordable;
        if (costSpan) costSpan.textContent = `${formatNumber(currentCost)} PDG`;

        const tooltip = building.description
            .replace('{gain}', formatNumber(currentGain))
            .replace('{count}', building.count)
            .replace('{percent}', percent)
            .replace('{total}', formatNumber(totalGeneratedByBuilding[building.id] || 0));

        element.setAttribute('data-tooltip', tooltip);
    });
}

function findBuildingById(buildingId) {
    for (const era of ERAS) {
        const building = era.buildings.find(b => b.id === buildingId);
        if (building) return building;
    }
    return null;
}

function checkEraUnlocks() {
    renderBuildings();
}

// Achat
function buyBuilding(buildingId) {
    const building = findBuildingById(buildingId);
    if (!building) return;

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
        checkEraUnlocks();
        showToast(`✅ +1 ${building.name} acheté !`);
    } else {
        showToast("❌ Pas assez de PDG !");
    }
}

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

// Bonus aléatoires
function spawnRandomBonus() {
    const bonusIndex = Math.floor(Math.random() * RANDOM_BONUSES.length);
    const bonus = RANDOM_BONUSES[bonusIndex];
    if (activeRandomBonuses.some(b => b.id === bonus.id)) return;

    const x = Math.random() * (window.innerWidth - 150) + 50;
    const y = Math.random() * (window.innerHeight - 200) + 100;

    const bonusElement = document.createElement('div');
    bonusElement.className = `random-bonus ${bonus.colorClass}`;
    bonusElement.innerHTML = bonus.symbol;
    bonusElement.style.left = `${x}px`;
    bonusElement.style.top = `${y}px`;
    bonusElement.setAttribute('data-tooltip', bonus.tooltip);

    document.getElementById('random-bonuses').appendChild(bonusElement);

    const timeout = setTimeout(() => {
        bonusElement.classList.add('clicked');
        setTimeout(() => bonusElement.remove(), 500);
    }, 10000);

    bonusElement.onclick = () => {
        clearTimeout(timeout);
        bonusElement.classList.add('clicked');

        if (bonus.effect === "auto") autoMultiplier = bonus.multiplier;
        else if (bonus.effect === "click") clickMultiplier = bonus.multiplier;
        else if (bonus.effect === "both") {
            autoMultiplier = bonus.multiplier;
            clickMultiplier = bonus.multiplier;
        }

        activeRandomBonuses.push({
            id: bonus.id,
            effect: bonus.effect,
            multiplier: bonus.multiplier,
            endTime: Date.now() + bonus.duration
        });

        setTimeout(() => bonusElement.remove(), 500);

        setTimeout(() => {
            activeRandomBonuses = activeRandomBonuses.filter(b => b.id !== bonus.id);
            if (bonus.effect === "auto" || bonus.effect === "both") autoMultiplier = 1;
            if (bonus.effect === "click" || bonus.effect === "both") clickMultiplier = 1;
            updateDisplay();
            showToast(`⏰ ${bonus.name} a expiré !`);
        }, bonus.duration);

        showToast(`✅ ${bonus.name} activé !`);
    };
}

// Boucle principale
function gameLoop() {
    let totalGain = 0;

    ERAS.forEach(era => {
        era.buildings.forEach(building => {
            const buildingGain = building.gain * building.count * buildingMultipliers[building.id];
            totalGain += buildingGain;

            if (building.count > 0) {
                totalGeneratedByBuilding[building.id] = (totalGeneratedByBuilding[building.id] || 0) + (buildingGain * 0.1);
            }
        });
    });

    autoGain = totalGain * autoMultiplier;
    score += autoGain / 10;

    if (autoGain > 0 && Date.now() - lastMedalRainTime > 500) {
        spawnMedalRain();
    }

    updateDisplay();
    saveGame();
    updateBuildingsButtons();
}

// Initialisation
function init() {
    initGlobals();
    loadGame();
    updateDisplay();
    renderBuildings();
    renderUpgrades();
    checkEraUnlocks();
}

// Timers
setInterval(spawnRandomBonus, 60000);
setInterval(gameLoop, 100);
window.onload = init;
