// ============================================
// STARSHIP CLICKER - MAIN SCRIPT
// Version 2.1.0
// ============================================

// ============================================
// GLOBAL TOOLTIP
// ============================================
const tooltip = document.createElement('div');
tooltip.className = 'upgrade-tooltip';
document.body.appendChild(tooltip);

function showTooltip(text, x, y, options) {
    tooltip.textContent = text;
    tooltip.style.width = '';
    tooltip.style.maxWidth = '';
    if (options && options.width) {
        tooltip.style.width = options.width + 'px';
        tooltip.style.maxWidth = options.width + 'px';
    }
    if (options && options.align === 'left') {
        tooltip.style.transform = 'translate(0, -120%)';
    } else {
        tooltip.style.transform = 'translate(-50%, -120%)';
    }
    tooltip.classList.add('visible');
    const rect = tooltip.getBoundingClientRect();
    const margin = 8;
    const halfWidth = options && options.align === 'left' ? 0 : rect.width / 2;
    const clampedX = Math.max(margin, Math.min(x, window.innerWidth - rect.width - margin));
    tooltip.style.top = y + 'px';
    tooltip.style.left = clampedX + 'px';
}

function hideTooltip() {
    tooltip.classList.remove('visible');
    tooltipLiveRefresh = null;
}

// Rafraichissement en continu du tooltip affiche (production qui evolue).
// Fontion qui regenere le texte; appelee periodiquement par la boucle de jeu.
let tooltipLiveRefresh = null;
function refreshLiveTooltip() {
    if (tooltipLiveRefresh && tooltip.classList.contains('visible')) {
        tooltip.textContent = tooltipLiveRefresh();
    }
}

// Détection d'un écran tactile (mobile / tablette)
const IS_TOUCH = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    || 'ontouchstart' in window
    || navigator.maxTouchPoints > 0;

// ============================================
// GLOBAL CONSTANTS
// ============================================
// Croissance du prix d'un même bâtiment à l'achat : ×1.15 par bâtiment possédé
// (identique à Cookie Clicker — le prix double tous les ~5 achats).
const BUILDING_PRICE_GROWTH_RATE = 1.15;
const GAME_LOOP_FPS = 10;
const GAME_LOOP_INTERVAL_MS = 100;
const BONUS_SPAWN_INTERVAL_MS = 30000;
const SAVE_INTERVAL_MS = 30000;
const TOAST_DURATION_MS = 3000;
const MAX_BUILDING_DISPLAY = 100;
const BUILDING_UPDATE_INTERVAL_MS = 500;
const SPACE_UPDATE_INTERVAL_MS = 500;

// ============================================
// GAME DATA
// ============================================

// ============================================
// ============================================
// ROCKET_PARTS avec tailles proportionnelles
// Hauteur totale: 454px (centrée verticalement)
// ============================================
// ============================================
// BÂTIMENTS DE PRODUCTION
// Achetables en masse, génèrent des Parts/s. Boucle clicker.
// ============================================
// Les noms/descriptions sont en FR (cles i18n) : affiches via t()/tf().
const PRODUCTION_BUILDINGS = [
    { id: "workshop",      name: "Atelier",                  description: "Tout commence ici", baseCost: 15,            gain: 0.1,      count: 0, image: "🛠️", imgPath: "images/buildings/workshop.png",  unlockCondition: () => true,            totalGenerated: 0 },
    { id: "factory",       name: "Usine",                    description: "Construit les ateliers", baseCost: 100,           gain: 1,         count: 0, image: "🏭",       imgPath: "images/buildings/factory.png",  unlockCondition: () => score >= 50,       totalGenerated: 0 },
    { id: "mine",          name: "Mine stellaire",           description: "Nourrit les usines", baseCost: 1100,          gain: 8,        count: 0, image: "⛏️",       imgPath: "images/buildings/stellar-mine.png", unlockCondition: () => score >= 500,      totalGenerated: 0 },
    { id: "solar",         name: "Centrale solaire",         description: "Alimente le complexe", baseCost: 12000,         gain: 47,       count: 0, image: "☀️",       imgPath: "images/buildings/solar-central.png", unlockCondition: () => score >= 6000,     totalGenerated: 0 },
    { id: "foundry",       name: "Autofab orbitale",        description: "Usines qui s'assemblent seules", baseCost: 1400000,       gain: 1400,     count: 0, image: "🛰️", imgPath: "images/buildings/orbital_autofab.png", unlockCondition: () => score >= 700000,   totalGenerated: 0 },
    { id: "station",       name: "Essaim de sondes",         description: "Sondes auto-réplicantes", baseCost: 20000000,      gain: 7800,    count: 0, image: "📡", imgPath: "images/buildings/essaim-sonde.png", unlockCondition: () => score >= 10000000, totalGenerated: 0 },
    { id: "nanoforge",     name: "Nanoforge",                description: "L'atome devient matière première", baseCost: 330000000,     gain: 44000,   count: 0, image: "⚙️", imgPath: "images/buildings/nanoforge.png", unlockCondition: () => score >= 150000000, totalGenerated: 0 },
    { id: "synth",         name: "Imprimeur quantique",  description: "La matière sur mesure", baseCost: 5100000000,    gain: 260000,  count: 0, image: "🧬", imgPath: "images/buildings/quantic_printer.png", unlockCondition: () => score >= 2500000000, totalGenerated: 0 },
    { id: "antimatter",   name: "Collecteur d'antimatière",  description: "Ressource ultime", baseCost: 75000000000,   gain: 1600000, count: 0, image: "🌀", imgPath: "images/buildings/antimatter_collector.png", unlockCondition: () => score >= 35000000000, totalGenerated: 0 },
    { id: "voidrig",       name: "Forge de vide",           description: "Extrait l'énergie du vide quantique", baseCost: 1e12,          gain: 10000000.0,      count: 0, image: "⚫",       unlockCondition: () => score >= 5e11,       totalGenerated: 0 },
    { id: "quasar",        name: "Moteur à quasar",           description: "Énergie de quasar", baseCost: 1.4e13,        gain: 65000000.0,    count: 0, image: "💫",       unlockCondition: () => score >= 7.5e12,    totalGenerated: 0 },
    { id: "nebula",        name: "Fonderie stellaire",   description: "Coule des étoiles entières", baseCost: 1.7e14,          gain: 430000000.0,      count: 0, image: "🌟",       unlockCondition: () => score >= 1e14,      totalGenerated: 0 },
    { id: "pulsar",        name: "Horloger de pulsar",          description: "Règle les battements de l'univers", baseCost: 2.1e15,          gain: 2900000000.0,      count: 0, image: "⭐",       unlockCondition: () => score >= 1.5e15,    totalGenerated: 0 },
    { id: "blackhole",     name: "Trou noir industriel",     description: "L'ultime moteur", baseCost: 2.6e16,          gain: 21000000000.0,      count: 0, image: "🕳️",       unlockCondition: () => score >= 2.5e16,    totalGenerated: 0 },
];

// Bâtiments de production = liste utilisée par la boucle clicker (achat en masse, gain Parts/s)
const BUILDINGS = PRODUCTION_BUILDINGS;

// ============================================
// PIÈCES DE FUSÉE
// Achats uniques par run (payés en Parts). Compléter les 10 = lancement.
// ============================================
const ROCKET_PARTS = [
    { id: "nozzles",       name: "Tuyères",        description: "Propulsion", cost: 50,           image: "🎯",       imgPath: "images/rocket/nozzles.PNG",       x: 50,    y: 646, width: 40,  height: 20,  order: 2,  purchased: false },
    { id: "engines",       name: "Moteurs",        description: "Moteurs principaux", cost: 150,          image: "🔥",       imgPath: "images/rocket/engines.png",       x: 50,    y: 595, width: 40,  height: 51,  order: 3,  purchased: false },
    { id: "fuel-tank",     name: "Réservoir",     description: "Carburant", cost: 450,          image: "⛽",       imgPath: "images/rocket/fuel-tank.png",     x: 50,    y: 537, width: 40,  height: 58,  order: 4,  purchased: false },
    { id: "rocket-body",   name: "Corps",          description: "Structure", cost: 1300,         image: "🏭",       imgPath: "images/rocket/body.png",          x: 50,    y: 337, width: 40,  height: 200, order: 5,  purchased: false },
    { id: "boosters-left", name: "Boosters Gauche", description: "Propulsion supplémentaire", cost: 3800,         image: "🚀",       imgPath: "images/rocket/boosters-left.png", x: 45.8,  y: 373, width: 50,  height: 300, order: 6,  purchased: false },
    { id: "boosters-right",name: "Boosters Droit",  description: "Propulsion supplémentaire", cost: 11000,        image: "🚀",       imgPath: "images/rocket/boosters-right.png",x: 54.2,  y: 373, width: 50,  height: 300, order: 6,  purchased: false },
    { id: "cockpit",       name: "Cockpit",        description: "Poste de pilotage", cost: 32000,        image: "👨‍🚀", imgPath: "images/rocket/cockpit.png",        x: 50,    y: 292, width: 45,  height: 45,  order: 7,  purchased: false },
    { id: "shield",        name: "Bouclier",       description: "Protection", cost: 93000,        image: "🛡️",       imgPath: "images/rocket/shield.png",        x: 50,    y: 233, width: 45,  height: 59,  order: 8,  purchased: false },
    { id: "launch-pad",    name: "Pas de tir",     description: "Lancement", cost: 270000,       image: "🚀",       imgPath: "images/rocket/launch-pad.png",    x: 60.2,  y: 205, width: 190, height: 481, order: 9,  purchased: false },
    { id: "astronaut",     name: "Astronaute",    description: "Pilote", cost: 638000,       image: "👩‍🚀", imgPath: "images/rocket/astronaut.png",     x: 40,    y: 635, width: 25,  height: 60,  order: 10, purchased: false }
];




// Ameliorations de clic inspirees de Cookie Clicker :
// - Chacune double la valeur de base du clic (x2, comme Reinforced finger / Carpal tunnel).
// - A partir de la 2e, debloque un bonus par bâtiment possede ( Thousand Fingers).
// - Les couts suivent l'echelle ~x10 de Cookie Clicker.
const CLICK_UPGRADES = [
    // Deblocage par Parts gagnees via les clics uniquement, cumulees depuis
    // le debut du run (reset au lancement comme les upgrades). Le cout reste
    // le vrai verrou, decalant chaque achat dans le temps.
    { threshold: 100,       name: "Doigt renforcé",        cost: 100 },
    { threshold: 500,       name: "Précision laser",       cost: 500 },
    { threshold: 2500,      name: "Lancement puissant",   cost: 10000 },
    { threshold: 10000,     name: "Ingénieur expert",     cost: 50000 },
    { threshold: 50000,     name: "Scientifique spatial",  cost: 1000000 },
    { threshold: 250000,    name: "Pionnier galactique",  cost: 5000000 },
    { threshold: 1000000,   name: "Click galactique",     cost: 100000000 },
    { threshold: 5000000,   name: "Maître cosmique",      cost: 500000000 },
    { threshold: 25000000,  name: "Puissance interstellaire", cost: 10000000000 },
    { threshold: 100000000, name: "Main de l'univers",   cost: 50000000000 }
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
    { id: "meteor", symbol: "🌠", name: "Pluie de météores", effect: "instant", type: "meteor", colorClass: "meteor" },
    { id: "flare", symbol: "☀️", name: "Éruption solaire", effect: "multiplier", type: "flare", multiplier: 5, duration: 15000, colorClass: "flare" }
];

const SAVE_VERSION = "2.2.0";

// ============================================
// TROPH\u0009ES
// ============================================
const TROPHY_COLORS = {
    pps: ['#88c9ee', '#4499ff', '#1177ff', '#0066ff', '#6622ff', '#aa00dd', '#ff0055'],
    planets: ['#94a3b8', '#ef4444', '#06b6d4', '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#fbbf24', '#ec4899', '#a855f7'],
    launches: ['#66b2ff', '#2288ff', '#8800ff', '#ff8800'],
    stardust: ['#6622ff', '#cc00bb', '#ffcc00'],
    'building-upgrade': ['#88c9ee', '#2288ff', '#aa00dd', '#ff4411'],
    'click-upgrade': ['#1177ff', '#ffaa00'],
    building: ['#88c9ee', '#2288ff', '#8800ff', '#ff0055'],
    score: ['#ffcc00', '#ff8800', '#ffee00'],
    bonus: ['#f59e0b', '#ff2233'],
    'building-types': ['#a855f7'],
    cards: ['#94a3b8', '#a855f7']
};
const TROPHIES = [
    // Parts par seconde (icônes: bâtiments du jeu, du plus humble au plus puissant)
    { id: "pps-1", name: "First Parts", description: "Atteindre 1 Parts par seconde", icon: "images/parts.png", threshold: 1, type: "pps" },
    { id: "pps-10", name: "Liftoff", description: "Atteindre 10 Parts par seconde", icon: "images/parts.png", threshold: 10, type: "pps" },
    { id: "pps-100", name: "Orbit Achieved", description: "Atteindre 100 Parts par seconde", icon: "images/parts.png", threshold: 100, type: "pps" },
    { id: "pps-1000", name: "Space Speed", description: "Atteindre 1 000 Parts par seconde", icon: "images/parts.png", threshold: 1000, type: "pps" },
    { id: "pps-10000", name: "Galactic Speed", description: "Atteindre 10 000 Parts par seconde", icon: "images/parts.png", threshold: 10000, type: "pps" },
    { id: "pps-100000", name: "Warp Speed", description: "Atteindre 100 000 Parts par seconde", icon: "images/parts.png", threshold: 100000, type: "pps" },
    { id: "pps-1000000", name: "Light Speed", description: "Atteindre 1 000 000 Parts par seconde", icon: "images/parts.png", threshold: 1000000, type: "pps" },
    { id: "pps-10000000", name: "Hyperdrive", description: "Atteindre 10 000 000 Parts par seconde", icon: "images/parts.png", threshold: 10000000, type: "pps" },
    { id: "pps-100000000", name: "Star Forge", description: "Atteindre 100 000 000 Parts par seconde", icon: "images/parts.png", threshold: 100000000, type: "pps" },
    { id: "pps-1000000000", name: "Cosmic Engine", description: "Atteindre 1 000 000 000 Parts par seconde", icon: "images/parts.png", threshold: 1000000000, type: "pps" },
    { id: "pps-10000000000", name: "Reality Bender", description: "Atteindre 10 000 000 000 Parts par seconde", icon: "images/parts.png", threshold: 10000000000, type: "pps" },

    // Progression spatiale (icônes: images des planètes)
    { id: "planet-moon", name: "Premier Pas", description: "Atteindre la Lune", icon: "images/planets/moon.png", threshold: 1, type: "planets" },
    { id: "planet-mars", name: "Explorateur Martien", description: "Atteindre Mars", icon: "images/planets/mars.png", threshold: 2, type: "planets" },
    { id: "planet-neptune", name: "Lointaine Neptune", description: "Atteindre Neptune", icon: "images/planets/neptune.png", threshold: 3, type: "planets" },
    { id: "planet-pluto", name: "Aux Confins du Système", description: "Atteindre Pluton", icon: "images/planets/pluto.png", threshold: 4, type: "planets" },
    { id: "planet-proxima", name: "Voyageur Interstellaire", description: "Atteindre Proxima Centauri", icon: "images/planets/proxima-centauri.png", threshold: 5, type: "planets" },
    { id: "planet-sirius", name: "Éclat de Sirius", description: "Atteindre Sirius", icon: "images/planets/sirius.png", threshold: 6, type: "planets" },
    { id: "planet-oort", name: "Le Grand Nuage", description: "Atteindre le Nuage d'Oort", icon: "images/planets/oort-cloud.png", threshold: 7, type: "planets" },
    { id: "planet-milky", name: "Cœur de la Galaxie", description: "Atteindre le Centre de la Voie lactée", icon: "images/planets/milky-way-center.png", threshold: 8, type: "planets" },
    { id: "planet-andromeda", name: "Galaxie Voisine", description: "Atteindre Andromède", icon: "images/planets/andromeda.png", threshold: 9, type: "planets" },
    { id: "planet-virgo", name: "Conquérant de l'Univers", description: "Atteindre l'Amas de Virgo", icon: "images/planets/virgo-cluster.png", threshold: 10, type: "planets" },

    // Lancements de fusée (icônes: pièces de fusée)
    { id: "launch-1", name: "Décollage !", description: "Réaliser votre premier lancement", icon: "images/rocket/engines.png", threshold: 1, type: "launches" },
    { id: "launch-5", name: "Pilote Confirmé", description: "Réaliser 5 lancements", icon: "images/rocket/cockpit.png", threshold: 5, type: "launches" },
    { id: "launch-15", name: "Escadron Spatial", description: "Réaliser 15 lancements", icon: "images/rocket/boosters-left.png", threshold: 15, type: "launches" },
    { id: "launch-30", name: "Flotte Interstellaire", description: "Réaliser 30 lancements", icon: "images/rocket/astronaut.png", threshold: 30, type: "launches" },
    { id: "launch-50", name: "Vétéran des Étoiles", description: "Réaliser 50 lancements", icon: "images/rocket/astronaut.png", threshold: 50, type: "launches" },
    { id: "launch-100", name: "Légende Cosmique", description: "Réaliser 100 lancements", icon: "images/rocket/astronaut.png", threshold: 100, type: "launches" },

    // Poussière d'étoiles (icônes: cartes du jeu)
    { id: "dust-1", name: "Première Poussière", description: "Gagner 1 Poussière d'Étoiles", icon: "images/cards/collection/comet-card.png", threshold: 1, type: "stardust" },
    { id: "dust-100", name: "Collectionneur Cosmique", description: "Gagner 100 Poussière d'Étoiles au total", icon: "images/cards/collection/nova-card.png", threshold: 100, type: "stardust" },
    { id: "dust-1000", name: "Maître de la Poussière", description: "Gagner 1 000 Poussière d'Étoiles au total", icon: "images/cards/collection/supernova-card.png", threshold: 1000, type: "stardust" },
    { id: "dust-10000", name: "Semeur d'Étoiles", description: "Gagner 10 000 Poussière d'Étoiles au total", icon: "images/cards/collection/comet-card.png", threshold: 10000, type: "stardust" },
    { id: "dust-100000", name: "Architecte Céleste", description: "Gagner 100 000 Poussière d'Étoiles au total", icon: "images/cards/collection/nova-card.png", threshold: 100000, type: "stardust" },

    // Améliorations de bâtiments (icônes: bâtiments)
    { id: "first-upgrade", name: "First Upgrade", description: "Acheter votre première amélioration de bâtiment", icon: "images/buildings/workshop.png", threshold: 1, type: "building-upgrade" },
    { id: "five-upgrades", name: "Upgrade Master", description: "Avoir 5 améliorations de bâtiment", icon: "images/buildings/factory.png", threshold: 5, type: "building-upgrade" },
    { id: "ten-upgrades", name: "Engineering Genius", description: "Avoir 10 améliorations de bâtiment", icon: "images/buildings/essaim-sonde.png", threshold: 10, type: "building-upgrade" },
    { id: "twenty-upgrades", name: "Upgrade Legend", description: "Avoir 20 améliorations de bâtiment", icon: "images/buildings/antimatter_collector.png", threshold: 20, type: "building-upgrade" },
    { id: "fifty-upgrades", name: "Génie de l'Ingénierie", description: "Avoir 50 améliorations de bâtiment", icon: "images/buildings/nanoforge.png", threshold: 50, type: "building-upgrade" },
    { id: "hundred-upgrades", name: "Ingénieur Cosmique", description: "Avoir 100 améliorations de bâtiment", icon: "images/buildings/quantic_printer.png", threshold: 100, type: "building-upgrade" },

    // Améliorations de clic (icônes: pièce fusée + astronaute)
    { id: "first-click-upgrade", name: "First Launch", description: "Acheter votre première amélioration de clic", icon: "images/rocket/nozzles.PNG", threshold: 1, type: "click-upgrade" },
    { id: "all-click-upgrades", name: "Launch Master", description: "Débloquer toutes les améliorations de clic", icon: "images/rocket/astronaut.png", threshold: CLICK_UPGRADES.length, type: "click-upgrade" },

    // Bâtiments possédés (icônes: bâtiments)
    { id: "first-building", name: "First Component", description: "Acheter votre premier bâtiment", icon: "images/buildings/workshop.png", threshold: 1, type: "building" },
    { id: "ten-buildings", name: "Space Builder", description: "Posséder 10 bâtiments au total", icon: "images/buildings/factory.png", threshold: 10, type: "building" },
    { id: "hundred-buildings", name: "Space Architect", description: "Posséder 100 bâtiments au total", icon: "images/buildings/stellar-mine.png", threshold: 100, type: "building" },
    { id: "thousand-buildings", name: "Galactic Builder", description: "Posséder 1 000 bâtiments au total", icon: "images/buildings/nanoforge.png", threshold: 1000, type: "building" },
    { id: "five-thousand-buildings", name: "Bâtisseur Stellaire", description: "Posséder 5 000 bâtiments au total", icon: "images/buildings/antimatter_collector.png", threshold: 5000, type: "building" },
    { id: "ten-thousand-buildings", name: "Empereur du Vide", description: "Posséder 10 000 bâtiments au total", icon: "images/buildings/essaim-sonde.png", threshold: 10000, type: "building" },

    // Score total (icônes: parts et cartes)
    { id: "score-1000", name: "Small Start", description: "Atteindre 1 000 Parts", icon: "images/parts.png", threshold: 1000, type: "score" },
    { id: "score-1000000", name: "Millionaire", description: "Atteindre 1 000 000 Parts", icon: "images/cards/collection/earth-card.png", threshold: 1000000, type: "score" },
    { id: "score-1000000000", name: "Billionaire", description: "Atteindre 1 000 000 000 Parts", icon: "images/cards/collection/sirius-card.png", threshold: 1000000000, type: "score" },
    { id: "score-1000000000000", name: "Trillionaire", description: "Atteindre 1 000 000 000 000 Parts", icon: "images/cards/collection/oort-card.png", threshold: 1000000000000, type: "score" },
    { id: "score-1000000000000000", name: "Quadrillionaire", description: "Atteindre 1 000 000 000 000 000 Parts", icon: "images/cards/collection/supernova-card.png", threshold: 1000000000000000, type: "score" },
    { id: "score-10000000000000000", name: "Maître de l'Univers", description: "Atteindre 10 000 000 000 000 000 Parts", icon: "images/cards/collection/blackhole-card.png", threshold: 10000000000000000, type: "score" },
    { id: "score-100000000000000000", name: "Au-delà de l'Univers", description: "Atteindre 100 000 000 000 000 000 Parts", icon: "images/planets/milky-way-center.png", threshold: 100000000000000000, type: "score" },

    // Bonus cliqués (icônes: comète)
    { id: "first-bonus", name: "First Bonus", description: "Cliquer votre premier bonus aléatoire", icon: "images/effects/comète.png", threshold: 1, type: "bonus" },
    { id: "ten-bonuses", name: "Bonus Hunter", description: "Cliquer 10 bonus aléatoires", icon: "images/cards/collection/meteor-card.png", threshold: 10, type: "bonus" },
    { id: "fifty-bonuses", name: "Chasseur de Comètes", description: "Cliquer 50 bonus aléatoires", icon: "images/effects/comète.png", threshold: 50, type: "bonus" },
    { id: "hundred-bonuses", name: "Cerveau Cosmique", description: "Cliquer 100 bonus aléatoires", icon: "images/effects/comète.png", threshold: 100, type: "bonus" },

    // Collection (icône: carte trou noir)
    { id: "all-buildings", name: "Space Collector", description: "Débloquer tous les types de bâtiments", icon: "images/cards/collection/blackhole-card.png", threshold: BUILDINGS.length, type: "building-types" },
    { id: "cards-10", name: "Cartothécaire", description: "Posséder 10 cartes de collection", icon: "images/cards/collection/moon-card.png", threshold: 10, type: "cards" },
    { id: "cards-20", name: "Collection Complète", description: "Posséder toutes les cartes de collection", icon: "images/cards/collection/oort-card.png", threshold: 20, type: "cards" },
];

// ============================================
// GLOBAL VARIABLES
// ============================================
let score = 0;
let partsPerSecond = 0;
let partsSinceLaunch = 0;
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
let lastRocketPartsUpdate = 0;
let lastSpaceProgressUpdate = 0;
let gameStartTime = 0;
let startupBonusApplied = false;
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
let starDust = 0; // Poussière d'Étoiles : monnaie de prestige persistante
let totalStardustEarned = 0; // Cumul de toutes les Poussière d'Étoiles gagnées (trophées)


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

let isLaunching = false;

// ============================================
// SPACE MAP SYSTEM (Planets & Bonuses)
// ============================================
const PLANETS = [
    { id: 'earth', name: 'Terre', emoji: '\uD83C\uDF0D', distanceRequired: 0, bonusPercent: 0, color: '#10b981', imgPath: 'images/planets/earth.png' },
    { id: 'moon', name: 'Lune', emoji: '\uD83D\uDD11', distanceRequired: 384400, bonusPercent: 30, color: '#a9a9a9', imgPath: 'images/planets/moon.png' },
    { id: 'mars', name: 'Mars', emoji: '\u2642', distanceRequired: 4120000, bonusPercent: 35, color: '#ef4444', imgPath: 'images/planets/mars.png' },
    { id: 'neptune', name: 'Neptune', emoji: '\u2645', distanceRequired: 47800000, bonusPercent: 40, color: '#06b6d4', imgPath: 'images/planets/neptune.png' },
    { id: 'pluto', name: 'Pluton', emoji: '\u2646', distanceRequired: 563000000, bonusPercent: 45, color: '#8b5cf6', imgPath: 'images/planets/pluto.png' },
    { id: 'proxima-centauri', name: 'Proxima Centauri', emoji: '\u2609', distanceRequired: 6100000000, bonusPercent: 50, color: '#10b981', imgPath: 'images/planets/proxima-centauri.png' },
    { id: 'sirius', name: 'Sirius', emoji: '\u2609', distanceRequired: 72500000000, bonusPercent: 55, color: '#3b82f6', imgPath: 'images/planets/sirius.png' },
    { id: 'oort-cloud', name: "Nuage d'Oort", emoji: '\u2728', distanceRequired: 891000000000, bonusPercent: 60, color: '#f59e0b', imgPath: 'images/planets/oort-cloud.png' },
    { id: 'milky-way-center', name: 'Centre Voie lactée', emoji: '\uD83C\uDF0C', distanceRequired: 12800000000000, bonusPercent: 65, color: '#fbbf24', imgPath: 'images/planets/milky-way-center.png' },
    { id: 'andromeda', name: 'Andromède', emoji: '\uD83C\uDF0C', distanceRequired: 156000000000000, bonusPercent: 75, color: '#ec4899', imgPath: 'images/planets/andromeda.png' },
    { id: 'virgo-cluster', name: 'Amas de Virgo', emoji: '\u2728', distanceRequired: 2010000000000000, bonusPercent: 90, color: '#a855f7', imgPath: 'images/planets/virgo-cluster.png' }
];

let unlockedPlanets = new Set(['earth']);
let planetBonuses = {}; // {planetId: bonusMultiplier}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function initLanguageSafe() { if (typeof initLanguage === 'function') initLanguage(); }
function initGlobals() {
    BUILDINGS.forEach(building => {
        totalGeneratedByBuilding[building.id] = totalGeneratedByBuilding[building.id] || 0;
        buildingUpgrades[building.id] = buildingUpgrades[building.id] || [];
    });
}

function findBuildingById(buildingId) {
    return BUILDINGS.find(b => b.id === buildingId);
}

function getPrestigeProductionBoost() {
    const p = isNaN(prestigeMultiplier) ? 1 : prestigeMultiplier;
    return 1 + (p - 1) / 2;
}
function getPlanetProductionBonus() {
    return 1 + getTotalPlanetBonus() + unlockedTrophies.size * 0.01;
}
function getTotalProductionMultiplier() {
    const auto = isNaN(autoMultiplier) || autoMultiplier === undefined ? 1 : autoMultiplier;
    return auto
        * getCollectionMultiplier()
        * getProductionBonus()
        * getPrestigeProductionBoost()
        * getPlanetProductionBonus();
}

function calculateBuildingGain(building) {
    const upgradeMultiplier = getBuildingUpgradeMultiplier(building.id);
    return building.gain * building.count * autoMultiplier * upgradeMultiplier * getContractBuildingMultiplier(building.id) * getCollectionMultiplier() * getProductionBonus() * getPrestigeProductionBoost() * getPlanetProductionBonus();
}

function calculateUnitBuildingGain(building) {
    const upgradeMultiplier = getBuildingUpgradeMultiplier(building.id);
    return building.gain * autoMultiplier * upgradeMultiplier * getContractBuildingMultiplier(building.id) * getCollectionMultiplier() * getProductionBonus() * getPrestigeProductionBoost() * getPlanetProductionBonus();
}

// Chaque upgrade de bâtiment double sa production (×2 par palier),
// comme les tiered upgrades de Cookie Clicker.
function getBuildingUpgradeMultiplier(buildingId) {
    const upgrades = buildingUpgrades[buildingId] || [];
    return Math.pow(2, upgrades.length);
}

function isBuildingUpgradeAvailable(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building) return false;
    
    const upgrades = buildingUpgrades[buildingId] || [];
    const thresholdIndex = BUILDING_UPGRADE_THRESHOLDS.indexOf(threshold);
    
    return building.count >= threshold &&
           !upgrades.includes(threshold) &&
           (thresholdIndex === 0 || upgrades.includes(BUILDING_UPGRADE_THRESHOLDS[thresholdIndex - 1]));
}

function getBuildingTooltip(building) {
    const unitGain = calculateUnitBuildingGain(building);
    const totalGain = calculateBuildingGain(building);
    const percent = partsPerSecond > 0 ? ((totalGain / partsPerSecond) * 100).toFixed(2) : 0;
    return tf('{flavor}: +{gain} Parts/s\n% de la production: {percent}%\nTotal g\u00e9n\u00e9r\u00e9: {total} Parts', {
        flavor: t(building.description),
        gain: formatNumber(unitGain),
        percent: percent,
        total: formatNumber(totalGeneratedByBuilding[building.id] || 0)
    });
}

// Coût d'un upgrade de bâtiment au palier `threshold` : baseCost × 10^(index du palier)
// (style Cookie Clicker : chaque palier coûte ~10× le précédent, proportionnel au bâtiment).
// Déterministe : ne dépend d'aucun état de jeu, donc pas de cache figé.
const BUILDING_UPGRADE_COST_GROWTH = 10;
const BUILDING_UPGRADE_COST_DIVISOR = 2;

function getBuildingUpgradeFixedCost(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building) return 0;
    const tierIndex = BUILDING_UPGRADE_THRESHOLDS.indexOf(threshold);
    const tier = tierIndex === -1 ? 0 : tierIndex;
    return Math.floor(building.baseCost * Math.pow(BUILDING_UPGRADE_COST_GROWTH, tier) / BUILDING_UPGRADE_COST_DIVISOR);
}

// Prix du prochain bâtiment : baseCost × 1.15^(bâtiments possédés)
// (formule exacte de Cookie Clicker). Pour count=0 le multiplicateur vaut 1.
function calculateBuildingCost(building) {
    const reduction = getBuildingCostReduction();
    return Math.floor(building.baseCost * Math.pow(BUILDING_PRICE_GROWTH_RATE, building.count) * (1 - reduction));
}

// Fonction de formatage optimisée
function groupThousands(n) {
    return Math.round(n).toLocaleString('fr-FR').replace(/[\u202F\u00A0]/g, ' ');
}

function formatNumber(num, isTotalScore) {
    if (num === 0) return "0";
    
    const absNum = Math.abs(num);
    
    // Nombres < 1000
    if (absNum < 1000) {
        return num % 1 === 0 ? Math.round(num).toString() : num.toFixed(1);
    }
    
    // Nombres entre 1000 et 999999
    if (absNum < 1000000) {
        if (num % 1 === 0) return groupThousands(num);
        const intPart = Math.floor(num);
        const decPart = (num - intPart).toFixed(1).slice(2);
        return groupThousands(intPart) + '.' + decPart;
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
    
    return scaled.toFixed(decimals) + " " + suffix;
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

function showToast(message, icon) {
    const toast = document.getElementById('toast');
    toast.innerHTML = '';
    if (icon) {
        const iconEl = document.createElement('span');
        iconEl.className = 'toast-icon';
        if (icon.startsWith('images/')) {
            const img = document.createElement('img');
            img.src = icon;
            img.alt = '';
            iconEl.appendChild(img);
        } else {
            iconEl.textContent = icon;
        }
        toast.appendChild(iconEl);
    }
    const textEl = document.createElement('span');
    textEl.textContent = message;
    toast.appendChild(textEl);
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
        partsSinceLaunch: partsSinceLaunch,
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
        starDust: starDust,
        totalStardustEarned: totalStardustEarned,
        galacticUpgrades: {...galacticUpgrades},
        rocketsLaunched: rocketsLaunched,
        unlockedPlanets: Array.from(unlockedPlanets),
        planetBonuses: {...planetBonuses},
        cardCollection: {...cardCollection},
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
        rocketParts: ROCKET_PARTS.map(part => ({
            id: part.id,
            purchased: part.purchased
        })),
        startupBonusApplied: startupBonusApplied,
        contractState: {
            offers: contractState.offers,
            active: contractState.active,
            buildingBonuses: contractState.buildingBonuses,
            nextRotationAt: contractState.nextRotationAt
        },
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
        partsSinceLaunch = parsed.partsSinceLaunch || score;
        autoMultiplier = parsed.autoMultiplier || 1;
        clickMultiplier = parsed.clickMultiplier || 1;
        totalPartsFromClicks = parsed.totalPartsFromClicks || parsed.clickPartsTotal || 0;
        clickedBonusesCount = parsed.clickedBonusesCount || 0;
        unlockedTrophies = new Set(parsed.unlockedTrophies || []);
        
        // Charger le système de prestige
        maxDistance = parsed.maxDistance || 0;
        prestigeMultiplier = parsed.prestigeMultiplier || 1;
        starDust = parsed.starDust || 0;
        totalStardustEarned = parsed.totalStardustEarned || 0;
        galacticUpgrades = parsed.galacticUpgrades || {};
        // V2.2: les upgrades galactiques sont uniques (maxLevel=1).
        // Cap les niveaux anciens pour eviter des bonus excesifs.
        Object.keys(galacticUpgrades).forEach(uid => {
            const u = GALACTIC_UPGRADES.find(x => x.id === uid);
            if (!u) {
                delete galacticUpgrades[uid];
            } else if (galacticUpgrades[uid] > u.maxLevel) {
                galacticUpgrades[uid] = u.maxLevel;
            }
        });
        rocketsLaunched = parsed.rocketsLaunched || 0;
        
        activatedClickUpgrades = parsed.activatedClickUpgrades || [];
        unlockedBuildings = new Set(parsed.unlockedBuildings || []);
        gameStartTime = parsed.gameStartTime || 0;
        startupBonusApplied = !!parsed.startupBonusApplied;
        if (parsed.contractState) {
            contractState.offers = parsed.contractState.offers || [];
            contractState.active = parsed.contractState.active || null;
            contractState.buildingBonuses = parsed.contractState.buildingBonuses || {};
            contractState.nextRotationAt = parsed.contractState.nextRotationAt || 0;
        }

        if (parsed.cardCollection) {
            cardCollection = {...parsed.cardCollection};
        }

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

        // Charger l'état des pièces de fusée (achats uniques)
        if (parsed.rocketParts) {
            parsed.rocketParts.forEach(savedPart => {
                const part = ROCKET_PARTS.find(p => p.id === savedPart.id);
                if (part) {
                    part.purchased = !!savedPart.purchased;
                }
            });
        }

        // Restaurer les planetes atteintes et leurs bonus de production
        if (parsed.unlockedPlanets) {
            unlockedPlanets = new Set(parsed.unlockedPlanets);
            PLANETS.forEach(planet => {
                if (unlockedPlanets.has(planet.id)) {
                    planetBonuses[planet.id] = planet.bonusPercent / 100;
                }
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
        applyOfflineEarnings(parsed.lastSave);

    } catch (e) {
        console.error("Erreur de chargement :", e);
        localStorage.removeItem('starshipClickerSave');
        showToast("\u26a0\ufe0f " + t("Sauvegarde corrompue. Nouvelle partie."));
    }
}

function exportSave() {
    const saveData = localStorage.getItem('starshipClickerSave');
    if (saveData) {
        navigator.clipboard.writeText(saveData)
            .then(() => showToast("\u2705 " + t("Sauvegarde copiée !")))
            .catch(() => showToast("\u274c " + t("Échec de la copie.")));
    } else {
        showToast("\u274c " + t("Aucune sauvegarde."));
    }
}

function importSave() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) { showToast("\u274c " + t("Rien à importer.")); return; }
    try {
        const testParse = JSON.parse(importText);
        if (testParse.version && testParse.buildings && testParse.buildingUpgrades) {
            localStorage.setItem('starshipClickerSave', importText);
            showToast("\u2705 " + t("Importé ! Redémarrage..."));
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast("\u274c " + t("Format invalide."));
        }
    } catch (e) {
        showToast("\u274c " + t("Format invalide."));
    }
}

function confirmDeleteSave() {
    if (confirm("\u26a0\ufe0f " + t("Supprimer la sauvegarde ? Tous vos progrès seront PERDUS !"))) {
        deleteSave();
    }
}

function deleteSave() {
    localStorage.removeItem('starshipClickerSave');
    showToast("\ud83d\uddd1\ufe0f " + t("Supprimé !"));
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
        showToast(t("Multiplicateur:") + " Max");
    } else {
        document.getElementById(`multiplier-x${multiplier}`).classList.add('active');
        showToast(t("Multiplicateur:") + ` x${multiplier}`);
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
        updateAllBuildingButtons();
        renderUpgrades();
        checkBuildingUnlocks();
        const maxText = buyMultiplier === 'max' ? ' (Max)' : '';
        showToast(`\u2705 +${buildingsToBuy} ${t(building.name)}${maxText}`);
        checkTrophies();
    } else {
        showToast("\u274c " + t("Pas assez de Parts"));
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
        showToast("\u2705 " + t("Already activated!"));
        return;
    }
    
    if (score < upgrade.cost) {
        showToast("\u274c " + t("Pas assez de Parts"));
        return;
    }
    
    score -= upgrade.cost;
    activatedClickUpgrades.push(threshold);
    updateDisplay();
    saveGame();
    hideTooltip();
    renderUpgrades();
    updateAllBuildingButtons();
    showToast(`\u2705 ${t(upgrade.name)} ${t("activated")}`);
}

function buyBuildingUpgrade(buildingId, threshold) {
    const building = findBuildingById(buildingId);
    if (!building || !isBuildingUpgradeAvailable(buildingId, threshold)) return;
    
    const cost = getBuildingUpgradeFixedCost(buildingId, threshold);
    
    if (score < cost) {
        showToast("\u274c " + t("Pas assez de Parts"));
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
    showToast('+ ' + t(building.name) + ' ' + t('am\u00e9lior\u00e9 x2') + ' (-' + formatNumber(cost) + ' Parts)');
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
        button.textContent = `${displayCost} ${t("Parts")}`;
    }
    if (productionSpan) productionSpan.textContent = `${formatNumber(totalGain)}/s`;
    if (ownershipDiv) ownershipDiv.textContent = `${t("Owned:")} ${building.count}`;

    element.setAttribute('data-tooltip', getBuildingTooltip(building));
}

function updateAllBuildingButtons() {
    document.querySelectorAll('.building-item').forEach(element => {
        const buildingId = element.id.replace('building-', '');
        updateBuildingButton(buildingId);
    });
}

function isBuildingUnlocked(building) {
    return building.unlockCondition ? building.unlockCondition() : true;
}

function checkBuildingUnlocks() {
    let needsRerender = false;
    BUILDINGS.forEach((building) => {
        if (isBuildingUnlocked(building) && !unlockedBuildings.has(building.id)) {
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

    BUILDINGS.forEach((building) => {
        if (isBuildingUnlocked(building) || unlockedBuildings.has(building.id)) {
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

    // Créer la structure avec l'image ou l'emoji du bâtiment
    const imageUrl = building.imgPath || '';
    const imageHtml = imageUrl
        ? `<img src="${imageUrl}" class="building-image" alt="${building.name}" width="${building.width || 84}" height="${building.height || 84}">`
        : `<span class="building-emoji">${building.image || ''}</span>`;

    buildingElement.innerHTML = `
        <div class="building-left">
            <div class="building-name-icon">
                <span class="building-name">${t(building.name)}</span>
            </div>
            <div class="building-ownership">
                ${t("Owned:")} ${building.count}
            </div>
        </div>
        <div class="building-center">
            ${imageHtml}
        </div>
        <div class="building-right">
            <button onclick="buyBuilding('${building.id}')" ${!isAffordable ? 'disabled' : ''}>
                ${formatNumber(currentCost)} ${t("Parts")}
            </button>
            <div class="building-production">${formatNumber(totalGain)}/s</div>
        </div>
    `;

    if (!IS_TOUCH) {
        buildingElement.addEventListener('mouseenter', (e) => {
            const rect = buildingElement.getBoundingClientRect();
            showTooltip(getBuildingTooltip(building), rect.left, rect.top, {
                align: 'left',
                width: Math.round(rect.width * 0.75)
            });
            tooltipLiveRefresh = () => getBuildingTooltip(building);
        });
        buildingElement.addEventListener('mouseleave', hideTooltip);
    }
    if (IS_TOUCH) {
        buildingElement.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            showTouchTooltip(buildingElement, getBuildingTooltip(building));
            tooltipLiveRefresh = () => getBuildingTooltip(building);
        });
    }

    container.appendChild(buildingElement);
}

// ============================================
// ROCKET LAUNCH SYSTEM
// ============================================

function checkRocketReady() {
    // Vérifier si toutes les pièces de fusée sont achetées
    return ROCKET_PARTS.every(part => part.purchased);
}

const PIECE_DISTANCE_MULT = 1.0;
const MOON_DISTANCE = 384400;
// Parts cumulees produites lors du premier lancement d'une nouvelle partie.
// Ce point d'ancrage calibre le debut de la courbe de distance.
// 10.5M parts pour la Lune: debut de partie rapide meme en jeu casual
// (la moitie du cumul d'un premier lancement, soit ~20-30 min de jeu).
const DISTANCE_MOON_PARTS = 1.05e7;
// Distance en deux segments:
// - jusqu'a DISTANCE_MOON_PARTS parts : croissance lineaire (Lune atteignable
//   des le premier lancement, debut de partie rapide et gratifiant)
// - au-dela : croissance lineaire, distance proportionnelle aux parts
//   (exposant 1 = aucun effet).
const DISTANCE_SCORE_EXP = 1.0;
// Gain de Poussière d'Étoiles par lancement, en deux segments:
// - jusqu'au Nuage d'Oort : (d / Lune)^0.44 (identique a avant)
// - au-dela : croissance ralentie (exposant 0.35) ancree sur la valeur a Oort,
//   pour que les derniers lancements ne donnent pas des montants enormes.
// Calibré pour : Lune = 1 PE minimum, arbre complet atteignable vers Andromède.
const STARDUST_DISTANCE_EXP = 0.44;
const STARDUST_TAIL_EXP = 0.35;
const STARDUST_TAIL_START_KM = 891000000000; // Nuage d'Oort

// Croissance du coût des pièces de fusée entre les lancements.
// Douce (×1.15) pour que la fusée se reconstruise vite après un reset,
// comme dans Cookie Clicker où l'ascension est toujours accessible.
const ROCKET_PART_COST_GROWTH = 1.15;

function calculateDistance() {
    const partsUnlocked = ROCKET_PARTS.filter(part => part.purchased).length;
    const totalParts = Math.max(partsSinceLaunch, 0);
    const partsMult = Math.pow(PIECE_DISTANCE_MULT, partsUnlocked);
    const scoreFactor = totalParts > 0
        ? (totalParts <= DISTANCE_MOON_PARTS
            ? MOON_DISTANCE * (totalParts / DISTANCE_MOON_PARTS)
            : MOON_DISTANCE * Math.pow(totalParts / DISTANCE_MOON_PARTS, DISTANCE_SCORE_EXP))
        : 0;
    const baseDistance = partsMult * scoreFactor;

    // Le prestige aide la distance mais de façon amortie (logarithmique) pour que
    // chaque planète reste plus difficile à atteindre que la précédente.
    const prestige = isNaN(prestigeMultiplier) ? 1 : prestigeMultiplier;
    const prestigeDistanceBoost = 1 + (prestige - 1) / 2;

    return baseDistance * prestigeDistanceBoost * getDistanceBonus();
}

function getCurrentDistance() {
    // Retourne la dernière distance calculée au lancement
    return lastLaunchDistance;
}

function launchRocket() {
    if (!checkRocketReady()) {
        showToast("❌ " + t("Fusée pas encore prête ! Il manque des pièces."));
        return;
    }
    
    if (isLaunching) {
        showToast("⏳ " + t("Lancement en cours..."));
        return;
    }
    
    isLaunching = true;
    
    // Calculer la distance
    const distance = calculateDistance();
    
    // Animation de lancement (à améliorer plus tard)
    const medal = document.getElementById('medal');
    medal.classList.remove('bounce');
    medal.style.transform = 'translateY(-50%) scale(0.8)';
    medal.style.transition = 'transform 0.5s';
    
    setTimeout(() => {
        medal.style.transform = 'translateY(-50%) translateY(-200px) scale(1.5)';
        medal.style.opacity = '0';
        medal.style.transition = 'all 2s';
    }, 500);
    
    // Après l'animation, afficher la carte spatiale AVANT le reset
    setTimeout(() => {
        medal.style.transform = 'translateY(-50%)';
        medal.style.opacity = '1';
        medal.style.transition = 'none';
        
        // Afficher la carte spatiale avec la progression
        lastLaunchDistance = distance;
        showSpaceMap(distance);
        updateSpaceProgress();
        updateConstructionScene();
        isLaunching = false;
        showToast(`🚀 ${t("Fusée lancée ! Distance atteinte:")} ${formatNumber(distance)} ${t("km")}`);
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
    const stardustEl = document.getElementById('launch-results-stardust');
    if (stardustEl) {
        const dustGained = calculateStardustGain(safeDistance);
        stardustEl.textContent = '+' + formatNumber(dustGained) + '  (total: ' + formatNumber(starDust) + ')';
    }
    
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

    // Earth (index 0) est le point de départ, pas un objectif.
    // On la traite comme si on n'avait pas encore atteint de planète.
    if (currentPlanetIndex <= 0) {
        return {
            currentPlanet: null,
            nextPlanet: PLANETS[1],
            progressPercent: Math.round((distance / PLANETS[1].distanceRequired) * 100)
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
        nextPlanets = [PLANETS[1], PLANETS[2]];
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
        if (planet.id === 'earth') return;
        if (distance >= planet.distanceRequired && !unlockedPlanets.has(planet.id)) {
            newlyUnlocked.push(planet);
        }
    });
    
    return newlyUnlocked;
}

function applyNewPlanets(newlyUnlocked) {
    newlyUnlocked.forEach(planet => {
        unlockedPlanets.add(planet.id);
        planetBonuses[planet.id] = planet.bonusPercent / 100;
    });
}

function getTotalPlanetBonus() {
    let total = 0;
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
            progressText.innerHTML = `${t("Tu as atteint")} <strong>${t(progress.currentPlanet.name)}</strong> ! ${t("En route vers")} ${t(progress.nextPlanet.name)} (${progress.progressPercent}%)`;
        } else {
            progressText.innerHTML = `${t("F\u00e9licitations ! Tu as atteint")} <strong>${t(progress.currentPlanet.name)}</strong>, ${t("la dernière planète !")}`;
        }
    } else {
        progressText.innerHTML = `${t("En route vers")} <strong>${t(progress.nextPlanet.name)}</strong> (${progress.progressPercent}%)`;
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
                <span class="planet-name">${planet.name}</span>
                <span class="planet-bonus">+${planet.bonusPercent}% ${t("Parts")}/s</span>
            `;
            planetElement.style.borderColor = planet.color;
            planetElement.style.color = planet.color;
            newUnlocksContainer.appendChild(planetElement);
        });
    } else {
        newUnlocksContainer.innerHTML = '<p class="no-new-planets">' + t('Aucune nouvelle planète débloquée') + '</p>';
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
    
    // Espacement fixe entre planètes (px) pour éviter le chevauchement
    const planetSpacing = 140;
    const planetSize = 80;
    const labelSpace = 50;
    const totalWidth = PLANETS.length * planetSpacing;
    container.style.width = `${totalWidth}px`;
    
    // Index de la planète actuelle (base pour le flou des planètes lointaines)
    const currentPlanetIndex = progress.currentPlanet
        ? PLANETS.findIndex(p => p.id === progress.currentPlanet.id)
        : 0;
    
    PLANETS.forEach((planet, index) => {
        const planetElement = document.createElement('div');
        planetElement.className = 'space-planet';
        
        const isUnlocked = unlockedPlanets.has(planet.id) || distance >= planet.distanceRequired;
        const isCurrent = progress.currentPlanet && progress.currentPlanet.id === planet.id;
        const isNext = progress.nextPlanet && progress.nextPlanet.id === planet.id;
        const isHidden = index > currentPlanetIndex + 2;
        
        let className = 'space-planet';
        if (isUnlocked) className += ' unlocked';
        if (isCurrent) className += ' current';
        if (isNext) className += ' next';
        if (isHidden) className += ' hidden';
        
        planetElement.className = className;
        
        // Planètes cachées: cercle noir avec point d'interrogation
        if (isHidden) {
            planetElement.innerHTML = `
                <div class="planet-unknown" style="width: ${planetSize}px; height: ${planetSize}px;">?</div>
                <span class="planet-name">???</span>
                <span class="planet-distance">???</span>
            `;
        } else {
            // Utiliser l'image si disponible, sinon l'emoji
            let planetHtml = '';
            if (planet.imgPath) {
                planetHtml = `<img src="${planet.imgPath}" class="planet-image" alt="${planet.name}" style="width: ${planetSize}px; height: ${planetSize}px;">`;
            } else {
                planetHtml = `<span class="planet-emoji">${planet.emoji}</span>`;
            }
            
            planetElement.innerHTML = `
                ${planetHtml}
                <span class="planet-name">${planet.name}</span>
                <span class="planet-distance">${formatNumber(planet.distanceRequired)} ${t("km")}</span>
            `;
        }
        
        planetElement.style.setProperty('--planet-color', planet.color);
        
        // Positionner les planètes (layout horizontal en px)
        const position = index * planetSpacing + planetSpacing / 2;
        planetElement.style.left = `${position}px`;
        
        // Ajouter la ligne de connexion (sauf pour la dernière)
        if (index < PLANETS.length - 1) {
            const nextPlanet = PLANETS[index + 1];
            const isNextUnlocked = unlockedPlanets.has(nextPlanet.id) || distance >= nextPlanet.distanceRequired;
            
            const line = document.createElement('div');
            line.className = 'space-connection';
            if (isUnlocked && isNextUnlocked) {
                line.classList.add('active');
            }
            line.style.left = `${position}px`;
            line.style.width = `${planetSpacing}px`;
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
        let shipPosition = planetSpacing / 2;
        if (progress.currentPlanet) {
            const currentIndex = PLANETS.findIndex(p => p.id === progress.currentPlanet.id);
            const nextIndex = currentIndex + 1;
            
            if (nextIndex < PLANETS.length && progress.nextPlanet) {
                // Entre deux planètes
                const startPos = currentIndex * planetSpacing + planetSpacing / 2;
                const endPos = nextIndex * planetSpacing + planetSpacing / 2;
                shipPosition = startPos + (endPos - startPos) * (progress.progressPercent / 100);
            } else {
                // Sur la dernière planète
                shipPosition = (PLANETS.length - 1) * planetSpacing + planetSpacing / 2;
            }
        } else {
            // Avant la première planète
            const firstPlanetPos = planetSpacing / 2;
            const secondPlanetPos = planetSpacing + planetSpacing / 2;
            shipPosition = firstPlanetPos + (secondPlanetPos - firstPlanetPos) * (progress.progressPercent / 100);
        }
        
        spaceship.style.left = `${shipPosition}px`;
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
    prestigeMultiplier = 1 + Math.log(1 + (isNaN(maxDistance) ? 0 : maxDistance) / MOON_DISTANCE) / 2;

    // Gain de Poussière d'Étoiles (monnaie de prestige persistante)
    const dustGained = calculateStardustGain(isNaN(lastLaunchDistance) ? 0 : lastLaunchDistance);
    if (dustGained > 0) {
        starDust += dustGained;
        totalStardustEarned += dustGained;
    }

    // Debloquer les planetes atteintes uniquement a la confirmation du reset
    applyNewPlanets(checkNewPlanetsUnlocked(lastLaunchDistance));

    // Reset du score, des bâtiments et des pièces de fusée (garde les bonus/prestige)
    score = 0;
    BUILDINGS.forEach(b => b.count = 0);
    ROCKET_PARTS.forEach(p => p.purchased = false);
    constructedParts = new Set();
    const scene = document.getElementById('rocket-parts-container');
    if (scene) scene.innerHTML = '';
    unlockedBuildings = new Set();
    startupBonusApplied = false;
    applyStartupBonus();
    totalPartsFromClicks = 0;
    activatedClickUpgrades = [];
    buildingUpgrades = {};
    buildingUpgradeCosts = {};
    totalGeneratedByBuilding = {};
    partsSinceLaunch = 0;
    resetContractState();
    
    updateDisplay();
    saveGame();
    checkBuildingUnlocks();
    renderBuildings();
    renderUpgrades();
    renderRocketPartsShop();
    
    // Afficher le modal de résultats
    showLaunchResults(lastLaunchDistance);
    isLaunching = false;
        updateSpaceProgress();
        updateConstructionScene();
}

function closeSpaceMap() {
    document.getElementById('space-map-modal').classList.remove('active');
}

// ============================================
// ATELIER GALACTIQUE (upgrades permanents)
// ============================================

function getGalacticUpgradeLevel(upgradeId) {
    return galacticUpgrades[upgradeId] || 0;
}

function getGalacticUpgradeCost(upgrade) {
    const level = getGalacticUpgradeLevel(upgrade.id);
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, level));
}

function isGalacticUpgradeLocked(upgrade) {
    if (!upgrade.requires) return false;
    return upgrade.requires.some(req => getGalacticUpgradeLevel(req) === 0);
}

function buyGalacticUpgrade(upgradeId) {
    const upgrade = GALACTIC_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    const level = getGalacticUpgradeLevel(upgradeId);
    if (level >= upgrade.maxLevel) return;
    if (isGalacticUpgradeLocked(upgrade)) {
        showToast("\u274c " + t("Prérequis non rempli"));
        return;
    }
    const cost = getGalacticUpgradeCost(upgrade);
    if (starDust < cost) {
        showToast("\u274c " + t("Pas assez de Poussière d'Étoiles"));
        return;
    }
    starDust -= cost;
    galacticUpgrades[upgradeId] = level + 1;
    updateStardustDisplay();
    renderGalacticShop();

    // rock1 donne des ateliers gratuits: les ajouter immediatement en cours de run
    if (upgradeId === 'rock1') {
        const extra = getUpgradeEffect('rock1') - (level * (GALACTIC_UPGRADES.find(u => u.id === 'rock1').effectPerLevel));
        if (extra > 0) {
            const atelier = BUILDINGS.find(b => b.id === 'workshop');
            if (atelier) {
                atelier.count += extra;
                unlockedBuildings.add(atelier.id);
                startupBonusApplied = true;
                renderBuildings();
                updateDisplay();
            }
        }
    }

    saveGame();
    showToast("\u2728 " + t(upgrade.name) + " " + t("niveau") + " " + (level + 1));
}

// Getters d'effets (utilisés par la boucle de jeu)
// ============================================
// PRODUCTION HORS-LIGNE (atelier galactique, branche Hors-ligne)
// Credit la production accumulée pendant l'absence, plafonnée au palier débloqué.
// ============================================

function getOfflineCapHours() {
    let hours = 0;
    for (const up of GALACTIC_UPGRADES) {
        if (up.branch === 'offline' && getGalacticUpgradeLevel(up.id) > 0) {
            hours = Math.max(hours, up.effectPerLevel);
        }
    }
    return hours;
}

function applyOfflineEarnings(lastSave) {
    if (!lastSave) return;
    const capHours = getOfflineCapHours();
    if (capHours <= 0) return;
    const elapsedSec = (Date.now() - lastSave) / 1000;
    if (elapsedSec < 60) return;
    const cappedSec = Math.min(elapsedSec, capHours * 3600);
    let totalGain = 0;
    BUILDINGS.forEach(building => {
        if (building.count > 0) {
            const g = calculateBuildingGain(building) * cappedSec;
            totalGeneratedByBuilding[building.id] = (totalGeneratedByBuilding[building.id] || 0) + g;
            totalGain += g;
        }
    });
    if (totalGain <= 0) return;
    score += totalGain;
    partsSinceLaunch += totalGain;
    const capped = cappedSec < elapsedSec;
    const hours = Math.floor(cappedSec / 3600);
    const minutes = Math.floor((cappedSec % 3600) / 60);
    const timeStr = hours > 0 ? hours + 'h' + String(minutes).padStart(2, '0') : minutes + ' min';
    showToast('\ud83c\udf19 ' + t('Production hors-ligne (') + timeStr + (capped ? ', ' + t('plafonn\u00e9e)') : '') + ' +' + formatNumber(totalGain) + ' ' + t('Parts'));
    updateDisplay();
}

function getUpgradeEffect(upgradeId) {
    const u = GALACTIC_UPGRADES.find(x => x.id === upgradeId);
    return u ? getGalacticUpgradeLevel(upgradeId) * u.effectPerLevel : 0;
}

function getProductionBonus() {
    return 1
        + getUpgradeEffect('prod1')
        + getUpgradeEffect('prod2')
        + getUpgradeEffect('prod3')
        + getUpgradeEffect('prod4')
        + getUpgradeEffect('prod5')
        + getUpgradeEffect('prod6')
        + getUpgradeEffect('prod7')
        + getUpgradeEffect('prod8');
}
function getBuildingCostReduction() {
    return 0;
}
function getRocketPartDiscount() {
    return 0;
}
function getStartupAteliers() {
    return getUpgradeEffect('rock1');
}
function getCometFrequencyBonus() {
    return 0;
}
function getStardustGainBonus() {
    return 1;
}
function calculateStardustGainExact(distanceKm) {
    const safeDistance = (isNaN(distanceKm) || distanceKm < 0) ? 0 : distanceKm;
    const anchor = Math.pow(STARDUST_TAIL_START_KM / MOON_DISTANCE, STARDUST_DISTANCE_EXP);
    const base = safeDistance <= STARDUST_TAIL_START_KM
        ? Math.pow(safeDistance / MOON_DISTANCE, STARDUST_DISTANCE_EXP)
        : anchor * Math.pow(safeDistance / STARDUST_TAIL_START_KM, STARDUST_TAIL_EXP);
    return base * getStardustGainBonus();
}

function calculateStardustGain(distanceKm) {
    return Math.floor(calculateStardustGainExact(distanceKm));
}
function getDistanceBonus() {
    let mult = 1;
    if (getGalacticUpgradeLevel('rock2') > 0) mult *= 1.20;
    if (getGalacticUpgradeLevel('rock4') > 0) mult *= 1.30;
    return mult;
}
function getClickPowerBonus() {
    let mult = 1;
    if (getGalacticUpgradeLevel('click1') > 0) mult *= 1.5;
    if (getGalacticUpgradeLevel('click3') > 0) mult *= 1.75;
    if (getGalacticUpgradeLevel('click5') > 0) mult *= 2;
    return mult;
}
function getCritChance() {
    return Math.min(0.50, getUpgradeEffect('click2') + getUpgradeEffect('click4'));
}
function getBoosterDiscount() {
    let discount = 1;
    if (getGalacticUpgradeLevel('coll1') > 0) discount *= 0.90;
    if (getGalacticUpgradeLevel('coll3') > 0) discount *= 0.90;
    if (getGalacticUpgradeLevel('coll5') > 0) discount *= 0.85;
    return 1 - discount;
}
function getCollectionUpgradeBonus() {
    return getUpgradeEffect('coll4');
}
function getRarityBoost() {
    return Math.min(0.50, getUpgradeEffect('coll2'));
}

function applyStartupBonus() {
    const freeAteliers = getStartupAteliers();
    if (startupBonusApplied || freeAteliers <= 0) return;
    const atelier = BUILDINGS.find(b => b.id === 'workshop');
    if (atelier) {
        atelier.count += freeAteliers;
        unlockedBuildings.add(atelier.id);
        startupBonusApplied = true;
    }
    const freeUsines = getGalacticUpgradeLevel('rock3');
    if (freeUsines > 0) {
        const usine = BUILDINGS.find(b => b.id === 'factory');
        if (usine) {
            usine.count += freeUsines;
            unlockedBuildings.add(usine.id);
        }
    }
}

function renderGalacticShop() {
    const container = document.getElementById('galactic-shop-list');
    if (!container) return;
    container.innerHTML = '';
    GALACTIC_BRANCHES.forEach(branch => {
        const branchEl = document.createElement('div');
        branchEl.className = 'galactic-branch';
        branchEl.style.setProperty('--branch-color', branch.color);

        const header = document.createElement('div');
        header.className = 'galactic-branch-header';
        header.innerHTML = '<span class="galactic-branch-icon">' + branch.icon + '</span><span class="galactic-branch-name">' + t(branch.name) + '</span>';
        branchEl.appendChild(header);

        const treeEl = document.createElement('div');
        treeEl.className = 'galactic-tree';

        const upgrades = GALACTIC_UPGRADES.filter(u => u.branch === branch.id);
        upgrades.forEach(upgrade => {
            const level = getGalacticUpgradeLevel(upgrade.id);
            const maxed = level >= upgrade.maxLevel;
            const locked = isGalacticUpgradeLocked(upgrade);
            const cost = getGalacticUpgradeCost(upgrade);
            const affordable = starDust >= cost && !locked;
            const el = document.createElement('div');
            el.className = 'galactic-node' + (maxed ? ' maxed' : '') + (locked ? ' locked' : '') + (!affordable && !maxed && !locked ? ' too-expensive' : '');

            let reqHtml = '';
            if (upgrade.requires) {
                const reqNames = upgrade.requires.map(r => {
                    const ru = GALACTIC_UPGRADES.find(u => u.id === r);
                    return ru ? ru.name : r;
                });
                reqHtml = '<span class="galactic-req">⛔ ' + t('Prérequis:') + ' ' + reqNames.map(r => t(r)).join(', ') + '</span>';
            }

            el.innerHTML =
                '<div class="galactic-node-top">' +
                    '<span class="galactic-node-name">' + t(upgrade.name) + '</span>' +
                    (maxed ? '<span class="galactic-node-max">MAX</span>' : '') +
                '</div>' +
                '<span class="galactic-node-desc">' + t(upgrade.desc) + '</span>' +
                '<div class="galactic-node-bottom">' +
                    '<span class="galactic-node-level">' + t('Niv.') + ' ' + level + '/' + upgrade.maxLevel + '</span>' +
                    (maxed
                        ? ''
                        : locked
                            ? reqHtml
                            : '<button class="galactic-btn" onclick="buyGalacticUpgrade(\'' + upgrade.id + '\')"' + (!affordable ? ' disabled' : '') + '>' + formatNumber(cost) + ' ✨</button>') +
                '</div>';
            treeEl.appendChild(el);
        });

        branchEl.appendChild(treeEl);
        container.appendChild(branchEl);
    });
}

function toggleGalacticShop() {
    const modal = document.getElementById('galactic-shop-modal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
    } else {
        renderGalacticShop();
        modal.classList.add('active');
    }
}

// ============================================
// SPACE PROGRESS SIDEBAR UPDATE
// ============================================

function updateSpaceProgress() {
    // Distance atteignable en temps réel (estimation)
    const reachableDistance = calculateDistance();
    // Distance réellement parcourue (ne change qu'au lancement)
    const traveledDistance = maxDistance;
    const progress = calculatePlanetProgress(reachableDistance);

    // Afficher la progression vers la PROCHAINE planète (basé sur distance parcourue)
    const planetDisplay = document.getElementById('current-planet-display');
    if (planetDisplay) {
        const traveledProgress = calculatePlanetProgress(traveledDistance);
        if (traveledProgress.nextPlanet) {
            planetDisplay.innerHTML = `${t(traveledProgress.nextPlanet.name)}: ${Math.min(100, Math.max(0, traveledProgress.progressPercent))}%`;
        } else {
            planetDisplay.innerHTML = `${t(traveledProgress.currentPlanet.name)}: 100%`;
        }
    }

    // Mettre à jour la mini-carte (basé sur distance parcourue)
    updateMiniSpaceMap(traveledDistance);

    // Mettre à jour les stats
    const sidebarDistance = document.getElementById('sidebar-distance');
    const sidebarDistanceMax = document.getElementById('sidebar-distance-max');
    const sidebarBonus = document.getElementById('sidebar-bonus');
    const sidebarPlanets = document.getElementById('sidebar-planets');

    if (sidebarDistance) {
        sidebarDistance.textContent = formatNumber(reachableDistance) + ' ' + t('km');
    }
    if (sidebarDistanceMax) {
        sidebarDistanceMax.textContent = formatNumber(traveledDistance) + ' ' + t('km');
    }
    if (sidebarBonus) {
        const totalBonus = 1 + getTotalPlanetBonus();
        sidebarBonus.textContent = 'x' + totalBonus.toFixed(2);
    }
    if (sidebarPlanets) {
        const unlockedCount = unlockedPlanets.size - (unlockedPlanets.has('earth') ? 1 : 0);
        sidebarPlanets.textContent = unlockedCount + '/10';
    }
}

function updateMiniSpaceMap(distance) {
    const container = document.getElementById('mini-space-map');
    if (!container) return;
    
    const progress = calculatePlanetProgress(distance);
    
    // Position des planètes dans la mini-map
    const planetPositions = [15, 50, 85];
    
    // Déterminer les planètes à afficher
    const planetsToShow = [];
    if (progress.currentPlanet) {
        const currentIndex = PLANETS.findIndex(p => p.id === progress.currentPlanet.id);
        if (currentIndex !== -1) {
            planetsToShow.push(PLANETS[currentIndex]);
            if (currentIndex + 1 < PLANETS.length) planetsToShow.push(PLANETS[currentIndex + 1]);
            if (currentIndex + 2 < PLANETS.length) planetsToShow.push(PLANETS[currentIndex + 2]);
        }
    } else {
        // Avant la Lune : afficher Terre (départ), Lune, Mars
        planetsToShow.push(PLANETS[0]);
        if (PLANETS.length > 1) planetsToShow.push(PLANETS[1]);
        if (PLANETS.length > 2) planetsToShow.push(PLANETS[2]);
    }
    
    // Clé pour détecter si les planètes affichées ont changé
    const planetsKey = planetsToShow.map(p => p.id).join(',');
    
    // Ne recréer le DOM (planètes + connexions) que si les planètes changent.
    // Sinon, mettre à jour uniquement la position du vaisseau pour éviter
    // que l'animation CSS ne redémarre toutes les 500ms.
    if (container.dataset.planetsKey !== planetsKey) {
        container.dataset.planetsKey = planetsKey;
        container.innerHTML = '';
        
        // Dessiner les planètes
        planetsToShow.forEach((planet, index) => {
            const planetElement = document.createElement('div');
            planetElement.className = 'space-planet';
            
            const isUnlocked = unlockedPlanets.has(planet.id) || distance >= planet.distanceRequired;
            const isCurrent = progress.currentPlanet && progress.currentPlanet.id === planet.id;
            
            if (isUnlocked) planetElement.classList.add('unlocked');
            if (isCurrent) planetElement.classList.add('current');
            if (planet.id === 'earth') planetElement.classList.add('origin');
            
            let planetHtml = '';
            if (planet.imgPath) {
                planetHtml = `<img src="${planet.imgPath}" class="planet-image" alt="${planet.name}">`;
            } else {
                planetHtml = `<span class="planet-emoji">${planet.emoji}</span>`;
            }
            planetHtml += `<div class="planet-name">${t(planet.name)}</div>`;
            const planetDist = planet.distanceRequired;
            const distLabel = planet.id === 'earth' ? t('Départ') : `${formatNumber(planetDist)} ${t('km')}`;
            planetHtml += `<div class="planet-distance">${distLabel}</div>`;
            
            planetElement.innerHTML = planetHtml;
            planetElement.style.setProperty('--planet-color', planet.color);
            
            const position = planetPositions[index] || (index * 40 + 15);
            planetElement.style.left = `${position}%`;
            planetElement.style.transform = 'translateX(-50%)';
            planetElement.style.textAlign = 'center';
            
            container.appendChild(planetElement);
        });
        
        // Ajouter les lignes de connexion entre les planètes
        for (let i = 0; i < planetsToShow.length - 1; i++) {
            const currentPlanet = planetsToShow[i];
            const nextPlanet = planetsToShow[i + 1];
            
            const isCurrentUnlocked = unlockedPlanets.has(currentPlanet.id) || distance >= currentPlanet.distanceRequired;
            const isNextUnlocked = unlockedPlanets.has(nextPlanet.id) || distance >= nextPlanet.distanceRequired;
            
            const line = document.createElement('div');
            line.className = 'space-connection';
            if (isCurrentUnlocked && isNextUnlocked) {
                line.classList.add('active');
            }
            
            const startPos = planetPositions[i] || (i * 40 + 15);
            const endPos = planetPositions[i + 1] || ((i + 1) * 40 + 15);
            line.style.left = `${startPos}%`;
            line.style.width = `${endPos - startPos}%`;
            container.appendChild(line);
        }
    }
    
    // Mettre à jour ou créer le vaisseau
    let spaceship = container.querySelector('.spaceship');
    const shouldShowShip = true;
    
    if (shouldShowShip) {
        // Calculer la position du vaisseau
        let shipPosition = 15;
        
        if (progress.currentPlanet) {
            const currentIndex = PLANETS.findIndex(p => p.id === progress.currentPlanet.id);
            
            if (currentIndex > 0 && progress.nextPlanet) {
                const nextIndex = PLANETS.findIndex(p => p.id === progress.nextPlanet.id);
                
                if (nextIndex > currentIndex && nextIndex < currentIndex + 3) {
                    const startPos = planetPositions[0] || 15;
                    const endPos = planetPositions[1] || 50;
                    shipPosition = startPos + (endPos - startPos) * (progress.progressPercent / 100);
                } else {
                    shipPosition = planetPositions[Math.min(currentIndex, 2)] || 50;
                }
            } else if (currentIndex === 0) {
                shipPosition = 15;
            } else {
                shipPosition = planetPositions[Math.min(currentIndex, 2)] || 85;
            }
        } else {
            const firstPlanetPos = planetPositions[0] || 15;
            const secondPlanetPos = planetPositions[1] || 50;
            shipPosition = firstPlanetPos + (secondPlanetPos - firstPlanetPos) * (progress.progressPercent / 100);
        }
        
        if (!spaceship) {
            spaceship = document.createElement('div');
            spaceship.className = 'spaceship';
            spaceship.innerHTML = '\u{1F680}';
            container.appendChild(spaceship);
        }
        spaceship.style.left = `${shipPosition}%`;
    } else if (spaceship) {
        spaceship.remove();
    }
}





// ============================================
// UPGRADES MANAGEMENT
// ============================================

// Affiche les nouveaux upgrades des qu'un seuil de production est franchi,
// sans reconstruire la barre a chaque tick (seulement si du nouveau apparait).
function checkNewUpgrades() {
    const container = document.getElementById('upgrades-container');
    if (!container) return;
    const newClickUps = CLICK_UPGRADES.filter(u => totalPartsFromClicks >= u.threshold && !activatedClickUpgrades.includes(u.threshold)).length;
    const newBuildingUps = BUILDING_UPGRADE_THRESHOLDS.reduce((acc, threshold) =>
        acc + BUILDINGS.filter(b => isBuildingUpgradeAvailable(b.id, threshold)).length, 0);
    if (container.childElementCount !== newClickUps + newBuildingUps) {
        renderUpgrades();
    }
}

function renderUpgrades() {
    const container = document.getElementById('upgrades-container');
    container.innerHTML = '';

    const available = [];

    // Upgrades de clic
    // Deblocage par les Parts gagnees uniquement en cliquant, cumulees depuis
    // le debut du run. Le cout reste le vrai verrou.
    CLICK_UPGRADES.forEach(upgrade => {
        if (totalPartsFromClicks >= upgrade.threshold && !activatedClickUpgrades.includes(upgrade.threshold)) {
            const upgradeIndex = CLICK_UPGRADES.indexOf(upgrade);
            const color = UPGRADE_COLORS[upgradeIndex % UPGRADE_COLORS.length];
            available.push({
                cost: upgrade.cost,
                render: () => {
                    const el = createUpgradeElement(color, 'images/cursor.svg', upgrade.name, upgrade.threshold);
                    attachTooltip(el, `${t(upgrade.name)} — ×2 ${t('clic')} — ${formatNumber(upgrade.cost)} ${t('Parts')}`);
                    el.onclick = () => buyClickUpgrade(upgrade.threshold);
                    return el;
                }
            });
        }
    });

    // Upgrades de buildings
    BUILDING_UPGRADE_THRESHOLDS.forEach(threshold => {
        BUILDINGS.forEach(building => {
            if (isBuildingUpgradeAvailable(building.id, threshold)) {
                const thresholdIndex = BUILDING_UPGRADE_THRESHOLDS.indexOf(threshold);
                const color = UPGRADE_COLORS[thresholdIndex];
                const cost = getBuildingUpgradeFixedCost(building.id, threshold);
                available.push({
                    cost,
                    render: () => {
                        const el = createUpgradeElement(color, building.imgPath || '', building.name, threshold);
                        attachTooltip(el, `${t(building.name)} — ${t('Palier')} ${threshold} — ×2 ${t('production')} — ${formatNumber(cost)} ${t('Parts')}`);
                        el.onclick = () => buyBuildingUpgrade(building.id, threshold);
                        return el;
                    }
                });
            }
        });
    });

    // Tri du moins chere au plus chere
    available.sort((a, b) => a.cost - b.cost);
    available.forEach(item => container.appendChild(item.render()));
}

function createUpgradeElement(color, imgSrc, altText, levelBadgeText) {
    const el = document.createElement('div');
    el.className = 'upgrade-icon';
    el.style.borderColor = color;
    el.style.boxShadow = `var(--shadow), 0 0 6px ${color}`;

    const img = document.createElement('img');
    img.className = 'upgrade-img';
    img.src = imgSrc;
    img.alt = altText;
    el.appendChild(img);

    const levelBadge = document.createElement('span');
    levelBadge.className = 'upgrade-level';
    levelBadge.textContent = levelBadgeText;
    el.appendChild(levelBadge);

    return el;
}

function attachTooltip(element, text) {
    if (!IS_TOUCH) {
        element.addEventListener('mouseenter', (e) => {
            const rect = e.target.getBoundingClientRect();
            showTooltip(text, rect.left + rect.width / 2, rect.top);
        });
        element.addEventListener('mouseleave', hideTooltip);
    }
    if (IS_TOUCH) {
        element.addEventListener('click', (e) => {
            if (touchTooltipElement !== element) {
                // 1er tap : afficher l'info, bloquer l'achat
                showTouchTooltip(element, text);
                e.stopImmediatePropagation();
                e.preventDefault();
            } else {
                // 2e tap : acheter (laisser passer le onclick)
                touchTooltipElement = null;
            }
        });
    }
}

// Tooltip tactile : sur mobile, le 1er tap affiche l'info, le 2e achète.
let touchTooltipElement = null;
function showTouchTooltip(element, text) {
    const rect = element.getBoundingClientRect();
    showTooltip(text, rect.left + rect.width / 2, rect.top);
    touchTooltipElement = element;
}
document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.upgrade-icon') && !e.target.closest('.building-item')) {
        hideTooltip();
        touchTooltipElement = null;
    }
}, { passive: true });

// ============================================
// BONUSES MANAGEMENT
// ============================================

function rebuildAutoMultipliers() {
    resetMultipliers();
    activeRandomBonuses.forEach(bonus => {
        if ((bonus.effect === 'auto' || bonus.effect === 'both' || bonus.effect === 'multiplier') && bonus.multiplier) {
            autoMultipliers.push(bonus.multiplier);
        }
        if ((bonus.effect === 'click' || bonus.effect === 'both') && bonus.multiplier) {
            clickMultipliers.push(bonus.multiplier);
        }
    });
    updateAutoMultiplier();
    updateClickMultiplier();
}

function spawnRandomBonus() {
    let bonusIndex = Math.floor(Math.random() * RANDOM_BONUSES.length);
    let bonus = RANDOM_BONUSES[bonusIndex];
    // Si ce bonus est déjà actif, prendre l'autre pour ne pas bloquer le spawn
    if (activeRandomBonuses.some(b => b.id === bonus.id)) {
        bonusIndex = (bonusIndex + 1) % RANDOM_BONUSES.length;
        bonus = RANDOM_BONUSES[bonusIndex];
        if (activeRandomBonuses.some(b => b.id === bonus.id)) return;
    }

    // La comète traverse l'écran en diagonale de haut en bas
    // La traînée part du haut et descend jusqu'en bas
    const containerTopOffset = document.getElementById('random-bonuses').getBoundingClientRect().top;
    const containerHeight = window.innerHeight - containerTopOffset;
    const startY = -180;
    const endY = containerHeight + 180;
    const verticalTravel = endY - startY;
    // À 45°, déplacement horizontal = déplacement vertical
    const horizontalTravel = verticalTravel;
    // Direction aléatoire: gauche→droite ou droite→gauche
    const goRight = Math.random() < 0.5;
    let startX, endX;
    if (goRight) {
        // Gauche→droite: départ à gauche, visible jusqu'à la sortie à droite
        const maxStartX = Math.max(0, window.innerWidth * 0.5 - 100);
        startX = Math.random() * maxStartX;
        endX = startX + horizontalTravel;
    } else {
        // Droite→gauche: départ à droite, visible dès le début
        const minStartX = window.innerWidth - window.innerWidth * 0.5;
        startX = minStartX + Math.random() * Math.max(0, window.innerWidth - minStartX - 100);
        endX = startX - horizontalTravel;
    }
    const duration = 6000;

    const bonusElement = document.createElement('div');
    bonusElement.className = `random-bonus comet ${bonus.colorClass}`;
    if (!goRight) bonusElement.classList.add('reverse');
    bonusElement.innerHTML = '<img src="images/effects/com\u00e8te.png" class="comet-img" alt="Comete">';
    bonusElement.style.left = `${startX}px`;
    bonusElement.style.top = `${startY}px`;

    document.getElementById('random-bonuses').appendChild(bonusElement);

    // Animation de traversée en diagonale
    requestAnimationFrame(() => {
        bonusElement.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
        bonusElement.style.left = `${endX}px`;
        bonusElement.style.top = `${endY}px`;
    });

    const trailInterval = setInterval(() => {
        const rect = bonusElement.getBoundingClientRect();
        const trail = document.createElement('div');
        trail.className = 'comet-trail';
        trail.style.left = `${rect.left + rect.width / 2}px`;
        trail.style.top = `${rect.top + rect.height / 2}px`;
        document.body.appendChild(trail);
        requestAnimationFrame(() => {
            trail.style.opacity = '0';
            trail.style.transform = 'translate(-50%, -50%) scale(2.5)';
        });
        setTimeout(() => trail.remove(), 1000);
    }, 80);

    const timeout = setTimeout(() => {
        clearInterval(trailInterval);
        bonusElement.remove();
    }, duration);

    bonusElement.onclick = () => {
        if (bonusElement.dataset.collected === '1') return;
        bonusElement.dataset.collected = '1';
        clearTimeout(timeout);
        clearInterval(trailInterval);
        bonusElement.classList.add('clicked');
        clickedBonusesCount++;

        if (bonus.id === "meteor") {
            const instantProduction = partsPerSecond * 10;
            score += instantProduction;
            partsSinceLaunch += instantProduction;
            showToast(`\u2705 ${t(bonus.name)}: +${formatNumber(instantProduction)} ${t("Parts")}!`);
        } 
        else if (bonus.id === "flare") {
            activeRandomBonuses.push({
                id: bonus.id,
                effect: bonus.effect,
                multiplier: bonus.multiplier,
                endTime: Date.now() + bonus.duration
            });
            rebuildAutoMultipliers();
            showToast(`\u2705 ${t(bonus.name)}: ×${bonus.multiplier} ${t("Parts")}/s ${t("for")} ${bonus.duration/1000}s`);

            setTimeout(() => {
                activeRandomBonuses = activeRandomBonuses.filter(b => b.id !== bonus.id);
                rebuildAutoMultipliers();
                updateDisplay();
                showToast(`\u23f0 ${t(bonus.name)} ${t("expir\u00e9")}`);
            }, bonus.duration);
        }

        setTimeout(() => bonusElement.remove(), 500);
        checkTrophies();
    };
}

// ============================================
// VISUAL EFFECTS
// ============================================

function getClickComponents() {
    const nbUpgrades = activatedClickUpgrades.length;
    // Base qui double a chaque upgrade de clic (comme Reinforced finger / Carpal tunnel).
    const baseCpC = Math.pow(2, nbUpgrades);
    // Bonus par bâtiment possede (equivalent Thousand Fingers) : +0.1 par bâtiment,
    // multiplie par un facteur croissant avec les upgrades (Million/Billion Fingers).
    const fingerMult = nbUpgrades >= 2 ? (1 + (nbUpgrades - 1) * 0.5) : 0;
    const buildingBonus = fingerMult * 0.1 * getTotalBuildingsOwned();
    // Bonus lie a la production (1% des Parts/s par upgrade).
    const cpsBonus = nbUpgrades * 0.01 * partsPerSecond;
    return { baseCpC, buildingBonus, cpsBonus };
}

function addScore(points, event) {
    const { baseCpC, buildingBonus, cpsBonus } = getClickComponents();
    const basePoints = baseCpC + buildingBonus + cpsBonus;
    const critMult = (Math.random() < getCritChance()) ? 3 : 1;
    const totalPoints = basePoints * getClickPowerBonus() * critMult;
    if (getGalacticUpgradeLevel('click6') > 0 && Math.random() < 0.05) {
        spawnRandomBonus();
    }

    score += totalPoints;
    partsSinceLaunch += totalPoints;
    totalPartsFromClicks += totalPoints;

    showClickEffect(Math.round(totalPoints), event);
    spawnFallingCoin(event);

    const medal = document.getElementById('medal');
    // Direction du clic par rapport au centre de la piece (normalisee), pour
    // tordre l'animation vers l'endroit clique. Fallback: centre.
    if (medal && event && event.clientX !== undefined) {
        const rect = medal.getBoundingClientRect();
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        const dx = event.clientX - (rect.left + halfW);
        const dy = event.clientY - (rect.top + halfH);
        const dist = Math.min(1, Math.hypot(dx, dy) / halfW);
        const nx = (dx / halfW) * dist;
        const ny = (dy / halfH) * dist;
        medal.style.setProperty('--click-nx', nx.toFixed(3));
        medal.style.setProperty('--click-ny', ny.toFixed(3));
    }
    medal.classList.remove('bounce');
    void medal.offsetWidth;
    medal.classList.add('bounce');

    updateDisplay();
    saveGame();
    updateAllBuildingButtons();
    renderUpgrades();
    checkBuildingUnlocks();
    checkTrophies();
}

function showClickEffect(value, event) {
    const container = document.getElementById('click-effects');

    const containerRect = container.getBoundingClientRect();
    let x, y;
    if (event && event.clientX !== undefined) {
        x = event.clientX;
        y = event.clientY;
    } else {
        const medal = document.getElementById('medal');
        const medalRect = medal.getBoundingClientRect();
        x = medalRect.left + medalRect.width / 2;
        y = medalRect.top + medalRect.height / 2;
    }
    x -= containerRect.left;
    y = y - containerRect.top - 10;

    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = `+${formatNumber(value)}`;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;

    container.appendChild(effect);
    setTimeout(() => effect.remove(), 1200);
}

// Piece qui tombe depuis le point clique : apparait sur place (pop),
// saute de quelques pixels au-dessus du clic (vitesse initiale vers le haut
// qui s'amortit), puis retombe tout doucement avec une acceleration
// gravitationnelle, en tournoyant lentement. Disparait hors ecran en bas.
// Gravite faible (~3x plus lente qu'avant en duree de chute).
const FALL_GRAVITY = 260; // px/s^2
const HOP_MIN = 18; // px
const HOP_MAX = 40; // px

function spawnFallingCoin(event) {
    const container = document.getElementById('falling-coins');
    if (!container) return;

    let x, y;
    if (event && event.clientX !== undefined) {
        x = event.clientX;
        y = event.clientY;
    } else {
        const medal = document.getElementById('medal');
        const medalRect = medal.getBoundingClientRect();
        x = medalRect.left + medalRect.width / 2;
        y = medalRect.top + medalRect.height / 2;
    }

    const coin = document.createElement('div');
    coin.className = 'falling-coin';

    const img = document.createElement('img');
    img.src = 'images/parts.png';
    img.alt = '';
    img.draggable = false;
    coin.appendChild(img);

    const size = 24 + Math.random() * 32;
    const drift = (Math.random() - 0.5) * 440;
    const spinDir = Math.random() < 0.5 ? 1 : -1;

    // Petit saut vers le haut depuis le point clique, puis chute douce
    const hop = HOP_MIN + Math.random() * (HOP_MAX - HOP_MIN);
    const fallDist = window.innerHeight - y + size + 20;
    const tUp = Math.sqrt(2 * hop / FALL_GRAVITY);
    const tDown = Math.sqrt(2 * (fallDist + hop) / FALL_GRAVITY);
    const total = tUp + tDown;
    const startDelay = 0.05 + Math.random() * 0.07;
    // Rotation reguliere : exactement 1 tour toutes les 12 secondes sur
    // toute la duree de vie de la piece (chute ~2-4s -> ~0.2-0.3 tour)
    const SPIN_PERIOD = 12;
    const spinDeg = spinDir * 360 * (total / SPIN_PERIOD);

    coin.style.width = size + 'px';
    coin.style.height = size + 'px';
    coin.style.left = x + 'px';
    coin.style.top = y + 'px';
    coin.style.setProperty('--fall-drift', drift + 'px');
    coin.style.setProperty('--fall-spin', spinDeg + 'deg');
    coin.style.setProperty('--fall-duration', total + 's');
    coin.style.setProperty('--fall-delay', startDelay + 's');

    container.appendChild(coin);

    // Trajectoire balistique en 2 phases : montee amortie (ease-out) puis
    // chute accelerante (ease-in). Les durees decoulent de la physique.
    if (coin.animate) {
        const anim = coin.animate([
            { transform: 'translate(-50%, -50%)', easing: 'cubic-bezier(0.25, 0.6, 0.4, 1)' },
            { transform: `translate(-50%, calc(-50% - ${hop.toFixed(1)}px))`, easing: 'cubic-bezier(0.5, 0, 0.85, 0.45)', offset: tUp / total },
            { transform: `translate(calc(-50% + ${drift.toFixed(1)}px), calc(-50% + ${fallDist.toFixed(1)}px))`, offset: 1 }
        ], { duration: total * 1000, delay: startDelay * 1000, fill: 'forwards' });
        anim.onfinish = () => coin.remove();
    } else {
        setTimeout(() => coin.remove(), (startDelay + total) * 1000);
    }
}

// ============================================
// MAIN GAME LOOP
// ============================================

function gameLoop() {
    let totalGain = 0;

    BUILDINGS.forEach(building => {
        const buildingGain = calculateBuildingGain(building);
        totalGain += buildingGain;
    });

    partsPerSecond = totalGain;
    const now = Date.now();
    const dtSeconds = (now - lastGameTick) / 1000;
    lastGameTick = now;
    const tickGain = partsPerSecond * dtSeconds;
    score += tickGain;
    partsSinceLaunch += tickGain;

    if (dtSeconds > 0) {
        BUILDINGS.forEach(building => {
            if (building.count > 0) {
                totalGeneratedByBuilding[building.id] = (totalGeneratedByBuilding[building.id] || 0) + (calculateBuildingGain(building) * dtSeconds);
            }
        });
    }

    if (Date.now() - lastBuildingsUpdate > BUILDING_UPDATE_INTERVAL_MS) {
        lastBuildingsUpdate = Date.now();
        updateAllBuildingButtons();
        refreshLiveTooltip();
        checkNewUpgrades();
    }
    if (Date.now() - lastRocketPartsUpdate > BUILDING_UPDATE_INTERVAL_MS) {
        lastRocketPartsUpdate = Date.now();
        renderRocketPartsShop();
    }
    updateDisplay();
    if (Date.now() - lastSpaceProgressUpdate > SPACE_UPDATE_INTERVAL_MS) {
        lastSpaceProgressUpdate = Date.now();
        updateSpaceProgress();
    }
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
    const { baseCpC, buildingBonus, cpsBonus } = getClickComponents();
    return (baseCpC + buildingBonus + cpsBonus) * getClickPowerBonus();
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
    return Math.floor(durationMs / 86400000) + t("jours");
}

// ============================================
// GESTION DES TROPH\u001aES
// ============================================

function getTotalStardustEarned() {
    return totalStardustEarned;
}
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
                case 'planets':
                    unlocked = unlockedPlanets.size - (unlockedPlanets.has('earth') ? 1 : 0) >= trophy.threshold;
                    break;
                case 'launches':
                    unlocked = rocketsLaunched >= trophy.threshold;
                    break;
                case 'stardust':
                    unlocked = getTotalStardustEarned() >= trophy.threshold;
                    break;
                case 'cards':
                    unlocked = Object.keys(cardCollection).filter(id => cardCollection[id] > 0).length >= trophy.threshold;
                    break;
            }
            
            if (unlocked) {
                unlockedTrophies.add(trophy.id);
                changed = true;
                showToast(`${t("Troph\u00e9e d\u00e9bloqu\u00e9 :")} ${t(trophy.name)}!`, trophy.icon);
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
    
    const familyOrder = ['pps', 'planets', 'launches', 'stardust', 'building-upgrade', 'click-upgrade', 'building', 'score', 'bonus', 'building-types', 'cards'];
    const trophiesByFamily = {};
    TROPHIES.forEach(trophy => {
        (trophiesByFamily[trophy.type] = trophiesByFamily[trophy.type] || []).push(trophy);
    });
    const orderedTrophies = [];
    familyOrder.forEach(family => {
        if (trophiesByFamily[family]) orderedTrophies.push(...trophiesByFamily[family]);
    });
    Object.keys(trophiesByFamily).forEach(family => {
        if (!familyOrder.includes(family)) orderedTrophies.push(...trophiesByFamily[family]);
    });

    const colorCounters = {};
    orderedTrophies.forEach(trophy => {
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
        const colors = TROPHY_COLORS[trophy.type] || ['#94a3b8'];
        const idx = colorCounters[trophy.type] || 0;
        colorCounters[trophy.type] = idx + 1;
        const color = colors[idx % colors.length];
        trophyElement.style.border = '2px solid #e2e8f0';
        trophyElement.style.background = '#f8fafc';
        trophyElement.style.isolation = 'isolate';
        
        if (unlockedTrophies.has(trophy.id)) {
            trophyElement.style.background = '#dbeafe';
            trophyElement.style.boxShadow = 'var(--shadow), 0 0 6px ' + color;
            trophyElement.style.opacity = '1';
        } else {
            trophyElement.style.opacity = '0.4';
            trophyElement.style.filter = 'grayscale(100%)';
        }
        
        const imgSize = (trophy.id === 'launch-1' || trophy.id === 'launch-5' || trophy.id === 'first-click-upgrade') ? '80%'
            : trophy.icon === 'images/parts.png' ? '100%'
            : '100%';
        trophyElement.innerHTML = trophy.icon.startsWith('images/')
            ? `<img src="${trophy.icon}" alt="${trophy.name}" style="width: ${imgSize}; height: ${imgSize}; object-fit: contain;">`
            : trophy.icon;
        const tint = document.createElement('span');
        tint.style.cssText = `position: absolute; inset: 0; border-radius: 50%; pointer-events: none; mix-blend-mode: color; opacity: 0.65; background: ${color};`;
        trophyElement.appendChild(tint);
        
        trophyElement.addEventListener('mouseenter', (e) => {
            const rect = e.target.getBoundingClientRect();
            const name = t(trophy.name);
            const description = t(trophy.description);
            const isUnlocked = unlockedTrophies.has(trophy.id);
            const status = isUnlocked ? t('D\u00e9bloqu\u00e9') : t('Verrouill\u00e9');
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
    container.innerHTML += '<h4 style="margin: 0 0 8px; color: #2563eb; font-size: 1.1rem;">' + t('Statistiques Globales') + '</h4>';
    const globalStats = [
        { label: t("Parts actuelles"), value: formatNumber(score, true) },
        { label: t("Total Parts g\u00e9n\u00e9r\u00e9s"), value: formatNumber(calculateTotalGenerated()) },
        { label: t("Parts par seconde"), value: formatNumber(partsPerSecond) },
        { label: t("Multiplicateur de production"), value: 'x' + getTotalProductionMultiplier().toFixed(2) },
        { label: t("Parts par clic"), value: formatNumber(getClickPower()) },
        { label: t("B\u00e2timents poss\u00e9d\u00e9s au total"), value: formatNumber(getTotalBuildingsOwned()) },
        { label: t("Partie commenc\u00e9e"), value: getGameDuration() },
        { label: t("Bonus cliqu\u00e9s"), value: clickedBonusesCount }
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

    container.innerHTML += '<h4 style="margin: 16px 0 8px; color: #2563eb; font-size: 1.1rem;">' + t('Upgrades') + '</h4>';
    container.innerHTML += '<h5 style="margin: 8px 0 4px; color: #64748b; font-size: 0.9rem;">' + t('Améliorations de Clic:') + '</h5>';
    
    if (activatedClickUpgrades.length > 0) {
        const line = document.createElement('div');
        line.style.display = 'flex';
        line.style.flexWrap = 'wrap';
        line.style.gap = '6px';
        line.style.alignItems = 'center';
        line.style.padding = '4px 0';
        activatedClickUpgrades.forEach(threshold => {
            const upgrade = CLICK_UPGRADES.find(u => u.threshold === threshold);
            if (upgrade) {
                const upgradeIndex = CLICK_UPGRADES.indexOf(upgrade);
                const color = UPGRADE_COLORS[upgradeIndex % UPGRADE_COLORS.length];
                const badge = document.createElement('span');
                badge.style.display = 'inline-flex';
                badge.style.alignItems = 'center';
                badge.style.gap = '4px';
                badge.style.padding = '2px 8px';
                badge.style.borderRadius = '999px';
                badge.style.border = '1px solid ' + color;
                badge.style.background = 'rgba(255, 255, 255, 0.6)';
                badge.style.color = '#64748b';
                badge.style.fontSize = '0.8rem';
                badge.innerHTML = `<img src="images/cursor.svg" alt="" style="width: 14px; height: 14px;"> ${t(upgrade.name)}`;
                line.appendChild(badge);
            }
        });
        container.appendChild(line);
    } else {
        const statElement = document.createElement('div');
        statElement.style.padding = '4px 0';
        statElement.style.fontSize = '0.85rem';
        statElement.style.color = '#94a3b8';
        statElement.textContent = t('Aucune am\u00e9lioration de clic');
        container.appendChild(statElement);
    }

    container.innerHTML += '<h5 style="margin: 12px 0 4px; color: #64748b; font-size: 0.9rem;">' + t('Am\u00e9liorations de B\u00e2timents:') + '</h5>';
    
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
            const levelColor = UPGRADE_COLORS[(upgrades.length - 1) % UPGRADE_COLORS.length];
            statElement.innerHTML = `<span>${t(building.name)}: <span style="color: ${levelColor}; font-weight: 700;">${upgrades.length}</span> ${t('niveau(x)')}</span>`;
            container.appendChild(statElement);
        }
    });

    if (!hasBuildingUpgrades) {
        const statElement = document.createElement('div');
        statElement.style.padding = '4px 0';
        statElement.style.fontSize = '0.85rem';
        statElement.style.color = '#94a3b8';
        statElement.textContent = t('Aucune am\u00e9lioration de b\u00e2timent');
        container.appendChild(statElement);
    }

    container.innerHTML += '<h4 style="margin: 16px 0 8px; color: #2563eb; font-size: 1.1rem;">' + t('Troph\u00e9es') + ' <span style="color: #16a34a;">(+' + (unlockedTrophies.size * 1) + '%)</span>' + '</h4>';
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
    updateModalPartsCounter();
    updateStardustDisplay();
    updateStardustPreview();
    updateBonusTimer();
}

function updateModalPartsCounter() {
    const scoreText = formatNumber(score, true);
    const gainText = formatNumber(partsPerSecond);
    document.querySelectorAll('.modal-parts-value').forEach(el => { el.textContent = scoreText; });
    document.querySelectorAll('.modal-parts-gain').forEach(el => { el.textContent = gainText; });
}

function updateStardustDisplay() {
    const text = formatNumber(starDust);
    document.querySelectorAll('#stardust-value, #stardust-value-2').forEach(el => { el.textContent = text; });
}

function updateStardustPreview() {
    const previewValue = document.getElementById('stardust-preview-value');
    const previewBar = document.getElementById('stardust-preview-bar');
    if (!previewValue || !previewBar) return;

    const reachableDistance = calculateDistance();
    const safeDistance = (isNaN(reachableDistance) || reachableDistance < 0) ? 0 : reachableDistance;
    const potentialDust = calculateStardustGainExact(safeDistance);
    const intPart = Math.floor(potentialDust);
    const fracPart = potentialDust - intPart;

    previewValue.textContent = formatNumber(intPart);
    previewBar.style.width = (fracPart * 100) + '%';
}

function updateBonusTimer() {
    const timerElement = document.getElementById('bonus-timer');
    if (!timerElement) return;

    const activeBonuses = activeRandomBonuses.filter(b => b.effect === 'multiplier' || b.id === 'flare');
    if (activeBonuses.length === 0) {
        timerElement.textContent = '';
        timerElement.style.display = 'none';
        return;
    }

    const labels = activeBonuses.map(bonus => {
        const remainingTime = Math.max(0, bonus.endTime - Date.now());
        const seconds = Math.ceil(remainingTime / 1000);
        return `\u23f3 \u00d7${bonus.multiplier} (${seconds}s)`;
    });
    timerElement.innerHTML = labels.join('<br>');
    timerElement.style.display = 'block';
}

// ============================================
// CONTRATS DE FABRICATION (mini-jeu)
// On achete un contrat ciblant un batiment precise; si on produit le quota
// de Parts avec CE batiment dans le temps imparti, il gagne un bonus de
// production permanent (+75% cumulable). Rotation des contrats toutes les
// 5 minutes. Les contrats ciblent en priorite les batiments negliges.
// ============================================
const CONTRACT_ROTATION_MS = 2 * 60 * 1000;
const CONTRACT_DURATION_MS = 3 * 60 * 1000;
const CONTRACT_QUOTA_RATIO = 1.35;
const CONTRACT_REWARD_MULT = 0.75;
const CONTRACT_REWARD_MAX_STACKS = 10;
const CONTRACT_PRICE_PPS_SECONDS = 20;

let contractState = {
    offers: [],
    nextRotationAt: 0,
    active: null,
    buildingBonuses: {}
};

function getContractEligibleBuildings() {
    return BUILDINGS.filter(b => b.count > 0 && b.unlockCondition());
}

function pickContractTargets() {
    const eligible = getContractEligibleBuildings();
    if (eligible.length === 0) return [];
    const totalPps = Math.max(1e-9, partsPerSecond);
    const scored = eligible.map(b => {
        const share = calculateBuildingGain(b) / totalPps;
        const stacks = contractState.buildingBonuses[b.id] || 0;
        const targetScore = (1 - share) + (CONTRACT_REWARD_MAX_STACKS - stacks) * 0.02 + Math.random() * 0.3;
        return { b, targetScore, share };
    });
    scored.sort((x, y) => y.targetScore - x.targetScore);
    const n = Math.min(2, scored.length);
    return scored.slice(0, n).map(s => s.b);
}

function getContractPrice() {
    return Math.max(50, Math.floor(partsPerSecond * CONTRACT_PRICE_PPS_SECONDS));
}

function generateContractOffers() {
    const targets = pickContractTargets();
    const now = Date.now();
    contractState.offers = targets.map(b => {
        const ppsBuilding = calculateBuildingGain(b);
        const quota = Math.max(10, Math.floor(ppsBuilding * (CONTRACT_DURATION_MS / 1000) * CONTRACT_QUOTA_RATIO));
        return {
            id: 'contract-' + b.id + '-' + now + '-' + Math.floor(Math.random() * 1e6),
            buildingId: b.id,
            price: getContractPrice(),
            quota: quota,
            expiresAt: now + CONTRACT_DURATION_MS
        };
    });
    contractState.nextRotationAt = now + CONTRACT_ROTATION_MS;
    if (typeof renderContracts === 'function' && document.getElementById('contracts-modal').classList.contains('active')) {
        renderContracts();
    }
}

function openContracts() {
    document.getElementById('contracts-modal').classList.add('active');
    renderContracts();
}

function closeContracts() {
    document.getElementById('contracts-modal').classList.remove('active');
}

function acceptContract(offerId) {
    const offer = contractState.offers.find(o => o.id === offerId);
    if (!offer) return;
    if (contractState.active) {
        showToast('\u26a0\ufe0f ' + t('Un contrat a la fois !'));
        return;
    }
    if (score < offer.price) {
        showToast('\u274c ' + t('Pas assez de Parts'));
        return;
    }
    score -= offer.price;
    partsSinceLaunch = Math.max(0, partsSinceLaunch - offer.price);
    const building = findBuildingById(offer.buildingId);
    contractState.active = {
        offerId: offer.id,
        buildingId: offer.buildingId,
        quota: offer.quota,
        progress: 0,
        startTotal: totalGeneratedByBuilding[offer.buildingId] || 0,
        acceptedAt: Date.now(),
        expiresAt: Date.now() + CONTRACT_DURATION_MS
    };
    contractState.offers = contractState.offers.filter(o => o.id !== offer.id);
    showToast('\u2705 ' + tf('Contrat accepte : {building} !', { building: t(building.name) }), building.imgPath);
    renderContracts();
    saveGame();
}

function updateContractProgress() {
    const c = contractState.active;
    if (!c) return;
    const totalNow = totalGeneratedByBuilding[c.buildingId] || 0;
    c.progress = Math.max(0, totalNow - c.startTotal);
    if (c.progress >= c.quota) {
        completeContract();
    }
}

function completeContract() {
    const c = contractState.active;
    if (!c) return;
    const building = findBuildingById(c.buildingId);
    const stacks = (contractState.buildingBonuses[c.buildingId] || 0);
    const maxed = stacks >= CONTRACT_REWARD_MAX_STACKS;
    if (!maxed) {
        contractState.buildingBonuses[c.buildingId] = stacks + 1;
    }
    const mult = getContractBuildingMultiplier(c.buildingId);
    showToast('\uD83E\uDDF1 ' + tf('Contrat rempli ! {building} x{mult}', { building: t(building.name), mult: mult.toFixed(2) }), building.imgPath);
    contractState.active = null;
    contractState.offers = [];
    generateContractOffers();
    checkTrophies();
    saveGame();
}

function failContract() {
    const c = contractState.active;
    if (!c) return;
    const building = findBuildingById(c.buildingId);
    showToast('\u23f3 ' + tf('Contrat echoue pour {building}...', { building: t(building.name) }), building.imgPath);
    contractState.active = null;
    contractState.offers = [];
    generateContractOffers();
    saveGame();
}

function getContractBuildingMultiplier(buildingId) {
    const stacks = contractState.buildingBonuses[buildingId] || 0;
    return Math.pow(1 + CONTRACT_REWARD_MULT, stacks);
}

function tickContracts() {
    const now = Date.now();
    if (now >= contractState.nextRotationAt) {
        generateContractOffers();
    }
    if (contractState.active) {
        updateContractProgress();
        if (contractState.active && now >= contractState.active.expiresAt) {
            failContract();
        }
    }
    if (document.getElementById('contracts-modal').classList.contains('active')) {
        renderContracts();
    }
    renderContractsCardStatus();
}

function renderContractsCardStatus() {
    const statusEl = document.getElementById('contracts-card-status');
    if (!statusEl) return;
    const now = Date.now();
    if (contractState.active) {
        const c = contractState.active;
        const building = findBuildingById(c.buildingId);
        const remaining = Math.max(0, c.expiresAt - now);
        const pct = Math.min(100, (c.progress / c.quota) * 100);
        statusEl.className = 'game-status visible';
        statusEl.innerHTML = t(building.name)
            + ' <span class="status-timer">' + formatContractTime(remaining) + '</span>'
            + '<span class="status-bar"><div style="width:' + pct + '%"></div></span>';
    } else if (contractState.offers.length > 0) {
        const nextIn = Math.max(0, contractState.nextRotationAt - now);
        statusEl.className = 'game-status visible';
        statusEl.innerHTML = '<span class="status-offers">' + contractState.offers.length + ' ' + t('contrat(s) propose(s)') + '</span>'
            + ' \u00b7 ' + tf('nouveaux contrats dans {time}', { time: formatContractTime(nextIn) });
    } else {
        statusEl.className = 'game-status';
        statusEl.textContent = '';
    }
}

function renderContracts() {
    const modal = document.getElementById('contracts-modal');
    if (!modal.classList.contains('active')) return;
    const listEl = document.getElementById('contracts-list');
    if (!listEl) return;
    const now = Date.now();
    const nextIn = Math.max(0, contractState.nextRotationAt - now);
    let html = '<div class="contract-rotation">\u23f3 ' + tf('nouveaux contrats dans {time}', { time: formatContractTime(nextIn) }) + '</div>';
    if (contractState.active) {
        const c = contractState.active;
        const building = findBuildingById(c.buildingId);
        const remaining = Math.max(0, c.expiresAt - now);
        const pct = Math.min(100, (c.progress / c.quota) * 100);
        html += '<div class="contract-card active">'
            + '<div class="contract-head"><img src="' + building.imgPath + '" alt=""><div><div class="contract-title">' + t(building.name) + '</div>'
            + '<div class="contract-sub">' + t('Contrat en cours') + '</div></div></div>'
            + '<div class="contract-progress"><div style="width:' + pct + '%"></div></div>'
            + '<div class="contract-meta"><span>' + formatNumber(Math.floor(c.progress)) + ' / ' + formatNumber(c.quota) + ' ' + t('Parts') + '</span>'
            + '<span class="contract-timer">' + formatContractTime(remaining) + '</span></div>'
            + '</div>';
    } else if (contractState.offers.length === 0) {
        html += '<div class="contract-empty">' + t('Aucun contrat disponible') + '</div>';
    } else {
        contractState.offers.forEach(offer => {
            const building = findBuildingById(offer.buildingId);
            const stacks = contractState.buildingBonuses[offer.buildingId] || 0;
            const rewardMult = getContractBuildingMultiplier(offer.buildingId) * (1 + CONTRACT_REWARD_MULT);
            const affordable = score >= offer.price;
            html += '<div class="contract-card">'
                + '<div class="contract-head"><img src="' + building.imgPath + '" alt=""><div>'
                + '<div class="contract-title">' + t(building.name) + '</div>'
                + '<div class="contract-sub">' + tf('Produis {quota} Parts avec ce batiment en 3 min', { quota: formatNumber(offer.quota) }) + '</div></div></div>'
                + '<div class="contract-reward">+' + Math.round(CONTRACT_REWARD_MULT * 100) + '% ' + t('production permanente') + ' (x' + rewardMult.toFixed(2) + ')'
                + (stacks > 0 ? ' \u00b7 ' + t('deja') + ' x' + getContractBuildingMultiplier(offer.buildingId).toFixed(2) : '')
                + (stacks >= CONTRACT_REWARD_MAX_STACKS ? ' \u00b7 ' + t('palier max') : '')
                + '</div>'
                + '<button class="contract-buy-btn" onclick="acceptContract(\'' + offer.id + '\')" ' + (affordable ? '' : 'disabled') + '>'
                + '<img src="images/parts.png" class="coin-icon" alt=""> ' + formatNumber(offer.price) + ' ' + t('Parts') + '</button>'
                + '</div>';
        });
    }
    listEl.innerHTML = html;
}

function formatContractTime(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
}

function resetContractState() {
    contractState.offers = [];
    contractState.active = null;
    contractState.buildingBonuses = {};
    contractState.nextRotationAt = 0;
}

// ============================================
// CARD COLLECTION MINI-GAME
// ============================================

const CARD_RARITIES = {
    common:     { name: 'Commune',     color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', bonusMult: 0.01 },
    rare:       { name: 'Rare',        color: '#3b82f6', glow: 'rgba(59,130,246,0.5)',  bonusMult: 0.03 },
    epic:       { name: 'Épique',     color: '#a855f7', glow: 'rgba(168,85,247,0.6)',  bonusMult: 0.08 },
    legendary:  { name: 'Légendaire',  color: '#fbbf24', glow: 'rgba(251,191,36,0.7)', bonusMult: 0.20 },
    alternative:{ name: 'Alternative', color: '#f43f5e', glow: 'rgba(244,63,94,0.8)',  bonusMult: 0.50 }
};

const COLLECTIBLE_CARDS = [    { id: 'earth-card',     name: 'Terre',                 rarity: 'common',     icon: '🌍', imgPath: 'images/cards/collection/earth-card.png' },    { id: 'moon-card',      name: 'Lune',                  rarity: 'common',     icon: '🌙', imgPath: 'images/cards/collection/moon-card.png' },    { id: 'mars-card',      name: 'Mars',                  rarity: 'common',     icon: '🐀', imgPath: 'images/cards/collection/mars-card.png' },    { id: 'wrench-card',    name: 'Atelier',               rarity: 'common',     icon: '🔧', imgPath: 'images/cards/collection/workshop-card.png' },    { id: 'factory-card',   name: 'Usine',                 rarity: 'common',     icon: '🏭', imgPath: 'images/cards/collection/factory-card.png' },    { id: 'mining-card',    name: 'Mine stellaire',        rarity: 'common',     icon: '⛏️', imgPath: 'images/cards/collection/mining-card.png' },    { id: 'solar-card',     name: 'Centrale solaire',      rarity: 'common',     icon: '☀️', imgPath: 'images/cards/collection/solar-card.png' },    { id: 'lab-card',       name: 'Laboratoire',           rarity: 'common',     icon: '🧪', imgPath: 'images/cards/collection/lab-card.png' },    { id: 'neptune-card',   name: 'Neptune',               rarity: 'rare',       icon: '🌊', imgPath: 'images/cards/collection/neptune-card.png' },    { id: 'pluto-card',     name: 'Pluton',                rarity: 'rare',       icon: '❄️', imgPath: 'images/cards/collection/pluto-card.png' },    { id: 'proxima-card',   name: 'Proxima Centauri',      rarity: 'rare',       icon: '☉', imgPath: 'images/cards/collection/proxima-card.png' },    { id: 'foundry-card',   name: 'Autofab orbitale',      rarity: 'rare',       icon: '🛰️', imgPath: 'images/cards/collection/foundry-card.png' },    { id: 'station-card',   name: 'Essaim de sondes',      rarity: 'rare',       icon: '📡', imgPath: 'images/cards/collection/station-card.png' },    { id: 'nanoforge-card', name: 'Nanoforge',             rarity: 'rare',       icon: '⚙️', imgPath: 'images/cards/collection/nanoforge-card.png' },    { id: 'sirius-card',    name: 'Sirius',                rarity: 'epic',       icon: '⭐', imgPath: 'images/cards/collection/sirius-card.png' },    { id: 'oort-card',      name: "Nuage d'Oort",           rarity: 'epic',       icon: '🌀', imgPath: 'images/cards/collection/oort-card.png' },    { id: 'synth-card',     name: 'Imprimeur quantique',   rarity: 'epic',       icon: '🧬', imgPath: 'images/cards/collection/synth-card.png' },    { id: 'milkyway-card',  name: 'Centre Voie lactée',  rarity: 'legendary',  icon: '🌌', imgPath: 'images/cards/collection/milkyway-card.png' },    { id: 'blackhole-card', name: 'Trou noir industriel',   rarity: 'legendary',  icon: '🕳️', imgPath: 'images/cards/collection/blackhole-card.png' },    { id: 'andromeda-card', name: 'Andromède',            rarity: 'alternative', icon: '🔭', imgPath: 'images/cards/collection/andromeda-card.png' }];

const BOOSTERS = {
    standard:  { name: 'Standard',   cardCount: 1, cost: () => Math.max(100, Math.floor(partsPerSecond * 8)),     rarities: { common: 0.80, rare: 0.18, epic: 0.02 } },
    premium:   { name: 'Premium',    cardCount: 2, cost: () => Math.max(500, Math.floor(partsPerSecond * 40)),    rarities: { common: 0.50, rare: 0.30, epic: 0.15, legendary: 0.04, alternative: 0.01 } },
    legendary: { name: 'Légendaire', cardCount: 3, cost: () => Math.max(2000, Math.floor(partsPerSecond * 160)),  rarities: { common: 0.25, rare: 0.30, epic: 0.25, legendary: 0.15, alternative: 0.05 } }
};

// ============================================
// ATELIER GALACTIQUE - 23 upgrades uniques en 4 branches
// Ne se reset jamais. Progression meta entre les runs.
// ============================================
const GALACTIC_BRANCHES = [
    { id: 'production',   name: 'Production',    icon: '\u2699',  color: '#3b82f6' },
    { id: 'rocket',       name: 'Fus\u00e9e',          icon: '\ud83d\ude80', color: '#f59e0b' },
    { id: 'collection',   name: 'Collection',     icon: '\ud83c\udccf', color: '#ec4899' },
    { id: 'click',        name: 'Clic',            icon: '\ud83d\udc46', color: '#10b981' },
    { id: 'offline',      name: 'Hors-ligne',      icon: '\ud83c\udf19', color: '#64748b' }
];

const GALACTIC_UPGRADES = [
    // === BRANCHE PRODUCTION (8) - un upgrade par planete ===
    { id: 'prod1',  branch: 'production', tier: 1, name: 'R\u00e9acteur \u00e0 fusion',        desc: '+25% production globale.',        baseCost: 2,    costMult: 1.0, maxLevel: 1, effectPerLevel: 0.25 },
    { id: 'prod2',  branch: 'production', tier: 2, name: 'Optimisation \u00e9nerg\u00e9tique',  desc: '+35% production globale.',        baseCost: 5,    costMult: 1.0, maxLevel: 1, effectPerLevel: 0.35, requires: ['prod1'] },
    { id: 'prod3',  branch: 'production', tier: 3, name: 'Surcharge industrielle',   desc: '+45% production globale.',        baseCost: 15,   costMult: 1.0, maxLevel: 1, effectPerLevel: 0.45, requires: ['prod2'] },
    { id: 'prod4',  branch: 'production', tier: 4, name: 'Automatisation avanc\u00e9e',    desc: '+55% production globale.',       baseCost: 45,   costMult: 1.0, maxLevel: 1, effectPerLevel: 0.55, requires: ['prod3'] },
    { id: 'prod5',  branch: 'production', tier: 5, name: 'Nanotechnologie',          desc: '+65% production globale.',       baseCost: 130,  costMult: 1.0, maxLevel: 1, effectPerLevel: 0.65, requires: ['prod4'] },
    { id: 'prod6',  branch: 'production', tier: 6, name: 'Synth\u00e8se de mati\u00e8re noire', desc: '+75% production globale.',      baseCost: 380,  costMult: 1.0, maxLevel: 1, effectPerLevel: 0.75, requires: ['prod5'] },
    { id: 'prod7',  branch: 'production', tier: 7, name: 'Singularit\u00e9 technologique', desc: '+85% production globale.',      baseCost: 800, costMult: 1.0, maxLevel: 1, effectPerLevel: 0.85, requires: ['prod6'] },
    { id: 'prod8',  branch: 'production', tier: 8, name: 'Forge stellaire',          desc: '+100% production globale.',       baseCost: 2200, costMult: 1.0, maxLevel: 1, effectPerLevel: 1.0, requires: ['prod7'] },

    // === BRANCHE FUS\u00c9E (5) - upgrades uniques ===
    { id: 'rock1',  branch: 'rocket', tier: 1, name: 'D\u00e9marrage assist\u00e9',        desc: '+5 Ateliers gratuits au d\u00e9but de chaque run.', baseCost: 1,   costMult: 1.0, maxLevel: 1, effectPerLevel: 5 },
    { id: 'rock2',  branch: 'rocket', tier: 2, name: 'Propulsion am\u00e9lior\u00e9e',      desc: '+20% distance de lancement.',       baseCost: 3,    costMult: 1.0, maxLevel: 1, effectPerLevel: 0.20, requires: ['rock1'] },
    { id: 'rock3',  branch: 'rocket', tier: 3, name: 'Cha\u00eene de production',     desc: '+1 Usine gratuite au d\u00e9but de chaque run.',  baseCost: 10,   costMult: 1.0, maxLevel: 1, effectPerLevel: 1, requires: ['rock2'] },
    { id: 'rock4',  branch: 'rocket', tier: 4, name: 'Propulsion quantique',      desc: '+30% distance de lancement.',       baseCost: 40,   costMult: 1.0, maxLevel: 1, effectPerLevel: 0.30, requires: ['rock3'] },

    // === BRANCHE COLLECTION (5) - upgrades uniques ===
    { id: 'coll1',  branch: 'collection', tier: 1, name: 'Carte de commerçant',     desc: '-10% coût des boosters.',          baseCost: 1,    costMult: 1.0, maxLevel: 1, effectPerLevel: 0.10 },
    { id: 'coll2',  branch: 'collection', tier: 2, name: 'Chance de collection',   desc: '+15% chance de rareté supérieure dans le booster Standard.',  baseCost: 8,   costMult: 1.0, maxLevel: 1, effectPerLevel: 0.15, requires: ['coll1'] },
    { id: 'coll3',  branch: 'collection', tier: 3, name: 'Marché noir',           desc: '-10% coût des boosters.',          baseCost: 30,   costMult: 1.0, maxLevel: 1, effectPerLevel: 0.10, requires: ['coll2'] },
    { id: 'coll4',  branch: 'collection', tier: 4, name: 'Boosters renforcés',      desc: '+20% au bonus des cartes possédées.',              baseCost: 80,   costMult: 1.0, maxLevel: 1, effectPerLevel: 0.20, requires: ['coll3'] },
    { id: 'coll5',  branch: 'collection', tier: 5, name: 'Réseau de contrebande',  desc: '-15% coût des boosters.',          baseCost: 200,  costMult: 1.0, maxLevel: 1, effectPerLevel: 0.15, requires: ['coll4'] },
    { id: 'coll6',  branch: 'collection', tier: 6, name: 'Album cosmique',          desc: '+1 carte dans tous les boosters.',     baseCost: 500,  costMult: 1.0, maxLevel: 1, effectPerLevel: 1, requires: ['coll5'] },

    // === BRANCHE CLIC (5) - upgrades uniques ===
    { id: 'click1', branch: 'click', tier: 1, name: 'Gants renforc\u00e9s',      desc: 'x1.5 puissance de clic.',              baseCost: 1,   costMult: 1.0, maxLevel: 1, effectPerLevel: 1.5 },
    { id: 'click2', branch: 'click', tier: 2, name: 'Frappe critique',       desc: '+2.5% chance de coup critique (x3).',   baseCost: 5,   costMult: 1.0, maxLevel: 1, effectPerLevel: 0.025, requires: ['click1'] },
    { id: 'click3', branch: 'click', tier: 3, name: 'Main cybern\u00e9tique',     desc: 'x1.75 puissance de clic.',             baseCost: 25,  costMult: 1.0, maxLevel: 1, effectPerLevel: 1.75, requires: ['click2'] },
    { id: 'click4', branch: 'click', tier: 4, name: 'Surcharge neuronale',    desc: '+10% chance de coup critique (x3).',    baseCost: 60,  costMult: 1.0, maxLevel: 1, effectPerLevel: 0.10, requires: ['click3'] },
    { id: 'click5', branch: 'click', tier: 5, name: 'Main de l\'univers',      desc: 'x2 puissance de clic.',                baseCost: 150, costMult: 1.0, maxLevel: 1, effectPerLevel: 2, requires: ['click4'] },
    { id: 'click6', branch: 'click', tier: 6, name: 'Appel cosmique',         desc: '5% de chance de d\u00e9clencher une com\u00e8te \u00e0 chaque clic.', baseCost: 400, costMult: 1.0, maxLevel: 1, effectPerLevel: 0.05, requires: ['click5'] },
    // === BRANCHE HORS-LIGNE (5) - production pendant l'absence ===
    { id: 'off1', branch: 'offline', tier: 1, name: 'Pilote automatique',          desc: 'Production continue jusqu\u0027\u00e0 1h apr\u00e8s fermeture du jeu.',  baseCost: 1,   costMult: 1.0, maxLevel: 1, effectPerLevel: 1 },
    { id: 'off2', branch: 'offline', tier: 2, name: 'Drone de maintenance',         desc: 'Production continue jusqu\u0027\u00e0 2h apr\u00e8s fermeture du jeu.',  baseCost: 3,   costMult: 1.0, maxLevel: 1, effectPerLevel: 2, requires: ['off1'] },
    { id: 'off3', branch: 'offline', tier: 3, name: 'IA de bord',                  desc: 'Production continue jusqu\u0027\u00e0 4h apr\u00e8s fermeture du jeu.',  baseCost: 8,  costMult: 1.0, maxLevel: 1, effectPerLevel: 4, requires: ['off2'] },
    { id: 'off4', branch: 'offline', tier: 4, name: 'Colonie autonome',            desc: 'Production continue jusqu\u0027\u00e0 8h apr\u00e8s fermeture du jeu.',  baseCost: 20,  costMult: 1.0, maxLevel: 1, effectPerLevel: 8, requires: ['off3'] },
    { id: 'off5', branch: 'offline', tier: 5, name: 'Civilisation robotis\u00e9e', desc: 'Production continue jusqu\u0027\u00e0 16h apr\u00e8s fermeture du jeu.', baseCost: 50, costMult: 1.0, maxLevel: 1, effectPerLevel: 16, requires: ['off4'] }
];

let galacticUpgrades = {};

let cardCollection = {};

function openCardCollection() {
    document.getElementById('card-collection-modal').classList.add('active');
    updateCardCollectionDisplay();
    showCardShop();
}

function closeCardCollection() {
    document.getElementById('card-collection-modal').classList.remove('active');
}

function showCardShop() {
    document.getElementById('cc-booster-screen').style.display = 'block';
    document.getElementById('cc-reveal-screen').style.display = 'none';
    document.getElementById('cc-album-screen').style.display = 'none';
    document.getElementById('cc-back-btn').style.display = 'none';
    updateBoosterPrices();
}

function showCardAlbum() {
    document.getElementById('cc-booster-screen').style.display = 'none';
    document.getElementById('cc-reveal-screen').style.display = 'none';
    document.getElementById('cc-album-screen').style.display = 'block';
    document.getElementById('cc-back-btn').style.display = 'inline-flex';
    renderCardAlbum();
}

function showCardReveal() {
    document.getElementById('cc-booster-screen').style.display = 'none';
    document.getElementById('cc-reveal-screen').style.display = 'flex';
    document.getElementById('cc-album-screen').style.display = 'none';
    document.getElementById('cc-back-btn').style.display = 'inline-flex';
}

function updateBoosterPrices() {
    for (const key in BOOSTERS) {
        const costEl = document.getElementById('cc-cost-' + key);
        if (costEl) { costEl.textContent = ''; const coinImg = document.createElement('img'); coinImg.src = 'images/parts.png'; coinImg.className = 'coin-icon'; coinImg.alt = ''; costEl.appendChild(coinImg); costEl.appendChild(document.createTextNode(' ' + formatNumber(Math.floor(BOOSTERS[key].cost() * (1 - getBoosterDiscount()))))); }
    }
}

function updateCardCollectionDisplay() {
    const collected = Object.keys(cardCollection).filter(id => cardCollection[id] > 0);
    document.getElementById('cc-collected-count').textContent = collected.length;
    document.getElementById('cc-total-count').textContent = COLLECTIBLE_CARDS.length;
    document.getElementById('cc-bonus-display').textContent = '×' + getCollectionMultiplier().toFixed(2);
}

function isCollectionComplete() {
    return COLLECTIBLE_CARDS.every(c => cardCollection[c.id] > 0);
}

function getCollectionBonus() {
    let bonus = 0;
    for (const card of COLLECTIBLE_CARDS) {
        if (cardCollection[card.id] > 0) {
            bonus += CARD_RARITIES[card.rarity].bonusMult;
        }
    }
    if (isCollectionComplete()) {
        bonus += 0.20;
    }
    return bonus;
}

function getCollectionMultiplier() {
    return 1 + getCollectionBonus() * (1 + getCollectionUpgradeBonus());
}

function buyBooster(type) {
    const booster = BOOSTERS[type];
    if (!booster) return;
    const cost = Math.floor(booster.cost() * (1 - getBoosterDiscount()));
    if (score < cost) {
        showToast('❌ ' + t('Pas assez de Parts pour ce booster !'));
        return;
    }
    score -= cost;
    updateDisplay();

    const drawn = [];
    let cardCount = booster.cardCount;
    cardCount += getGalacticUpgradeLevel('coll6');
    for (let i = 0; i < cardCount; i++) {
        drawn.push(drawCard(booster.rarities));
    }

    for (const card of drawn) {
        cardCollection[card.id] = (cardCollection[card.id] || 0) + 1;
    }

    renderRevealCards(drawn);
    showCardReveal();
    updateCardCollectionDisplay();
    saveGame();
}

function drawCard(rarities) {
    const boost = getRarityBoost();
    const adjusted = {};
    let total = 0;
    const order = Object.keys(rarities);
    for (const r of order) { adjusted[r] = rarities[r]; total += rarities[r]; }
    if (boost > 0) {
        const boosted = adjusted['common'] * boost;
        adjusted['common'] -= boosted;
        for (let i = 1; i < order.length; i++) {
            adjusted[order[i]] += boosted / (order.length - 1);
        }
    }
    const roll = Math.random() * total;
    let cumul = 0;
    let chosenRarity = 'common';
    for (const rarity of order) {
        cumul += adjusted[rarity];
        if (roll < cumul) { chosenRarity = rarity; break; }
    }
    const pool = COLLECTIBLE_CARDS.filter(c => c.rarity === chosenRarity);
    if (pool.length === 0) {
        const fallback = COLLECTIBLE_CARDS.filter(c => c.rarity === 'common');
        return fallback[Math.floor(Math.random() * fallback.length)];
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

function renderRevealCards(cards) {
    const container = document.getElementById('cc-reveal-cards');
    container.innerHTML = '';
    document.getElementById('cc-reveal-shop-btn').style.display = 'none';
    document.getElementById('cc-reveal-album-btn').style.display = 'none';
    const total = cards.length;
    let revealed = 0;
    const checkAllRevealed = function () {
        if (revealed >= total) {
            document.getElementById('cc-reveal-shop-btn').style.display = 'inline-flex';
            document.getElementById('cc-reveal-album-btn').style.display = 'inline-flex';
        }
    };
    cards.forEach((card, idx) => {
        const isNew = (cardCollection[card.id] || 0) <= 1;
        const el = document.createElement('div');
        el.className = 'cc-reveal-card rarity-' + card.rarity;
        el.style.animationDelay = (idx * 0.15) + 's';
        el.innerHTML =
            '<div class="cc-reveal-inner">' +
                '<div class="cc-reveal-front"><img src="images/cards/backs/card-back.png" class="cc-card-img" alt="Dos de carte"></div>' +
                '<div class="cc-reveal-back">' +
                    '<img src="' + card.imgPath + '" class="cc-card-img" alt="' + card.name + '">' +
                    (isNew ? '<div class="cc-card-new">' + t('NOUVELLE !') + '</div>' : '') +
                '</div>' +
            '</div>';
        el.addEventListener('click', function () {
            if (el.classList.contains('flipped')) return;
            el.classList.add('flipped');
            revealed++;
            checkAllRevealed();
        });
        container.appendChild(el);
    });
}

function revealAllCards() {
    document.querySelectorAll('#cc-reveal-cards .cc-reveal-card:not(.flipped)').forEach(function (el) {
        el.classList.add('flipped');
    });
    document.getElementById('cc-reveal-shop-btn').style.display = 'inline-flex';
    document.getElementById('cc-reveal-album-btn').style.display = 'inline-flex';
}

function renderCardAlbum() {
    const grid = document.getElementById('cc-album-grid');
    grid.innerHTML = '';

    const complete = isCollectionComplete();
    if (complete) {
        const banner = document.createElement('div');
        banner.className = 'cc-set-complete';
        banner.textContent = '🚀 ' + t('Collection complète ! +20% prod');
        grid.appendChild(banner);
    }
    COLLECTIBLE_CARDS.forEach(card => {
        const owned = cardCollection[card.id] > 0;
        const el = document.createElement('div');
        el.className = 'cc-album-card' + (owned ? '' : ' locked') + ' rarity-' + card.rarity;
        el.innerHTML =
            (owned
                ? '<img src="' + card.imgPath + '" class="cc-card-img" alt="' + card.name + '"><div class="cc-card-count">\u00d7' + cardCollection[card.id] + '</div>'
                : '<div class="cc-card-icon">?</div>');
        if (owned) {
            el.addEventListener('click', function () { openCardLightbox(card); });
        }
        grid.appendChild(el);
    });
}

function openCardLightbox(card) {
    const lightbox = document.getElementById('cc-lightbox');
    const img = document.getElementById('cc-lightbox-img');
    img.src = card.imgPath;
    img.alt = card.name;
    document.getElementById('cc-lightbox-name').textContent = card.icon + ' ' + t(card.name);
    const rarity = CARD_RARITIES[card.rarity];
    const bonus = Math.round(CARD_RARITIES[card.rarity].bonusMult * 100);
    const count = cardCollection[card.id] || 0;
    document.getElementById('cc-lightbox-sub').textContent = t(rarity.name) + ' \u00b7 +' + bonus + '% ' + t('production') + ' \u00b7 \u00d7' + count;
    document.getElementById('cc-lightbox-name').style.color = rarity.color;
    lightbox.classList.add('open');
    lightbox.dataset.cardId = card.id;
}

function closeCardLightbox() {
    const lightbox = document.getElementById('cc-lightbox');
    lightbox.classList.remove('open');
    lightbox.dataset.cardId = '';
}

// ============================================
// MOBILE / RESPONSIVE
// ============================================
// Vue active sur mobile : 'center' (fusée), 'right' (bâtiments), 'left' (espace)
let mobileActiveView = 'center';

function isMobileLayout() {
    return window.matchMedia('(max-width: 1024px)').matches;
}

function setMobileView(view) {
    mobileActiveView = view;
    const grid = document.querySelector('.main-grid');
    const nav = document.getElementById('mobile-nav');
    if (!grid) return;
    grid.classList.remove('mobile-view-left', 'mobile-view-center', 'mobile-view-right');
    grid.classList.add('mobile-view-' + view);
    if (nav) {
        nav.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }
    if (view === 'center') applySceneScale();
}

// Mise à l'échelle de la scène de construction : la fusée fait ~700px
// de haut en taille réelle (pièces positionnées en pixels fixes). On applique
// un transform: scale() pour qu'elle tienne toujours dans l'écran.
function applySceneScale() {
    const container = document.getElementById('rocket-parts-container');
    if (!container) return;
    const scene = container.parentElement;
    if (!scene) return;
    const sceneHeight = scene.clientHeight;
    const sceneWidth = scene.clientWidth;
    if (!sceneHeight || !sceneWidth) return;
    // Repère de la fusée dans la scène (positions px fixes des pièces)
    const ROCKET_TOP = 205;
    const ROCKET_BASE = 686;
    const PAD = 12;
    // Scène assez grande : layout d'origine inchangé (desktop)
    if (sceneHeight >= ROCKET_BASE + PAD && sceneWidth >= 420) {
        container.style.transform = '';
        return;
    }
    const rocketHeight = ROCKET_BASE - ROCKET_TOP;
    const fitY = (sceneHeight - PAD * 2) / rocketHeight;
    const fitX = (sceneWidth - PAD * 2) / 420;
    const scale = Math.min(1, fitY, fitX);
    // Origine en haut au centre ; on place la base de la fusée
    // juste au-dessus du bas de la scène.
    const ty = sceneHeight - PAD - scale * ROCKET_BASE;
    container.style.transformOrigin = '50% 0';
    container.style.transform = 'translateY(' + ty + 'px) scale(' + scale + ')';
}

function initMobileNav() {
    const nav = document.getElementById('mobile-nav');
    if (!nav) return;
    nav.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => setMobileView(btn.dataset.view));
    });
    if (isMobileLayout()) setMobileView(mobileActiveView);
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isMobileLayout()) {
                setMobileView(mobileActiveView);
                applySceneScale();
            }
        }, 150);
    });
    window.addEventListener('orientationchange', () => {
        setTimeout(applySceneScale, 250);
    });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    initGlobals();
    loadGame();
    applyStartupBonus();

    updateDisplay();
    renderBuildings();
    renderUpgrades();
    renderRocketPartsShop();
    updateConstructionScene();
    checkBuildingUnlocks();
    checkTrophies();
    initMobileNav();
    const ccLightbox = document.getElementById('cc-lightbox');
    if (ccLightbox) {
        ccLightbox.addEventListener('click', function (e) { if (e.target !== document.getElementById('cc-lightbox-img')) closeCardLightbox(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCardLightbox(); });
    }
    if (isMobileLayout()) {
        setMobileView(mobileActiveView);
        applySceneScale();
    }
}

// ============================================
// TIMERS
// ============================================

function scheduleBonusSpawn() {
    const bonus = getCometFrequencyBonus();
    const delay = Math.max(800, BONUS_SPAWN_INTERVAL_MS / (1 + bonus));
    setTimeout(() => {
        spawnRandomBonus();
        scheduleBonusSpawn();
    }, delay);
}
scheduleBonusSpawn();
let lastGameTick = Date.now();

setInterval(gameLoop, GAME_LOOP_INTERVAL_MS);
setInterval(tickContracts, 500);
setInterval(() => {
    if (Date.now() - lastSaveTime > SAVE_INTERVAL_MS) {
        saveGame();
    }
}, 10000);

window.onload = function() {
    if (typeof initLanguage === 'function') initLanguage();
    init();
    if (!gameStartTime) {
        gameStartTime = Date.now();
    }
    initDebugMode();
};

// ============================================
// MODE DEBUG (test de progression rapide)
// Activer via ?debug=1 dans l'URL.
// Commandes globales: Debug.addScore(n), Debug.addStardust(n),
// Debug.buyAllParts(), Debug.launch(), Debug.fast(n),
// Debug.giveBuildings(id, n), Debug.reset(), Debug.setPlanet(index)
// ============================================
const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug');

function debugSimulateTime(seconds) {
    // Avance une horloge virtuelle et rejoue gameLoop pas a pas
    // (gameLoop se base sur Date.now, on le decale d'un offset croissant).
    const stepMs = 2000;
    let remaining = seconds * 1000;
    const realNow = Date.now;
    let offset = 0;
    Date.now = () => realNow() + offset;
    try {
        while (remaining > 0) {
            const dt = Math.min(stepMs, remaining);
            offset += dt;
            gameLoop();
            remaining -= dt;
        }
    } finally {
        Date.now = realNow;
    }
    // Resynchroniser toutes les horloges de throttling sur le temps reel,
    // sinon elles restent bloquees dans le futur virtuel et les mises a jour
    // UI (prix, distance, sauvegarde) s'arretent pendant des heures.
    const now = Date.now();
    lastGameTick = now;
    lastBuildingsUpdate = 0;
    lastRocketPartsUpdate = 0;
    lastSpaceProgressUpdate = 0;
    lastSaveTime = 0;
}

function debugRenderAll() {
    updateDisplay();
    updateAllBuildingButtons();
    renderBuildings();
    renderUpgrades();
    renderRocketPartsShop();
    updateConstructionScene();
    updateSpaceProgress();
    updateStardustDisplay();
    renderGalacticShop();
}

// --- Estimateur de temps reel jusqu'a la prochaine planete ---
// Snapshot/restaure l'etat du jeu, simule l'avenir avec une politique
// d'achat "meilleur rendement" et retourne le temps de jeu actif requis.
function debugSnapshotState() {
    return {
        score, partsSinceLaunch, partsPerSecond, starDust,
        maxDistance, prestigeMultiplier, rocketsLaunched, lastLaunchDistance,
        buildings: BUILDINGS.map(b => ({ id: b.id, count: b.count })),
        buildingUpgrades: JSON.parse(JSON.stringify(buildingUpgrades)),
        parts: ROCKET_PARTS.map(p => ({ id: p.id, purchased: p.purchased })),
        constructed: new Set(constructedParts),
        galactic: JSON.parse(JSON.stringify(galacticUpgrades)),
        clickUps: [...activatedClickUpgrades],
        autoMultiplier, clickMultiplier
    };
}

function debugRestoreState(s) {
    score = s.score;
    partsSinceLaunch = s.partsSinceLaunch;
    partsPerSecond = s.partsPerSecond;
    starDust = s.starDust;
    maxDistance = s.maxDistance;
    prestigeMultiplier = s.prestigeMultiplier;
    rocketsLaunched = s.rocketsLaunched;
    lastLaunchDistance = s.lastLaunchDistance;
    s.buildings.forEach(sb => { const b = findBuildingById(sb.id); if (b) b.count = sb.count; });
    buildingUpgrades = JSON.parse(JSON.stringify(s.buildingUpgrades));
    s.parts.forEach(sp => { const p = ROCKET_PARTS.find(x => x.id === sp.id); if (p) p.purchased = sp.purchased; });
    constructedParts = new Set(s.constructed);
    galacticUpgrades = JSON.parse(JSON.stringify(s.galactic));
    activatedClickUpgrades = [...s.clickUps];
    autoMultiplier = s.autoMultiplier;
    clickMultiplier = s.clickMultiplier;
}

// Politique d'achat du bot: a chaque pas, depense le score au meilleur
// rendement (batiment le plus rentable, upgrade de batiment, piece de fusee).
function debugSimulateToTarget(targetDistanceKm, clickRatePerSec = 4, maxHours = 24) {
    const progress = calculatePlanetProgress(lastLaunchDistance);
    const next = progress.nextPlanet;
    const targetDist = targetDistanceKm || (next ? next.distanceRequired : null);
    if (!targetDist) return { error: 'Plus de planète à atteindre.' };
    // Cumul de parts requis: dist = LUNE * (cum / DISTANCE_MOON_PARTS)^EXP * boostDistance
    const boost = (1 + (prestigeMultiplier - 1) / 2) * getDistanceBonus();
    const cumRequired = DISTANCE_MOON_PARTS * Math.pow(targetDist / (boost * MOON_DISTANCE), 1 / DISTANCE_SCORE_EXP);
    if (partsSinceLaunch >= cumRequired) return { error: 'Objectif déjà atteint.' };

    const dt = 1; // pas de 1 s
    const maxSteps = maxHours * 3600;
    let cum = partsSinceLaunch;
    let scoreSpendable = score;
    let steps = 0;
    // copie des counts pour la simulation
    const counts = BUILDINGS.map(b => b.count);
    const ups = BUILDINGS.map(b => (buildingUpgrades[b.id] || []).length);
    let partsBought = ROCKET_PARTS.filter(p => p.purchased).length;
    const partCosts = ROCKET_PARTS.map(p => getRocketPartCost(p));
    const clickUpsN = activatedClickUpgrades.length;

    function prodPerSec() {
        let total = 0;
        BUILDINGS.forEach((b, i) => {
            total += b.gain * counts[i] * Math.pow(2, ups[i]);
        });
        return total * autoMultiplier * getCollectionMultiplier() * getProductionBonus()
             * getPrestigeProductionBoost() * getPlanetProductionBonus();
    }

    for (steps = 0; steps < maxSteps && cum < cumRequired; steps++) {
        const pps = prodPerSec();
        // clics actifs (4/s) tant qu'ils sont significatifs (< 50% de la prod)
        const totB = counts.reduce((a, b) => a + b, 0);
        const fm = clickUpsN >= 2 ? (1 + (clickUpsN - 1) * 0.5) : 0;
        const clickVal = Math.pow(2, clickUpsN) + fm * 0.1 * totB + clickUpsN * 0.01 * pps;
        const inc = pps * dt + (clickRatePerSec * clickVal > pps * 0.1 ? clickRatePerSec * clickVal * dt : 0);
        cum += inc;
        scoreSpendable += inc;
        // achats: on depense au mieux, ordonne par payback
        // (batiment / upgrade de batiment / piece de fusee)
        let bought = true;
        while (bought) {
            bought = false;
            let bestPayback = Infinity, action = null;
            BUILDINGS.forEach((b, i) => {
                const c = Math.floor(b.baseCost * Math.pow(BUILDING_PRICE_GROWTH_RATE, counts[i]));
                const unitGain = b.gain * Math.pow(2, ups[i]) * getProductionBonus() * getPrestigeProductionBoost() * getPlanetProductionBonus() * getCollectionMultiplier();
                if (scoreSpendable >= c && unitGain > 0) {
                    const pb = c / unitGain;
                    if (pb < bestPayback) { bestPayback = pb; action = { type: 'b', i, c }; }
                }
                // upgrade de batiment si palier atteint
                if (counts[i] >= BUILDING_UPGRADE_THRESHOLDS[ups[i]]) {
                    const uc = getBuildingUpgradeFixedCost(b.id, BUILDING_UPGRADE_THRESHOLDS[ups[i]]);
                    const marginalGain = unitGain * counts[i]; // x2 la prod du batiment
                    if (scoreSpendable >= uc && counts[i] > 0) {
                        const pb = uc / marginalGain;
                        if (pb < bestPayback) { bestPayback = pb; action = { type: 'u', i, c: uc }; }
                    }
                }
            });
            if (action) {
                scoreSpendable -= action.c;
                if (action.type === 'b') counts[action.i]++;
                else ups[action.i]++;
                bought = true;
            }
        }
        // pieces de fusee des que le score le permet (objectif du run)
        while (partsBought < 10 && scoreSpendable >= partCosts[partsBought]) {
            scoreSpendable -= partCosts[partsBought];
            partsBought++;
        }
    }
    if (cum >= cumRequired) {
        return { seconds: steps, planet: next ? next.name : '?', targetDistance: targetDist };
    }
    return { error: 'Non atteint en ' + maxHours + ' h de jeu actif.' };
}

function debugEstimateTime() {
    const snap = debugSnapshotState();
    let result;
    try {
        result = debugSimulateToTarget();
    } finally {
        debugRestoreState(snap);
        debugRenderAll();
    }
    if (result.error) return result;
    const h = Math.floor(result.seconds / 3600);
    const m = Math.round((result.seconds % 3600) / 60);
    return { ...result, formatted: h > 0 ? (h + 'h' + String(m).padStart(2, '0')) : (m + ' min') };
}

const Debug = {
    addScore(n) {
        score += n;
        partsSinceLaunch += n;
        updateDisplay();
    },
    addStardust(n) {
        starDust += n;
        totalStardustEarned += n;
        updateStardustDisplay();
        renderGalacticShop();
    },
    buyAllParts() {
        ROCKET_PARTS.forEach(p => {
            if (!p.purchased) {
                p.purchased = true;
                constructedParts = new Set(ROCKET_PARTS.map(x => x.id));
                updateConstructionScene();
            }
        });
        renderRocketPartsShop();
    },
    launch() {
        if (!checkRocketReady()) { this.buyAllParts(); }
        launchRocket();
    },
    fast(seconds) {
        debugSimulateTime(seconds);
        debugRenderAll();
    },
    giveBuildings(buildingId, n) {
        const b = findBuildingById(buildingId);
        if (!b) { console.warn('Bâtiment inconnu:', buildingId); return; }
        b.count += n;
        unlockedBuildings.add(b.id);
        debugRenderAll();
    },
    reset() {
        localStorage.removeItem('starshipClickerSave');
        location.search = '?debug=1';
    },
    estimate() {
        const r = debugEstimateTime();
        if (r.error) { console.warn('[DEBUG] ' + r.error); showToast('[DEBUG] ' + r.error); return r; }
        console.log('[DEBUG] Prochaine planète: ' + r.planet + ' dans ~' + r.formatted + ' de jeu actif');
        showToast('[DEBUG] ' + r.planet + ' dans ~' + r.formatted);
        return r;
    },
    breakdown() {
        const factors = {
            temporaire: autoMultiplier,
            cartes: getCollectionMultiplier(),
            atelier_production: getProductionBonus(),
            prestige: getPrestigeProductionBoost(),
            planetes: getPlanetProductionBonus()
        };
        let total = 1;
        Object.entries(factors).forEach(([k, v]) => {
            total *= v;
            console.log('[DEBUG] ' + k.padEnd(18) + ' x' + v.toFixed(2));
        });
        console.log('[DEBUG] TOTAL              x' + total.toFixed(2));
        return { ...factors, total };
    },
    setPlanet(index) {
        const p = PLANETS[index];
        if (!p) { console.warn('Index invalide. 0=Terre ... ' + (PLANETS.length - 1) + '=' + PLANETS[PLANETS.length - 1].name); return; }
        const dust = calculateStardustGain(p.distanceRequired);
        if (dust > 0) { starDust += dust; totalStardustEarned += dust; }
        maxDistance = Math.max(maxDistance, p.distanceRequired);
        prestigeMultiplier = 1 + Math.log(1 + maxDistance / MOON_DISTANCE) / 2;
        unlockedPlanets = new Set(PLANETS.slice(0, index + 1).map(x => x.id));
        updateSpaceProgress();
        updateStardustDisplay();
        renderGalacticShop();
        console.log('Positionné sur ' + p.name + ' (+' + dust + ' PE, prestige x' + prestigeMultiplier.toFixed(2) + ')');
    }
};

window.Debug = Debug;

function initDebugMode() {
    if (!DEBUG_MODE) return;
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = 'position:fixed;bottom:10px;left:10px;z-index:99999;background:rgba(0,0,0,.85);color:#0f0;font-family:monospace;font-size:12px;padding:10px;border-radius:8px;display:flex;flex-direction:column;gap:6px;max-height:90vh;overflow:auto;';
    const btn = (label, fn) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.onclick = fn;
        b.style.cssText = 'background:#111;color:#0f0;border:1px solid #0f0;padding:4px 8px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:11px;';
        return b;
    };
    panel.appendChild(btn('+100k Parts', () => Debug.addScore(1e5)));
    panel.appendChild(btn('+1M Parts', () => Debug.addScore(1e6)));
    panel.appendChild(btn('+100 PE', () => Debug.addStardust(100)));
    panel.appendChild(btn('Toutes pièces fusée', () => Debug.buyAllParts()));
    panel.appendChild(btn('Lancer la fusée', () => Debug.launch()));
    panel.appendChild(btn('+1 min de jeu', () => Debug.fast(60)));
    panel.appendChild(btn('+10 min de jeu', () => Debug.fast(600)));
    panel.appendChild(btn('+1 h de jeu', () => Debug.fast(3600)));
    panel.appendChild(btn('⏱ Temps réel estimé', () => Debug.estimate()));
    panel.appendChild(btn('Reset complet', () => Debug.reset()));
    const close = document.createElement('button');
    close.textContent = '×';
    close.onclick = () => panel.remove();
    close.style.cssText = 'background:#111;color:#f00;border:1px solid #f00;padding:2px 6px;border-radius:4px;cursor:pointer;position:absolute;top:4px;right:4px;';
    panel.appendChild(close);
    document.body.appendChild(panel);
    console.log('%c[DEBUG] mode test actif. Console: Debug.addScore(n), Debug.addStardust(n), Debug.buyAllParts(), Debug.launch(), Debug.fast(sec), Debug.giveBuildings(id, n), Debug.setPlanet(i), Debug.reset()', 'color:#0f0');
}


// ============================================
// ROCKET PARTS SHOP (achats uniques)
// ============================================

function getRocketPartCost(part) {
    const discount = Math.min(0.5, getRocketPartDiscount());
    return Math.floor(part.cost * Math.pow(ROCKET_PART_COST_GROWTH, rocketsLaunched) * (1 - discount));
}

function buyRocketPart(partId) {
    const part = ROCKET_PARTS.find(p => p.id === partId);
    if (!part || part.purchased) return;
    const cost = getRocketPartCost(part);
    if (score < cost) {
        showToast("\u274c " + t("Pas assez de Parts pour") + " " + t(part.name));
        return;
    }
    score -= cost;
    part.purchased = true;
    updateDisplay();
    updateConstructionScene();
    renderRocketPartsShop();
    checkBuildingUnlocks();
    saveGame();
    showToast("\u2705 " + t(part.name) + " " + t("construit !"));
    checkTrophies();
}

function renderRocketPartsShop() {
    const container = document.getElementById('rocket-parts-shop');
    if (!container) return;
    const nextPart = ROCKET_PARTS.find(p => !p.purchased);
    if (!nextPart) {
        if (container.dataset.partId !== '__complete__') {
            container.dataset.partId = '__complete__';
            container.innerHTML =
                '<div class="rocket-part-frame complete">' +
                    '<div class="rocket-part-frame-title">' + t('Pi\u00e8ces compl\u00e8tes') + '</div>' +
                    '<div class="rocket-part-frame-complete">\u2713 ' + t('Fus\u00e9e pr\u00eate \u00e0 lancer') + '</div>' +
                '</div>';
        }
        return;
    }
    const cost = getRocketPartCost(nextPart);
    const isAffordable = score >= cost;
    // Ne recrerer le DOM que si la piece affichee change. Sinon, mettre a jour
    // uniquement le cout et l'etat du bouton pour eviter le clignotement du hover.
    if (container.dataset.partId !== nextPart.id) {
        container.dataset.partId = nextPart.id;
        const imageUrl = nextPart.imgPath || '';
        const imageHtml = imageUrl
            ? '<img src="' + imageUrl + '" class="rocket-part-icon" alt="' + nextPart.name + '">'
            : '<span class="rocket-part-icon-placeholder"></span>';
        const purchasedCount = ROCKET_PARTS.filter(p => p.purchased).length;
        container.innerHTML =
            '<div class="rocket-part-frame' + (!isAffordable ? ' locked' : '') + '">' +
                '<div class="rocket-part-frame-title">' + t('Pi\u00e8ce') + ' ' + (purchasedCount + 1) + ' / ' + ROCKET_PARTS.length + '</div>' +
                '<div class="rocket-part-left">' + imageHtml + '</div>' +
                '<div class="rocket-part-info">' +
                    '<span class="rocket-part-name">' + t(nextPart.name) + '</span>' +
                    '<span class="rocket-part-cost">' + formatNumber(cost) + ' ' + t('Parts') + '</span>' +
                '</div>' +
                '<button class="rocket-part-btn" onclick="buyRocketPart(\'' + nextPart.id + '\')"' + (!isAffordable ? ' disabled' : '') + '>' + t('Construire') + '</button>' +
            '</div>';
    } else {
        const costEl = container.querySelector('.rocket-part-cost');
        if (costEl) costEl.textContent = formatNumber(cost) + ' ' + t('Parts');
        const btn = container.querySelector('.rocket-part-btn');
        if (btn) {
            btn.disabled = !isAffordable;
        }
        const frame = container.querySelector('.rocket-part-frame');
        if (frame) {
            if (isAffordable) frame.classList.remove('locked');
            else frame.classList.add('locked');
        }
    }
}

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
        // Les pièces de fusée s'affichent une fois achetées
        const shouldDisplay = part.purchased;
        
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
            applySceneScale();
            
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
    const allConstructed = ROCKET_PARTS.every(p => constructedParts.has(p.id));
    
    const scene = document.getElementById('construction-scene');
    if (allConstructed && scene) {
        scene.classList.add('rocket-complete');
        showToast("🚀 " + t("Fusée complète ! Prête pour le décollage !"));
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
