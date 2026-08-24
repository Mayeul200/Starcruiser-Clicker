// ===== CONSTANTES =====
const ERAS = [
    {
        name: "Ère 1 : Les Origines",
        requiredScore: 0, // Déblocage immédiat
        items: [
            {
                id: "drapeau",
                name: "Drapeau Français",
                description: "Symbole national. Cliquez pour gagner des Points de Gloire !",
                type: "click",
                baseCost: 0,
                gain: 1,
                count: 0,
                costMultiplier: 1.15,
                image: "assets/images/drapeau-france.png"
            },
            {
                id: "coq-gaulois",
                name: "Coq Gaulois",
                description: "Symbole de la Gaule. Génère des points automatiquement.",
                type: "auto",
                baseCost: 50,
                gain: 5, // points par seconde
                count: 0,
                costMultiplier: 1.15,
                image: "assets/images/coq-gaulois.png",
                globalUpgrade: {
                    name: "Élevage de Coqs",
                    description: "×2 la production de tous les Coqs Gaulois.",
                    cost: 1000,
                    multiplier: 2,
                    requiredCount: 10,
                    unlocked: false
                }
            },
            {
                id: "vercingetorix",
                name: "Vercingétorix",
                description: "Chef gaulois contre les Romains.",
                type: "auto",
                baseCost: 200,
                gain: 10,
                count: 0,
                costMultiplier: 1.15,
                image: "assets/images/vercingetorix.png",
                globalUpgrade: {
                    name: "Armée Gauloise",
                    description: "×2 la production de Vercingétorix.",
                    cost: 5000,
                    multiplier: 2,
                    requiredCount: 5,
                    unlocked: false
                }
            },
            {
                id: "charlemagne",
                name: "Charlemagne",
                description: "Premier empereur des Francs.",
                type: "auto",
                baseCost: 1000,
                gain: 50,
                count: 0,
                costMultiplier: 1.15,
                image: "assets/images/charlemagne.png",
                globalUpgrade: {
                    name: "Empire Carolingien",
                    description: "×2 la production de Charlemagne.",
                    cost: 20000,
                    multiplier: 2,
                    requiredCount: 3,
                    unlocked: false
                }
            }
        ]
    },
    // Ères 2-5 (à ajouter plus tard)
    {
        name: "Ère 2 : La Construction de la France",
        requiredScore: 5000,
        items: []
    },
    {
        name: "Ère 3 : L'Expansion et la Révolution",
        requiredScore: 200000,
        items: []
    },
    {
        name: "Ère 4 : L'Ère Moderne",
        requiredScore: 5000000,
        items: []
    },
    {
        name: "Ère 5 : La France Contemporaine",
        requiredScore: 1000000000,
        items: []
    }
];

// ===== VARIABLES GLOBALES =====
let score = 0;
let autoGain = 0;
let multipliers = {}; // Multiplicateurs par élément
let activeClickUpgrades = []; // Améliorations de clic actives

// Initialisation des multiplicateurs
ERAS.forEach(era => {
    era.items.forEach(item => {
        multipliers[item.id] = 1;
    });
});

// ===== FONCTIONS DE BASE =====
function addScore(points) {
    score += points;
    updateScoreDisplay();
    saveGame();
}

function updateScoreDisplay() {
    document.getElementById('score-value').textContent = formatNumber(score);
    document.getElementById('auto-gain').textContent = formatNumber(autoGain);
}

function formatNumber(num) {
    if (num < 1000) return num.toString();
    if (num >= 1000 && num < 1000000) return (num / 1000).toFixed(1) + "K";
    if (num >= 1000000 && num < 1000000000) return (num / 1000000).toFixed(1) + "M";
    return (num / 1000000000).toFixed(1) + "B";
}

// ===== FONCTIONS D'ACHAT =====
function buyItem(eraIndex, itemId) {
    const era = ERAS[eraIndex];
    const item = era.items.find(i => i.id === itemId);
    if (!item || item.type !== "auto") return;

    const currentCost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, item.count));
    if (score >= currentCost) {
        score -= currentCost;
        item.count++;
        updateScoreDisplay();
        saveGame();
        renderEras();
    } else {
        alert("Pas assez de Points de Gloire !");
    }
}

function buyGlobalUpgrade(eraIndex, itemId) {
    const era = ERAS[eraIndex];
    const item = era.items.find(i => i.id === itemId);
    if (!item || !item.globalUpgrade || item.globalUpgrade.unlocked) return;

    if (score >= item.globalUpgrade.cost) {
        score -= item.globalUpgrade.cost;
        item.globalUpgrade.unlocked = true;
        multipliers[item.id] *= item.globalUpgrade.multiplier;
        updateScoreDisplay();
        saveGame();
        renderEras();
    } else {
        alert("Pas assez de Points de Gloire !");
    }
}

// ===== FONCTIONS D'AFFICHAGE =====
function renderEras() {
    const erasContainer = document.getElementById('eras');
    erasContainer.innerHTML = '';

    ERAS.forEach((era, eraIndex) => {
        const isUnlocked = score >= era.requiredScore || era.requiredScore === 0;
        if (!isUnlocked) return;

        const eraElement = document.createElement('div');
        eraElement.className = 'era';
        eraElement.innerHTML = `
            <h2>${era.name}</h2>
            <div class="items-grid" id="items-${eraIndex}"></div>
        `;
        erasContainer.appendChild(eraElement);
        renderItems(eraIndex);
    });
}

function renderItems(eraIndex) {
    const era = ERAS[eraIndex];
    const itemsContainer = document.getElementById(`items-${eraIndex}`);
    if (!itemsContainer) return;
    itemsContainer.innerHTML = '';

    era.items.forEach(item => {
        const currentCost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, item.count));
        const currentGain = item.type === "auto" ? item.gain * item.count * multipliers[item.id] : 0;

        const itemElement = document.createElement('div');
        itemElement.className = 'item';

        let html = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
        `;

        if (item.type === "click") {
            html += `
                <div class="stats">
                    <span>+${item.gain} par clic</span>
                </div>
                <button onclick="addScore(${item.gain})">Cliquez ici !</button>
            `;
        } else if (item.type === "auto") {
            html += `
                <div class="stats">
                    <span>${formatNumber(currentGain)}/s</span>
                    <span>Possédés : ${item.count}</span>
                </div>
                <button onclick="buyItem(${eraIndex}, '${item.id}')" ${score < currentCost ? 'disabled' : ''}>
                    Acheter (${formatNumber(currentCost)} pts)
                </button>
            `;
            if (item.globalUpgrade) {
                const upgrade = item.globalUpgrade;
                html += `
                    <div class="upgrade" style="margin-top: 10px; padding: 10px; background: #fff9e6; border: 1px solid #ffd700; border-radius: 5px;">
                        <h4>${upgrade.name}</h4>
                        <p>${upgrade.description}</p>
                        <button onclick="buyGlobalUpgrade(${eraIndex}, '${item.id}')" ${score < upgrade.cost || upgrade.unlocked ? 'disabled' : ''}>
                            ${upgrade.unlocked ? '✅ Acheté !' : `Acheter (${formatNumber(upgrade.cost)} pts)`}
                        </button>
                    </div>
                `;
            }
        }
        itemElement.innerHTML = html;
        itemsContainer.appendChild(itemElement);
    });
}

// ===== BOUCLE PRINCIPALE =====
setInterval(() => {
    let totalGain = 0;
    ERAS.forEach(era => {
        era.items.forEach(item => {
            if (item.type === "auto") {
                totalGain += item.gain * item.count * multipliers[item.id];
            }
        });
    });
    autoGain = totalGain;
    score += totalGain;
    updateScoreDisplay();
    saveGame();
}, 1000);

// ===== INITIALISATION =====
window.onload = () => {
    loadGame();
    updateScoreDisplay();
    renderEras();
};
