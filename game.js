// ===== DONNÉES DU JEU =====
const ERA = {
    name: "L'Aube de la France",
    buildings: [
        {
            id: "coq-gaulois",
            name: "Coq Gaulois",
            description: "Symbole de la Gaule. Génère des PDG automatiquement.",
            baseCost: 10,
            gain: 0.1, // PDG par seconde
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

// ===== VARIABLES GLOBALES =====
let score = 0;
let autoGain = 0;
let clickMultiplier = 1;
let autoMultiplier = 1;

// ===== FONCTIONS DE BASE =====
function addScore(points) {
    score += points * clickMultiplier;
    updateDisplay();
    saveGame();
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
        renderBuildings();
    } else {
        alert(`Il vous manque ${formatNumber(currentCost - score)} PDG !`);
    }
}

// ===== ACHAT DES BONUS =====
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
        renderUpgrades();
        startUpgradeTimer(upgradeId);
    } else if (upgrade.active) {
        alert("Ce bonus est déjà actif !");
    } else {
        alert(`Il vous manque ${formatNumber(upgrade.cost - score)} PDG !`);
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
            renderUpgrades();
            timerElement.textContent = "";
        } else {
            timerElement.textContent = `⏳ ${remaining}s`;
        }
    }, 1000);
}

// ===== AFFICHAGE =====
function renderBuildings() {
    const container = document.getElementById('buildings-list');
    container.innerHTML = '';

    ERA.buildings.forEach(building => {
        const currentCost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.count));
        const currentGain = building.gain * building.count;

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
            <button onclick="buyBuilding('${building.id}')" ${score < currentCost ? 'disabled' : ''}>
                Acheter (${formatNumber(currentCost)} PDG)
            </button>
        `;
        container.appendChild(buildingElement);
    });
}

function renderUpgrades() {
    ERA.upgrades.forEach(upgrade => {
        const element = document.getElementById(upgrade.id);
        const button = element.querySelector('button');
        const costSpan = element.querySelector('.cost span');

        button.disabled = score < upgrade.cost || upgrade.active;
        costSpan.textContent = formatNumber(upgrade.cost);

        if (upgrade.active) {
            button.textContent = "Actif !";
            button.style.background = "#4CAF50";
        } else {
            button.textContent = "Acheter";
            button.style.background = "#ffd700";
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
    score += autoGain / 10; // On divise par 10 pour avoir un gain fluide (10 updates/seconde)
    updateDisplay();
    saveGame();
}

setInterval(gameLoop, 100); // 10 fois par seconde

// ===== INITIALISATION =====
function init() {
    loadGame();
    updateDisplay();
    renderBuildings();
    renderUpgrades();
}

window.onload = init;
