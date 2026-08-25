// ===== DONNÉES DU JEU =====
const ERA = {
    name: "L'Aube de la France",
    buildings: [
        {
            id: "coq-gaulois",
            name: "Coq Gaulois",
            description: "Symbole de la Gaule.",
            baseCost: 10,
            gain: 0.1,
            count: 0,
            image: "🐓",
            upgrades: [
                { requiredCount: 10, multiplier: 2, name: "Élevage", description: "×2" },
                { requiredCount: 25, multiplier: 2, name: "Fermes", description: "×2" },
                { requiredCount: 50, multiplier: 2, name: "Royaume", description: "×2" },
                { requiredCount: 75, multiplier: 2, name: "Empire", description: "×2" },
                { requiredCount: 100, multiplier: 2, name: "Légion", description: "×2" }
            ]
        },
        {
            id: "vercingetorix",
            name: "Vercingétorix",
            description: "Chef gaulois.",
            baseCost: 100,
            gain: 1,
            count: 0,
            image: "🛡️",
            upgrades: [
                { requiredCount: 10, multiplier: 2, name: "Armée", description: "×2" },
                { requiredCount: 25, multiplier: 2, name: "Légion", description: "×2" },
                { requiredCount: 50, multiplier: 2, name: "Grand Armée", description: "×2" },
                { requiredCount: 75, multiplier: 2, name: "Unifiées", description: "×2" },
                { requiredCount: 100, multiplier: 2, name: "Empire", description: "×2" }
            ]
        },
        {
            id: "charlemagne",
            name: "Charlemagne",
            description: "Empereur des Francs.",
            baseCost: 1000,
            gain: 10,
            count: 0,
            image: "👑",
            upgrades: [
                { requiredCount: 10, multiplier: 2, name: "Cour", description: "×2" },
                { requiredCount: 25, multiplier: 2, name: "Empire", description: "×2" },
                { requiredCount: 50, multiplier: 2, name: "Royaume", description: "×2" },
                { requiredCount: 75, multiplier: 2, name: "Hégémonie", description: "×2" },
                { requiredCount: 100, multiplier: 2, name: "Légende", description: "×2" }
            ]
        },
        {
            id: "notre-dame",
            name: "Notre-Dame",
            description: "Cathédrale gothique.",
            baseCost: 10000,
            gain: 100,
            count: 0,
            image: "⛪",
            upgrades: [
                { requiredCount: 10, multiplier: 2, name: "Architecture", description: "×2" },
                { requiredCount: 25, multiplier: 2, name: "Vitraux", description: "×2" },
                { requiredCount: 50, multiplier: 2, name: "Rosace", description: "×2" },
                { requiredCount: 75, multiplier: 2, name: "Majestueuse", description: "×2" },
                { requiredCount: 100, multiplier: 2, name: "Chef-d'Œuvre", description: "×2" }
            ]
        },
        {
            id: "fleur-de-lys",
            name: "Fleur de Lys",
            description: "Symbole royal.",
            baseCost: 100000,
            gain: 1000,
            count: 0,
            image: "🌸",
            upgrades: [
                { requiredCount: 10, multiplier: 2, name: "Blason", description: "×2" },
                { requiredCount: 25, multiplier: 2, name: "Héraldique", description: "×2" },
                { requiredCount: 50, multiplier: 2, name: "Symboles", description: "×2" },
                { requiredCount: 75, multiplier: 2, name: "Dynastie", description: "×2" },
                { requiredCount: 100, multiplier: 2, name: "Héritage", description: "×2" }
            ]
        }
    ]
};

const CLICK_UPGRADES = [
    { threshold: 100, bonus: 0.01, name: "Maîtrise", description: "+1% Points De Gloire/s par clic" },
    { threshold: 200, bonus: 0.01, name: "Précis", description: "+1% Points De Gloire/s par clic" },
    { threshold: 500, bonus: 0.01, name: "Puissant", description: "+1% Points De Gloire/s par clic" },
    { threshold: 1000, bonus: 0.01, name: "Expert", description: "+1% Points De Gloire/s par clic" },
    { threshold: 2000, bonus: 0.01, name: "Légendaire", description: "+1% Points De Gloire/s par clic" }
];

const RANDOM_BONUSES = [
    { id: "druide", symbol: "🌿", effect: "auto", multiplier: 5, duration: 30000, tooltip: "×5 Points De Gloire/s", colorClass: "druide" },
    { id: "alliance", symbol: "🤝", effect: "click", multiplier: 10, duration: 30000, tooltip: "×10 Points De Gloire/clic", colorClass: "alliance" }
];

// ===== VARIABLES GLOBALES =====
let score = 0;
let autoGain = 0;
let clickMultiplier = 1;
let autoMultiplier = 1;
let activeRandomBonuses = [];
let buildingMultipliers = { "coq-gaulois": 1, "vercingetorix": 1, "charlemagne": 1, "notre-dame": 1, "fleur-de-lys": 1 };
let clickPDGTotal = 0;
let clickBonus = 0;
let activatedClickUpgrades = [];
let lastMedalRainTime = 0;
let lastSaveTime = 0; // Pour limiter la fréquence des sauvegardes

// ===== INITIALISATION =====
function init() {
    loadGame();
    renderBuildings();
    renderUpgrades();
    updateDisplay();
    renderChickens();

    // Boucle principale (sans sauvegarde à chaque itération)
    setInterval(gameLoop, 100);
    setInterval(spawnRandomBonus, 60000);

    // Sauvegarde périodique (toutes les 5 secondes)
    setInterval(() => {
        if (Date.now() - lastSaveTime > 5000) {
            saveGame();
            lastSaveTime = Date.now();
        }
    }, 1000);

    console.log("✅ Jeu initialisé");
}

// ===== FORMATAGE DES NOMBRES (version finale) =====
function formatNumber(num) {
    if (num < 1000) {
        // Nombres < 1000 : 1 chiffre après la virgule (ex: 0,3 / 45,8 / 567,9)
        return num.toFixed(1).replace('.', ',');
    } else if (num < 1000000) {
        // Nombres >= 1000 et < 1M : 3 chiffres après la virgule (ex: 1,023K / 10,345K / 100,500K)
        return (num / 1000).toFixed(3).replace('.', ',') + 'K';
    } else if (num < 1000000000) {
        // Nombres >= 1M et < 1B : 3 chiffres après la virgule (ex: 1,023M)
        return (num / 1000000).toFixed(3).replace('.', ',') + 'M';
    } else {
        // Nombres >= 1B : 3 chiffres après la virgule (ex: 1,023B)
        return (num / 1000000000).toFixed(3).replace('.', ',') + 'B';
    }
}

// ===== FONCTIONS PRINCIPALES =====
function addScore(points) {
    const basePoints = points * clickMultiplier;
    const bonusPoints = autoGain * clickBonus;
    const totalPoints = basePoints + bonusPoints;

    score += totalPoints;
    clickPDGTotal += basePoints;

    showClickEffect(Math.round(totalPoints));
    updateDisplay();
    saveGame(); // Sauvegarde après un clic
    updateBuildingsButtons();
    renderUpgrades();
}

function showClickEffect(value) {
    const container = document.getElementById('click-effects');
    if (!container) return;

    const medal = document.getElementById('medal');
    if (!medal) return;

    const medalRect = medal.getBoundingClientRect();
    const centerX = medalRect.left + medalRect.width / 2;
    const centerY = medalRect.top + medalRect.height / 2;

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 60;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = `+${value}`;
    effect.style.left = `${centerX + offsetX}px`;
    effect.style.top = `${centerY + offsetY}px`;

    const endAngle = angle + (Math.random() - 0.5) * 0.3;
    const endDistance = distance + 30;
    const endX = Math.cos(endAngle) * endDistance;
    const endY = Math.sin(endAngle) * endDistance - 80;

    effect.style.setProperty('--end-x', `${endX}px`);
    effect.style.setProperty('--end-y', `${endY}px`);

    container.appendChild(effect);
    setTimeout(() => effect.remove(), 1200);
}

function spawnMedalRain() {
    if (autoGain <= 0) return;

    const medalCount = Math.min(Math.max(1, Math.floor(autoGain / 2)), 8);
    const container = document.getElementById('medal-rain');
    if (!container) return;

    const medal = document.getElementById('medal');
    if (!medal) return;

    const medalRect = medal.getBoundingClientRect();

    for (let i = 0; i < medalCount; i++) {
        const startX = medalRect.left + Math.random() * medalRect.width;
        const startY = medalRect.top - 50 - Math.random() * 50;
        const endX = medalRect.left + Math.random() * medalRect.width - medalRect.width / 2;
        const endY = medalRect.top + Math.random() * medalRect.height;

        const medalRain = document.createElement('div');
        medalRain.className = 'medal-rain';
        medalRain.innerHTML = '🏅';
        medalRain.style.left = `${startX}px`;
        medalRain.style.top = `${startY}px`;
        medalRain.style.setProperty('--fall-x', `${endX - startX}px`);
        medalRain.style.setProperty('--fall-y', `${endY - startY}px`);

        container.appendChild(medalRain);
        setTimeout(() => medalRain.remove(), 2500);
    }

    lastMedalRainTime = Date.now();
}

// ===== BOUCLE PRINCIPALE (SANS SAUVEGARDE) =====
function gameLoop() {
    let totalGain = 0;
    ERA.buildings.forEach(building => {
        totalGain += building.gain * building.count * buildingMultipliers[building.id];
    });
    autoGain = totalGain * autoMultiplier;
    score += autoGain / 10;

    if (autoGain > 0 && Date.now() - lastMedalRainTime > 300) {
        spawnMedalRain();
    }

    updateDisplay();
    updateBuildingsButtons();
}

function updateDisplay() {
    const scoreElement = document.getElementById('score-value');
    const gainElement = document.getElementById('gain-value');
    if (scoreElement) scoreElement.textContent = formatNumber(score);
    if (gainElement) gainElement.textContent = formatNumber(autoGain);
}

// ===== GESTION DES COQS =====
function renderChickens() {
    const container = document.getElementById('chickens-container');
    if (!container) return;

    container.innerHTML = '';

    const coqGaulois = ERA.buildings.find(b => b.id === "coq-gaulois");
    if (!coqGaulois || coqGaulois.count === 0) return;

    const medal = document.getElementById('medal');
    if (!medal) return;

    const medalRect = medal.getBoundingClientRect();
    const centerX = medalRect.left + medalRect.width / 2;
    const centerY = medalRect.top + medalRect.height / 2;
    const radius = 140;

    const maxChickens = 12;
    const chickensToShow = Math.min(coqGaulois.count, maxChickens);

    for (let i = 0; i < chickensToShow; i++) {
        const angle = (i * (360 / chickensToShow)) * (Math.PI / 180);
        const x = centerX + Math.cos(angle) * radius - 20;
        const y = centerY + Math.sin(angle) * radius - 20;

        const chicken = document.createElement('div');
        chicken.className = 'chicken';
        chicken.innerHTML = '🐓';
        chicken.style.left = `${x}px`;
        chicken.style.top = `${y}px`;
        chicken.style.transform = `translate(-50%, -50%) rotate(${i * (360 / chickensToShow)}deg)`;
        chicken.style.animationDelay = `${i * 0.5}s`;

        container.appendChild(chicken);
    }
}

// ===== FONCTION POUR METTRE À JOUR LES BOUTONS =====
function updateBuildingsButtons() {
    document.querySelectorAll('.building-item').forEach((el, i) => {
        const building = ERA.buildings[i];
        if (!building) return;

        const currentCost = building.count === 0
            ? building.baseCost
            : Math.floor(building.baseCost * Math.exp(0.12 * building.count));

        const currentGain = building.gain * building.count * buildingMultipliers[building.id] * autoMultiplier;
        const isAffordable = score >= currentCost;

        const btn = el.querySelector('button');
        if (btn) {
            btn.textContent = `Acheter (${formatNumber(currentCost)} Points De Gloire)`;
            btn.disabled = !isAffordable;
        }

        const stats = el.querySelectorAll('.stats span');
        if (stats[0]) stats[0].textContent = `+${formatNumber(currentGain)}/s`;
        if (stats[1]) stats[1].textContent = `Possédés : ${building.count}`;
    });

    renderChickens();
}

// ===== AMÉLIORATIONS =====
function renderUpgrades() {
    const container = document.getElementById('upgrades-list');
    if (!container) return;
    container.innerHTML = '';

    ERA.buildings.forEach(building => {
        const nextUpgrade = building.upgrades.find(upgrade =>
            building.count >= upgrade.requiredCount &&
            buildingMultipliers[building.id] < (2 ** (building.upgrades.indexOf(upgrade) + 1))
        );
        if (nextUpgrade) {
            const el = document.createElement('div');
            el.className = 'upgrade-item';
            el.innerHTML = `
                <h3>${building.name}</h3>
                <p>${nextUpgrade.description}</p>
                <p class="cost">Niveau : ${nextUpgrade.requiredCount}</p>
                <button onclick="buyBuildingUpgrade('${building.id}', ${nextUpgrade.requiredCount})">Activer</button>
            `;
            container.appendChild(el);
        }
    });

    CLICK_UPGRADES.forEach(upgrade => {
        if (clickPDGTotal >= upgrade.threshold && !activatedClickUpgrades.includes(upgrade.threshold)) {
            const el = document.createElement('div');
            el.className = 'upgrade-item';
            el.innerHTML = `
                <h3>Clic</h3>
                <p>${upgrade.description}</p>
                <p class="cost">Seuil : ${formatNumber(upgrade.threshold)}</p>
                <button onclick="buyClickUpgrade(${upgrade.threshold})">Activer</button>
            `;
            container.appendChild(el);
        }
    });

    if (container.innerHTML === '') {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.7)">Achetez des bâtiments pour débloquer !</p>';
    }
}

function renderBuildings() {
    const container = document.getElementById('buildings-list');
    if (!container) return;
    container.innerHTML = '';

    ERA.buildings.forEach(building => {
        const currentCost = building.count === 0
            ? building.baseCost
            : Math.floor(building.baseCost * Math.exp(0.12 * building.count));

        const currentGain = building.gain * building.count * buildingMultipliers[building.id] * autoMultiplier;
        const isAffordable = score >= currentCost;

        const el = document.createElement('div');
        el.className = 'building-item';
        el.innerHTML = `
            <div class="building-header">
                <span class="building-icon">${building.image}</span>
                <div>
                    <h3>${building.name}</h3>
                    <p>${building.description}</p>
                </div>
            </div>
            <div class="stats">
                <span>+${formatNumber(currentGain)}/s</span>
                <span>Possédés : ${building.count}</span>
            </div>
            <button onclick="buyBuilding('${building.id}')" ${!isAffordable ? 'disabled' : ''}>
                Acheter (${formatNumber(currentCost)} Points De Gloire)
            </button>
        `;
        container.appendChild(el);
    });
}

// ===== ACHATS (avec sauvegarde) =====
function buyBuilding(buildingId) {
    const building = ERA.buildings.find(b => b.id === buildingId);
    if (!building) return;

    const currentCost = building.count === 0
        ? building.baseCost
        : Math.floor(building.baseCost * Math.exp(0.12 * building.count));

    if (score >= currentCost) {
        score -= currentCost;
        building.count++;
        updateDisplay();
        saveGame(); // Sauvegarde après achat
        updateBuildingsButtons();
        renderUpgrades();
    }
}

function buyBuildingUpgrade(buildingId, requiredCount) {
    const building = ERA.buildings.find(b => b.id === buildingId);
    if (!building) return;

    const upgrade = building.upgrades.find(u => u.requiredCount === requiredCount);
    if (!upgrade) return;

    buildingMultipliers[building.id] *= upgrade.multiplier;
    updateDisplay();
    saveGame(); // Sauvegarde après amélioration
    updateBuildingsButtons();
    renderUpgrades();
}

function buyClickUpgrade(threshold) {
    const upgrade = CLICK_UPGRADES.find(u => u.threshold === threshold);
    if (!upgrade) return;

    clickBonus += upgrade.bonus;
    activatedClickUpgrades.push(threshold);
    updateDisplay();
    saveGame(); // Sauvegarde après amélioration de clic
    renderUpgrades();
    showToast(`✅ ${upgrade.name} activée !`);
}

// ===== BONUS =====
function spawnRandomBonus() {
    const bonus = RANDOM_BONUSES[Math.floor(Math.random() * RANDOM_BONUSES.length)];
    if (activeRandomBonuses.some(b => b.id === bonus.id)) return;

    const x = Math.random() * (window.innerWidth - 150) + 50;
    const y = Math.random() * (window.innerHeight - 200) + 100;

    const el = document.createElement('div');
    el.className = `random-bonus ${bonus.colorClass}`;
    el.innerHTML = bonus.symbol;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.setAttribute('data-tooltip', bonus.tooltip);
    el.setAttribute('data-id', bonus.id);

    document.getElementById('random-bonuses').appendChild(el);

    const timeout = setTimeout(() => {
        el.classList.add('clicked');
        setTimeout(() => el.remove(), 500);
    }, 10000);

    el.onclick = () => {
        clearTimeout(timeout);
        el.classList.add('clicked');

        if (bonus.effect === "auto") autoMultiplier = bonus.multiplier;
        else if (bonus.effect === "click") clickMultiplier = bonus.multiplier;

        activeRandomBonuses.push({
            id: bonus.id,
            effect: bonus.effect,
            multiplier: bonus.multiplier,
            endTime: Date.now() + bonus.duration
        });

        saveGame(); // Sauvegarde après activation de bonus
        setTimeout(() => el.remove(), 500);

        setTimeout(() => {
            activeRandomBonuses = activeRandomBonuses.filter(b => b.id !== bonus.id);
            if (bonus.effect === "auto") autoMultiplier = 1;
            if (bonus.effect === "click") clickMultiplier = 1;
            updateDisplay();
        }, bonus.duration);
    };
}

// ===== PARAMÈTRES =====
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

// ===== DÉMARRAGE =====
window.onload = init;
