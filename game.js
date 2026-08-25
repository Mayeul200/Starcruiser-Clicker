// ===== DONNÉES DU JEU (5 ÈRES) =====
const ERAS = [
    // ÈRE 1: L'Aube de la France
    {
        id: "aube-france", name: "L'Aube de la France", description: "Les origines de notre nation.",
        requiredScore: 0, color: "#0055a4", icon: "🌅",
        buildings: [
            { id: "coq-gaulois", name: "Coq Gaulois", description: "Symbole de la Gaule. Génère des PDG automatiquement.", baseCost: 10, gain: 0.1, count: 0, image: "🐓", unlockCondition: () => true, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Élevage de Coqs", description: "×2 production" }, { requiredCount: 25, multiplier: 2, name: "Fermes Gauloises", description: "×2 production" }, { requiredCount: 50, multiplier: 2, name: "Royaume des Coqs", description: "×2 production" }] },
            { id: "vercingetorix", name: "Vercingétorix", description: "Chef gaulois contre Rome.", baseCost: 100, gain: 1, count: 0, image: "🗡️", unlockCondition: () => score >= 20, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Armée Gauloise", description: "×2 production" }, { requiredCount: 25, multiplier: 2, name: "Légion Gauloise", description: "×2 production" }] },
            { id: "charlemagne", name: "Charlemagne", description: "Premier empereur des Francs.", baseCost: 1000, gain: 10, count: 0, image: "👑", unlockCondition: () => score >= 500, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Cour Impériale", description: "×2 production" }, { requiredCount: 25, multiplier: 2, name: "Empire Carolingien", description: "×2 production" }] },
            { id: "notre-dame", name: "Cathédrale Notre-Dame", description: "Chef-d'œuvre gothique.", baseCost: 10000, gain: 100, count: 0, image: "⛪", unlockCondition: () => score >= 5000, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Architecture Gothique", description: "×2 production" }, { requiredCount: 25, multiplier: 2, name: "Vitraux Sacrés", description: "×2 production" }] },
            { id: "fleur-de-lys", name: "Fleur de Lys", description: "Symbole royal.", baseCost: 100000, gain: 1000, count: 0, image: "🌸", unlockCondition: () => score >= 25000, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Blason Royal", description: "×2 production" }, { requiredCount: 25, multiplier: 2, name: "Héraldique Sacrée", description: "×2 production" }] }
        ]
    },
    // ÈRE 2: La Construction de la France
    {
        id: "construction-france", name: "La Construction de la France", description: "L'essor du royaume.",
        requiredScore: 50000, color: "#4CAF50", icon: "🏰",
        buildings: [
            { id: "saint-louis", name: "Saint Louis", description: "Roi juste et pieux.", baseCost: 50000, gain: 500, count: 0, image: "👨‍⚖️", unlockCondition: () => score >= 50000, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Cour de Justice", description: "×2 production" }] },
            { id: "joan-of-arc", name: "Jeanne d'Arc", description: "Héroïne nationale.", baseCost: 200000, gain: 2000, count: 0, image: "🛡️", unlockCondition: () => score >= 100000, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Armure Sacrée", description: "×2 production" }] }
        ]
    },
    // ÈRE 3: L'Expansion et la Révolution
    {
        id: "expansion-revolution", name: "L'Expansion et la Révolution", description: "De Louis XIV à la Révolution.",
        requiredScore: 1000000, color: "#9C27B0", icon: "⚔️",
        buildings: [
            { id: "louis-xiv", name: "Louis XIV", description: "Le Roi-Soleil.", baseCost: 1000000, gain: 10000, count: 0, image: "☀️", unlockCondition: () => score >= 1000000, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Château de Versailles", description: "×2 production" }] },
            { id: "revolution", name: "Révolution Française", description: "Liberté, Égalité, Fraternité.", baseCost: 5000000, gain: 50000, count: 0, image: "🎭", unlockCondition: () => score >= 2000000, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Prise de la Bastille", description: "×2 production" }] }
        ]
    },
    // ÈRE 4: L'Ère Moderne
    {
        id: "ere-moderne", name: "L'Ère Moderne", description: "De Napoléon à la Belle Époque.",
        requiredScore: 50000000, color: "#FF9800", icon: "🗼",
        buildings: [
            { id: "napoleon", name: "Napoléon Bonaparte", description: "Empereur des Français.", baseCost: 50000000, gain: 500000, count: 0, image: "🎖️", unlockCondition: () => score >= 50000000, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Grande Armée", description: "×2 production" }] },
            { id: "tour-eiffel", name: "Tour Eiffel", description: "Symbole de Paris.", baseCost: 200000000, gain: 2000000, count: 0, image: "🗼", unlockCondition: () => score >= 100000000, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Exposition Universelle", description: "×2 production" }] }
        ]
    },
    // ÈRE 5: La France Contemporaine
    {
        id: "france-contemporaine", name: "La France Contemporaine", description: "De la Ve République à aujourd'hui.",
        requiredScore: 1000000000, color: "#2196F3", icon: "🇫🇷",
        buildings: [
            { id: "de-gaulle", name: "Charles de Gaulle", description: "Fondateur de la Ve République.", baseCost: 1000000000, gain: 10000000, count: 0, image: "🕊️", unlockCondition: () => score >= 1000000000, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Appel du 18 Juin", description: "×2 production" }] },
            { id: "macron", name: "Emmanuel Macron", description: "Président moderne.", baseCost: 5000000000, gain: 50000000, count: 0, image: "💼", unlockCondition: () => score >= 2000000000, upgrades: [{ requiredCount: 10, multiplier: 2, name: "Startup Nation", description: "×2 production" }] }
        ]
    }
];

// Améliorations de clic
const CLICK_UPGRADES = [
    { threshold: 100, bonus: 0.01, name: "Maîtrise du Clic", description: "+1% des PDG/s par clic" },
    { threshold: 200, bonus: 0.01, name: "Clic Précis", description: "+1% des PDG/s par clic" },
    { threshold: 500, bonus: 0.01, name: "Clic Puissant", description: "+1% des PDG/s par clic" },
    { threshold: 1000, bonus: 0.01, name: "Clic Expert", description: "+1% des PDG/s par clic" },
    { threshold: 2000, bonus: 0.01, name: "Clic Légendaire", description: "+1% des PDG/s par clic" },
    { threshold: 5000, bonus: 0.02, name: "Clic Divin", description: "+2% des PDG/s par clic" }
];

// Bonus aléatoires
const RANDOM_BONUSES = [
    { id: "druide", symbol: "🌿", name: "Druide Sacré", effect: "auto", multiplier: 5, duration: 30000, tooltip: "×5 PDG/s pendant 30s", colorClass: "druide" },
    { id: "alliance", symbol: "🤝", name: "Alliance Sacrée", effect: "click", multiplier: 10, duration: 30000, tooltip: "×10 PDG/clic pendant 30s", colorClass: "alliance" },
    { id: "marianne", symbol: "👩‍💼", name: "Marianne", effect: "both", multiplier: 3, duration: 45000, tooltip: "×3 PDG/s ET ×3 PDG/clic pendant 45s", colorClass: "marianne" },
    { id: "napoleon-bonus", symbol: "🎖️", name: "Stratège Génial", effect: "auto", multiplier: 8, duration: 25000, tooltip: "×8 PDG/s pendant 25s", colorClass: "napoleon" }
];

// Variables globales
let score = 0, autoGain = 0, clickMultiplier = 1, autoMultiplier = 1;
let activeRandomBonuses = [], buildingMultipliers = {}, clickPDGTotal = 0, clickBonus = 0;
let activatedClickUpgrades = [], lastMedalRainTime = 0, currentEraIndex = 0;

// Initialisation
function initBuildingMultipliers() {
    ERAS.forEach(era => era.buildings.forEach(building => buildingMultipliers[building.id] = buildingMultipliers[building.id] || 1));
}

// Ajoute des points
function addScore(points) {
    const basePoints = points * clickMultiplier;
    const bonusPoints = autoGain * clickBonus;
    const totalPoints = basePoints + bonusPoints;
    score += totalPoints; clickPDGTotal += basePoints;
    showClickEffect(Math.round(totalPoints));
    document.getElementById('medal').classList.add('clicked');
    setTimeout(() => document.getElementById('medal').classList.remove('clicked'), 300);
    updateDisplay(); saveGame(); updateBuildingsButtons(); renderUpgrades(); checkEraUnlocks();
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
    const endAngle = angle + (Math.random() - 0.5) * 0.5;
    const endDistance = distance + 50;
    effect.style.setProperty('--end-x', `${Math.cos(endAngle) * endDistance}px`);
    effect.style.setProperty('--end-y', `${Math.sin(endAngle) * endDistance - 100}px`);
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
        medalRain.className = 'medal-rain'; medalRain.innerHTML = '🏅';
        medalRain.style.left = `${startX}px`; medalRain.style.top = `${startY}px`;
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

// Paramètres
function toggleSettings() { document.getElementById('settings-modal').classList.toggle('active'); }
function exportSave() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (saveData) navigator.clipboard.writeText(saveData).then(() => showToast("✅ Sauvegarde copiée !")).catch(() => { prompt("Copiez :", saveData); showToast("✅ Copié manuellement."); });
    else showToast("❌ Aucune sauvegarde.");
}
function importSave() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) { showToast("❌ Rien à importer."); return; }
    try { JSON.parse(importText); localStorage.setItem('gloryOfFranceSave', importText); showToast("✅ Importé ! Redémarrage..."); setTimeout(() => window.location.reload(), 1000); }
    catch (e) { showToast("❌ Format invalide."); }
}
function confirmDeleteSave() { if (confirm("⚠️ Supprimer la sauvegarde ?")) deleteSave(); }
function deleteSave() { localStorage.removeItem('gloryOfFranceSave'); showToast("🗑️ Supprimé !"); setTimeout(() => window.location.reload(), 1000); }
function showToast(message) { const toast = document.getElementById('toast'); toast.textContent = message; toast.classList.add('active'); setTimeout(() => toast.classList.remove('active'), 3000); }

// Affiche les ères
function renderEras() {
    const container = document.getElementById('buildings-list'); container.innerHTML = '';
    let currentEra = ERAS[0];
    for (let i = ERAS.length - 1; i >= 0; i--) { if (score >= ERAS[i].requiredScore) { currentEra = ERAS[i]; currentEraIndex = i; break; } }
    document.querySelector('.panel-header h2').innerHTML = `${currentEra.icon} ${currentEra.name}`;
    ERAS.forEach(era => { if (score >= era.requiredScore || era.requiredScore === 0) era.buildings.forEach(building => { if (building.unlockCondition()) renderBuilding(building); }); });
}

// Affiche un bâtiment
function renderBuilding(building) {
    const container = document.getElementById('buildings-list');
    const currentCost = building.count === 0 ? building.baseCost : Math.floor(building.baseCost * Math.exp(0.12 * building.count));
    const currentGain = building.gain * building.count * buildingMultipliers[building.id] * autoMultiplier;
    const isAffordable = score >= currentCost;
    const buildingElement = document.createElement('div');
    buildingElement.className = 'building-item'; buildingElement.id = `building-${building.id}`;
    buildingElement.innerHTML = `
        <div class="building-header">
            <span class="building-icon">${building.image}</span>
            <div class="building-info"><h3>${building.name}</h3><p>${building.description}</p></div>
        </div>
        <div class="stats"><span class="gain-stat">+${formatNumber(currentGain)}/s</span><span class="count-stat">Possédé(s) : ${building.count}</span></div>
        <button onclick="buyBuilding('${building.id}')" ${!isAffordable ? 'disabled' : ''}>Acheter (${formatNumber(currentCost)} PDG)</button>
    `;
    container.appendChild(buildingElement);
}

// Met à jour les boutons
function updateBuildingsButtons() {
    document.querySelectorAll('.building-item').forEach(element => {
        const buildingId = element.id.replace('building-', ''); const building = findBuildingById(buildingId);
        if (!building) return;
        const currentCost = building.count === 0 ? building.baseCost : Math.floor(building.baseCost * Math.exp(0.12 * building.count));
        const currentGain = building.gain * building.count * buildingMultipliers[building.id] * autoMultiplier;
        const isAffordable = score >= currentCost;
        const button = element.querySelector('button'); const gainStat = element.querySelector('.gain-stat'); const countStat = element.querySelector('.count-stat');
        if (button) button.textContent = `Acheter (${formatNumber(currentCost)} PDG)`, button.disabled = !isAffordable;
        if (gainStat) gainStat.textContent = `+${formatNumber(currentGain)}/s`;
        if (countStat) countStat.textContent = `Possédé(s) : ${building.count}`;
    });
}

// Trouve un bâtiment
function findBuildingById(buildingId) {
    for (const era of ERAS) { const building = era.buildings.find(b => b.id === buildingId); if (building) return building; }
    return null;
}

// Affiche les améliorations
function renderUpgrades() {
    const container = document.getElementById('upgrades-list'); container.innerHTML = '';
    ERAS.forEach(era => era.buildings.forEach(building => {
        const nextUpgrade = building.upgrades.find(upgrade => building.count >= upgrade.requiredCount && buildingMultipliers[building.id] < (2 ** (building.upgrades.indexOf(upgrade) + 1)));
        if (nextUpgrade) {
            const upgradeElement = document.createElement('div'); upgradeElement.className = 'upgrade-item';
            upgradeElement.innerHTML = `<h3>${building.name}</h3><p>${nextUpgrade.description}</p><p class="cost">Niveau : ${nextUpgrade.requiredCount}</p><button onclick="buyBuildingUpgrade('${building.id}', ${nextUpgrade.requiredCount})">Activer</button>`;
            container.appendChild(upgradeElement);
        }
    }));
    CLICK_UPGRADES.forEach(upgrade => {
        if (clickPDGTotal >= upgrade.threshold && !activatedClickUpgrades.includes(upgrade.threshold)) {
            const upgradeElement = document.createElement('div'); upgradeElement.className = 'upgrade-item';
            upgradeElement.innerHTML = `<h3>✨ ${upgrade.name}</h3><p>${upgrade.description}</p><p class="cost">Seuil : ${formatNumber(upgrade.threshold)} PDG</p><button onclick="buyClickUpgrade(${upgrade.threshold})">Activer</button>`;
            container.appendChild(upgradeElement);
        }
    });
    if (container.innerHTML === '') container.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.9rem;padding:10px;">Achetez des bâtiments ou cliquez pour débloquer des améliorations !</p>';
}

// Vérifie les déblocages
function checkEraUnlocks() { renderEras(); }

// Achat
function buyBuilding(buildingId) {
    const building = findBuildingById(buildingId); if (!building) return;
    const currentCost = building.count === 0 ? building.baseCost : Math.floor(building.baseCost * Math.exp(0.12 * building.count));
    if (score >= currentCost) { score -= currentCost; building.count++; updateDisplay(); saveGame(); updateBuildingsButtons(); renderUpgrades(); checkEraUnlocks(); showToast(`✅ +1 ${building.name} !`); }
    else showToast("❌ Pas assez de PDG !");
}
function buyBuildingUpgrade(buildingId, requiredCount) {
    const building = findBuildingById(buildingId); if (!building) return;
    const upgrade = building.upgrades.find(u => u.requiredCount === requiredCount); if (!upgrade) return;
    buildingMultipliers[building.id] *= upgrade.multiplier; updateDisplay(); saveGame(); updateBuildingsButtons(); renderUpgrades(); showToast(`✅ ${upgrade.name} activée !`);
}
function buyClickUpgrade(threshold) {
    const upgrade = CLICK_UPGRADES.find(u => u.threshold === threshold); if (!upgrade) return;
    clickBonus += upgrade.bonus; activatedClickUpgrades.push(threshold); updateDisplay(); saveGame(); renderUpgrades(); showToast(`✅ ${upgrade.name} activée !`);
}

// Bonus aléatoires
function spawnRandomBonus() {
    const bonusIndex = Math.floor(Math.random() * RANDOM_BONUSES.length); const bonus = RANDOM_BONUSES[bonusIndex];
    if (activeRandomBonuses.some(b => b.id === bonus.id)) return;
    const x = Math.random() * (window.innerWidth - 150) + 50; const y = Math.random() * (window.innerHeight - 200) + 100;
    const bonusElement = document.createElement('div'); bonusElement.className = `random-bonus ${bonus.colorClass}`;
    bonusElement.innerHTML = bonus.symbol; bonusElement.style.left = `${x}px`; bonusElement.style.top = `${y}px`;
    bonusElement.setAttribute('data-tooltip', bonus.tooltip); bonusElement.setAttribute('data-id', bonus.id);
    document.getElementById('random-bonuses').appendChild(bonusElement);
    const timeout = setTimeout(() => { bonusElement.classList.add('clicked'); setTimeout(() => bonusElement.remove(), 500); }, 10000);
    bonusElement.onclick = () => {
        clearTimeout(timeout); bonusElement.classList.add('clicked');
        if (bonus.effect === "auto") autoMultiplier = bonus.multiplier;
        else if (bonus.effect === "click") clickMultiplier = bonus.multiplier;
        else if (bonus.effect === "both") { autoMultiplier = bonus.multiplier; clickMultiplier = bonus.multiplier; }
        activeRandomBonuses.push({ id: bonus.id, effect: bonus.effect, multiplier: bonus.multiplier, endTime: Date.now() + bonus.duration });
        setTimeout(() => bonusElement.remove(), 500);
        setTimeout(() => {
            activeRandomBonuses = activeRandomBonuses.filter(b => b.id !== bonus.id);
            if (bonus.effect === "auto" || bonus.effect === "both") autoMultiplier = 1;
            if (bonus.effect === "click" || bonus.effect === "both") clickMultiplier = 1;
            updateDisplay(); showToast(`⏰ ${bonus.name} a expiré !`);
        }, bonus.duration);
        showToast(`✅ ${bonus.name} activé !`);
    };
}

// Boucle principale
function gameLoop() {
    let totalGain = 0;
    ERAS.forEach(era => era.buildings.forEach(building => totalGain += building.gain * building.count * buildingMultipliers[building.id]));
    autoGain = totalGain * autoMultiplier; score += autoGain / 10;
    if (autoGain > 0 && Date.now() - lastMedalRainTime > 500) spawnMedalRain();
    updateDisplay(); saveGame(); updateBuildingsButtons();
}

// Initialisation
function init() { initBuildingMultipliers(); loadGame(); updateDisplay(); renderEras(); renderUpgrades(); checkEraUnlocks(); }
setInterval(spawnRandomBonus, 60000); setInterval(gameLoop, 100); window.onload = init;
