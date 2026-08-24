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
            costMultiplier: 1.15,
            image: "🐓"
        },
        {
            id: "vercingetorix",
            name: "Vercingétorix",
            description: "Chef gaulois contre Rome. Génère plus de PDG.",
            baseCost: 100,
            gain: 1,
            count: 0,
            costMultiplier: 1.15,
            image: "🛡️"
        },
        {
            id: "charlemagne",
            name: "Charlemagne",
            description: "Empereur des Francs. Génère encore plus de PDG.",
            baseCost: 1000,
            gain: 10,
            count: 0,
            costMultiplier: 1.15,
            image: "👑"
        },
        {
            id: "notre-dame",
            name: "Cathédrale Notre-Dame",
            description: "Chef-d'œuvre gothique. Génère un flux constant de PDG.",
            baseCost: 10000,
            gain: 100,
            count: 0,
            costMultiplier: 1.15,
            image: "⛪"
        },
        {
            id: "fleur-de-lys",
            name: "Fleur de Lys",
            description: "Symbole royal. Génère des PDG avec élégance.",
            baseCost: 100000,
            gain: 1000,
            count: 0,
            costMultiplier: 1.15,
            image: "🌸"
        }
    ],
    upgrades: [
        {
            id: "bonus-click",
            name: "Bénédiction des Druides",
            description: "×2 PDG/clic pendant 30s",
            cost: 100,
            type: "click",
            multiplier: 2,
            duration: 30,
            active: false,
            endTime: 0
        },
        {
            id: "bonus-auto",
            name: "Alliance des Tribus",
            description: "×2 PDG/s pendant 30s",
            cost: 200,
            type: "auto",
            multiplier: 2,
            duration: 30,
            active: false,
            endTime: 0
        }
    ]
};

// ===== BONUS ALÉATOIRES =====
const RANDOM_BONUSES = [
    {
        id: "druide",
        symbol: "🌿",
        name: "Druide Sacré",
        effect: "auto",
        multiplier: 5,
        duration: 30000, // 30 secondes
        tooltip: "×5 PDG/s pendant 30s",
        colorClass: "druide"
    },
    {
        id: "alliance",
        symbol: "🤝",
        name: "Alliance Sacrée",
        effect: "click",
        multiplier: 10,
        duration: 30000, // 30 secondes
        tooltip: "×10 PDG/clic pendant 30s",
        colorClass: "alliance"
    }
];

// ===== VARIABLES GLOBALES =====
let score = 0;
let autoGain = 0;
let clickMultiplier = 1;
let autoMultiplier = 1;
let activeRandomBonuses = []; // Bonus aléatoires actifs
let bonusTimers = []; // Timers pour les bonus aléatoires

// ===== FONCTIONS DE BASE =====
function addScore(points) {
    score += points * clickMultiplier;
    updateDisplay();
    saveGame();
    updateBuildingsButtons();
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

// ===== FONCTION POUR METTRE À JOUR LES BOUTONS DES BÂTIMENTS =====
function updateBuildingsButtons() {
    const buildingElements = document.querySelectorAll('.building-item');
    
    buildingElements.forEach((element, index) => {
        const building = ERA.buildings[index];
        if (!building) return;

        const currentCost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.count));
        const currentGain = building.gain * building.count * autoMultiplier;
        const isAffordable = score >= currentCost;

        const button = element.querySelector('button');
        button.textContent = `Acheter (${formatNumber(currentCost)} PDG)`;
        button.disabled = !isAffordable;

        const stats = element.querySelectorAll('.stats span');
        if (stats[0]) stats[0].textContent = `+${formatNumber(currentGain)}/s`;
        if (stats[1]) stats[1].textContent = `Possédés : ${building.count}`;
    });
}

// ===== FONCTION POUR METTRE À JOUR LES BONUS ACHETABLES =====
function updateUpgradesButtons() {
    ERA.upgrades.forEach(upgrade => {
        const element = document.getElementById(upgrade.id);
        if (!element) return;

        const button = element.querySelector('button');
        const costSpan = element.querySelector('.cost span');
        const isAffordable = score >= upgrade.cost;
        const isActive = upgrade.active;

        button.disabled = !isAffordable || isActive;
        costSpan.textContent = formatNumber(upgrade.cost);

        if (isActive) {
            button.textContent = "Actif !";
            button.style.background = "#4CAF50";
            button.style.color = "white";
        } else {
            button.textContent = "Acheter";
            button.style.background = "#ffd700";
            button.style.color = "#0055a4";
        }
    });
}

// ===== ACHAT DES BÂTIMENTS =====
function buyBuilding(buildingId) {
    const building = ERA.buildings.find(b => b.id === buildingId);
    if (!building) return;

    const currentCost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.count));
    if (score >= currentCost) {
        score -= currentCost;
        building.count++;
        updateDisplay();
        saveGame();
        updateBuildingsButtons();
    }
}

// ===== ACHAT DES BONUS ACHETABLES =====
function buyUpgrade(upgradeId) {
    const upgrade = ERA.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    if (score >= upgrade.cost && !upgrade.active) {
        score -= upgrade.cost;
        upgrade.active = true;
        upgrade.endTime = Date.now() + upgrade.duration * 1000;

        if (upgrade.type === "click") {
            clickMultiplier = upgrade.multiplier;
        } else if (upgrade.type === "auto") {
            autoMultiplier = upgrade.multiplier;
        }

        updateDisplay();
        saveGame();
        updateUpgradesButtons();
        updateBuildingsButtons();
        startUpgradeTimer(upgradeId);
    }
}

function startUpgradeTimer(upgradeId) {
    const upgrade = ERA.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const timerElement = document.getElementById(`${upgradeId}-timer`);
    const interval = setInterval(() => {
        const remaining = Math.ceil((upgrade.endTime - Date.now()) / 1000);
        if (remaining <= 0) {
            clearInterval(interval);
            upgrade.active = false;
            if (upgrade.type === "click") clickMultiplier = 1;
            if (upgrade.type === "auto") autoMultiplier = 1;
            updateDisplay();
            saveGame();
            updateUpgradesButtons();
            updateBuildingsButtons();
            timerElement.textContent = "";
        } else {
            timerElement.textContent = `⏳ ${remaining}s`;
        }
    }, 1000);
}

// ===== BONUS ALÉATOIRES =====
// Crée un bonus aléatoire à l'écran
function spawnRandomBonus() {
    // Choix aléatoire entre druide et alliance
    const bonusIndex = Math.floor(Math.random() * RANDOM_BONUSES.length);
    const bonus = RANDOM_BONUSES[bonusIndex];

    // Vérifier qu'un bonus du même type n'est pas déjà actif
    const isActive = activeRandomBonuses.some(b => b.id === bonus.id);
    if (isActive) return;

    // Position aléatoire (éviter les bords)
    const x = Math.random() * (window.innerWidth - 150) + 50;
    const y = Math.random() * (window.innerHeight - 200) + 100;

    // Créer l'élément
    const bonusElement = document.createElement('div');
    bonusElement.className = `random-bonus ${bonus.colorClass}`;
    bonusElement.innerHTML = bonus.symbol;
    bonusElement.style.left = `${x}px`;
    bonusElement.style.top = `${y}px`;
    bonusElement.setAttribute('data-tooltip', bonus.tooltip);
    bonusElement.setAttribute('data-id', bonus.id);

    // Ajouter au conteneur
    document.getElementById('random-bonuses').appendChild(bonusElement);

    // Supprimer après 10 secondes si non cliqué
    const timeout = setTimeout(() => {
        bonusElement.classList.add('clicked');
        setTimeout(() => {
            bonusElement.remove();
        }, 500); // Temps pour l'animation de disparition
    }, 10000);

    // Gérer le clic
    bonusElement.onclick = () => {
        clearTimeout(timeout);
        bonusElement.classList.add('clicked');

        // Appliquer l'effet
        if (bonus.effect === "auto") {
            autoMultiplier = bonus.multiplier;
        } else if (bonus.effect === "click") {
            clickMultiplier = bonus.multiplier;
        }

        // Ajouter au tableau des bonus actifs
        activeRandomBonuses.push({
            id: bonus.id,
            effect: bonus.effect,
            multiplier: bonus.multiplier,
            endTime: Date.now() + bonus.duration
        });

        // Supprimer le bonus après l'animation
        setTimeout(() => {
            bonusElement.remove();
        }, 500);

        // Planifier la fin de l'effet
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
        const currentCost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.count));
        const currentGain = building.gain * building.count * autoMultiplier;
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
                <span>Possédés : ${building.count}</span>
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

function renderUpgrades() {
    ERA.upgrades.forEach(upgrade => {
        const element = document.getElementById(upgrade.id);
        if (!element) return;

        const button = element.querySelector('button');
        const costSpan = element.querySelector('.cost span');

        const isAffordable = score >= upgrade.cost;
        const isActive = upgrade.active;

        button.disabled = !isAffordable || isActive;
        costSpan.textContent = formatNumber(upgrade.cost);

        if (isActive) {
            button.textContent = "Actif !";
            button.style.background = "#4CAF50";
            button.style.color = "white";
        } else {
            button.textContent = "Acheter";
            button.style.background = "#ffd700";
            button.style.color = "#0055a4";
        }
    });
}

// ===== BOUCLE PRINCIPALE =====
function gameLoop() {
    let totalGain = 0;
    ERA.buildings.forEach(building => {
        totalGain += building.gain * building.count;
    });
    autoGain = totalGain * autoMultiplier;
    score += autoGain / 10;
    updateDisplay();
    saveGame();
    updateBuildingsButtons();
    updateUpgradesButtons();
}

// ===== TIMERS =====
// Faire apparaître un bonus aléatoire toutes les 60 secondes
setInterval(spawnRandomBonus, 60000); // 60 000 ms = 1 minute
setInterval(gameLoop, 100);

// ===== INITIALISATION =====
function init() {
    loadGame();
    updateDisplay();
    renderBuildings();
    renderUpgrades();
}

window.onload = init;
