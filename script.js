// ============================================
// STARCruiser CLICKER - MAIN SCRIPT
// Version 2.1.0
// ============================================

// ============================================
// GLOBAL TOOLTIP
// ============================================
const tooltip = document.createElement('div');
tooltip.className = 'upgrade-tooltip';
document.body.appendChild(tooltip);
let tooltipAnchor = null;

function showTooltip(text, x, y, options) {
    // Chaque ligne du tooltip est insecable (nowrap) : un nombre ne peut jamais
    // etre coupe en deux par le retour a la ligne impose par max-width.
    tooltip.replaceChildren(...text.split('\n').map(line => {
        const span = document.createElement('span');
        span.className = 'tooltip-line';
        span.textContent = line;
        return span;
    }));
    tooltip.style.width = '';
    tooltip.style.maxWidth = '';
    if (options && options.width) {
        tooltip.style.width = options.width + 'px';
        tooltip.style.maxWidth = options.width + 'px';
    }
    tooltip.classList.add('visible');
    const rect = tooltip.getBoundingClientRect();
    const margin = 8;
    // leftEdge : bord gauche reel du tooltip une fois le centrage (-50%) applique
    const leftEdge = options && options.align === 'left' ? x : x - rect.width / 2;
    const clampedLeft = Math.max(margin, Math.min(leftEdge, window.innerWidth - rect.width - margin));
    // Clamp vertical : si le tooltip ne tient pas au-dessus (trophees proches
    // du haut d'ecran), il bascule sous l'element via options.anchorBottom.
    const anchorBottom = options && options.anchorBottom ? options.anchorBottom : y;
    const forceBelow = !!(options && options.below);
    if (!forceBelow && y - rect.height - margin >= 0) {
        tooltip.style.transform = 'translate(0, -120%)';
        tooltip.style.top = y + 'px';
    } else {
        tooltip.style.transform = 'translate(0, 0)';
        tooltip.style.top = Math.min(anchorBottom + margin, window.innerHeight - rect.height - margin) + 'px';
    }
    tooltip.style.left = clampedLeft + 'px';
    tooltipAnchor = { x, y, options: options || null };
}

function hideTooltip() {
    tooltip.classList.remove('visible');
    tooltipLiveRefresh = null;
    tooltipAnchor = null;
}

// Rafraichissement en continu du tooltip affiche (production qui evolue).
// Fontion qui regenere le texte; appelee periodiquement par la boucle de jeu.
let tooltipLiveRefresh = null;
function refreshLiveTooltip() {
    if (tooltipLiveRefresh && tooltip.classList.contains('visible')) {
        tooltip.replaceChildren(...tooltipLiveRefresh().split('\n').map(line => {
            const span = document.createElement('span');
            span.className = 'tooltip-line';
            span.textContent = line;
            return span;
        }));
        if (tooltipAnchor) {
            const rect = tooltip.getBoundingClientRect();
            const margin = 8;
            const leftEdge = tooltipAnchor.options && tooltipAnchor.options.align === 'left'
                ? tooltipAnchor.x : tooltipAnchor.x - rect.width / 2;
            const clampedLeft = Math.max(margin, Math.min(leftEdge, window.innerWidth - rect.width - margin));
            tooltip.style.left = clampedLeft + 'px';
            if (tooltipAnchor.y - rect.height - margin < 0) {
                const anchorBottom = tooltipAnchor.options && tooltipAnchor.options.anchorBottom
                    ? tooltipAnchor.options.anchorBottom : tooltipAnchor.y;
                tooltip.style.top = Math.min(anchorBottom + margin, window.innerHeight - rect.height - margin) + 'px';
            }
        }
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
const DISPLAY_UPDATE_INTERVAL_MS = 250;
const SLOW_UPDATE_INTERVAL_MS = 1000;
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
    { id: "workshop",      name: "Atelier",                  description: "Tout commence ici", baseCost: 15,            gain: 0.1,      count: 0, image: "", imgPath: "images/buildings/workshop.png",  unlockCondition: () => true,            totalGenerated: 0 },
    { id: "factory",       name: "Usine",                    description: "Construit les ateliers", baseCost: 100,           gain: 1,         count: 0, image: "",       imgPath: "images/buildings/factory.png",  unlockCondition: () => score >= 50,       totalGenerated: 0 },
    { id: "mine",          name: "Mine stellaire",           description: "Nourrit les usines", baseCost: 1100,          gain: 8,        count: 0, image: "",       imgPath: "images/buildings/stellar-mine.png", unlockCondition: () => score >= 500,      totalGenerated: 0 },
    { id: "solar",         name: "Centrale solaire",         description: "Alimente le complexe", baseCost: 12000,         gain: 47,       count: 0, image: "",       imgPath: "images/buildings/solar-central.png", unlockCondition: () => score >= 6000,     totalGenerated: 0 },
    { id: "foundry",       name: "Autofab orbitale",        description: "Usines qui s'assemblent seules", baseCost: 130000,       gain: 260,     count: 0, image: "", imgPath: "images/buildings/orbital-autofab.png", unlockCondition: () => score >= 65000,   totalGenerated: 0 },
    { id: "station",       name: "Essaim de sondes",         description: "Sondes auto-réplicantes", baseCost: 1400000,      gain: 1400,    count: 0, image: "", imgPath: "images/buildings/essaim-sonde.png", unlockCondition: () => score >= 700000, totalGenerated: 0 },
    { id: "nanoforge",     name: "Nanoforge",                description: "L'atome devient matière première", baseCost: 20000000,     gain: 7800,   count: 0, image: "", imgPath: "images/buildings/nanoforge.png", unlockCondition: () => score >= 10000000, totalGenerated: 0 },
    { id: "synth",         name: "Imprimeur quantique",  description: "La matière sur mesure", baseCost: 330000000,    gain: 44000,  count: 0, image: "", imgPath: "images/buildings/quantic-printer.png", unlockCondition: () => score >= 150000000, totalGenerated: 0 },
    { id: "antimatter",   name: "Collecteur d'antimatière",  description: "Ressource ultime", baseCost: 5100000000,   gain: 260000, count: 0, image: "", imgPath: "images/buildings/antimatter_collector.png", unlockCondition: () => score >= 2500000000, totalGenerated: 0 },
    { id: "voidrig",       name: "Forge de vide",           description: "Extrait l'énergie du vide quantique", baseCost: 75000000000,          gain: 1600000,      count: 0, image: "",       imgPath: "images/buildings/voidforge.png", unlockCondition: () => score >= 35000000000,       totalGenerated: 0 },
    { id: "quasar",        name: "Moteur à quasar",           description: "Énergie de quasar", baseCost: 1000000000000,        gain: 10000000,    count: 0, image: "",       imgPath: "images/buildings/quasar-motor.png", unlockCondition: () => score >= 500000000000,    totalGenerated: 0 },
    { id: "nebula",        name: "Fonderie stellaire",   description: "Coule des étoiles entières", baseCost: 14000000000000,          gain: 65000000,      count: 0, image: "",       imgPath: "images/buildings/stellar-fundry.png", unlockCondition: () => score >= 7500000000000,      totalGenerated: 0 },
    { id: "pulsar",        name: "Horloger de pulsar",          description: "Règle les battements de l'univers", baseCost: 170000000000000,          gain: 430000000,      count: 0, image: "",       imgPath: "images/buildings/pulsar-clock.png", unlockCondition: () => score >= 100000000000000,    totalGenerated: 0 },
    { id: "blackhole",     name: "Trou noir industriel",     description: "L'ultime moteur", baseCost: 2100000000000000,          gain: 2900000000,      count: 0, image: "",       imgPath: "images/buildings/black-hole-factory.png", unlockCondition: () => score >= 1500000000000000,    totalGenerated: 0 },
];

// Bâtiments de production = liste utilisée par la boucle clicker (achat en masse, gain Parts/s)
const BUILDINGS = PRODUCTION_BUILDINGS;

// ============================================
// PIÈCES DE FUSÉE
// Achats uniques par run (payés en Parts). Compléter les 10 = lancement.
// ============================================
const ROCKET_PARTS = [
    { id: "nozzles",       name: "Tuyères",        description: "Propulsion", cost: 50,           image: "",       imgPath: "images/rocket/nozzles.PNG",       x: 50,    y: 646, width: 40,  height: 20,  order: 2,  purchased: false },
    { id: "engines",       name: "Moteurs",        description: "Moteurs principaux", cost: 150,          image: "",       imgPath: "images/rocket/engines.png",       x: 50,    y: 595, width: 40,  height: 51,  order: 3,  purchased: false },
    { id: "fuel-tank",     name: "Réservoir",     description: "Carburant", cost: 450,          image: "",       imgPath: "images/rocket/fuel-tank.png",     x: 50,    y: 537, width: 40,  height: 58,  order: 4,  purchased: false },
    { id: "rocket-body",   name: "Corps",          description: "Structure", cost: 1300,         image: "",       imgPath: "images/rocket/body.png",          x: 50,    y: 337, width: 40,  height: 200, order: 5,  purchased: false },
    { id: "boosters-left", name: "Boosters Gauche", description: "Propulsion supplémentaire", cost: 3800,         image: "",       imgPath: "images/rocket/boosters-left.png", x: 45.8,  y: 373, width: 50,  height: 300, order: 6,  purchased: false },
    { id: "boosters-right",name: "Boosters Droit",  description: "Propulsion supplémentaire", cost: 11000,        image: "",       imgPath: "images/rocket/boosters-right.png",x: 54.2,  y: 373, width: 50,  height: 300, order: 6,  purchased: false },
    { id: "cockpit",       name: "Cockpit",        description: "Poste de pilotage", cost: 32000,        image: "", imgPath: "images/rocket/cockpit.png",        x: 50,    y: 292, width: 45,  height: 45,  order: 7,  purchased: false },
    { id: "shield",        name: "Bouclier",       description: "Protection", cost: 93000,        image: "",       imgPath: "images/rocket/shield.png",        x: 50,    y: 233, width: 45,  height: 59,  order: 8,  purchased: false },
    { id: "launch-pad",    name: "Pas de tir",     description: "Lancement", cost: 270000,       image: "",       imgPath: "images/rocket/launch-pad.png",    x: 60.2,  y: 205, width: 190, height: 481, order: 9,  purchased: false },
    { id: "astronaut",     name: "Astronaute",    description: "Pilote", cost: 638000,       image: "", imgPath: "images/rocket/astronaut.png",     x: 60,    y: 635, width: 25,  height: 60,  order: 10, purchased: false }
];




// Ameliorations de clic inspirees de Cookie Clicker :
// - Chacune double la valeur de base du clic (x2, comme Reinforced finger / Carpal tunnel).
// - A partir de la 2e, debloque un bonus par bâtiment possede ( Thousand Fingers).
// - Les couts suivent l'echelle ~x10 de Cookie Clicker.
const CLICK_UPGRADES = [
    // Deblocage par Parts gagnees via les clics uniquement, cumulees depuis
    // le debut du run (reset au lancement comme les upgrades). Le cout reste
    // le vrai verrou, decalant chaque achat dans le temps.
    // Echelonnement resserre : premier palier des ~50 clics (au lieu de 100
    // parts cumulees), puis progression ~x4 a x5 par palier pour lisser
    // la courbe vers les hauts multiplicateurs.
    { threshold: 50,        name: "Doigt renforcé",        cost: 50 },
    { threshold: 250,       name: "Précision laser",       cost: 250 },
    { threshold: 1200,      name: "Lancement puissant",   cost: 2500 },
    { threshold: 6000,      name: "Ingénieur expert",     cost: 15000 },
    { threshold: 30000,     name: "Scientifique spatial",  cost: 100000 },
    { threshold: 150000,    name: "Pionnier galactique",  cost: 750000 },
    { threshold: 750000,    name: "Click galactique",     cost: 5000000 },
    { threshold: 4000000,   name: "Maître cosmique",      cost: 40000000 },
    { threshold: 20000000,  name: "Puissance interstellaire", cost: 300000000 },
    { threshold: 100000000, name: "Main de l'univers",   cost: 2000000000 }
];

// Paliers de 1 a 200 batiments : personne ne depassera 200 exemplaires
const BUILDING_UPGRADE_THRESHOLDS = [1, 5, 10, 25, 50, 75, 100, 150, 200];

function getUpgradeTierColor(tierIndex) {
    const n = BUILDING_UPGRADE_THRESHOLDS.length;
    if (n <= 1) return UPGRADE_COLORS[0];
    const pos = Math.round(tierIndex * (UPGRADE_COLORS.length - 1) / (n - 1));
    return UPGRADE_COLORS[Math.min(Math.max(pos, 0), UPGRADE_COLORS.length - 1)];
}
const UPGRADE_COLORS = [
    '#88c9ee', '#66b2ff', '#4499ff', '#2288ff', '#1177ff',
    '#0066ff', '#4444ff', '#6622ff', '#8800ff', '#aa00dd',
    '#cc00bb', '#ee0099', '#ff0077', '#ff0055', '#ff2233',
    '#ff4411', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00',
    '#ffee00', '#ffff00'
];

const RANDOM_BONUSES = [
    { id: "meteor", symbol: "", name: "Pluie de météores", effect: "instant", type: "meteor", colorClass: "meteor" },
    { id: "flare", symbol: "", name: "Éruption solaire", effect: "multiplier", type: "flare", multiplier: 5, duration: 15000, colorClass: "flare" }
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
    building: ['#88c9ee', '#0066ff', '#ff6600', '#ffcc00', '#ffee00', '#ffff00'],
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
    { id: "pps-1000000", name: "Vitesse Nébulaire", description: "Atteindre 1 000 000 Parts par seconde", icon: "images/parts.png", threshold: 1000000, type: "pps" },
    { id: "pps-10000000", name: "Hyperdrive", description: "Atteindre 10 000 000 Parts par seconde", icon: "images/parts.png", threshold: 10000000, type: "pps" },
    { id: "pps-100000000", name: "Star Forge", description: "Atteindre 100 000 000 Parts par seconde", icon: "images/parts.png", threshold: 100000000, type: "pps" },
    { id: "pps-1000000000", name: "Cosmic Engine", description: "Atteindre 1 000 000 000 Parts par seconde", icon: "images/parts.png", threshold: 1000000000, type: "pps" },
    { id: "pps-10000000000", name: "Reality Bender", description: "Atteindre 10 000 000 000 Parts par seconde", icon: "images/parts.png", threshold: 10000000000, type: "pps" },

    // Vitesse de voyage (icône: missile) — vitesse REELLE de la stat
    // "Vitesse", c'est-a-dire les km/s gagnes par la distance atteignable.
    { id: "speed-100", name: "Première Accélération", description: "Atteindre 100 km/s de vitesse de voyage", icon: "images/effects/missile.png", threshold: 100, type: "speed" },
    { id: "speed-1000", name: "Propulsion Ionique", description: "Atteindre 1 000 km/s de vitesse de voyage", icon: "images/effects/missile.png", threshold: 1000, type: "speed" },
    { id: "speed-10000", name: "Vitesse Stellaire", description: "Atteindre 10 000 km/s de vitesse de voyage", icon: "images/effects/missile.png", threshold: 10000, type: "speed" },
    { id: "speed-100000", name: "Missile Interstellaire", description: "Atteindre 100 000 km/s de vitesse de voyage", icon: "images/effects/missile.png", threshold: 100000, type: "speed" },
    { id: "speed-299792", name: "Plus Vite que la Lumière", description: "Dépasser la vitesse de la lumière (299 792 km/s)", icon: "images/effects/missile.png", threshold: 299792, type: "speed" },
    { id: "speed-1000000", name: "Propulsion Warp", description: "Atteindre 1 000 000 km/s de vitesse de voyage", icon: "images/effects/missile.png", threshold: 1000000, type: "speed" },
    { id: "speed-10000000", name: "Sillage Cosmique", description: "Atteindre 10 000 000 km/s de vitesse de voyage", icon: "images/effects/missile.png", threshold: 10000000, type: "speed" },

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
    { id: "dust-100", name: "Collectionneur Cosmique", description: "Gagner 100 Poussière d'Étoiles au total", icon: "images/cards/collection/milky-way-center-card.png", threshold: 100, type: "stardust" },
    { id: "dust-1000", name: "Maître de la Poussière", description: "Gagner 1 000 Poussière d'Étoiles au total", icon: "images/cards/collection/sirius-card.png", threshold: 1000, type: "stardust" },
    { id: "dust-10000", name: "Semeur d'Étoiles", description: "Gagner 10 000 Poussière d'Étoiles au total", icon: "images/cards/collection/comet-card.png", threshold: 10000, type: "stardust" },
    { id: "dust-100000", name: "Architecte Céleste", description: "Gagner 100 000 Poussière d'Étoiles au total", icon: "images/cards/collection/oort-cloud-card.png", threshold: 100000, type: "stardust" },

    // Améliorations de bâtiments (icônes: bâtiments)
    { id: "first-upgrade", name: "First Upgrade", description: "Acheter votre première amélioration de bâtiment", icon: "images/buildings/workshop.png", threshold: 1, type: "building-upgrade" },
    { id: "five-upgrades", name: "Upgrade Master", description: "Avoir 5 améliorations de bâtiment", icon: "images/buildings/factory.png", threshold: 5, type: "building-upgrade" },
    { id: "ten-upgrades", name: "Engineering Genius", description: "Avoir 10 améliorations de bâtiment", icon: "images/buildings/essaim-sonde.png", threshold: 10, type: "building-upgrade" },
    { id: "twenty-upgrades", name: "Upgrade Legend", description: "Avoir 20 améliorations de bâtiment", icon: "images/buildings/antimatter_collector.png", threshold: 20, type: "building-upgrade" },
    { id: "fifty-upgrades", name: "Génie de l'Ingénierie", description: "Avoir 50 améliorations de bâtiment", icon: "images/buildings/nanoforge.png", threshold: 50, type: "building-upgrade" },
    { id: "hundred-upgrades", name: "Ingénieur Cosmique", description: "Avoir 100 améliorations de bâtiment", icon: "images/buildings/quantic-printer.png", threshold: 100, type: "building-upgrade" },

    // Améliorations de clic (icônes: pièce fusée + astronaute)
    { id: "first-click-upgrade", name: "First Launch", description: "Acheter votre première amélioration de clic", icon: "images/rocket/nozzles.PNG", threshold: 1, type: "click-upgrade" },
    { id: "all-click-upgrades", name: "Launch Master", description: "Débloquer toutes les améliorations de clic", icon: "images/rocket/astronaut.png", threshold: CLICK_UPGRADES.length, type: "click-upgrade" },

    // Bâtiments possédés (icônes: bâtiments)
    { id: "first-building", name: "First Component", description: "Acheter votre premier bâtiment", icon: "images/buildings/workshop.png", threshold: 1, type: "building" },
    { id: "ten-buildings", name: "Space Builder", description: "Posséder 10 bâtiments au total", icon: "images/buildings/factory.png", threshold: 10, type: "building" },
    { id: "hundred-buildings", name: "Space Architect", description: "Posséder 100 bâtiments au total", icon: "images/buildings/stellar-mine.png", threshold: 100, type: "building" },
    { id: "thousand-buildings", name: "Galactic Builder", description: "Posséder 250 bâtiments au total", icon: "images/buildings/nanoforge.png", threshold: 250, type: "building" },
    { id: "five-thousand-buildings", name: "Bâtisseur Stellaire", description: "Posséder 500 bâtiments au total", icon: "images/buildings/antimatter_collector.png", threshold: 500, type: "building" },
    { id: "ten-thousand-buildings", name: "Empereur du Vide", description: "Posséder 1 000 bâtiments au total", icon: "images/buildings/essaim-sonde.png", threshold: 1000, type: "building" },

    // Score total (icônes: parts et cartes)
    { id: "score-1000", name: "Small Start", description: "Atteindre 1 000 Parts", icon: "images/parts.png", threshold: 1000, type: "score" },
    { id: "score-1000000", name: "Millionaire", description: "Atteindre 1 000 000 Parts", icon: "images/cards/collection/earth-card.png", threshold: 1000000, type: "score" },
    { id: "score-1000000000", name: "Billionaire", description: "Atteindre 1 000 000 000 Parts", icon: "images/cards/collection/sirius-card.png", threshold: 1000000000, type: "score" },
    { id: "score-1000000000000", name: "Trillionaire", description: "Atteindre 1 000 000 000 000 Parts", icon: "images/cards/collection/oort-cloud-card.png", threshold: 1000000000000, type: "score" },
    { id: "score-1000000000000000", name: "Quadrillionaire", description: "Atteindre 1 000 000 000 000 000 Parts", icon: "images/cards/collection/milky-way-center-card.png", threshold: 1000000000000000, type: "score" },
    { id: "score-10000000000000000", name: "Maître de l'Univers", description: "Atteindre 10 000 000 000 000 000 Parts", icon: "images/cards/collection/missile-card.png", threshold: 10000000000000000, type: "score" },
    { id: "score-100000000000000000", name: "Au-delà de l'Univers", description: "Atteindre 100 000 000 000 000 000 Parts", icon: "images/planets/milky-way-center.png", threshold: 100000000000000000, type: "score" },

    // Bonus cliqués (icônes: comète)
    { id: "first-bonus", name: "First Bonus", description: "Cliquer votre premier bonus aléatoire", icon: "images/effects/comete.png", threshold: 1, type: "bonus" },
    { id: "ten-bonuses", name: "Bonus Hunter", description: "Cliquer 10 bonus aléatoires", icon: "images/cards/collection/comet-card.png", threshold: 10, type: "bonus" },
    { id: "fifty-bonuses", name: "Chasseur de Comètes", description: "Cliquer 50 bonus aléatoires", icon: "images/effects/comete.png", threshold: 50, type: "bonus" },
    { id: "hundred-bonuses", name: "Cerveau Cosmique", description: "Cliquer 100 bonus aléatoires", icon: "images/effects/comete.png", threshold: 100, type: "bonus" },

    // Collection (icône: carte trou noir)
    { id: "all-buildings", name: "Space Collector", description: "Débloquer tous les types de bâtiments", icon: "images/cards/collection/milky-way-center-card.png", threshold: BUILDINGS.length, type: "building-types" },
    { id: "cards-10", name: "Cartothécaire", description: "Posséder 10 cartes de collection", icon: "images/cards/collection/moon-card.png", threshold: 10, type: "cards" },
    { id: "cards-20", name: "Collection Complète", description: "Posséder toutes les cartes de collection", icon: "images/cards/collection/oort-cloud-card.png", threshold: 20, type: "cards" },
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
let totalGeneratedAtLaunchStart = 0;
let totalPartsEarnedAllTime = 0;
let totalPartsEarnedThisLaunch = 0;
let naturalPartsThisLaunch = 0;
let lastSaveTime = 0;
let lastBuildingsUpdate = 0;
let lastRocketPartsUpdate = 0;
let lastSpaceProgressUpdate = 0;
let lastDisplayUpdate = 0;
let lastSlowUpdate = 0;
let gameStartTime = 0;
let startupBonusApplied = false;
let tutorialSeen = false;
let buyMultiplier = 1;
let clickedBonusesCount = 0;
let unlockedTrophies = new Set();

// ============================================
// ROCKET LAUNCH SYSTEM (Prestige)
// ============================================
let maxDistance = 0;
let prestigeMultiplier = 1;
let rocketsLaunched = 0;
// Horodatage du dernier lancement confirme (0 = jamais lance)
let lastLaunchAt = 0;
let lastLaunchDistance = 0;
let starDust = 0; // Poussière d'Étoiles : monnaie de prestige persistante
let totalStardustEarned = 0; // Cumul de toutes les Poussière d'Étoiles gagnées (trophées)


// ============================================
// ROCKET CONSTRUCTION DATA
// ============================================
const ROCKET_PART_POSITIONS = {
    'nozzles': { position: 'bottom', emoji: '', name: 'Tuyères', class: 'rocket-engine' },
    'engines': { position: 'bottom', emoji: '', name: 'Moteurs', class: 'rocket-engine' },
    'fuel-tank': { position: 'middle', emoji: '', name: 'Réservoir', class: 'rocket-body' },
    'rocket-body': { position: 'middle', emoji: '', name: 'Corps', class: 'rocket-body' },
    'wings': { position: 'sides', emoji: '', name: 'Stabilisateurs', class: 'rocket-wings' },
    'cockpit': { position: 'top', emoji: '', name: 'Cockpit', class: 'rocket-nose' },
    'shield': { position: 'top', emoji: '', name: 'Bouclier', class: 'rocket-nose' },
    'launch-pad': { position: 'bottom', emoji: '', name: 'Pas de tir', class: 'rocket-engine' },
    'astronaut': { position: 'top', emoji: '', name: 'Astronaute', class: 'rocket-nose' }
};

let isLaunching = false;
let launchSequenceActive = false;
let nextPlanetNotified = false;

// ============================================
// SPACE MAP SYSTEM (Planets & Bonuses)
// ============================================
const PLANETS = [
    { id: 'earth', name: 'Terre', emoji: '\uD83C\uDF0D', distanceRequired: 0, bonusPercent: 0, color: '#10b981', imgPath: 'images/planets/earth.png' },
    { id: 'moon', name: 'Lune', emoji: '\uD83D\uDD11', distanceRequired: 384400, bonusPercent: 25, color: '#a9a9a9', imgPath: 'images/planets/moon.png' },
    { id: 'mars', name: 'Mars', emoji: '\u2642', distanceRequired: 4120000, bonusPercent: 30, color: '#ef4444', imgPath: 'images/planets/mars.png' },
    { id: 'neptune', name: 'Neptune', emoji: '\u2645', distanceRequired: 47800000, bonusPercent: 35, color: '#06b6d4', imgPath: 'images/planets/neptune.png' },
    { id: 'pluto', name: 'Pluton', emoji: '\u2646', distanceRequired: 563000000, bonusPercent: 40, color: '#8b5cf6', imgPath: 'images/planets/pluto.png' },
    { id: 'oort-cloud', name: "Nuage d'Oort", emoji: '\u2728', distanceRequired: 6100000000, bonusPercent: 45, color: '#f59e0b', imgPath: 'images/planets/oort-cloud.png' },
    { id: 'proxima-centauri', name: 'Proxima Centauri', emoji: '\u2609', distanceRequired: 72500000000, bonusPercent: 50, color: '#10b981', imgPath: 'images/planets/proxima-centauri.png' },
    { id: 'sirius', name: 'Sirius', emoji: '\u2609', distanceRequired: 891000000000, bonusPercent: 55, color: '#3b82f6', imgPath: 'images/planets/sirius.png' },
    { id: 'milky-way-center', name: 'Centre Voie lactée', emoji: '\uD83C\uDF0C', distanceRequired: 12800000000000, bonusPercent: 60, color: '#fbbf24', imgPath: 'images/planets/milky-way-center.png' },
    { id: 'andromeda', name: 'Andromède', emoji: '\uD83C\uDF0C', distanceRequired: 156000000000000, bonusPercent: 70, color: '#ec4899', imgPath: 'images/planets/andromeda.png' },
    { id: 'virgo-cluster', name: 'Amas de Virgo', emoji: '\u2728', distanceRequired: 2010000000000000, bonusPercent: 85, color: '#a855f7', imgPath: 'images/planets/virgo-cluster.png' }
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
// Cache d'accEs par id : findBuildingById est appelE dans toutes les boucles
// de rendu (plusieurs fois par tick). La liste ne change jamais apres init.
const buildingByIdCache = new Map();
function findBuildingByIdFast(buildingId) {
    let b = buildingByIdCache.get(buildingId);
    if (b === undefined) {
        b = BUILDINGS.find(x => x.id === buildingId) || null;
        buildingByIdCache.set(buildingId, b);
    }
    return b;
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

// Multiplicateur propre du batiment : upgrades (x2 par palier).
// Exclut les bonus globaux (planets, trophees, prestige, collection, boost temporaire).
function getBuildingOwnMultiplier(building) {
    return getBuildingUpgradeMultiplier(building.id);
}
function calculateBuildingGain(building) {
    const upgradeMultiplier = getBuildingUpgradeMultiplier(building.id);
    return building.gain * building.count * autoMultiplier * upgradeMultiplier * getCollectionMultiplier() * getProductionBonus() * getPrestigeProductionBoost() * getPlanetProductionBonus();
}

function calculateUnitBuildingGain(building) {
    const upgradeMultiplier = getBuildingUpgradeMultiplier(building.id);
    return building.gain * autoMultiplier * upgradeMultiplier * getCollectionMultiplier() * getProductionBonus() * getPrestigeProductionBoost() * getPlanetProductionBonus();
}


// Production hors boost temporaire (autoMultiplier exclu) : base de calcul des quotas
// de contrat, pour qu'une offre generee pendant un x5 reste atteignable ensuite.
function calculateBuildingBaseGain(building) {
    const upgradeMultiplier = getBuildingUpgradeMultiplier(building.id);
    return building.gain * building.count * upgradeMultiplier * getCollectionMultiplier() * getProductionBonus() * getPrestigeProductionBoost() * getPlanetProductionBonus();
}
// PPS total hors boost temporaire (autoMultiplier exclu) : base de calcul des
// contrats interactifs, pour qu'une offre generee pendant un x5 reste coherente.
function getBasePartsPerSecond() {
    let total = 0;
    BUILDINGS.forEach(building => { total += calculateBuildingBaseGain(building); });
    return total;
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
    // Total de production rEutilisE du snapshot du gameLoop (dEjA calculE
    // pour partsPerSecond) au lieu de recalculer le gain de TOUS les
    // batiments pour CHAQUE tooltip — c'Etait O(batiments^2) par tick.
    const currentTotal = cachedGainPerBuilding.get(building.id) === totalGain && buildingGainsCache !== null
        ? buildingGainsCache
        : (BUILDINGS.reduce((acc, b) => acc + (cachedGainPerBuilding.get(b.id) || calculateBuildingGain(b)), 0));
    const percent = currentTotal > 0 ? ((totalGain / currentTotal) * 100).toFixed(2) : 0;
    return tf('{flavor}: +{gain} Parts/s\nMultiplicateur: x{mult}\n% de la production: {percent}%\nTotal g\u00e9n\u00e9r\u00e9: {total} Parts', {
        flavor: t(building.description),
        gain: formatNumber(unitGain),
        mult: getBuildingOwnMultiplier(building).toFixed(2),
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
        return groupThousands(intPart) + ',' + decPart;
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
    
    return scaled.toFixed(decimals).replace('.', ',') + " " + suffix;
}

function updateAutoMultiplier() {
    autoMultiplier = autoMultipliers.reduce((a, b) => a * b, 1);
    invalidateBuildingGainsCache();
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

let toastHideTimer = null;
const TOAST_MAX_STACK = 3;
function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}
function showToast(message, icon, durationMs, options) {
    const container = getToastContainer();
    while (container.children.length >= TOAST_MAX_STACK) {
        container.firstElementChild.remove();
    }
    const toast = document.createElement('div');
    toast.className = 'toast' + (options && options.failure ? ' failure' : '');
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
    textEl.className = 'toast-text';
    textEl.textContent = message;
    toast.appendChild(textEl);
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('active'));
    toast._hideTimer = setTimeout(() => dismissToast(toast), durationMs || TOAST_DURATION_MS);
}
function dismissToast(toast) {
    if (!toast || !toast.classList.contains('active')) return;
    if (toast._hideTimer) clearTimeout(toast._hideTimer);
    toast.classList.remove('active');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    setTimeout(() => { if (toast.isConnected) toast.remove(); }, 400);
}
// Les toasts sont en pointer-events: none : ils ne doivent jamais
// intercepter les gestes (scroll tactile) derriere eux.
// Un tap (sans glissement) sur une notification la ferme quand meme :
// on teste geometriquement la position du doigt/curseur contre les toasts.
let toastTapCandidate = null;
document.addEventListener('pointerdown', (e) => {
    toastTapCandidate = { x: e.clientX, y: e.clientY, id: e.pointerId };
});
document.addEventListener('pointerup', (e) => {
    const start = toastTapCandidate;
    toastTapCandidate = null;
    if (!start || start.id !== e.pointerId) return;
    if (Math.abs(e.clientX - start.x) > 10 || Math.abs(e.clientY - start.y) > 10) return;
    const toasts = document.querySelectorAll('.toast.active');
    for (const toast of toasts) {
        const r = toast.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            dismissToast(toast);
            return;
        }
    }
});

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
        totalPartsEarnedAllTime: totalPartsEarnedAllTime,
        totalPartsEarnedThisLaunch: totalPartsEarnedThisLaunch,
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
        lastLaunchAt: lastLaunchAt,
        lastLaunchDistance: lastLaunchDistance,
        // Multiplicateur d'achat (x1/x5/x10/max) : confort, sinon retombe a x1.
        buyMultiplier: buyMultiplier === 'max' ? 'max' : (buyMultiplier || 1),
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
        rocketParts: ROCKET_PARTS.map(part => ({            id: part.id,            purchased: part.purchased        })),
        // Pieces deja construites : evite de rejouer l'animation de chute
        // pour toute la fusee a chaque rechargement de la page.
        constructedParts: [...constructedParts],
        startupBonusApplied: startupBonusApplied,
        tutorialSeen: tutorialSeen,
        contractState: {
            offers: contractState.offers,
            active: contractState.active,
            nextRotationAt: contractState.nextRotationAt,
            unlockedSeen: contractState.unlockedSeen
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

    localStorage.setItem('starcruiserClickerSave', JSON.stringify(saveData));
    lastSaveTime = Date.now();
}

function loadGame() {
    const legacySave = localStorage.getItem('starshipClickerSave');
    if (legacySave !== null && localStorage.getItem('starcruiserClickerSave') === null) {
        localStorage.setItem('starcruiserClickerSave', legacySave);
    }
    if (legacySave !== null) localStorage.removeItem('starshipClickerSave');

    const saveData = localStorage.getItem('starcruiserClickerSave');
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
        lastLaunchAt = parsed.lastLaunchAt || 0;
        lastLaunchDistance = parsed.lastLaunchDistance || 0;
        if (parsed.buyMultiplier === 'max' || [1, 5, 10].includes(parsed.buyMultiplier)) {
            buyMultiplier = parsed.buyMultiplier;
        }
        
        activatedClickUpgrades = parsed.activatedClickUpgrades || [];
        unlockedBuildings = new Set(parsed.unlockedBuildings || []);
        gameStartTime = parsed.gameStartTime || 0;
        startupBonusApplied = !!parsed.startupBonusApplied;
        // Migration : les anciennes saves n'ont pas tutorialSeen. Un joueur qui a
        // deja progresse (score, batiments, lancements) ne doit pas voir le tuto.
        if (parsed.tutorialSeen !== undefined) {
            tutorialSeen = !!parsed.tutorialSeen;
        } else {
            const hasProgress = (parsed.score || 0) > 0
                || (parsed.rocketsLaunched || 0) > 0
                || (parsed.unlockedBuildings || []).length > 0;
            tutorialSeen = hasProgress;
        }
        if (parsed.contractState) {
            // Migration contrats interactifs : les offres/contrats de l'ancien
            // format (buildingId/quota, pas de typeId) ne sont plus valides —
            // on les jette pour regenerer des offres au nouveau format.
            const oldOffers = (parsed.contractState.offers || []).filter(o => o && o.typeId);
            contractState.offers = oldOffers.map(o => ({
                id: o.id, typeId: o.typeId, diffIdx: o.diffIdx || 1,
                target: o.target || 1, price: o.price || 0,
                rewardType: o.rewardType || 'instant', instantSec: o.instantSec || 0,
                clickMult: o.clickMult || 0, mult: o.mult || 0,
                duration: o.duration || 0, shower: o.shower || 0,
                expiresAt: o.expiresAt || 0
            }));
            const oa = parsed.contractState.active;
            contractState.active = (oa && oa.typeId && oa.target) ? oa : null;
            // Le compteur de Parts naturelles repart de zero au chargement :
            // reancrer la progression du contrat production sur la valeur
            // courante pour eviter une cible devenue inatteignable.
            if (contractState.active && contractState.active.typeId === 'production') {
                contractState.active.naturalStartTotal = 0;
            }
            contractState.nextRotationAt = parsed.contractState.nextRotationAt || 0;
            contractState.unlockedSeen = !!parsed.contractState.unlockedSeen;
        }

        if (parsed.cardCollection) {
            cardCollection = {...parsed.cardCollection};
            // Migration : la carte Laboratoire n'existe plus, remplacee par Comete.
            if (cardCollection['lab-card']) {
                cardCollection['comet-card'] = (cardCollection['comet-card'] || 0) + cardCollection['lab-card'];
                delete cardCollection['lab-card'];
            }
            // Migration : la carte Nanoforge n'existe plus, remplacee par Moteur a quasar.
            if (cardCollection['nanoforge-card']) {
                cardCollection['quasar-card'] = (cardCollection['quasar-card'] || 0) + cardCollection['nanoforge-card'];
                delete cardCollection['nanoforge-card'];
            }
            // Migration : la carte Imprimeur quantique n'existe plus, remplacee par Horloger de pulsar.
            if (cardCollection['synth-card']) {
                cardCollection['pulsar-card'] = (cardCollection['pulsar-card'] || 0) + cardCollection['synth-card'];
                delete cardCollection['synth-card'];
            }
            // Migration : la carte Trou noir industriel n'existe plus, remplacee par Missile.
            if (cardCollection['blackhole-card']) {
                cardCollection['missile-card'] = (cardCollection['missile-card'] || 0) + cardCollection['blackhole-card'];
                delete cardCollection['blackhole-card'];
            }
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
        if (parsed.totalPartsEarnedAllTime !== undefined) {
            totalPartsEarnedAllTime = parsed.totalPartsEarnedAllTime || 0;
        } else {
            totalPartsEarnedAllTime = calculateTotalGenerated() + totalPartsFromClicks;
        }
        if (parsed.totalPartsEarnedThisLaunch !== undefined) {
            totalPartsEarnedThisLaunch = parsed.totalPartsEarnedThisLaunch || 0;
        } else {
            totalPartsEarnedThisLaunch = calculateTotalGenerated() + totalPartsFromClicks;
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
                    // Restaurer aussi l'etat construit : sans ca, toutes les
                    // pieces achetees rejouaient l'animation de chute d'un coup
                    // au chargement et paraissaient empilees n'importe comment.
                    if (savedPart.purchased) constructedParts.add(part.id);
                }
            });
        }
        // Etat construit persiste (format recent) : prioritaire sur la
        // regeneration via rocketParts, identique en pratique.
        if (parsed.constructedParts) {
            constructedParts = new Set(parsed.constructedParts.filter(id =>
                ROCKET_PARTS.some(p => p.id === id && p.purchased)));
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
        if (e instanceof SyntaxError) {
            localStorage.removeItem('starcruiserClickerSave');
            showToast("\u26a0\ufe0f " + t("Sauvegarde corrompue. Nouvelle partie."));
        } else {
            // Sauvegarde illisible seulement si le JSON lui-meme est casse.
            // Pour toute autre erreur (code, DOM), on conserve la sauvegarde :
            // la supprimer ferait perdre au joueur des heures de progression.
            showToast("\u26a0\ufe0f " + t("Erreur de chargement. Sauvegarde conserv\u00e9e."));
        }
    }
}

function exportSave() {
    const saveData = localStorage.getItem('starcruiserClickerSave');
    if (!saveData) {
        showToast("\u274c " + t("Aucune sauvegarde."));
        return;
    }
    // Generer un fichier texte contenant la sauvegarde et le telecharger
    // directement (Blob + lien de telechargement), plus fiable que le
    // presse-papier sur mobile.
    try {
        const blob = new Blob([saveData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'starcruiser-sauvegarde.txt';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        showToast("\u2705 " + t("Fichier de sauvegarde téléchargé !"));
    } catch (e) {
        navigator.clipboard.writeText(saveData)
            .then(() => showToast("\u2705 " + t("Sauvegarde copiée !")))
            .catch(() => showToast("\u274c " + t("Échec de la copie.")));
    }
}

function importSave() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) { showToast("\u274c " + t("Rien à importer.")); return; }
    try {
        const testParse = JSON.parse(importText);
        if (testParse.version !== SAVE_VERSION) {
            showToast("\u274c " + t("Version de sauvegarde incompatible."));
            return;
        }
        if (testParse.buildings && testParse.buildingUpgrades) {
            localStorage.setItem('starcruiserClickerSave', importText);
            showToast("\u2705 " + t("Importé ! Redémarrage..."));
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast("\u274c " + t("Format invalide."));
        }
    } catch (e) {
        showToast("\u274c " + t("Format invalide."));
    }
}

// Import direct d'un fichier texte de sauvegarde (exporte via exportSave) :
// le fichier est lu et importe sans passer par le copier-coller.
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('import-file-input');
    if (!fileInput) return;
    fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = String(e.target.result || '').trim();
            const textarea = document.getElementById('import-textarea');
            if (textarea) textarea.value = text;
            importSave();
        };
        reader.onerror = () => showToast("\u274c " + t("Échec de la lecture du fichier."));
        reader.readAsText(file);
        fileInput.value = '';
    });
});
function confirmDeleteSave() {
    if (confirm("\u26a0\ufe0f " + t("Supprimer la sauvegarde ? Tous vos progrès seront PERDUS !"))) {
        deleteSave();
    }
}

function deleteSave() {
    clearTimeout(bonusSpawnTimer);
    bonusSpawnTimer = null;
    localStorage.removeItem('starcruiserClickerSave');
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
    } else {
        document.getElementById(`multiplier-x${multiplier}`).classList.add('active');
    }
    
    updateAllBuildingButtons();
}

// Reveal "Nouveau batiment" : popup plein ecran avec l'image en grand,
// la description et les caracteristiques. Se declenche uniquement au
// premier achat d'un type de batiment (count 0 -> 1).
function showNewBuildingModal(building) {
    const modal = document.getElementById('new-building-modal');
    if (!modal) return;
    const img = document.getElementById('nb-image');
    if (img) {
        img.src = building.imgPath || '';
        img.alt = building.name;
        // relance l'animation de pop a chaque ouverture
        img.style.animation = 'none';
        void img.offsetWidth;
        img.style.animation = '';
    }
    document.getElementById('nb-name').textContent = t(building.name);
    document.getElementById('nb-description').textContent = t(building.description);
    document.getElementById('nb-gain').textContent = '+' + formatNumber(building.gain) + ' ' + t('Parts') + '/s';
    document.getElementById('nb-cost').textContent = formatNumber(building.baseCost) + ' ' + t('Parts');
    modal.classList.add('active');
}

function closeNewBuildingModal() {
    const modal = document.getElementById('new-building-modal');
    if (modal) modal.classList.remove('active');
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
        const isNewType = building.count === 0;
        score -= totalCost;
        building.count += buildingsToBuy;
        unlockedBuildings.add(building.id);
        invalidateBuildingGainsCache();
        Sounds.buy();
        if (isNewType) { showNewBuildingModal(building); Sounds.unlock(); }
        updateDisplay();
        updateConstructionScene();
        saveGame();
        updateAllBuildingButtons();
        renderUpgrades();
        checkBuildingUnlocks();
        hideTooltip();
        checkTrophies();
    } else {
        hideTooltip();
        Sounds.lose();
        showToast("\u274c " + t("Pas assez de Parts"));
    }
}

function calculateMaxAffordable(building) {
    // Formule fermee (somme geometrique) au lieu d'une boucle couteuse :
    // cost(i) = floor(base * r^i * (1 - red)), i = 0..n-1.
    // La boucle precedente etait O(n) par batement et par frame, avec un
    // score eleve n pouvait atteindre des dizaines de milliers d'unites.
    if (score < calculateBuildingCost(building)) return 0;
    const reduction = getBuildingCostReduction();
    const unit = Math.floor(building.baseCost * (1 - reduction));
    if (unit <= 0) return 0;
    const r = BUILDING_PRICE_GROWTH_RATE;
    let n = Math.floor(Math.log(1 + (score * (r - 1)) / (unit * Math.pow(r, building.count))) / Math.log(r));
    if (!(n > 0)) return 0;
    // Ajustement fin : l'arrondi floor() par unite rend les couts reels
    // legerement differents de la somme geometrique continue. On corrige de
    // part et d'autre avec le cout exact (quelques iterations seulement).
    while (n > 0 && calculateTotalBuildingCost(building, n) > score) n--;
    let guard = 0;
    while (guard++ < 1000 && calculateTotalBuildingCost(building, n + 1) <= score) n++;
    return n;
}
function calculateTotalBuildingCost(building, count) {
    // Somme geometrique des couts des `count` prochaines unites.
    let totalCost = 0;
    for (let i = 0; i < count; i++) {
        totalCost += calculateBuildingCost({...building, count: building.count + i});
    }
    return totalCost;
}

function buyClickUpgrade(threshold) {
    const upgrade = CLICK_UPGRADES.find(u => u.threshold === threshold);
    if (!upgrade) return;
    
    if (activatedClickUpgrades.includes(threshold)) {
        showToast("\u2705 " + t("Already activated!"));
        return;
    }
    
    if (score < upgrade.cost) {
        Sounds.lose();
        showToast("\u274c " + t("Pas assez de Parts"));
        return;
    }
    
    score -= upgrade.cost;
    activatedClickUpgrades.push(threshold);
    Sounds.upgrade();
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
        Sounds.lose();
        showToast("\u274c " + t("Pas assez de Parts"));
        return;
    }
    
    score -= cost;
    
    if (!buildingUpgrades[buildingId]) {
        buildingUpgrades[buildingId] = [];
    }
    
    buildingUpgrades[buildingId].push(threshold);
    Sounds.upgrade();
    invalidateBuildingGainsCache();
    updateDisplay();
    saveGame();
    hideTooltip();
    renderUpgrades();
    updateAllBuildingButtons();
    checkTrophies();
    showToast('+ ' + t(building.name) + ' ' + t('am\u00e9lior\u00e9 x2') + ' (-' + formatNumber(cost) + ' Parts)');
}

// Bâtiments déjà signalés comme abordables : le son ne joue qu'au passage
// inabordable -> abordable, pas en continu ni au chargement initial.
const affordableNotifiedBuildings = new Set();
let affordableSoundReady = false;

function updateBuildingButton(buildingId, pulseTarget) {
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

    const notPurchased = building.count === 0;
    if (element.classList.contains('not-purchased') !== notPurchased) {
        element.classList.toggle('not-purchased', notPurchased);
    }

    const button = element.querySelector('button');
    const productionSpan = element.querySelector('.building-production');
    const ownershipDiv = element.querySelector('.building-ownership');

    if (button) {
        const btnText = `${displayCost} ${t("Parts")}`;
        const btnDisabled = !isAffordable || buildingsToShow === 0;
        if (button.textContent !== btnText) button.textContent = btnText;
        if (button.disabled !== btnDisabled) button.disabled = btnDisabled;
    }
    if (productionSpan) {
        const prodText = `${formatNumber(totalGain)}/s`;
        if (productionSpan.textContent !== prodText) productionSpan.textContent = prodText;
    }
    if (ownershipDiv) {
        const ownText = `${t("Possédés:")} ${building.count}`;
        if (ownershipDiv.textContent !== ownText) ownershipDiv.textContent = ownText;
    }

    const newTooltip = getBuildingTooltip(building);
    if (element.getAttribute('data-tooltip') !== newTooltip) element.setAttribute('data-tooltip', newTooltip);
    // Pulse d'attention : le premier batiment debloquE non possEdE dont le
    // prix est abordable (la cible est pre-calcullEe par updateAllBuildingButtons).
    if (pulseTarget !== undefined && building.id === pulseTarget && isAffordable) {
        pulseHint(element);
    } else if (!notPurchased) {
        clearPulseHint(element);
    }
    if (isAffordable) {
        if (!affordableNotifiedBuildings.has(building.id)) {
            affordableNotifiedBuildings.add(building.id);
            // Pas de son au tout premier passage (chargement de partie) :
            // on ne carillonne que les transitions ultérieures.
            if (affordableSoundReady) Sounds.affordable();
        }
    } else {
        affordableNotifiedBuildings.delete(building.id);
    }
}

function updateAllBuildingButtons() {
    // Cible du pulse calculEe UNE fois (et non par batiment) : le premier
    // batiment debloquE non possEdE. Chaque bouton testait avant avec un
    // BUILDINGS.some() — O(batiments^2) a chaque tick de 500 ms.
    let pulseTarget = null;
    for (const b of BUILDINGS) {
        if (isBuildingUnlocked(b) && b.count === 0) { pulseTarget = b.id; break; }
    }
    document.querySelectorAll('.building-item').forEach(element => {
        const buildingId = element.id.replace('building-', '');
        updateBuildingButton(buildingId, pulseTarget);
    });
    affordableSoundReady = true;
}

// Pulse d'attention : allume un element pendant 10 s maxi, puis s'eteint
// tout seul si le joueur n'a pas agi. Reallumer un element deja allume
// ne reinitialise PAS son chrono (pas de pulse infini sur un element).
const pulseHintTimers = new WeakMap();
function pulseHint(el) {
    if (!el || pulseHintTimers.has(el)) return;
    el.classList.add('pulse-hint');
    const timer = setTimeout(() => {
        el.classList.remove('pulse-hint');
        pulseHintTimers.delete(el);
    }, 10000);
    pulseHintTimers.set(el, timer);
}
function clearPulseHint(el) {
    if (!el || !pulseHintTimers.has(el)) return;
    clearTimeout(pulseHintTimers.get(el));
    pulseHintTimers.delete(el);
    el.classList.remove('pulse-hint');
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
    renderCollectionCardStatus();
    renderContractsCardStatus();
}

function renderBuildings() {
    const container = document.getElementById('buildings-list');
    // Preserver la position de scroll : un rerendu (ex. deblocage d'un
    // batiment pendant que le score monte) ne doit jamais remonter la liste.
    const scrollPanel = container.closest('.right-panel');
    const savedScroll = scrollPanel ? scrollPanel.scrollTop : 0;
    container.innerHTML = '';

    BUILDINGS.forEach((building) => {
        if (isBuildingUnlocked(building) || unlockedBuildings.has(building.id)) {
            renderBuilding(building);
        }
    });
    if (scrollPanel && savedScroll > 0) scrollPanel.scrollTop = savedScroll;
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
                ${t("Possédés:")} ${building.count}
            </div>
            <div class="building-production">${formatNumber(totalGain)}/s</div>
        </div>
        <div class="building-center">
            ${imageHtml}
        </div>
        <div class="building-right">
            <button onclick="buyBuilding('${building.id}')" ${!isAffordable ? 'disabled' : ''}>
                ${formatNumber(currentCost)} ${t("Parts")}
            </button>
        </div>
    `;

    if (!IS_TOUCH) {
        buildingElement.addEventListener('mouseenter', (e) => {
            if (building.count === 0) return;
            const rect = buildingElement.getBoundingClientRect();
            showTooltip(getBuildingTooltip(building), rect.left, rect.top, {
                align: 'left',
                // 90 % de la largeur de la case : texte aise sans deborder
                // sur les elements voisins.
                width: Math.round(rect.width * 0.9)
            });
            tooltipLiveRefresh = () => getBuildingTooltip(building);
        });
        buildingElement.addEventListener('mouseleave', hideTooltip);
    }
    if (IS_TOUCH) {
        buildingElement.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            if (building.count === 0) return;
            showTouchTooltip(buildingElement, getBuildingTooltip(building));
            tooltipLiveRefresh = () => getBuildingTooltip(building);
        });
    }

    container.appendChild(buildingElement);
    relocateBuildingProductions();
}


function relocateBuildingProductions() {
    document.querySelectorAll('.building-item').forEach(item => {
        const prod = item.querySelector('.building-production');
        const left = item.querySelector('.building-left');
        const right = item.querySelector('.building-right');
        if (!prod || !left || !right) return;
        if (isMobileLayout() && prod.parentElement !== left) {
            left.appendChild(prod);
        } else if (!isMobileLayout() && prod.parentElement !== right) {
            right.appendChild(prod);
        }
    });
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
// 50M parts pour la Lune: premier objectif reel du jeu. Les tests montrent
// que 22M etaient atteints en ~15 min de jeu intensif (clics + contrats +
// planetes cumules dans partsSinceLaunch) ; 50M vise ~35-45 min actives.
const DISTANCE_MOON_PARTS = 5e7;
// Distance lineaire : exposant 1.0, la vitesse km/s ne diminue jamais quand
// les parts croissent. La difficulte vient uniquement du prix des batiments
// et de l'ancre de la Lune, pas d'un ralentissement de la distance.
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
// Croissance calibrée sur le multiplicateur de production permanent MOYEN
// gagné par cycle de lancement. Estimation fixe (constante, pas variable) :
// - prestige (log) : ×1,15 à ×1,35 par cycle, décroissant
// - planète débloquée (~1/cycle) : +30 à 50% additif -> ~×1,1-1,2 effectif
// - Poussière d'Étoiles dépensée en production : +25 à 45% additif -> ~×1,1
// Cumul moyen ~×1,3 par lancement (×1,5 en début de partie, ×1,2 en fin).
// La fusée reste reconstruisible en début de cycle (le joueur produit ~30%
// plus vite qu'au cycle précédent) sans devenir gratuite en fin de partie.
const ROCKET_PART_COST_GROWTH = 1.3;

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
// Vitesse du prochain voyage : distance atteignable / durée de l'animation.
// Chaque tronçon dure TRAVEL_ANIM_LEG_MS ; le nombre de tronçons suit le
// nombre de planètes jusqu'ê la destination atteignable (même logique
// que l'animation : la vitesse en km/s s'adapte ê chaque tronçon).
function calculateTravelSpeedKmS() {
    // Vitesse REELLE : combien de km la stat "Distance atteignable" gagne
    // par seconde. Distance = f(partsSinceLaunch) et partsSinceLaunch croit
    // de partsPerSecond chaque seconde -> vitesse = f'(parts) * pps.
    // On derive exactement la meme formule que calculateDistance().
    const parts = Math.max(partsSinceLaunch, 0);
    if (parts <= 0 || partsPerSecond <= 0) return 0;
    return travelSpeedFromPps(parts, partsPerSecond);
}
// Vitesse hors boost temporaire de production (x5 etc.) : base des trophees
// de vitesse, pour qu'un multiplicateur ephemere ne debloque pas un trophee.
function calculateTravelSpeedKmSBase() {
    const parts = Math.max(partsSinceLaunch, 0);
    const basePps = getBasePartsPerSecond();
    if (parts <= 0 || basePps <= 0) return 0;
    return travelSpeedFromPps(parts, basePps);
}
function travelSpeedFromPps(parts, pps) {
    const partsUnlocked = ROCKET_PARTS.filter(part => part.purchased).length;
    const partsMult = Math.pow(PIECE_DISTANCE_MULT, partsUnlocked);
    let dFactor;
    if (parts <= DISTANCE_MOON_PARTS) {
        // scoreFactor lineaire : MOON_DISTANCE * (parts / DISTANCE_MOON_PARTS)
        dFactor = MOON_DISTANCE / DISTANCE_MOON_PARTS;
    } else {
        // scoreFactor puissance : derivee de MOON_DISTANCE * x^EXP avec x = parts/DISTANCE_MOON_PARTS
        dFactor = MOON_DISTANCE * DISTANCE_SCORE_EXP * Math.pow(parts / DISTANCE_MOON_PARTS, DISTANCE_SCORE_EXP - 1) / DISTANCE_MOON_PARTS;
    }
    const prestige = isNaN(prestigeMultiplier) ? 1 : prestigeMultiplier;
    const prestigeDistanceBoost = 1 + (prestige - 1) / 2;
    return pps * partsMult * dFactor * prestigeDistanceBoost * getDistanceBonus();
}
function formatTravelSpeed(kmS) {
    if (kmS <= 0) return '0 km/s';
    if (kmS >= 1000) return formatNumber(kmS) + ' km/s';
    const v = Math.round(kmS * 10) / 10;
    return (v % 1 === 0 ? v.toString() : v.toFixed(1)) + ' km/s';
}

function launchRocket() {
    if (!checkRocketReady()) {
        showToast(t("Fusée pas encore prête ! Il manque des pièces."));
        return;
    }
    
    if (isLaunching) {
        showToast("⏳ " + t("Lancement en cours..."));
        return;
    }
    
    isLaunching = true;
    launchSoundSequence();
    
    // Calculer la distance
    const distance = calculateDistance();
    
    playLaunchSequence(() => {
        lastLaunchDistance = distance;
        // Animation de voyage Terre -> Lune, puis carte de l'espace
        playTravelAnimation(distance, () => {
            // Fin du voyage : l'atelier galactique s'ouvre en plein ecran,
            // non fermable -- on en sort uniquement par le bouton Continuer
            // (qui applique le reset). Plus d'ecran de space map intermediaire.
            showPostTravelShop(distance);
            updateSpaceProgress();
            updateConstructionScene();
            isLaunching = false;
            showToast(`${t("Fusée lancée ! Distance atteinte:")} ${formatNumber(distance)} ${t("km")}`);
        });
    });
}

// Séquence cinématique de lancement : compte à rebours avec tremblement,
// allumage des moteurs avec flammes et fumée, puis décollage accéléré
// de la fusée complète au centre du panneau. `onDone` est appelé quand la
// fusée a quitté l'écran.
function playLaunchSequence(onDone) {
    const scene = document.getElementById('construction-scene');
    const container = document.getElementById('rocket-parts-container');
    if (!scene || !container) { onDone(); return; }

    // Bloquer le clic et le recalcul d'échelle pendant la séquence
    const medal = document.getElementById('medal');
    if (medal) medal.style.pointerEvents = 'none';
    launchSequenceActive = true;

    // Gel du transform d'échelle de base pour composer proprement l'animation
    const baseTransform = container.style.transform || '';
    const baseOrigin = container.style.transformOrigin || '';

    const overlay = document.createElement('div');
    overlay.className = 'launch-overlay';
    const countdown = document.createElement('div');
    countdown.className = 'launch-countdown';
    overlay.appendChild(countdown);
    scene.appendChild(overlay);

    // Wrapper d'animation : la fusée vole dedans. Le pas de tir et l'astronaute
    // restent au sol (pièces « ground ») : ils ne décollent pas.
    const GROUND_PARTS = ['launch-pad', 'astronaut'];
    const rocketWrap = document.createElement('div');
    rocketWrap.className = 'launch-rocket-wrap';
    rocketWrap.style.transform = baseTransform;
    if (baseOrigin) rocketWrap.style.transformOrigin = baseOrigin;
    const groundPieces = [];
    Array.from(container.children).forEach(child => {
        const isGround = GROUND_PARTS.some(id => child.classList && child.classList.contains(id));
        if (isGround) groundPieces.push(child);
        else rocketWrap.appendChild(child);
    });
    container.appendChild(rocketWrap);

    const finish = () => {
        overlay.remove();
        Array.from(rocketWrap.children).forEach(child => {
            if (child.classList && child.classList.contains('rocket-piece')) container.appendChild(child);
        });
        rocketWrap.remove();
        const smoke = scene.querySelector('.launch-smoke');
        if (smoke) smoke.remove();
        const astronaut = container.querySelector('.rocket-piece.astronaut');
        if (astronaut) {
            astronaut.classList.remove('astronaut-running');
            astronaut.style.opacity = '';
        }
        if (medal) medal.style.pointerEvents = '';
        launchSequenceActive = false;
        onDone();
    };

    // Étape 1 : compte à rebours 3..2..1. Seule la fusée tremble ;
    // l'astronaute, lui, court hors du pas de tir dès le clic.
    const steps = ['3', '2', '1'];
    let stepIndex = 0;
    const stepMs = 700;
    rocketWrap.classList.add('launch-shaking');
    const astronaut = container.querySelector('.rocket-piece.astronaut');
    if (astronaut) astronaut.classList.add('astronaut-running');
    countdown.textContent = steps[0];
    countdown.classList.add('pulsing');
    const stepTimer = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
            countdown.textContent = steps[stepIndex];
        } else {
            clearInterval(stepTimer);
            // Étape 2 : allumage moteurs
            countdown.textContent = t('Décollage !');
            rocketWrap.classList.remove('launch-shaking');
            igniteLaunchFlames(rocketWrap, scene);
            setTimeout(() => {
                // Étape 3 : décollage — la fusée s'envole (l'astronaute court déjà)
                countdown.classList.add('fading');
                rocketWrap.classList.add('lift-off');
                setTimeout(finish, 1900);
            }, 700);
        }
    }, stepMs);
}

// Flammes + fumée sous la fusée pendant le décollage
function igniteLaunchFlames(rocketWrap, sceneEl) {
    // Flammes dans le repere de la fusee : elles suivent le vol.
    // Positionnement calcule depuis ROCKET_PARTS (plus de valeurs CSS en
    // dur) : un jet sous chaque tuyere de booster + le jet central sous
    // les moteurs. Tolerie de proximite pour relier tuyere et jet.
    const flames = document.createElement('div');
    flames.className = 'launch-flames';
    rocketWrap.appendChild(flames);
    const nozzles = ROCKET_PARTS.filter(p => p.id === 'nozzles');
    const boosters = ROCKET_PARTS.filter(p => p.id.startsWith('boosters-'));
    const centerX = 50; // axe central de la fusee en %
    // Decalage du centre VISUEL des tuyeres dans chaque image de booster :
    // le contenu PNG n'est pas centre dans le canevas (boosters-left a du
    // remplissage transparent a droite, boosters-right a gauche).
    const BOOSTER_JET_OFFSET_PX = { 'boosters-left': -5, 'boosters-right': 4 };
    const jets = [];
    nozzles.forEach(n => jets.push({ cx: n.x, off: 0 }));
    boosters.forEach(b => jets.push({ cx: b.x, off: BOOSTER_JET_OFFSET_PX[b.id] || 0 }));
    if (jets.length === 0) {
        jets.push({ cx: centerX, off: 0 }, { cx: centerX, off: 0 }, { cx: centerX, off: 0 });
    }
    jets.forEach((j, i) => {
        const jet = document.createElement('div');
        jet.className = 'launch-flame-jet';
        jet.style.left = 'calc(' + j.cx + '% + ' + (j.off || 0) + 'px - 13px)'; // 13px = demi-largeur du jet
        jet.style.animationDelay = (i * 0.12) + 's';
        flames.appendChild(jet);
    });
    // Fumée au sol sur le pas de tir : elle ne décolle pas.
    // Ajoutée dans le monde scene-world pour suivre la meme echelle que la fusée.
    const world = document.getElementById('scene-world');
    if (world) {
        const smoke = document.createElement('div');
        smoke.className = 'launch-smoke';
        world.appendChild(smoke);
    }
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
    // Vrai bonus total de production, identique a la ligne "Multiplicateur de production" des statistiques.
    multiplierElement.textContent = 'x' + getTotalProductionMultiplier().toFixed(2);
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
// ANIMATION DE VOYAGE (apres decollage, avant la carte de l'espace)
// Plein ecran, verticale, pensee mobile : la fusee monte de la Terre
// (bas de l'ecran) vers la Lune (haut). Le compteur de km defile de 0
// jusqu'a la distance reellement atteinte par le lancer.
// ============================================
const TRAVEL_ANIM_LEG_MS = 5000;    // duree par troncon (Terre -> Lune = 1 troncon)
let travelAnimFrame = 0;
let travelStarsData = [];

// ============================================
// MOTEUR DE PROJECTION PERSPECTIVE (voyage spatial pseudo-3D)
// Axe de voyage : vertical, la fusee vise le HAUT de l'ecran. La
// profondeur z croit vers le haut. La camera (chase cam) est legerement
// AU-DESSUS et DERRIERE la fusee : la fusee est rendue au tiers inferieur,
// les astres proches apparaissent bas et gros, les astres lointains
// remontent vers l'horizon en rapetissant (parallaxe reelle).
// Unite de profondeur : 1 = distance camera->fusee (REL_ROCKET).
// ============================================

// Construit la fusee COMPLETE dans le holder, a l'echelle cible.
function buildTravelRocketInto(holder, targetH) {
    // Fusee du voyage : image dediee (Fusee-travel.png, 768x1376),
    // verticale et droite. Largeur deduite du ratio de l'image.
    const ROCKET_TRAVEL_IMG = 'images/rocket/Fusee-travel.png';
    const ROCKET_TRAVEL_RATIO = 768 / 1376;
    holder.innerHTML = '';
    const h = Math.max(1, targetH);
    const w = h * ROCKET_TRAVEL_RATIO;
    holder.style.width = w + 'px';
    holder.style.height = h + 'px';
    const img = document.createElement('img');
    img.src = ROCKET_TRAVEL_IMG;
    img.alt = '';
    img.style.position = 'absolute';
    img.style.inset = '0';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    holder.appendChild(img);
    // Flammes des TROIS moteurs : structure dediee proportionnelle a la
    // fusee. Positions mesurees sur Fusee-travel.png (tuyeres a 20.8%,
    // 50.3% et 79.8% de la largeur, sortie a ~86% de la hauteur). Chaque
    // jet = lueur externe + flamme principale (coeur blanc-jaune, colonne
    // orange) + base bleue + pointe fumeuse, animees independamment.
    const JETS = [
        { left: 20.8, scale: 0.9 },   // booster gauche
        { left: 50.3, scale: 1.0 },   // moteur central
        { left: 79.8, scale: 0.9 }    // booster droit
    ];
    const flames = document.createElement('div');
    flames.className = 'travel-flames';
    JETS.forEach((j, idx) => {
        const jet = document.createElement('div');
        jet.className = 'travel-jet';
        jet.style.left = j.left + '%';
        jet.style.setProperty('--jet-scale', String(j.scale));
        jet.style.setProperty('--jet-delay', (idx * 0.06) + 's');
        const glow = document.createElement('div');
        glow.className = 'travel-flame-glow';
        const core = document.createElement('div');
        core.className = 'travel-flame-core';
        const blue = document.createElement('div');
        blue.className = 'travel-flame-blue';
        const tip = document.createElement('div');
        tip.className = 'travel-flame-tip';
        core.appendChild(blue);
        core.appendChild(tip);
        jet.appendChild(glow);
        jet.appendChild(core);
        flames.appendChild(jet);
    });
    holder.appendChild(flames);
}

// Projection d'un astre (decalage lateral lat, profondeur z) sur
// l'ecran pour une camera a la profondeur cameraZ. Tous les astres
// restent proches de l'axe central (composition mobile).
function travelProject(lat, z, cameraZ, W, horizonY, pitchK, baseSize) {
    const rel = z - cameraZ;                 // profondeur relative
    if (rel <= 0.08) return { visible: false };
    const inv = 1 / rel;                     // 1 = profondeur de la fusee
    return {
        x: W / 2 + lat * 0.5 * W * inv,      // parallaxe laterale
        y: horizonY + pitchK * inv,          // proche = bas, loin = horizon
        size: baseSize * inv,                 // echelle perspective
        inv: inv,
        visible: true
    };
}

function playTravelAnimation(distance, onDone) {
    const overlay = document.getElementById('travel-overlay');
    if (!overlay || typeof distance !== 'number' || isNaN(distance)) {
        if (onDone) onDone();
        return;
    }
    travelSoundStart();
    cancelAnimationFrame(travelAnimFrame);
    const deepEl = document.getElementById('travel-deep');
    const rocketEl = document.getElementById('travel-rocket');
    const distanceEl = document.getElementById('travel-distance-value');
    const skipBtn = document.getElementById('travel-skip');
    const safeDistance = Math.max(0, distance);

    const H = window.innerHeight || 800;
    const W = window.innerWidth || 400;

    // --- Chase cam legerement au-dessus et derriere la fusee ---
    // La fusee est le point focal : fixe au tiers inferieur, inclinee
    // dans son axe de voyage (nez vers la destination), avec un leger
    // abaissement d'arriere (vue surelevee, pas un sprite 2D plat).
    const rocketX = W * 0.5;
    // Cam plus HAUTE au-dessus de l'axe : la fusee est rendue plus bas,
    // l'horizon descend, la pente fusee->horizon s'accentue (vue plongeante
    // plus marquee sur la ligne de planetes).
    const rocketY = H * 0.70;
    const horizonY = H * 0.20;
    // pitchK : ecart vertical fusee->horizon pour un astre a la profondeur
    // de la fusee (rel=1) -> l'astre affleure la fusee.
    const pitchK = (rocketY - horizonY);
    // Facteur global d'echelle des planetes : -20% (vue un peu plus
    // reculee, comme si la camera etait plus loin de l'axe).
    const PLANET_SCALE = 0.8;
    // Adaptation mobile : sur un ecran portrait, W est petit et H grand --
    // baser la taille des planetes sur la seule largeur les rend minuscules.
    // On ancre l'echelle sur une diagonale normalisee : equivalente a W sur
    // un ecran large (desktop), proche de 73% de la hauteur en 9:16.
    const isPortrait = H > W * 1.15;
    const sizeRef = isPortrait ? Math.min(W * 1.95, H * 0.92) : W;
    const baseSize = sizeRef * 0.52 * PLANET_SCALE;
    // Fusee VERTICALE et DROITE (image dediee, aucune inclinaison).

    if (rocketEl) buildTravelRocketInto(rocketEl, H * 0.24);

    // --- Itineraire : planetes de PLANETS jusqu'a la destination atteinte
    // (structure du jeu inchangee : Terre -> Lune -> Mars -> ...).
    const reached = PLANETS.filter(p => safeDistance >= p.distanceRequired);
    const target = reached[reached.length - 1] || PLANETS[0];
    const itinerary = PLANETS.slice(0, PLANETS.indexOf(target) + 1);
    // Etapes espacees : 5 unites de profondeur par planete -> la
    // destination demarre tres loin (point minuscule a l'horizon), les
    // intermediaires demandent un vrai trajet. zMax = profondeur de la cible.
    const DEPTH_STEP = 5;
    // Fenetre de visibilite : au plus deux planetes devant la camera
    // (la suivante en micro-point a l'horizon), rien au-dela.
    const TRAVEL_LOOKAHEAD = 2 * DEPTH_STEP + 1.15;
    const zMax = (itinerary.length - 1) * DEPTH_STEP;

    // Trajet de la camera : demarre PRES de la Terre (gros bout de
    // planet en bas d'ecran, comme juste apres le decollage), accelere
    // puis maintient sa vitesse de croisiere jusqu'a la cible (aucune
    // deceleration, meme a l'arrivee).
    const CAM_START = -0.85;                 // Terre a rel ~0.85 au depart
    const CAM_END = zMax - 1.15;             // cible a rel ~1.15 a l'arrivee
    // Temps EQUIVALENT par troncon : Terre -> Lune garde sa duree, chaque
    // planete supplementaire ajoute un troncon de meme duree (Mars = deux
    // fois Terre -> Lune).
    const legs = itinerary.length - 1;
    const animMs = Math.max(1, legs) * TRAVEL_ANIM_LEG_MS;

    // Corps celestes generes dynamiquement (calque de profondeur)
    // Le Nuage d'Oort n'a PAS de sprite : il est remplace par le champ
    // volumetrique procedural (oortField) -- troncon, timing et km
    // inchanges, uniquement la representation visuelle.
    deepEl.innerHTML = '';
    // Index du Nuage d'Oort dans l'itineraire (calcule AVANT bodies :
    // sert a rendre la planete suivante plus discrete en sortie de nuage).
    const oortIdx = itinerary.findIndex(p => p.id === 'oort-cloud');
    const bodies = itinerary.map((p, i) => {
        if (p.id === 'oort-cloud') {
            return { el: null, z: i * DEPTH_STEP, lat: 0, scale: 1, hidden: true };
        }
        const el = document.createElement('div');
        el.className = 'travel-body';
        const img = document.createElement('img');
        img.src = p.imgPath;
        img.alt = '';
        el.appendChild(img);
        deepEl.appendChild(el);
        // Composition : toutes les planetes sur l'axe central, sans
        // decalage laterale (meme la Terre).
        const lat = 0;
        // La Terre un peu plus petite que l'echelle globale des planetes.
        const scale = (i === 0) ? 0.75 : 1;
        // La planete qui suit le Nuage d'Oort est plus discrete : elle
        // se reveille en tout petit seulement apres la traversee, pour
        // ne pas gacher l'immersion dans le nuage.
        const afterOort = i === oortIdx + 1;
        return { el, z: i * DEPTH_STEP, lat, scale, distant: afterOort };
    });

    // --- Nuage d'Oort : champ volumetrique de debris glaces ---
    // La camera traverse un VOLUME 3D d'objets : les 5 images dediees
    // de l'utilisateur (images/effects/) remplacee les modeles proceduraux.
    // Trois couches de profondeur, densite progressive (aucune apparition
    // brutale), projection et z-index identiques aux planetes. Aucune
    // logique de voyage modifiee -- uniquement la representation visuelle.
    let oortDensity = () => 0;
    const oortField = [];
    const smooth01 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
    if (oortIdx >= 0) {
        const oortZ = oortIdx * DEPTH_STEP;
        // Champ elargi et montee plus douce : les premiers cailloux
        // apparaissent PLUS TOT (des le passage de Pluton), la densite
        // monte progressivement vers le plein regime au milieu du
        // nuage, puis redescent doucement -- jamais de mur de rochers.
        // Champ confine a la region du nuage : la traversee commence
        // avant la position Oort (premiers cailloux anticipes) mais
        // s'ARRETE pile a la position du nuage -- au-dela on en ressort
        // et l'espace redevient vide.
        const FIELD_Z0 = oortZ - 7.5;
        const FIELD_Z1 = oortZ + 0.5;
        oortDensity = (cam) => {
            if (cam <= FIELD_Z0 || cam >= FIELD_Z1) return 0;
            return Math.min(smooth01((cam - FIELD_Z0) / 5.5), smooth01((FIELD_Z1 - cam) / 1.6));
        };
        const rand = (a, b) => a + Math.random() * (b - a);
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        // Les 5 modeles d'objets du nuage (images dediees, tailles
        // natives heterogenes -- les tailles ecran sont fixees par couche).
        const OORT_MODELS = [
            { cls: 'oort-ice', img: 'images/effects/Small irregular icy nucleus.png', ar: 197 / 184 },
            { cls: 'oort-comet', img: 'images/effects/Small comet nucleus.png', ar: 182 / 165 },
            { cls: 'oort-fragment', img: 'images/effects/Ice-rock fragment.png', ar: 218 / 244 },
            { cls: 'oort-asteroid', img: 'images/effects/Dark rocky asteroid.png', ar: 159 / 156 },
            { cls: 'oort-large', img: 'images/effects/Large rare Oort Cloud body.png', ar: 289 / 281 }
        ];
        const addObj = (layer, model, size, op, ox, oy, z) => {
            const el = document.createElement('div');
            el.className = 'travel-oort ' + model.cls;
            const img = document.createElement('img');
            img.src = model.img;
            img.alt = '';
            img.draggable = false;
            el.appendChild(img);
            el.style.display = 'none';
            deepEl.appendChild(el);
            oortField.push({
                el, layer, z, ox, oy, size, op, on: false, ar: model.ar,
                gate: layer === 0 ? 0.02 : (layer === 1 ? 0.14 : 0.30),
                stag: Math.random(),
                rot: rand(0, 360),
                spin: rand(-40, 40)
            });
        };
        // Petits modeles (4) pour les couches lointaine et moyenne.
        const SMALLS = OORT_MODELS.slice(0, 4);
        // Couche 1 -- tres loin : minuscules points glaces (immensite,
        // quasi immobiles, ils habillent la profondeur).
        for (let i = 0; i < 140; i++) {
            addObj(0, pick(SMALLS),
                rand(5, 11), rand(0.25, 0.55),
                rand(-1.15, 1.15) * W, rand(-0.85, 0.85) * H,
                rand(FIELD_Z0, FIELD_Z1));
        }
        // Couche 2 -- distance moyenne : fragments et asteroides
        // visibles, tailles variees, parallaxe marquee -- repartis sur
        // TOUT l'ecran, pas seulement l'axe central.
        for (let i = 0; i < 110; i++) {
            addObj(1, pick(SMALLS),
                rand(16, 44), rand(0.5, 0.85),
                rand(-1.05, 1.05) * W, rand(-0.75, 0.75) * H,
                rand(FIELD_Z0 + 0.5, FIELD_Z1 - 0.5));
        }
        // Couche 3 -- fly-by proches : gros blocs rares qui traversent
        // vite le champ de vision, avec streak radial (motion blur).
        for (let i = 0; i < 36; i++) {
            addObj(2, pick(OORT_MODELS),
                rand(45, 110), rand(0.75, 0.95),
                (Math.random() < 0.5 ? -1 : 1) * rand(0.16, 0.46) * W,
                rand(-0.26, 0.26) * H,
                rand(FIELD_Z0 + 1.5, FIELD_Z1 - 1.5));
        }
        // Couche 4 -- AUTOUR DE LA CAMERA : gros blocs derives sur les
        // bords de l'ecran, au niveau de la camera elle-meme (rel tres
        // faible). La camera est DANS le nuage : des cailloux l'entourent,
        // passent devant la fusee et derriere elle.
        for (let i = 0; i < 24; i++) {
            addObj(2, pick(OORT_MODELS),
                rand(50, 130), rand(0.6, 0.9),
                (Math.random() < 0.5 ? -1 : 1) * rand(0.55, 1.15) * W,
                rand(-0.7, 0.7) * H,
                rand(FIELD_Z0 + 0.3, FIELD_Z1 - 0.3));
        }
    }

    // --- Couche vitesse : trainees de vitesse radiales 3D ---
    // Chaque trainee vit dans le volume devant la camera (comme les
    // etoiles et le nuage d'Oort) : elle coule depuis le point de fuite
    // vers les bords de l'ecran, alignee sur l'axe camera -> trainee,
    // et s'allonge avec la vitesse et la proximite.
    const streaksEl = document.createElement('div');
    streaksEl.className = 'travel-streaks';
    const oldStreaks = overlay.querySelectorAll('.travel-streaks');
    for (let i = 0; i < oldStreaks.length; i++) oldStreaks[i].remove();
    overlay.appendChild(streaksEl);
    const streaks = [];
    const streakCount = 120;
    for (let i = 0; i < streakCount; i++) {
        const s = document.createElement('div');
        s.className = 'travel-streak';
        s.style.opacity = '0';
        streaksEl.appendChild(s);
        streaks.push({
            el: s,
            ox: (Math.random() * 2 - 1) * 1.6,
            oy: (Math.random() * 2 - 1) * 1.25,
            rel: 0.3 + Math.random() * 3.2,
            depth: 0.35 + Math.random() * 0.75
        });
    }

    const startTime = performance.now();
    let lastNow = startTime;
    let finished = false;

    const cleanup = () => {
        cancelAnimationFrame(travelAnimFrame);
        overlay.classList.remove('active');
        if (skipBtn) skipBtn.removeEventListener('click', skipHandler);
        if (finished) {
            if (onDone) onDone();
        }
    };
    const skipHandler = () => finish();

    function finish() {
        if (finished) return;
        finished = true;
        travelSoundStop();
        if (distanceEl) rollCounterText(distanceEl, formatNumber(safeDistance));
        setTimeout(cleanup, 240);
    }

    const lerp = (a, b, t) => a + (b - a) * t;
    const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    // Profil de vitesse : ACCELERATION CONSTANTE du depart a la cible.
    // Vitesse calibree sur la route GLOBALE Terre -> Virgo : la vitesse
    // finale d'un voyage depend de sa position sur la route complete
    // (Lune = lente, Virgo = vitesse MAX). Chaque nouveau record va donc
    // plus vite que le precedent -- la vitesse max n'est atteinte QUE
    // lors de l'arrivee a Virgo.
    const totalLegs = PLANETS.length - 1; // Terre -> Virgo (route complete)
    // Multiplicateur de vitesse du fond : LINEAIRE sur la position absolue
    // de la fusee sur la route Terre -> Virgo (pas sur le voyage en cours).
    // Passer Mars dans un voyage long montre exactement les memes effets
    // que l'arrivee a Mars d'un voyage court : coherent partout.
    // Plafond volontairement INSENSE : la vitesse finale (Virgo) est
    // abstraitement enorme -- le fond doit donner l'impression d'un
    // trou de ver, quitte a defier la realite. Reste lineaire et ancre
    // a la position absolue : Terre = 1, Virgo = 8.
    const VIRGO_SPEED_MAX = 8;
    // Vitesse camera CONSTANTE PAR TRONCON : chaque troncon dure
    // exactement TRAVEL_ANIM_LEG_MS (5s), de l'echapement de la planete
    // au passage de la suivante. La fusee croise chaque planete pile a
    // la frontiere 5s/5s -- la sensation d'acceleration vient du fond,
    // du compteur km (distances reelles croissantes) et des trainees.
    const camAt = (t) => {
        if (legs <= 0) return CAM_START;
        const scaled = Math.min(t, 1) * legs;
        const k = Math.min(legs - 1, Math.floor(scaled));
        // Le premier troncon part de CAM_START (derriere la Terre, bien
        // visible au depart) ; les suivants de la planete k a la k+1.
        const from = (k === 0) ? CAM_START : k * DEPTH_STEP;
        const to = (k === legs - 1) ? CAM_END : (k + 1) * DEPTH_STEP;
        return lerp(from, to, scaled - k);
    };
    // Position absolue normalisee sur la route COMPLETE (0 Terre, 1 Virgo) :
    // troncons deja franchis + avancement dans le troncon courant.
    const posAt = (t) => {
        if (legs <= 0) return 0;
        const scaled = Math.min(t, 1) * legs;
        const k = Math.min(legs - 1, Math.floor(scaled));
        return Math.min(1, (k + (scaled - k)) / totalLegs);
    };
    // Compteur km : interpolation REELLE entre planetes. Quand la camera
    // croise la Lune, le compteur lit exactement 384 400 km, quel que soit
    // le voyage ; la vitesse en km/s s'adapte donc a chaque troncon. Le
    // troncon final se termine sur la distance reellement atteinte.
    const kmAt = (cam) => {
        if (cam <= CAM_START) return 0;
        const last = itinerary.length - 1;
        const bounds = [];
        for (let i = 1; i <= last - 1; i++) bounds.push(i * DEPTH_STEP);
        bounds.push(CAM_END);
        for (let i = 0; i < bounds.length; i++) {
            // Le premier troncon part de CAM_START : le compteur monte
            // des la premiere image, fini le 0 km fige alors qu'on avance.
            const z0 = (i === 0) ? CAM_START : bounds[i - 1];
            const z1 = bounds[i];
            if (cam < z1 || i === bounds.length - 1) {
                const d0 = itinerary[i].distanceRequired;
                const d1 = (i === last - 1) ? safeDistance : itinerary[i + 1].distanceRequired;
                const f = Math.max(0, Math.min(1, (cam - z0) / (z1 - z0)));
                return d0 + (d1 - d0) * f;
            }
        }
        return itinerary[last].distanceRequired;
    };

    const tick = (now) => {
        if (finished) return;
        const linear = Math.min(1, (now - startTime) / animMs);
        const cameraZ = camAt(linear);
        // Vitesse visuelle du fond : LINEAIRE, ancree a la position absolue
        // sur la route (troncon courant + avancement dedans). Quasi
        // immobile pres de la Terre, plein regime uniquement a Virgo --
        // et identique a toute passe precedente, quel que soit le voyage.
        const dt = Math.min(0.05, (now - lastNow) / 1000);
        lastNow = now;
        const posNow = Math.min(1, posAt(linear));
        const speedNorm = posNow;                      // 0 Terre -> 1 Virgo
        const speed = 1 + speedNorm * (VIRGO_SPEED_MAX - 1);

        // ---- Fusee : point focal ----
        // Leger balancement organique : derive latérale douce + avance/
        // recul dans l'axe de voyage (fleche verticale + tres legere
        // variation d'echelle pour la profondeur). Fusée toujours
        // verticale et droite, aucun tangage -- juste assez de vie pour
        // que la scene ne soit pas statique.
        if (rocketEl) {
            const ph = (now - startTime) / 1000;
            const swayX = Math.sin(ph * 0.9 + 0.4) * 28 + Math.sin(ph * 1.7) * 12;
            const swayY = Math.sin(ph * 0.6) * 20;
            const breathe = 1 + Math.sin(ph * 0.6 + 1.2) * 0.024;
            rocketEl.style.left = (rocketX + swayX) + 'px';
            rocketEl.style.top = (rocketY + swayY) + 'px';
            rocketEl.style.transform = 'translate(-50%, -50%) scale(' + breathe.toFixed(4) + ')';
        }

        // ---- Compteur de km : distances reelles, synchronisees au
        // passage effectif de chaque planete ----
        if (distanceEl) rollCounterText(distanceEl, formatNumber(Math.floor(legs > 0 ? kmAt(cameraZ) : safeDistance * easeInOut(linear))));

        // ---- Fond en parallaxe RADIALE 3D : chaque etoile vit dans le
        // volume devant la camera. Elle s'approche a une vitesse
        // proportionnelle a la vitesse reelle (les proches filent plus
        // vite que les lointaines) et coule depuis le point de fuite
        // (horizon) vers les bords -- coherent avec la vue chase-cam
        // et la projection des planetes / du nuage d'Oort.
        travelStarsData.forEach(st => {
            st.rel -= speed * st.depth * 0.7 * dt;
            if (st.rel < 0.12) {
                // Recyclage : l'etoile a depasse la camera, on la renvoie
                // au fond du volume avec un nouvel angle.
                st.rel = 2.6 + Math.random() * 0.9;
                st.ox = (Math.random() * 2 - 1) * 1.6;
                st.oy = (Math.random() * 2 - 1) * 1.25;
            }
            const inv = 1 / st.rel;
            const x = W / 2 + st.ox * 0.5 * W * inv;
            const y = horizonY + pitchK * inv + st.oy * H * 0.85 * inv;
            st.el.style.left = x.toFixed(1) + 'px';
            st.el.style.top = y.toFixed(1) + 'px';
            // Grossit en s'approchant, scintillement conserve.
            const sz = Math.min(5, st.size * (0.6 + inv * 0.55));
            st.el.style.width = sz.toFixed(1) + 'px';
            st.el.style.height = sz.toFixed(1) + 'px';
            // Sorties d'ecran masquees (l'etoile reapparaitra au recyclage).
            if (x < -6 || x > W + 6 || y < -6 || y > H + 6) {
                st.el.style.opacity = '0';
            } else {
                st.el.style.opacity = '';
            }
        });
        // ---- Trainees de vitesse RADIALES : chaque trainee vit dans le
        // volume devant la camera. Elle coule depuis le point de fuite,
        // alignee sur son propre axe camera -> trainee, et s'allonge
        // avec la vitesse et la proximite -- meme physique que les
        // etoiles et le nuage d'Oort.
        streaks.forEach(s => {
            s.rel -= speed * s.depth * 0.8 * dt;
            if (s.rel < 0.15) {
                s.rel = 2.6 + Math.random() * 0.9;
                s.ox = (Math.random() * 2 - 1) * 1.6;
                s.oy = (Math.random() * 2 - 1) * 1.25;
            }
            const inv = 1 / s.rel;
            const x = W / 2 + s.ox * 0.5 * W * inv;
            const y = horizonY + pitchK * inv + s.oy * H * 0.85 * inv;
            // Direction du flot au point projete : vecteur point de
            // fuite -> trainee, normalise.
            const dx = x - W / 2;
            const dy = y - horizonY;
            const len = Math.max(1, Math.hypot(dx, dy));
            const ang = Math.atan2(dy, dx) * 180 / Math.PI + 90;
            // Longueur : croit avec la vitesse et la proximite.
            const streakLen = (16 + speedNorm * 150) * (0.35 + inv * 0.5);
            s.el.style.left = x.toFixed(1) + 'px';
            s.el.style.top = y.toFixed(1) + 'px';
            s.el.style.height = streakLen.toFixed(1) + 'px';
            s.el.style.transform = 'translate(-50%, -50%) rotate(' + ang.toFixed(1) + 'deg)';
            // Opacite : visible des les premieres planetes, LINEAIRE
            // sur la position absolue, pleine a haute vitesse.
            const op = Math.min(1, 0.32 + 0.68 * speedNorm) * (0.3 + s.depth * 0.7) * Math.min(1, inv * 0.9);
            if (x < -20 || x > W + 20 || y < -20 || y > H + 20) {
                s.el.style.opacity = '0';
            } else {
                s.el.style.opacity = op.toFixed(2);
            }
        });

        // ---- Astres : projection perspective + fondu de depassement ----
        bodies.forEach(b => {
            if (b.hidden) return;
            // Fenetre de visibilite : on ne montre pas toute la ligne de
            // planetes, seulement les deux prochaines (la 2e en micro-point).
            // La planete qui suit le Nuage d'Oort apparait PLUS TARD et
            // PLUS PETITE (fenetre resserree).
            // TOUTES les planetes apparaissent en DOUCEUR : meme fondu
            // d'entree que Proxima (smoothstep sur l'opacite des
            // premieres unites de profondeur apres l'entree en fenetre),
            // puis croissance perspective purement monotone.
            const lookahead = b.distant ? 9 : TRAVEL_LOOKAHEAD;
            if (b.z - cameraZ > lookahead) {
                b.el.style.display = 'none';
                return;
            }
            b.el.style.display = '';
            const pr = travelProject(b.lat, b.z, cameraZ, W, horizonY, pitchK, baseSize);
            if (!pr.visible) {
                b.el.style.opacity = '0';
                return;
            }
            b.el.style.left = pr.x.toFixed(1) + 'px';
            b.el.style.top = pr.y.toFixed(1) + 'px';
            // Entree en douceur generalisee : fondu d'opacite au moment
            // ou la planete entre dans sa fenetre de visibilite, taille
            // de depart reduite pour la planete post-Oort.
            const rel = b.z - cameraZ;
            const fadeIn = Math.max(0, Math.min(1, (lookahead - rel) / 2.5));
            b.el.style.opacity = (fadeIn * fadeIn * (3 - 2 * fadeIn)).toFixed(2);
            b.el.style.width = Math.max(6, pr.size * (b.scale || 1) * (b.distant ? 0.85 : 1)).toFixed(1) + 'px';
            b.el.style.transform = 'translate(-50%, -50%)';
            // Ordre de peinture par profondeur : plus un astre est proche,
            // plus il est peint au-dessus (z eleve). Les astres passes
            // derriere la camera gardent leur ordre naturel.
            b.el.style.zIndex = String(Math.max(1, Math.round(pr.inv * 10) + 1));
            // A la sortie : l'astre depasse la camera en grossissant et
            // sort naturellement de l'ecran par le bas, plein echelle.
        });

        // ---- Nuage d'Oort : traverssee volumetrique ----
        // Densite progressive : vide -> premiers objets -> immersion.
        // Chaque objet n'apparait que si la densite locale depasse son
        // seuil (reparti par couche + alea de staging) -> montee douce,
        // jamais un mur de rochers d'un coup.
        if (oortField.length > 0) {
            const density = oortDensity(cameraZ);
            oortField.forEach(o => {
                const rel = o.z - cameraZ;
                // Un objet depasse par la camera (rel <= 0) n'est PLUS
                // rendu : le rendu miroir le faisait retr ecir apres le
                // passage, comme s'il filait dans le meme sens que la
                // fusee. Il grossit, croise la camera, disparait --
                // exactement comme les planetes.
                if (density <= 0 || rel <= 0.05 || rel > TRAVEL_LOOKAHEAD * 1.6) {
                    if (o.on) { o.el.style.display = 'none'; o.on = false; }
                    return;
                }
                const local = Math.max(0, Math.min(1, (density - o.gate * 0.55) / (1 - o.gate * 0.55)));
                const appear = smooth01(local - o.stag * 0.85);
                if (appear <= 0.01) {
                    if (o.on) { o.el.style.display = 'none'; o.on = false; }
                    return;
                }
                const inv = 1 / Math.max(0.12, rel);
                const sx = W / 2 + o.ox * inv;
                const sy = horizonY + pitchK * inv + o.oy * inv;
                const size = Math.max(1.5, o.size * inv);
                const op = o.op * appear * Math.min(1, rel * 2.2);
                if (!o.on) { o.el.style.display = ''; o.on = true; }
                o.el.style.left = sx.toFixed(1) + 'px';
                o.el.style.top = sy.toFixed(1) + 'px';
                o.el.style.width = size.toFixed(1) + 'px';
                o.el.style.height = (size / o.ar).toFixed(1) + 'px';
                o.el.style.opacity = op.toFixed(2);
                o.el.style.transform = 'translate(-50%, -50%) rotate(' + (o.rot + o.spin * (o.layer === 2 ? 2.2 : 0.5)) + 'deg)';
                // Ordre de peinture identique aux planetes : plus c'est
                // proche, plus c'est peint au-dessus. Les fly-by proches
                // passent devant la fusee (z-index 12+).
                // Ordre de peinture identique aux planetes : plus c'est
                // proche, plus c'est peint au-dessus.
                o.el.style.zIndex = String(Math.min(30, Math.round(inv * 10) + 1));
                // Streak de motion blur sur les objets proches : le halo
                // s'allonge avec la proximite (sensation de vitesse).
                if (o.layer === 2) {
                    o.el.style.setProperty('--streak', Math.min(1, (inv - 1) / 1.6).toFixed(2));
                }
            });
        }

        if (linear >= 1) {
            finish();
            return;
        }
        travelAnimFrame = requestAnimationFrame(tick);
    };

    // Initialisation
    if (rocketEl) {
        rocketEl.style.left = rocketX + 'px';
        rocketEl.style.top = rocketY + 'px';
        rocketEl.style.transform = 'translate(-50%, -50%)';
    }
    if (distanceEl) rollCounterText(distanceEl, '0');
    fillTravelStars(overlay);
    overlay.classList.add('active');
    if (skipBtn) skipBtn.addEventListener('click', skipHandler);
    travelAnimFrame = requestAnimationFrame(tick);
}

function fillTravelStars(overlay) {
    // Etoiles reconstruites a chaque voyage : positions pilotees en JS
    // (parallaxe selon la profondeur propre a chaque etoile).
    const deepFieldEl = overlay.querySelector('.travel-deepfield');
    if (deepFieldEl) {
        // Fond lointain riche : 2 halos de nebuleuse + poussiere d'etoiles
        // statique + micro-etoiles scintillantes, toutes en CSS pur (aucune
        // image chargee) -- la profondeur lointaine que le voyage manquait.
        deepFieldEl.innerHTML = '';
        const nebA = document.createElement('div');
        nebA.className = 'travel-nebula';
        nebA.style.left = (Math.random() * 50 + 8) + '%';
        nebA.style.top = (Math.random() * 35 + 5) + '%';
        deepFieldEl.appendChild(nebA);
        const nebB = document.createElement('div');
        nebB.className = 'travel-nebula nebula-b';
        nebB.style.left = (Math.random() * 40 + 45) + '%';
        nebB.style.top = (Math.random() * 40 + 40) + '%';
        deepFieldEl.appendChild(nebB);
        const dustCount = 90;
        for (let i = 0; i < dustCount; i++) {
            const d = document.createElement('div');
            d.className = 'travel-dust';
            d.style.left = (Math.random() * 100) + '%';
            d.style.top = (Math.random() * 100) + '%';
            d.style.width = (Math.random() * 1.6 + 0.6) + 'px';
            d.style.height = d.style.width;
            d.style.animationDelay = (Math.random() * 2.4) + 's';
            deepFieldEl.appendChild(d);
        }
    }
    const starsEl = overlay.querySelector('.travel-stars');
    if (!starsEl) return;
    starsEl.innerHTML = '';
    travelStarsData = [];
    const count = 320;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'travel-star';
        if (Math.random() < 0.5) star.classList.add('twinkle');
        const size = Math.random() * 2.2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.animationDelay = (Math.random() * 1.6) + 's';
        starsEl.appendChild(star);
        // Champ 3D radial : chaque etoile vit dans le volume devant la
        // camera (decalage ox/oy + profondeur rel). Projettee depuis le
        // point de fuite (horizon) comme les planetes et le nuage d'Oort,
        // elle coule vers la camera -- coherent avec la chase-cam.
        travelStarsData.push({
            el: star,
            ox: (Math.random() * 2 - 1) * 1.6,
            oy: (Math.random() * 2 - 1) * 1.25,
            rel: 0.25 + Math.random() * 3.25,
            depth: 0.35 + Math.random() * 0.75,
            size: size
        });
    }
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
        invalidateBuildingGainsCache();
    });
}

function getTotalPlanetBonus() {
    let total = 0;
    Object.values(planetBonuses).forEach(bonus => {
        total += bonus;
    });
    return total;
}

// Fin de voyage : ouvre l'atelier galactique en PLEIN ECRAN, non fermable.
// Le joueur y depense sa Poussiere d'Etoiles, puis clique sur Continuer
// pour appliquer le reset et reprendre la partie. Le bouton de la sidebar
// ouvre la meme modal en consultation (fermable librement).
let postTravelLock = false;

function showPostTravelShop(distance) {
    const modal = document.getElementById('galactic-shop-modal');
    if (!modal) return;
    postTravelLock = true;
    modal.classList.add('post-travel');
    // Recompenses creditees DES L'OUVERTURE de l'atelier (pas au reset) :
    // le joueur voit deja sa Poussiere d'Etoiles et peut la depenser avant
    // de cliquer sur Continuer. Sauvegarde immediate : un rafraichissement
    // pendant l'atelier ne fait pas perdre le gain du vol.
    if (lastLaunchDistance > maxDistance) {
        maxDistance = lastLaunchDistance;
    }
    rocketsLaunched++;
    lastLaunchAt = Date.now();
    prestigeMultiplier = 1 + Math.log(1 + (isNaN(maxDistance) ? 0 : maxDistance) / MOON_DISTANCE) / 2;
    const dustGained = calculateStardustGain(isNaN(lastLaunchDistance) ? 0 : lastLaunchDistance);
    if (dustGained > 0) {
        starDust += dustGained;
        totalStardustEarned += dustGained;
    }
    saveGame();
    const summaryEl = document.getElementById('post-travel-summary');
    if (summaryEl) {
        const newlyUnlocked = checkNewPlanetsUnlocked(distance);
        let unlocksHtml = '';
        if (newlyUnlocked.length > 0) {
            unlocksHtml = '<div class="pts-unlocks">' + newlyUnlocked.map(planet =>
                '<span class="pts-planet" style="border-color:' + planet.color + ';color:' + planet.color + ';">' +
                t(planet.name) + ' +' + planet.bonusPercent + '%</span>').join('') + '</div>';
        }
        summaryEl.innerHTML =
            '<div class="pts-line">' + t('Distance parcourue') + ' <strong>' + formatNumber(isNaN(distance) ? 0 : distance) + ' km</strong></div>' +
            '<div class="pts-line">' + t('Poussière d\'Étoiles gagnée') + ' <strong>+' + formatNumber(dustGained) + ' \u2728</strong></div>' +
            unlocksHtml;
        summaryEl.style.display = '';
    }
    const actionsEl = document.getElementById('post-travel-actions');
    if (actionsEl) actionsEl.style.display = '';
    renderGalacticShop();
    updateStardustDisplay();
    modal.classList.add('active');
}

// Consultation libre depuis la sidebar : pas de blocage, pas de resume.
function openGalacticShopBrowse() {
    const modal = document.getElementById('galactic-shop-modal');
    if (!modal) return;
    postTravelLock = false;
    modal.classList.remove('post-travel');
    const summaryEl = document.getElementById('post-travel-summary');
    if (summaryEl) summaryEl.style.display = 'none';
    const actionsEl = document.getElementById('post-travel-actions');
    if (actionsEl) actionsEl.style.display = 'none';
    renderGalacticShop();
    updateStardustDisplay();
    modal.classList.add('active');
}

// Sortie de la modal atelier : bloquee si on vient de finir un voyage
// (seul le bouton Continuer -> confirmPostTravelReset peut la fermer).
function tryCloseGalacticShop() {
    if (postTravelLock) return;
    document.getElementById('galactic-shop-modal').classList.remove('active');
}

// Bouton Continuer : ferme la modal, applique le reset avec les bonus,
// puis affiche les resultats de la mission.
function confirmPostTravelReset() {
    document.getElementById('galactic-shop-modal').classList.remove('active');
    postTravelLock = false;
    const summaryEl = document.getElementById('post-travel-summary');
    if (summaryEl) summaryEl.style.display = 'none';
    const actionsEl = document.getElementById('post-travel-actions');
    if (actionsEl) actionsEl.style.display = 'none';
    // Les recompenses (record, prestige, Poussiere d'Etoiles) ont deja ete
    // creditees a l'ouverture de l'atelier : ici, seul le reset reste a faire.
    // Debloquer les planetes atteintes uniquement a la confirmation du reset
    applyNewPlanets(checkNewPlanetsUnlocked(lastLaunchDistance));
    // Reset du score, des batiments et des pieces de fusee (garde les bonus/prestige)
    score = 0;
    BUILDINGS.forEach(b => b.count = 0);
    ROCKET_PARTS.forEach(p => p.purchased = false);
    constructedParts = new Set();
    nextPlanetNotified = false;
    const scene = document.getElementById('rocket-parts-container');
    if (scene) scene.innerHTML = '';
    unlockedBuildings = new Set();
    startupBonusApplied = false;
    applyStartupBonus();
    totalPartsFromClicks = 0;
    activatedClickUpgrades = [];
    buildingUpgrades = {};
    buildingUpgradeCosts = {};
    totalGeneratedAtLaunchStart = calculateTotalGenerated();
    totalGeneratedByBuilding = {};
    partsSinceLaunch = 0;
    totalPartsEarnedThisLaunch = 0;
    naturalPartsThisLaunch = 0;
    activeRandomBonuses = [];
    rebuildAutoMultipliers();
    updateBonusTimer();
    resetContractState();
    updateDisplay();
    saveGame();
    checkBuildingUnlocks();
    renderBuildings();
    renderUpgrades();
    renderRocketPartsShop();
    showLaunchResults(lastLaunchDistance);
    isLaunching = false;
    updateSpaceProgress();
    updateConstructionScene();
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
                invalidateBuildingGainsCache();
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

// Plafond hors-ligne de base, gratuit des le debut du jeu (10 minutes).
// Les ameliorations galactiques de la branche hors-ligne augmentent ce plafond.
const BASE_OFFLINE_CAP_HOURS = 10 / 60;
function getOfflineCapHours() {
    let hours = BASE_OFFLINE_CAP_HOURS;
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
    trackPartsEarned(totalGain);
    const capped = cappedSec < elapsedSec;
    showWelcomeBackModal(totalGain, cappedSec, capped);
    updateDisplay();
}

// Pop-up de reconnexion : resume les Parts gagnees pendant l'absence.
// Reutilise le style de la modale Nouveau batiment.
function showWelcomeBackModal(gain, seconds, capped) {
    const modal = document.getElementById('welcome-back-modal');
    if (!modal) return;
    const img = document.getElementById('wb-image');
    if (img) {
        // relance l'animation de pop a chaque ouverture
        img.style.animation = 'none';
        void img.offsetWidth;
        img.style.animation = '';
    }
    document.getElementById('wb-gain').textContent = '+' + formatNumber(gain) + ' ' + t('Parts');
    document.getElementById('wb-duration').textContent = formatDurationHMS(seconds * 1000);
    const cappedEl = document.getElementById('wb-capped');
    if (cappedEl) {
        cappedEl.style.display = capped ? '' : 'none';
        if (capped) cappedEl.textContent = t("Plafonné aux capacités de production hors-ligne. Améliore-les dans l'atelier galactique !");
    }
    modal.classList.add('active');
}

function closeWelcomeBackModal() {
    const modal = document.getElementById('welcome-back-modal');
    if (modal) modal.classList.remove('active');
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
    invalidateBuildingGainsCache();
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
                reqHtml = '<span class="galactic-req">' + t('Prérequis:') + ' ' + reqNames.map(r => t(r)).join(', ') + '</span>';
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
    if (modal && modal.classList.contains('active') && !postTravelLock) {
        modal.classList.remove('active');
        return;
    }
    openGalacticShopBrowse();
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

    // Afficher la progression vers la PROCHAINE planète : en temps reel sur la
    // distance ACTUELLEMENT atteignable (elle croit a chaque Part gagnee),
    // pas sur la distance parcourue qui ne bouge qu'au lancement.
    const planetDisplay = document.getElementById('current-planet-display');
    if (planetDisplay) {
        if (progress.nextPlanet) {
            planetDisplay.innerHTML = `${t(progress.nextPlanet.name)}: ${Math.min(100, Math.max(0, progress.progressPercent))}%`;
        } else {
            planetDisplay.innerHTML = `${t(progress.currentPlanet.name)}: 100%`;
        }
    }
    // Mettre à jour la mini-carte : meme base temps reel que le pourcentage
    updateMiniSpaceMap(reachableDistance);

    // Mettre à jour les stats
    const sidebarDistance = document.getElementById('sidebar-distance');
    const sidebarDistanceMax = document.getElementById('sidebar-distance-max');
    const sidebarSpeed = document.getElementById('sidebar-speed');
    const sidebarBonus = document.getElementById('sidebar-bonus');

    if (sidebarDistance) {
        rollCounterText(sidebarDistance, formatNumber(reachableDistance) + ' ' + t('km'));
    }
    if (sidebarDistanceMax) {
        rollCounterText(sidebarDistanceMax, formatNumber(traveledDistance) + ' ' + t('km'));
    }
    if (sidebarSpeed) {
        rollCounterText(sidebarSpeed, formatTravelSpeed(calculateTravelSpeedKmS()));
    }
    if (sidebarBonus) {
        const totalBonus = 1 + getTotalPlanetBonus();
        sidebarBonus.textContent = 'x' + totalBonus.toFixed(2);
    }
    checkNextPlanetNotification();
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
            spaceship.innerHTML = '<img src="images/rocket/Fusée3.png" alt="Fusée" class="spaceship-img">';
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
    // Rafraichir l'etat actif/grise du bouton "Tout acheter" selon le score
    const btn = document.getElementById('buy-all-upgrades');
    if (btn) {
        const affordable = [score].length && (newClickUps + newBuildingUps) > 0;
        btn.disabled = !canBuyAllUpgrades() || !affordable || !isAnyUpgradeAffordable();
        btn.classList.toggle('affordable', !btn.disabled);
    }
}
function isAnyUpgradeAffordable() {
    const cheapest = getCheapestAvailableUpgradeCost();
    return cheapest !== null && cheapest <= score;
}
function getCheapestAvailableUpgradeCost() {
    let cheapest = null;
    CLICK_UPGRADES.forEach(upgrade => {
        if (totalPartsFromClicks >= upgrade.threshold && !activatedClickUpgrades.includes(upgrade.threshold)) {
            if (cheapest === null || upgrade.cost < cheapest) cheapest = upgrade.cost;
        }
    });
    BUILDING_UPGRADE_THRESHOLDS.forEach(threshold => {
        BUILDINGS.forEach(building => {
            if (isBuildingUpgradeAvailable(building.id, threshold)) {
                const cost = getBuildingUpgradeFixedCost(building.id, threshold);
                if (cheapest === null || cost < cheapest) cheapest = cost;
            }
        });
    });
    return cheapest;
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
                    const newNb = CLICK_UPGRADES.indexOf(upgrade) + 1;
                    const el = createUpgradeElement(color, 'images/cursor.svg', upgrade.name, newNb);
                    const lines = [
                        t(upgrade.name) + ' — ' + t('niveau') + ' ' + newNb,
                        t('+1% de production par clic') + '\n' + formatNumber(upgrade.cost) + ' ' + t('Parts')
                    ];
                    attachTooltip(el, lines.join('\n'));
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
                const color = getUpgradeTierColor(thresholdIndex);
                const cost = getBuildingUpgradeFixedCost(building.id, threshold);
                available.push({
                    cost,
                    render: () => {
                        const el = createUpgradeElement(color, building.imgPath || '', building.name, thresholdIndex + 1);
                        attachTooltip(el, `${t(building.name)} — ${t('niveau')} ${thresholdIndex + 1} — ×2 ${t('production')} — ${formatNumber(cost)} ${t('Parts')}`);
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
    renderBuyAllUpgradesButton(container, available);
}

// Bouton "Tout acheter" : achete en un clic toutes les ameliorations
// abordables, de la moins chere a la plus chere (le score baisse au fur
// et a mesure, donc l'ordre est important). Debloque au 3e lancement.
const BUY_ALL_UNLOCK_LAUNCHES = 3;
function canBuyAllUpgrades() {
    return rocketsLaunched >= BUY_ALL_UNLOCK_LAUNCHES;
}
function renderBuyAllUpgradesButton(container, available) {
    let btn = document.getElementById('buy-all-upgrades');
    if (!canBuyAllUpgrades()) {
        if (btn) btn.remove();
        return;
    }
    const affordable = available.filter(item => item.cost <= score).length;
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'buy-all-upgrades';
        btn.className = 'buy-all-upgrades-btn';
        btn.textContent = t('Tout acheter');
        btn.onclick = buyAllUpgrades;
        container.parentNode.insertBefore(btn, container.nextSibling);
    }
    btn.disabled = affordable === 0;
    btn.classList.toggle('affordable', affordable > 0);
}
function buyAllUpgrades() {
    if (!canBuyAllUpgrades()) return;
    // Reconstituer la liste complete des ameliorations disponibles
    const available = [];
    CLICK_UPGRADES.forEach(upgrade => {
        if (totalPartsFromClicks >= upgrade.threshold && !activatedClickUpgrades.includes(upgrade.threshold)) {
            available.push({ kind: 'click', threshold: upgrade.threshold, cost: upgrade.cost });
        }
    });
    BUILDING_UPGRADE_THRESHOLDS.forEach(threshold => {
        BUILDINGS.forEach(building => {
            if (isBuildingUpgradeAvailable(building.id, threshold)) {
                available.push({ kind: 'building', buildingId: building.id, threshold, cost: getBuildingUpgradeFixedCost(building.id, threshold) });
            }
        });
    });
    available.sort((a, b) => a.cost - b.cost);
    let bought = 0;
    // Achat successif du moins cher : a chaque achat le score baisse, ce
    // qui peut rendre les suivantes inabordables. On s'arrete des que le
    // prochain n'est plus payable.
    while (available.length && available[0].cost <= score) {
        const item = available.shift();
        if (item.kind === 'click') {
            if (!activatedClickUpgrades.includes(item.threshold) && score >= item.cost) {
                score -= item.cost;
                activatedClickUpgrades.push(item.threshold);
                bought++;
            }
        } else if (isBuildingUpgradeAvailable(item.buildingId, item.threshold) && score >= item.cost) {
            score -= item.cost;
            if (!buildingUpgrades[item.buildingId]) buildingUpgrades[item.buildingId] = [];
            buildingUpgrades[item.buildingId].push(item.threshold);
            bought++;
        }
    }
    if (bought === 0) {
        Sounds.lose();
        showToast("\u274c " + t("Pas assez de Parts"));
        return;
    }
    invalidateBuildingGainsCache();
    updateDisplay();
    saveGame();
    hideTooltip();
    renderUpgrades();
    updateAllBuildingButtons();
    checkTrophies();
    showToast("\u2705 " + bought + " " + t("ameliorations achetees"));
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
            // Tooltip des upgrades ancre sous la case : la barre d'ameliorations
            // est en haut d'ecran, au-dessus il serait colle a la top bar.
            showTooltip(text, rect.left + rect.width / 2, rect.top, { below: true, anchorBottom: rect.bottom });
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
    showTooltip(text, rect.left + rect.width / 2, rect.top, { anchorBottom: rect.bottom, below: true });
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

function spawnRandomBonus(shower, isContract) {
    // Pluie de comètes : bonus instantané uniquement (pas de flare, pas de
    // cumul de multiplicateurs), look distinct, récompense généreuse.
    let bonus = shower
        ? { id: "meteor", symbol: "\ud83c\udf20", name: "Pluie de météores", effect: "instant", type: "meteor", colorClass: "meteor" }
        : RANDOM_BONUSES[Math.floor(Math.random() * RANDOM_BONUSES.length)];
    // Si ce bonus est déjà actif, prendre l'autre pour ne pas bloquer le spawn
    if (!shower && activeRandomBonuses.some(b => b.id === bonus.id)) {
        const other = RANDOM_BONUSES.find(b => b.id !== bonus.id);
        if (activeRandomBonuses.some(b => b.id === other.id)) return;
        bonus = other;
    }

    // La comète traverse l'écran en diagonale de haut en bas
    // La traînée part du haut et descend jusqu'en bas
    const containerTopOffset = document.getElementById('random-bonuses').getBoundingClientRect().top;
    const containerHeight = window.innerHeight - containerTopOffset;
    const startY = -180;
    const endY = containerHeight + 180;
    const verticalTravel = endY - startY;
    // À 60°, déplacement horizontal = vertical / tan(60°) ~ 0.577
    const horizontalTravel = verticalTravel * 0.577;
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
    // Cometes de contrat : plus rapides (4 s au lieu de 6 s), plus dures
    // a intercepter — le contrat doit se mEriter.
    const isContractComet = shower && contractState.active
        && (contractState.active.typeId === 'comets' || contractState.active.typeId === 'shower');
    const duration = isContractComet ? 4000 : 6000;

    const bonusElement = document.createElement('div');
    bonusElement.className = `random-bonus comet ${bonus.colorClass}` + (shower ? ' shower' : '');
    if (isContract) bonusElement.dataset.contractComet = '1';
    if (!goRight) bonusElement.classList.add('reverse');
    // Structure detaillee inspiree des vraies cometes :
    // - chevelure (coma) : halo diffus autour du noyau
    // - queue de plasma continue attachee derriere le noyau, orientee
    //   dans l'axe oppose au vol
    // - queue de poussiere : particules qui derivent vers l'arriere
    bonusElement.innerHTML = '<img src="images/effects/comete.png" class="comet-img" alt="Comete">'
        + '<div class="comet-coma"></div>'
        + '<div class="comet-tail-plasma"></div>'
        + '<div class="comet-tail-dust"></div>';
    bonusElement.style.left = `${startX}px`;
    bonusElement.style.top = `${startY}px`;

    document.getElementById('random-bonuses').appendChild(bonusElement);

    // Animation de traversée en diagonale en transform (compositee GPU,
    // comme le missile) : animer left/top forcerait le layout a chaque
    // frame, la comete saccaderait et le point de rendez-vous du missile
    // serait rate des que le thread principal charge (pluie, trainee).
    const travelX = endX - startX;
    const travelY = endY - startY;
    requestAnimationFrame(() => {
        bonusElement.style.transition = `transform ${duration}ms linear`;
        bonusElement.style.transform = `translate(${travelX}px, ${travelY}px)`;
    });

    // Queue de poussiere : particules frequentes a vie longue, qui
    // DERIVENT vers l'arriere du noyau (rejetees dans l'axe oppose au
    // vol) et s'ecartent legerement sur les cotes -- comme la queue
    // reelle d'une comete, courbee et diffuse, pas un chapelet de
    // cercles fixes.
    // Performance : la traIne etait LE goulot d'etranglement de la pluie
    // (12 cometes x 2 particules / 16 ms ~ 1500 nodes DOM/s, chacune avec son
    // rAF + setTimeout). Nouvelle approche : un intervalle serre en absolute
    // (60 ms), UNE particule par tick, et un POOL de particules recyclees —
    // zero allocation en regime etabli, le navigateur ne gere plus que
    // ~20 elements persistants au lieu de creer/detruire 1500 par seconde.
    const TRAIL_INTERVAL_MS = 60;
    const TRAIL_LIFE_MS = 900;
    const dirX = goRight ? 1 : -1;
    // Fraction du noyau dans le conteneur (identique aux variables CSS --nx/--ny)
    const nucX = goRight ? 0.6716 : 0.3216;
    const nucY = goRight ? 0.8051 : 0.8012;
    const trailPool = [];
    const trailInUse = [];
    const trailInterval = setInterval(() => {
        const rect = bonusElement.getBoundingClientRect();
        // Emettre au NOYAU reel, et scaler la derive a la taille de la comete
        const cx = rect.left + rect.width * nucX;
        const cy = rect.top + rect.height * nucY;
        const tsc = Math.max(0.6, Math.min(1, rect.width / 180));
        // UNE particule par tick, alternee coeur/poussiere pour garder le
        // melange des deux textures sans doubler le travail.
        const isCore = (trailInUse.length % 2) === 0;
        let trail = trailPool.pop();
        if (!trail) {
            trail = document.createElement('div');
            document.body.appendChild(trail);
        }
        trail.className = 'comet-trail' + (isCore ? ' core' : ' dust');
        trail.style.width = ((isCore ? 20 : 11) * tsc).toFixed(1) + 'px';
        trail.style.height = ((isCore ? 20 : 11) * tsc).toFixed(1) + 'px';
        const drift = (40 + Math.random() * 70) * tsc;
        const spread = ((Math.random() * 2 - 1) * 26) * tsc;
        // Reset de l'etat ANIM du pool : repositionner puis reactiver la
        // transition dans le frame suivant (forcage du reflow via offsetWidth).
        trail.style.transition = 'none';
        trail.style.opacity = '1';
        trail.style.left = `${cx}px`;
        trail.style.top = `${cy}px`;
        trail.style.transform = 'translate(-50%, -50%)';
        void trail.offsetWidth;
        trail.style.transition = '';
        requestAnimationFrame(() => {
            trail.style.opacity = '0';
            trail.style.transform = `translate(-50%, -50%) translate(${-dirX * drift * 0.5 + spread * 0.4}px, ${-drift * 0.866 + spread * 0.6}px) scale(0.2)`;
        });
        trailInUse.push(trail);
        // Recyclage : les particules expirees retournent au pool (cache)
        while (trailInUse.length > 0 && trailInUse[0].style.opacity === '0') {
            trailPool.push(trailInUse.shift());
        }
    }, TRAIL_INTERVAL_MS);

    const timeout = setTimeout(() => {
        clearInterval(trailInterval);
        bonusElement.remove();
        trailInUse.forEach(t => { t.remove(); });
        trailInUse.length = 0;
        // Contrat "Protection de la fusee" : une comete qui traverse sans
        // etre interceptee frappe la fusee — defaut PARFAIT, le contrat echoue
        // immediatement. C'est ce qui le distingue de la "Survie a la pluie"
        // ou rater des cometes ne fait perdre que la recolte.
        const c = contractState.active;
        if (shower && bonusElement.dataset.collected !== '1') {
            // Cometes ratees HORS defense parfaite (pluie naturelle, contrat
            // shower) : petit son de perte pour signaler le manque a gagner.
            if (!c || c.typeId !== 'comets') Sounds.lose();
        }
        if (shower && c && c.typeId === 'comets' && bonusElement.dataset.collected !== '1') {
            c.progress = -Infinity; // marque l'echec pour updateContractProgress
            c.failed = true;
            failContract();
        }
        // Contrat "Survie a la pluie" : cette comete vient de finir sa course.
        // Si toutes les cometes prevues sont passees (plus en vol, plus a venir)
        // et que la cible n'est plus atteignable, le contrat est DEJA perdu :
        // inutile d'attendre les dernieres secondes du chrono, on arrete net.
        if (shower && c && c.typeId === 'shower') {
            c.showerInFlight = Math.max(0, (c.showerInFlight || 0) - 1);
            if (c.showerLaunched >= (c.showerTotal || 0)
                && c.showerInFlight === 0
                && c.progress < c.target) {
                c.failed = true;
                failContract();
            }
        }
    }, duration);

    bonusElement.onclick = () => {
        if (bonusElement.dataset.collected === '1') return;
        bonusElement.dataset.collected = '1';
        // Le timeout de fin de course est coupe des le clic : il ne doit pas
        // retirer la comete pendant que le missile est en vol.
        clearTimeout(timeout);
        // Interception en vol : la comete NE S'ARRETE PAS, elle continue sa
        // transition. Le missile calcule un point de rendez-vous sur sa
        // trajectoire future et la detruit en plein vol.
        interceptCometWithMissile(bonusElement, () => {
            // Impact : la comete disparait pile au point de rendez-vous, remplacee
            // par l'explosion. On fige sa position ACQUISE (pas de teleportation,
            // la transition est coupee sur place), puis fondu de sortie.
            clearInterval(trailInterval);
            const impactRect = bonusElement.getBoundingClientRect();
            const contRect = document.getElementById('random-bonuses').getBoundingClientRect();
            // Le vol est porte par transform : on fige la comete a sa
            // position ACQUISE en convertissant la position viewport en
            // translation (left/top restent le point de depart).
            bonusElement.style.transition = 'none';
            bonusElement.style.transform = `translate(${impactRect.left - contRect.left - parseFloat(bonusElement.style.left)}px, ${impactRect.top - contRect.top - parseFloat(bonusElement.style.top)}px) scale(0.5)`;
            bonusElement.classList.add('clicked');
            clickedBonusesCount++;
            // Contrat interactif en cours : la comete interceptee compte.
            notifyContractComet();
            // La comete n'atteindra jamais son timeout de fin de course
            // (clearTimeout ci-dessus) : decrementer le compteur de vol ici.
            const cc = contractState.active;
            if (shower && cc && cc.typeId === 'shower') {
                cc.showerInFlight = Math.max(0, (cc.showerInFlight || 0) - 1);
            }
            if (bonus.id === "meteor") {
                // Cometes de CONTRAT uniquement : aucun bonus direct, elles ne
                // servent qu'a remplir l'objectif. Les pluies naturelles (shower)
                // donnent bien leurs parts, comme les cometes isolees.
                const isContractComet = bonusElement.dataset.contractComet === '1';
                if (!isContractComet) {
                    const instantProduction = partsPerSecond * (shower ? 5 : 10);
                    score += instantProduction;
                    partsSinceLaunch += instantProduction;
                    trackPartsEarned(instantProduction);
                    showBonusPopup('+' + formatNumber(instantProduction) + ' ' + t("Parts"), 'instant');
                }
            }
            else if (bonus.id === "flare") {
                // Chaque flare porte un endTime unique : le timer d'expiration
                // retire uniquement CE bonus. Filtrer par id retirerait tous les
                // flares actifs du meme type d'un seul coup.
                const flareEndTime = Date.now() + bonus.duration;
                activeRandomBonuses.push({
                    id: bonus.id,
                    effect: bonus.effect,
                    multiplier: bonus.multiplier,
                    endTime: flareEndTime
                });
                rebuildAutoMultipliers();
                showBonusPopup(t('Production') + ' \u00d7' + bonus.multiplier, 'multiplier');
                setTimeout(() => {
                    activeRandomBonuses = activeRandomBonuses.filter(b => b.endTime !== flareEndTime);
                    rebuildAutoMultipliers();
                    updateDisplay();
                }, bonus.duration);
            }
            setTimeout(() => bonusElement.remove(), 500);
            checkTrophies();
        }, { startX, startY, endX, endY, duration });
    };
}
// Missile d'interception : quand le joueur clique sur une comète, un missile
// part du bord de l'écran et la percute en trajectoire perpendiculaire à la
// sienne. Vol très rapide (180-320 ms), puis explosion et destruction.
// Interception en vol : la comete NE S'ARRETE PAS. Le missile calcule
// un point de rendez-vous sur la trajectoire future de la comete et
// s'y crash pile au moment ou elle y passe.
// Gros popup de bonus au centre de l'ecran : "+X Parts" ou "Production x5",
// position et angle aleatoires, comme un gain dans un jeu video. Vit dans
// .click-effects (calque fixe au-dessus du jeu, sous les cometes).
function showBonusPopup(text, kind) {
    const container = document.getElementById('click-effects');
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const cx = cRect.width / 2;
    const cy = cRect.height / 2;
    const rx = (Math.random() - 0.5) * Math.min(240, cRect.width * 0.3);
    const ry = (Math.random() - 0.5) * Math.min(160, cRect.height * 0.3);
    const angle = (Math.random() - 0.5) * 24;
    const el = document.createElement('div');
    el.className = 'bonus-pop ' + (kind === 'multiplier' ? 'bonus-pop-mult' : 'bonus-pop-instant');
    el.textContent = text;
    el.style.left = (cx + rx) + 'px';
    el.style.top = (cy + ry) + 'px';
    el.style.setProperty('--bpop-rot', angle.toFixed(1) + 'deg');
    container.appendChild(el);
    setTimeout(() => el.remove(), 1900);
}

function interceptCometWithMissile(cometEl, onDestroy, opts) {
    Sounds.missile();
    const cometRect = cometEl.getBoundingClientRect();
    // Nucleau reel de la comete via les variables CSS --nx/--ny (le sprite est
    // horizontal avec queue integree, le noyau n'est PAS au centre du canvas).
    // Les variables sont en POURCENTAGE du conteneur : convertir en px selon
    // la taille reelle, pour que le point de rendez-vous reste exact quelle
    // que soit la taille de la comete (desktop 180px, mobile 130px, pluie 120px).
    const cs = getComputedStyle(cometEl);
    const nxRaw = parseFloat(cs.getPropertyValue('--nx')) || 74.44;
    const nyRaw = parseFloat(cs.getPropertyValue('--ny')) || 75;
    const nx = cometRect.width * nxRaw / 100;
    const ny = cometRect.height * nyRaw / 100;
    const cx = cometRect.left + nx;
    const cy = cometRect.top + ny;
    // Facteur d'echelle des effets (missile, explosion) : 1 pour une comete
    // de 180px, proportionnellement plus petit pour les cometes reduites.
    const scale = Math.max(0.6, Math.min(1, cometRect.width / 180));
    const goRight = !cometEl.classList.contains('reverse');
    // Vecteur vitesse de la comete (px/ms) sur sa trajectoire lineaire.
    const vTotal = opts ? opts.duration : 6000;
    const vcx = opts ? (opts.endX - opts.startX) / vTotal : 0;
    const vcy = opts ? (opts.endY - opts.startY) / vTotal : 0;
    // Depart du missile : PERPENDICULAIRE a la trajectoire de la comete.
    // La comete vole en diagonale ; le missile arrive dans l'axe
    // perpendiculaire, depuis hors de l'ecran, et la percute de plein
    // fouet dans une direction orthogonale a son vol.
    const vLen = Math.hypot(vcx, vcy) || 1;
    let pvx = -vcy / vLen;
    let pvy = vcx / vLen;
    // Cote du tir : partir du BAS de la comete (le missile monte vers elle)
    if (pvy < 0) { pvx = -pvx; pvy = -pvy; }
    const reach = Math.hypot(window.innerWidth, window.innerHeight) * 0.6;
    // Convergence du point de rendez-vous : la comete avance pendant le vol
    // du missile, donc on reitere (temps de vol <-> position future) jusqu'a
    // ce que le missile arrive au point pile au moment ou elle y passe.
    let flightMs = 320;
    let tx = cx, ty = cy;
    let launchXadj = cx, launchY = cy;
    for (let i = 0; i < 3; i++) {
        tx = cx + vcx * flightMs;
        ty = cy + vcy * flightMs;
        launchXadj = tx + pvx * reach;
        launchY = ty + pvy * reach;
        const d = Math.hypot(tx - launchXadj, ty - launchY);
        flightMs = Math.max(240, Math.min(600, d / 2.2));
    }
    launchXadj = tx + pvx * reach;
    launchY = ty + pvy * reach;
    const angle = Math.atan2(ty - launchY, tx - launchXadj);
    const missile = document.createElement('div');
    missile.className = 'comet-missile';
    missile.innerHTML = '<img src="images/effects/missile.png" alt="">';
    document.body.appendChild(missile);
    const mRect = missile.getBoundingClientRect();
    const mW = mRect.width || 46;
    const mH = mRect.height || 14;
    missile.style.left = (launchXadj - mW / 2) + 'px';
    missile.style.top = (launchY - mH / 2) + 'px';
    missile.style.transform = `translate(0px, 0px) rotate(${angle}rad) scale(${scale})`;
    // Forcer le commit de l'orientation initiale AVANT de poser la
    // transition : sinon le navigateur n'a jamais calcule le style de depart
    // et interpole la rotation depuis 0 rad, le missile tourne sur lui-meme
    // pendant tout le vol.
    void missile.getBoundingClientRect();
    // Vol rapide mais lisible : borné entre 240 et 600 ms selon la distance.
    // Animation en transform (compositee GPU) : left/top forcerait le layout
    // a chaque frame et ferait saccader le vol.
    const dx = tx - launchXadj;
    const dy = ty - launchY;
    requestAnimationFrame(() => {
        missile.style.transition = `transform ${flightMs}ms linear`;
        missile.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}rad) scale(${scale})`;
    });
    setTimeout(() => {
        if (!missile.isConnected) return;
        missile.remove();
        spawnCometExplosion(tx, ty, scale);
        onDestroy();
    }, flightMs + 20);
}
// Explosion de la comète à l'impact : lueur, flash blanc, boule de feu,
// ondes de choc, gerbe d'étincelles et fumée. Chaque couche est un div
// positionné au point d'impact, animée en CSS puis nettoyée.
function spawnCometExplosion(cx, cy, scale) {
    Sounds.explosion();
    // Echelle des effets : proportionnelle a la taille de la comete detruite
    const sc = Math.max(0.5, Math.min(1, scale || 1));
    const explosion = document.createElement('div');
    explosion.className = 'comet-explosion';
    explosion.style.left = cx + 'px';
    explosion.style.top = cy + 'px';
    explosion.style.setProperty('--es', sc);
    document.body.appendChild(explosion);

    const layer = (cls) => {
        const el = document.createElement('div');
        el.className = cls;
        explosion.appendChild(el);
        return el;
    };

    layer('exp-light');
    layer('exp-core');
    layer('exp-fireball');

    // Deux ondes de choc, la seconde légèrement en retard
    layer('exp-ring');
    const ring2 = layer('exp-ring');
    ring2.style.animationDelay = '0.12s';
    ring2.style.animationDuration = '0.7s';

    // Gerbe d'étincelles : directions et portées variées
    const SPARKS = 16;
    for (let i = 0; i < SPARKS; i++) {
        const spark = layer('exp-spark');
        const theta = (i / SPARKS) * Math.PI * 2 + Math.random() * 0.35;
        const dist = (50 + Math.random() * 110) * sc;
        const sx = Math.cos(theta) * dist;
        const sy = Math.sin(theta) * dist;
        spark.style.setProperty('--sx', sx.toFixed(1) + 'px');
        spark.style.setProperty('--sy', sy.toFixed(1) + 'px');
        spark.style.setProperty('--sr', (Math.random() * 220 - 110).toFixed(0) + 'deg');
        spark.style.setProperty('--ssize', ((3 + Math.random() * 3.5) * sc).toFixed(1) + 'px');
        spark.style.setProperty('--sd', (0.5 + Math.random() * 0.35).toFixed(2) + 's');
    }

    // Fumée : bouffées décalées, majoritairement vers le haut
    for (let i = 0; i < 6; i++) {
        const smoke = layer('exp-smoke');
        const theta = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
        const dist = (26 + Math.random() * 60) * sc;
        smoke.style.setProperty('--sx', (Math.cos(theta) * dist).toFixed(1) + 'px');
        smoke.style.setProperty('--sy', (Math.sin(theta) * dist).toFixed(1) + 'px');
        smoke.style.setProperty('--sscale', (0.7 + Math.random() * 0.9).toFixed(2));
        smoke.style.setProperty('--sdelay', (0.05 + Math.random() * 0.2).toFixed(2) + 's');
    }

    setTimeout(() => explosion.remove(), 1400);
}

// ============================================
// VISUAL EFFECTS
// ============================================

// Parts par clic "naturelles" : base + bonus batiments + bonus production de base,
// sans aucun multiplicateur (temporaire, galactique ou critique). Sert de base
// de calcul pour les cibles et la progression des contrats clickParts.
function getNaturalClickParts() {
    const nbUpgrades = activatedClickUpgrades.length;
    const { baseCpC, buildingBonus } = getClickComponents();
    const naturalCpsBonus = nbUpgrades * 0.01 * getBasePartsPerSecond();
    return baseCpC + buildingBonus + naturalCpsBonus;
}

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
    Sounds.click();
    const { baseCpC, buildingBonus, cpsBonus } = getClickComponents();
    const basePoints = baseCpC + buildingBonus + cpsBonus;
    const critMult = (Math.random() < getCritChance()) ? 3 : 1;
    // clickMultiplier : multiplicateurs temporaires de CLIC (contrats,
    // flares). Il etait calcule et sauvegarde mais jamais applique ici —
    // les rewards "Clic x2/3/5" des contrats n'avaient donc AUCUN effet.
    const totalPoints = basePoints * clickMultiplier * getClickPowerBonus() * critMult;
    if (getGalacticUpgradeLevel('click6') > 0 && Math.random() < 0.05) {
        spawnRandomBonus();
    }

    score += totalPoints;
    partsSinceLaunch += totalPoints;
    totalPartsFromClicks += totalPoints;
    trackPartsEarned(totalPoints);
    trackNaturalParts(basePoints);
    // Contrat interactif en cours : le clic compte. Pour clickParts on mesure
    // les Parts naturelles (sans multiplicateurs) pour rester coherent avec
    // la cible calculee sur le Parts/clic naturel.
    notifyContractClick(basePoints);

    showClickEffect(Math.round(totalPoints), event);
    spawnShockwave(event);
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

// Ondes de choc : 2 anneaux emis au point EXACT du clic (le 2e plus petit,
// 60 ms plus tard), qui s'etendent en s'estompant : sensation de frappe.
function spawnShockwave(event) {
    const container = document.getElementById('click-effects');
    if (!container) return;
    let x, y;
    if (event && event.clientX !== undefined) {
        x = event.clientX; y = event.clientY;
    } else {
        const medal = document.getElementById('medal');
        const r = medal.getBoundingClientRect();
        x = r.left + r.width / 2; y = r.top + r.height / 2;
    }
    const rect = container.getBoundingClientRect();
    const cx = x - rect.left, cy = y - rect.top;
    // Taille ADAPTATIVE : proportionnelle au diametre reel de la piece
    // (~22%), elle-meme adaptee a l'ecran (21cqh min/max). L'onde suit
    // donc la piece sur mobile comme sur PC, sans media query.
    const medal = document.getElementById('medal');
    const medalRect = medal.getBoundingClientRect();
    const base = Math.max(20, Math.round(medalRect.width * 0.22));
    const half = -(base / 2);
    const w1 = document.createElement('div');
    w1.className = 'shockwave';
    w1.style.left = cx + 'px';
    w1.style.top = cy + 'px';
    w1.style.width = base + 'px';
    w1.style.height = base + 'px';
    w1.style.margin = half + 'px 0 0 ' + half + 'px';
    const w2 = document.createElement('div');
    w2.className = 'shockwave small';
    w2.style.left = cx + 'px';
    w2.style.top = cy + 'px';
    w2.style.width = base + 'px';
    w2.style.height = base + 'px';
    w2.style.margin = half + 'px 0 0 ' + half + 'px';
    container.appendChild(w1);
    container.appendChild(w2);
    setTimeout(() => { w1.remove(); w2.remove(); }, 700);
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
    const dir = Math.random() * Math.PI * 2;
    const dist = 55 + Math.random() * 45;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    effect.style.setProperty('--ce-dx', (Math.cos(dir) * dist).toFixed(1) + 'px');
    effect.style.setProperty('--ce-dy', (Math.sin(dir) * dist).toFixed(1) + 'px');
    effect.style.setProperty('--ce-rot', ((Math.random() - 0.5) * 22).toFixed(1) + 'deg');
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
// SOUND DESIGN — moteur Web Audio 100% synthétisé
// Aucun fichier audio : chaque son est généré par oscillateurs.
// Muert par défaut jusqu'à la première interaction (politique navigateurs),
// réglage sauvegardé, coupé quand l'onglet est masqué.
// ============================================
const Sound = {
    ctx: null,
    master: null,
    enabled: (localStorage.getItem('starcruiserSound') !== '0'),
    _lastClick: 0
};
function soundInit() {
    if (Sound.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    Sound.ctx = new AC();
    Sound.master = Sound.ctx.createGain();
    Sound.master.gain.value = 0.22;
    Sound.master.connect(Sound.ctx.destination);
}
function soundResume() {
    if (!Sound.ctx) soundInit();
    if (Sound.ctx && Sound.ctx.state === 'suspended') Sound.ctx.resume();
}
// Bip générique : fréquence de départ, fréquence de fin, durée, type d'onde, volume
function soundTone(freq, freqEnd, dur, type, vol, delay) {
    if (!Sound.enabled) return;
    soundResume();
    if (!Sound.ctx) return;
    const t0 = Sound.ctx.currentTime + (delay || 0);
    const osc = Sound.ctx.createOscillator();
    const g = Sound.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd && freqEnd !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol || 0.5, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(Sound.master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
}
// Bruit filtré (explosions, whoosh)
function soundNoise(dur, vol, freqStart, freqEnd) {
    if (!Sound.enabled) return;
    soundResume();
    if (!Sound.ctx) return;
    const t0 = Sound.ctx.currentTime;
    const len = Math.max(1, Math.floor(Sound.ctx.sampleRate * dur));
    const buf = Sound.ctx.createBuffer(1, len, Sound.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = Sound.ctx.createBufferSource();
    src.buffer = buf;
    const filt = Sound.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(freqStart || 1800, t0);
    filt.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd || 120), t0 + dur);
    const g = Sound.ctx.createGain();
    g.gain.setValueAtTime(vol || 0.4, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filt); filt.connect(g); g.connect(Sound.master);
    src.start(t0); src.stop(t0 + dur);
}
const Sounds = {
    // Clic sur la médaille : tick doux, pitch légèrement aléatoire, anti-spam 30 ms
    click() {
        // Vrai son de piece de monnaie, bien audible : le classique "coin
        // collect" (piece Zelda / rupee) — deux notes metalliques cristallines
        // en intervalle de quarte ascendante (Si grave puis Mi aigu), chaque
        // note = fondamentale forte + partiel metallique inharmonique +
        // petite attaque carree. Pitch legerement improvise a chaque clic.
        const now = performance.now();
        if (now - Sound._lastClick < 40) return;
        Sound._lastClick = now;
        const detune = 1 + (Math.random() - 0.5) * 0.04;
        const f1 = 988 * detune;   // Si5 : premiere note, cristalline
        const f2 = 1319 * detune;   // Mi6 : seconde note, claire et conclusive
        // Note 1 : attaque breve + fondamentale cristalline + partiel metal
        soundTone(f1, f1, 0.012, 'square', 0.1);
        soundTone(f1, f1 * 0.998, 0.11, 'sine', 0.3);
        soundTone(f1 * 2.76, f1 * 2.7, 0.07, 'sine', 0.07, 0.002);
        // Note 2 : la reponse, plus aigue, qui conclut le geste
        soundTone(f2, f2, 0.012, 'square', 0.1, 0.075);
        soundTone(f2, f2 * 0.998, 0.16, 'sine', 0.32, 0.075);
        soundTone(f2 * 2.76, f2 * 2.7, 0.08, 'sine', 0.06, 0.077);
    },
    // Achat : pop satisfaisant, deux notes montantes
    buy() {
        soundTone(360, 520, 0.09, 'sine', 0.4);
        soundTone(540, 720, 0.12, 'sine', 0.3, 0.06);
    },
    // Un bâtiment devient abordable : carillon doux deux notes,
    // discret pour ne pas spammer quand le score monte vite.
    affordable() {
        soundTone(880, 880, 0.09, 'sine', 0.16);
        soundTone(1175, 1175, 0.14, 'sine', 0.18, 0.09);
    },
    // Un bâtiment devient abordable : carillon doux deux notes, discret
    // pour ne pas spammer quand le score monte vite.
    affordable() {
        soundTone(880, 880, 0.09, 'sine', 0.16);
        soundTone(1175, 1175, 0.14, 'sine', 0.18, 0.09);
    },
    // Nouveau bâtiment débloqué : jingle 3 notes ascendantes
    unlock() {
        soundTone(523, 523, 0.14, 'triangle', 0.35);
        soundTone(659, 659, 0.14, 'triangle', 0.35, 0.12);
        soundTone(784, 784, 0.22, 'triangle', 0.4, 0.24);
    },
    // Amélioration (upgrade) : bip cristallin
    upgrade() {
        soundTone(880, 1320, 0.1, 'sine', 0.35);
    },
    // Comète : whoosh du missile puis explosion
    missile() {
        // Sifflement de missile realiste : comme avant, le sifflement aigu
        // descendant (l'arme qui tombe, Doppler), mais avec plus de corps —
        // une couche grave ronde qui glisse avec et un souffle d'air autour,
        // plus vivant qu'un sinus pur. Realiste et reconnaissable.
        soundTone(2400, 400, 0.5, 'sine', 0.3);
        soundTone(480, 120, 0.5, 'sine', 0.12);
        soundNoise(0.45, 0.08, 1800, 500, 0.03);
    },
    explosion() {
        // Combo ultra satisfaisant : impact qui claque SEC (claquement +
        // punch grave profond), puis une recompense cristalline qui monte
        // (deux notes do->sol aiguEs, la pieces gagnee) — le "payoff" du
        // missile. Tout reste bref et rond, dans le style du jeu.
        // Claquement initial tres present
        soundNoise(0.05, 0.45, 9000, 3000);
        // Le punch grave du BOOM, profond et bref
        soundTone(100, 40, 0.15, 'sine', 0.5);
        // Souffle de frappe court pour l'assise
        soundNoise(0.2, 0.25, 900, 150);
        // Payoff : notes cristallines montantes qui recompensent le hit
        soundTone(1047, 1047, 0.12, 'sine', 0.2, 0.1);
        soundTone(1568, 1568, 0.2, 'sine', 0.24, 0.2);
    },
    // Contrat : accepté / rempli / échoué
    contractAccept() {
        soundTone(440, 440, 0.1, 'sine', 0.3);
        soundTone(587, 587, 0.14, 'sine', 0.3, 0.09);
    },
    contractDone() {
        soundTone(587, 587, 0.1, 'triangle', 0.35);
        soundTone(784, 784, 0.1, 'triangle', 0.35, 0.09);
        soundTone(988, 988, 0.2, 'triangle', 0.4, 0.18);
    },
    contractFail() {
        soundTone(330, 220, 0.3, 'sawtooth', 0.25);
        soundTone(196, 130, 0.4, 'sine', 0.25, 0.1);
    },
    // Perte generique (achat impossible, comete ratee, bonus expire) :
    // petit duo descendant bref, discret mais clairement negatif
    lose() {
        soundTone(311, 233, 0.14, 'sine', 0.22);
        soundTone(233, 165, 0.2, 'sine', 0.2, 0.09);
    },
    // Alerte pluie de cometes naturelle : trois notes montantes cristallines
    // suivies d'un souffle — previent l'oreille avant que l'oeil ne voie la pluie
    showerAlert() {
        soundTone(392, 392, 0.16, 'triangle', 0.3);
        soundTone(523, 523, 0.16, 'triangle', 0.3, 0.16);
        soundTone(659, 659, 0.22, 'triangle', 0.26, 0.32);
        soundNoise(0.5, 0.12, 2000, 6000, 0.34);
    },
    // Booster de cartes : ouverture mystique
    booster() {
        // Ouverture de booster refaite : un swell mystErieux qui monte depuis
        // le grave (deux sinus glissants qui s'elevent ensemble), un voile de
        // bruit EthErE au sommet facon interstice magique, puis un accord
        // cristallin qui s'illumine et s'Eteint doucement — la sensation
        // d'ouvrir un coffre spatial, pas d'un paquet terrestre.
        soundTone(110, 440, 0.35, 'sine', 0.26);
        soundTone(165, 660, 0.35, 'sine', 0.14);
        soundNoise(0.25, 0.18, 3000, 7000, 0.3);
        soundTone(880, 880, 0.4, 'sine', 0.3, 0.38);
        soundTone(1109, 1109, 0.4, 'sine', 0.24, 0.38);
        soundTone(1319, 1319, 0.45, 'sine', 0.28, 0.38);
        soundTone(1760, 1760, 0.35, 'sine', 0.1, 0.5);
        soundTone(440, 440, 0.3, 'sine', 0.12, 0.55);
    },
    // Pièce de fusée qui s'empile : choc métallique + verrouillage
    partStack() {
        // Une pièce de fusée qui tombe à sa place : clac métallique grave
        // au contact (le choc), puis petit cliquetis de verrouillage (la
        // pièce qui se clipse), discret et satisfaisant, dans le style des
        // autres sons.
        soundTone(320, 180, 0.08, 'square', 0.14);
        soundTone(160, 90, 0.14, 'sine', 0.2);
        soundNoise(0.06, 0.14, 4000, 900);
        soundTone(1175, 1175, 0.05, 'square', 0.06, 0.09);
        soundTone(1568, 1568, 0.07, 'sine', 0.08, 0.1);
    },
    // Trophée : fanfare discrète
    trophy() {
        soundTone(659, 659, 0.1, 'triangle', 0.3);
        soundTone(784, 784, 0.1, 'triangle', 0.3, 0.1);
        soundTone(1047, 1047, 0.26, 'triangle', 0.38, 0.2);
    },
    // Lancement : la sequence complete est pilotee par launchSoundSequence()
    launch() {}
};
// ===== Boucles audio continues (moteurs, voyage) =====
const SoundLoops = {};
// Demarre une boucle de bruit rose filtrE, retourne un handle { stop() }
function soundStartNoiseLoop(freqStart, freqEnd, vol, rampSec) {
    if (!Sound.enabled) return null;
    soundResume();
    if (!Sound.ctx) return null;
    const ctx = Sound.ctx;
    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
        // Bruit rose approx : moyenne glissante du blanc
        const w = Math.random() * 2 - 1;
        last = (last + 0.03 * w) / 1.03;
        data[i] = last * 3.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(freqStart, ctx.currentTime);
    filt.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + (rampSec || 1));
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.15);
    src.connect(filt); filt.connect(g); g.connect(Sound.master);
    src.start();
    return {
        stop(fadeSec) {
            const t = ctx.currentTime;
            g.gain.cancelScheduledValues(t);
            g.gain.setValueAtTime(g.gain.value, t);
            g.gain.linearRampToValueAtTime(0, t + (fadeSec || 0.4));
            setTimeout(() => { try { src.stop(); } catch (e) {} }, ((fadeSec || 0.4) * 1000) + 80);
        }
    };
}
// Boucle de moteur : oscillateurs graves + modulations, handle { stop() }
function soundStartEngineLoop(baseFreq, vol) {
    if (!Sound.enabled) return null;
    soundResume();
    if (!Sound.ctx) return null;
    const ctx = Sound.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.2);
    g.connect(Sound.master);
    const oscs = [];
    // Couche 1 : grondement fondamental (sawtooth tres grave, filtre passe-bas)
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = baseFreq;
    const f1 = ctx.createBiquadFilter(); f1.type = 'lowpass'; f1.frequency.value = 260;
    o1.connect(f1); f1.connect(g); o1.start(); oscs.push(o1);
    // Couche 2 : sub plus grave (sine) pour la poitrine
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = baseFreq * 0.5;
    o2.connect(g); o2.start(); oscs.push(o2);
    // Couche 3 : LFO de trEmblement sur la frequence (vibration moteur)
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 11;
    const lfoG = ctx.createGain(); lfoG.gain.value = baseFreq * 0.12;
    lfo.connect(lfoG); lfoG.connect(o1.frequency); lfo.start(); oscs.push(lfo);
    return {
        stop(fadeSec) {
            const t = ctx.currentTime;
            g.gain.cancelScheduledValues(t);
            g.gain.setValueAtTime(g.gain.value, t);
            g.gain.linearRampToValueAtTime(0, t + (fadeSec || 0.5));
            oscs.forEach(o => { try { o.stop(t + (fadeSec || 0.5) + 0.1); } catch (e) {} });
        }
    };
}
// SEQUENCE sonore complete du lancement : compte a rebours (bips), ignition
// (moteurs + souffle), decollage (montee en puissance), puis extinction.
function launchSoundSequence() {
    if (!Sound.enabled) return;
    soundResume();
    if (!Sound.ctx) return;
    // Bips du compte a rebours : 3.. 2.. 1 (bip grave) puis bip final aigu
    [0, 700, 1400].forEach(d => soundTone(440, 440, 0.12, 'square', 0.14, d / 1000));
    soundTone(880, 880, 0.25, 'square', 0.16, 2.1);
    // Ignition a T+2.1 s (compte a rebours ~2.1 s + marge d'allumage) :
    // grondement moteur + jet de souffle qui montent en puissance
    setTimeout(() => {
        SoundLoops.engine = soundStartEngineLoop(55, 0.5);
        SoundLoops.jet = soundStartNoiseLoop(400, 2400, 0.5, 1.2);
    }, 2050);
    // Extinction douce apres le decollage (la fusee est sortie de l'ecran)
    setTimeout(() => {
        if (SoundLoops.engine) { SoundLoops.engine.stop(1.2); SoundLoops.engine = null; }
        if (SoundLoops.jet) { SoundLoops.jet.stop(1.2); SoundLoops.jet = null; }
    }, 6500);
}
// AMBIANCE DE VOYAGE : moteur continu plus doux + vent spatial discret
function travelSoundStart() {
    if (!Sound.enabled) return;
    soundResume();
    if (!Sound.ctx) return;
    SoundLoops.travelEngine = soundStartEngineLoop(42, 0.22);
    SoundLoops.travelWind = soundStartNoiseLoop(900, 600, 0.1, 2);
}
function travelSoundStop() {
    if (SoundLoops.travelEngine) { SoundLoops.travelEngine.stop(0.6); SoundLoops.travelEngine = null; }
    if (SoundLoops.travelWind) { SoundLoops.travelWind.stop(0.6); SoundLoops.travelWind = null; }
}
function toggleSound() {
    Sound.enabled = !Sound.enabled;
    localStorage.setItem('starcruiserSound', Sound.enabled ? '1' : '0');
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) btn.textContent = Sound.enabled ? '🔊' : '🔇';
    if (Sound.enabled) Sounds.click();
}
document.addEventListener('visibilitychange', () => {
    if (document.hidden && Sound.ctx && Sound.ctx.state === 'running') Sound.ctx.suspend();
    else if (!document.hidden && Sound.ctx && Sound.ctx.state === 'suspended' && Sound.enabled) Sound.ctx.resume();
});

// ============================================
// MAIN GAME LOOP
// ============================================

// ============================================
// PLUIE DE PIECES (panneau central)
// ============================================
// Densite liee aux Parts/s : 1 piece / 10 s a 1 Parts/s,
// 100 pieces / s a 1 000 000 Parts/s (progression racine, sans plafond).
const partsRain = {
    container: null,
    canvas: null,
    ctx: null,
    coinImg: null,
    sprite: null,
    parts: [],
    dpr: 1,
    spawnDebt: 0,
    lastTick: 0,
    lastFrame: 0,
    canvasClean: false
};
function getPartsRainRate() {
    if (partsPerSecond <= 0) return 0;
    // 0.08 = 0.1 reduit de 20 % : moins de pieces visibles a debit egal.
    // Plafond dur a 100 pieces/s : au-dela, la densite visuelle n'ajoute
    // rien et la lecture du panneau central en souffre.
    return Math.min(0.08 * Math.sqrt(partsPerSecond), 100);
}
function resizeRainCanvas() {
    const canvas = partsRain.canvas;
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    partsRain.dpr = dpr;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
}
// Pre-rend la piece dans un petit canvas offscreen (~48 px) : dessiner
// l'image 687x664 redimensionnee a 5-22 px pour chaque piece a chaque frame
// coutait tres cher et faisait decrocher le rendu sous les 60 fps.
function buildRainSprite() {
    const img = partsRain.coinImg;
    if (!img || !img.complete || !img.naturalWidth) return false;
    const spriteSize = 48;
    const off = document.createElement('canvas');
    off.width = spriteSize;
    off.height = spriteSize;
    const octx = off.getContext('2d');
    octx.drawImage(img, 0, 0, spriteSize, spriteSize);
    partsRain.sprite = off;
    return true;
}

function ensureRainCanvas() {
    if (partsRain.canvas) return true;
    const container = partsRain.container || document.getElementById('parts-rain');
    if (!container) return false;
    partsRain.container = container;
    const canvas = document.createElement('canvas');
    canvas.className = 'rain-canvas';
    container.appendChild(canvas);
    partsRain.canvas = canvas;
    partsRain.ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = 'images/parts.png';
    img.onload = buildRainSprite;
    partsRain.coinImg = img;
    window.addEventListener('resize', resizeRainCanvas);
    window.addEventListener('resize', refreshBonusBadgePosition);
    window.addEventListener('resize', fitCounterFontSize);
    resizeRainCanvas();
    partsRain.lastFrame = 0;
    requestAnimationFrame(rainFrame);
    return true;
}
function rainFrame(now) {
    requestAnimationFrame(rainFrame);
    const canvas = partsRain.canvas;
    const ctx = partsRain.ctx;
    if (!canvas || !ctx) return;
    const dt = Math.min((now - (partsRain.lastFrame || now)) / 1000, 0.1);
    // Horloge murale distincte : les timestamps rAF comptent depuis le
    // chargement de la page, pas l'epoch — les comparer a Date.now()
    // cassait le garde-fou de tickPartsRain et purgait la pluie a chaque tick.
    partsRain.lastFrame = now;
    partsRain.lastFrameWall = Date.now();
    if (canvas.width <= 1) { resizeRainCanvas(); return; }
    // Idle quasi gratuit : si rien a dessiner, on ne clear meme pas le canvas
    // (il l'a deja EtE au dernier passage) — la boucle RAF devient no-op.
    if (partsRain.suspended || partsRain.parts.length === 0) {
        if (!partsRain.canvasClean) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            partsRain.canvasClean = true;
        }
        return;
    }
    partsRain.canvasClean = false;
    // Reinitialiser la matrice a l'identite : la frame precedente peut avoir
    // laisse une transformation piece en place, faussant clearRect.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!partsRain.sprite && !buildRainSprite()) return;
    const sprite = partsRain.sprite;
    const parts = partsRain.parts;
    for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.angle += p.spinSpeed * dt;
        if (p.y - p.size > canvas.height) { parts.splice(i, 1); continue; }
        const flip = Math.cos(p.angle);
        // setTransform remplace save/translate/scale/restore : une seule
        // ecriture de matrice par piece au lieu de deux empilements de pile.
        ctx.setTransform(flip, 0, 0, 1, p.x, p.y);
        ctx.drawImage(sprite, -p.size / 2, -p.size / 2, p.size, p.size);
    }
}
function tickPartsRain(now) {
    if (!ensureRainCanvas()) return;
    if (partsRain.suspended) { partsRain.lastTick = now; partsRain.spawnDebt = 0; return; }
    const rate = getPartsRainRate();
    if (rate <= 0) { partsRain.lastTick = now; partsRain.spawnDebt = 0; return; }
    if (!partsRain.lastTick) partsRain.lastTick = now;
    // Garde anti-empilement : si requestAnimationFrame n'a pas rendu de frame
    // depuis longtemps (fenetre masquee sans visibilitychange, ecran veille,
    // throttling RAF du navigateur), le timer continuait a spawn des pieces
    // qui n'etaient ni animees ni supprimees — d'ou la pile qui tourne d'un
    // coup au retour. On purge tout tant que le rendu est fige.
    if (partsRain.lastFrameWall && now - partsRain.lastFrameWall > 1000) {
        partsRain.parts.length = 0;
        partsRain.spawnDebt = 0;
        partsRain.lastTick = now;
        return;
    }
    // Accumulateur : autorise plusieurs spawns par tick aux debits eleves,
    // tout en gardant le rythme exact aux faibles debits. Plafonne a 0.5 s de
    // dette (au lieu de 1 x rate) : meme aux tres hauts debits, aucune rafale
    // ne peut vider un stock de pieces d'un seul coup au retour.
    partsRain.spawnDebt = Math.min(partsRain.spawnDebt + (rate * (now - partsRain.lastTick)) / 1000, rate * 0.5);
    partsRain.lastTick = now;
    while (partsRain.spawnDebt >= 1) {
        partsRain.spawnDebt -= 1;
        spawnRainPart();
    }
}
// Purge de la pluie quand la page est masquee : au rechargement ou au retour
// d'onglet, aucune piece stockee ne doit se mettre a tourner d'un coup.
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        partsRain.suspended = true;
        partsRain.parts.length = 0;
        partsRain.spawnDebt = 0;
    } else {
        // Ne reactiver que si la vue affiche bien le panneau central :
        // sur mobile la navigation gere sa propre suspension.
        partsRain.suspended = (typeof isMobileLayout === 'function' && isMobileLayout() && mobileActiveView !== 'center');
        partsRain.lastTick = Date.now();
        resizeRainCanvas();
    }
});
function spawnRainPart() {
    const canvas = partsRain.canvas;
    if (!canvas || canvas.width <= 1) return;
    const dpr = partsRain.dpr;
    // Tailles variees : de minuscule (5px) a petite (22px), petit plus frequent.
    const size = (5 + Math.random() * Math.random() * 17) * dpr;
    const duration = 5 + Math.random() * 4;
    // Deviation laterale : trajectoire en diagonale, jamais parfaitement droite.
    const drift = (Math.random() - 0.5) * 160 * dpr;
    // Rotation sur elle-meme : vitesse et sens aleatoires, restituee en canvas
    // par un retournement horizontal (cos de l'angle), meme effet piece qui virevolte.
    const spin = (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 540);
    partsRain.parts.push({
        x: Math.random() * canvas.width,
        y: -40 * dpr,
        size,
        vx: drift / duration,
        vy: (canvas.height + 80 * dpr) / duration,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (spin * Math.PI / 180) / duration
    });
}

let buildingGainsCache = null;
let cachedGainPerBuilding = new Map();

function invalidateBuildingGainsCache() {
    buildingGainsCache = null;
}

function getBuildingGainsSnapshot() {
    if (buildingGainsCache === null) {
        let totalGain = 0;
        cachedGainPerBuilding = new Map();
        BUILDINGS.forEach(building => {
            const buildingGain = calculateBuildingGain(building);
            cachedGainPerBuilding.set(building.id, buildingGain);
            totalGain += buildingGain;
        });
        partsPerSecond = totalGain;
        buildingGainsCache = totalGain;
    }
    return buildingGainsCache;
}

function gameLoop() {
    getBuildingGainsSnapshot();
    tickPartsRain(Date.now());
    const now = Date.now();
    const dtSeconds = (now - lastGameTick) / 1000;
    lastGameTick = now;
    const tickGain = partsPerSecond * dtSeconds;
    const naturalTickGain = getBasePartsPerSecond() * dtSeconds;
    score += tickGain;
    partsSinceLaunch += tickGain;
    trackPartsEarned(tickGain);
    trackNaturalParts(naturalTickGain);
    updateLaunchTimer();
    if (dtSeconds > 0) {
        BUILDINGS.forEach(building => {
            if (building.count > 0) {
                totalGeneratedByBuilding[building.id] = (totalGeneratedByBuilding[building.id] || 0) + (cachedGainPerBuilding.get(building.id) || 0) * dtSeconds;
            }
        });
    }
    if (now - lastBuildingsUpdate > BUILDING_UPDATE_INTERVAL_MS) {
        lastBuildingsUpdate = now;
        updateAllBuildingButtons();
        refreshLiveTooltip();
        checkNewUpgrades();
    }
    if (now - lastRocketPartsUpdate > BUILDING_UPDATE_INTERVAL_MS) {
        lastRocketPartsUpdate = now;
        renderRocketPartsShop();
    }
    if (now - lastDisplayUpdate > DISPLAY_UPDATE_INTERVAL_MS) {
        lastDisplayUpdate = now;
        updateDisplay();
    }
    if (now - lastSpaceProgressUpdate > SPACE_UPDATE_INTERVAL_MS) {
        lastSpaceProgressUpdate = now;
        updateSpaceProgress();
    }
    if (now - lastSlowUpdate > SLOW_UPDATE_INTERVAL_MS) {
        lastSlowUpdate = now;
        checkBuildingUnlocks();
        refreshStatsLive();
        checkTrophies();
    }
}

// ============================================
// STATISTICS
// ============================================

function trackPartsEarned(amount) {
    if (!(amount > 0)) return;
    totalPartsEarnedAllTime += amount;
    totalPartsEarnedThisLaunch += amount;
}

// Parts "naturelles" gagnees depuis le debut du run : production de base (hors
// autoMultiplier) + Parts naturelles des clics. Les bonus instantanes (meteores)
// et les multiplicateurs temporaires sont exclus. Sert de base coherente au
// contrat de production, dont la cible est calculee sur le PPS naturel.
function trackNaturalParts(amount) {
    if (!(amount > 0)) return;
    naturalPartsThisLaunch += amount;
}
function calculateTotalGenerated() {
    let total = 0;
    for (const key in totalGeneratedByBuilding) {
        total += totalGeneratedByBuilding[key];
    }
    return total;
}
// Cumul des Parts generees depuis le dernier lancement : snapshot du total
// historique pris au moment du reset de la run (confirmPostTravelReset).
function calculateLaunchGenerated() {
    return Math.max(0, calculateTotalGenerated() - totalGeneratedAtLaunchStart);
}

function getClickPower() {
    const { baseCpC, buildingBonus, cpsBonus } = getClickComponents();
    return (baseCpC + buildingBonus + cpsBonus) * clickMultiplier * getClickPowerBonus();
}

function getTotalBuildingsOwned() {
    return BUILDINGS.reduce((total, building) => total + building.count, 0);
}

function getGameDuration() {
    if (!gameStartTime) return "N/A";
    
    const durationMs = Date.now() - gameStartTime;
    
    const totalSec = Math.floor(durationMs / 1000);
    const days = Math.floor(totalSec / 86400);
    if (days > 0) return days + t("jours") + ' ' + formatDurationHMS((totalSec % 86400) * 1000);
    return formatDurationHMS(durationMs);
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
                case 'speed':
                    unlocked = calculateTravelSpeedKmSBase() >= trophy.threshold;
                    break;
            }
            
            if (unlocked) {
                unlockedTrophies.add(trophy.id);
                Sounds.trophy();
                changed = true;
                showToast(`${t("Troph\u00e9e d\u00e9bloqu\u00e9 :")} ${t(trophy.name)}!`, trophy.icon, 5000);
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
    
    const familyOrder = ['pps', 'speed', 'planets', 'launches', 'stardust', 'building-upgrade', 'click-upgrade', 'building', 'score', 'bonus', 'building-types', 'cards'];
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
        // Couleur du palier : uniquement sur le bord du cercle, fond neutre.
        const family = trophiesByFamily[trophy.type] || [];
        const familyIndex = family.indexOf(trophy);
        const tierColor = getUpgradeTierColor(familyIndex);
        if (unlockedTrophies.has(trophy.id)) {
            trophyElement.style.border = '2px solid ' + tierColor;
            trophyElement.style.background = 'var(--secondary-light)';
            trophyElement.style.boxShadow = 'var(--shadow)';
            trophyElement.style.opacity = '1';
        } else {
            trophyElement.style.border = '1px solid var(--border)';
            trophyElement.style.background = 'var(--secondary)';
            trophyElement.style.opacity = '0.35';
            trophyElement.style.filter = 'grayscale(100%)';
        }
        
        const imgSize = (trophy.id === 'launch-1' || trophy.id === 'launch-5' || trophy.id === 'first-click-upgrade') ? '80%'
            : trophy.icon === 'images/parts.png' ? '100%'
            : '100%';
        // Trophée non débloqué : contenu masqué par un point d'interrogation.
        if (unlockedTrophies.has(trophy.id)) {
            trophyElement.innerHTML = trophy.icon.startsWith('images/')
                ? `<img src="${trophy.icon}" alt="${trophy.name}" style="width: ${imgSize}; height: ${imgSize}; object-fit: contain;">`
                : trophy.icon;
        } else {
            trophyElement.innerHTML = '?';
        }
        // Trophee verrouille : aucun tooltip, le contenu reste un mystere.
        if (unlockedTrophies.has(trophy.id)) {
            const showTrophyTooltip = (target) => {
                const rect = target.getBoundingClientRect();
                const name = t(trophy.name);
                const description = t(trophy.description);
                showTooltip(`${name}\n${description}\n${t('D\u00e9bloqu\u00e9')}`, rect.left + rect.width/2, rect.top, { anchorBottom: rect.bottom });
            };
            if (!IS_TOUCH) {
                trophyElement.addEventListener('mouseenter', (e) => showTrophyTooltip(e.target));
                trophyElement.addEventListener('mouseleave', hideTooltip);
            } else {
                trophyElement.addEventListener('click', (e) => {
                    if (touchTooltipElement === trophyElement) {
                        touchTooltipElement = null;
                        hideTooltip();
                    } else {
                        touchTooltipElement = trophyElement;
                        showTrophyTooltip(trophyElement);
                    }
                    e.stopPropagation();
                });
            }
        }
        
        trophiesGrid.appendChild(trophyElement);
    });
    
    container.appendChild(trophiesGrid);
    return container;
}

let lastStatsRender = 0;

function statsStructureKey() {
    return [
        gameLanguage,
        activatedClickUpgrades.join(','),
        Object.keys(buildingUpgrades).map(id => id + ':' + ((buildingUpgrades[id] || []).length)).join(','),
        unlockedTrophies.size,
        [...unlockedTrophies].join(',')
    ].join('|');
}

function refreshStatsLive() {
    const modal = document.getElementById('stats-modal');
    if (!modal || !modal.classList.contains('active')) return;
    const now = Date.now();
    const container = document.getElementById('stats-body');
    if (!container) return;
    const key = statsStructureKey();
    if (container.dataset.structureKey !== key) {
        const scrollTop = container.scrollTop;
        renderStats();
        container.dataset.structureKey = key;
        container.scrollTop = scrollTop;
        return;
    }
    if (now - lastStatsRender < 1000) return;
    lastStatsRender = now;
    updateStatsDynamicValues(container);
}

function updateStatsDynamicValues(container) {
    const values = [
        formatNumber(score, true),
        formatNumber(totalPartsEarnedAllTime),
        formatNumber(totalPartsEarnedThisLaunch),
        formatNumber(partsPerSecond),
        'x' + getTotalProductionMultiplier().toFixed(2),
        formatNumber(getClickPower()),
        formatNumber(getTotalBuildingsOwned()),
        formatTravelSpeed(calculateTravelSpeedKmS()),
        getGameDuration(),
        String(clickedBonusesCount)
    ];
    container.querySelectorAll('[data-stat-value]').forEach(el => {
        const idx = parseInt(el.dataset.statValue, 10);
        if (!Number.isNaN(idx) && values[idx] !== undefined) el.textContent = values[idx];
    });
    const bonusTitle = container.querySelector('[data-trophies-bonus]');
    if (bonusTitle) bonusTitle.textContent = '(+' + (unlockedTrophies.size * 1) + '%)';
}

function renderStats() {
    const container = document.getElementById('stats-body');
    container.innerHTML = '';
    container.innerHTML += '<h4 style="margin: 0 0 8px; color: #2563eb; font-size: 1.1rem;">' + t('Statistiques Globales') + '</h4>';
    const globalStats = [
        { label: t("Parts actuelles"), value: formatNumber(score, true) },
        { label: t("Total Parts g\u00e9n\u00e9r\u00e9s"), value: formatNumber(totalPartsEarnedAllTime) },
        { label: t("Parts g\u00e9n\u00e9r\u00e9s pour ce lancement"), value: formatNumber(totalPartsEarnedThisLaunch) },
        { label: t("Parts par seconde"), value: formatNumber(partsPerSecond) },
        { label: t("Multiplicateur de production"), value: 'x' + getTotalProductionMultiplier().toFixed(2) },
        { label: t("Parts par clic"), value: formatNumber(getClickPower()) },
        { label: t("B\u00e2timents poss\u00e9d\u00e9s au total"), value: formatNumber(getTotalBuildingsOwned()) },
        { label: t("Vitesse de voyage"), value: formatTravelSpeed(calculateTravelSpeedKmS()) },
        { label: t("Partie commenc\u00e9e"), value: getGameDuration() },
        { label: t("Com\u00e8tes D\u00e9truites"), value: clickedBonusesCount }
    ];

    globalStats.forEach(stat => {
        const statElement = document.createElement('div');
        statElement.style.display = 'flex';
        statElement.style.justifyContent = 'space-between';
        statElement.style.padding = '8px 0';
        statElement.style.borderBottom = '1px solid #e2e8f0';
        statElement.innerHTML = `
            <span style="color: #64748b; font-size: 0.9rem;">${stat.label}</span>
            <span style="color: #2563eb; font-weight: 600;" data-stat-value="${globalStats.indexOf(stat)}">${stat.value}</span>
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
            const levelColor = getUpgradeTierColor(upgrades.length - 1);
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

    container.innerHTML += '<h4 style="margin: 16px 0 8px; color: #2563eb; font-size: 1.1rem;">' + t('Troph\u00e9es') + ' <span style="color: #16a34a;" data-trophies-bonus>(+' + (unlockedTrophies.size * 1) + '%)</span>' + '</h4>';
    const trophiesSection = renderTrophies();
    container.appendChild(trophiesSection);
    container.dataset.structureKey = statsStructureKey();
}

// ============================================
// MODALS
// ============================================

const EXCLUSIVE_MODALS = ['stats-modal', 'settings-modal', 'contracts-modal', 'card-collection-modal', 'galactic-shop-modal'];
function showExclusiveModal(modalId, onOpen) {
    const target = document.getElementById(modalId);
    const wasActive = target.classList.contains('active');
    EXCLUSIVE_MODALS.forEach(id => {
        if (id !== modalId) {
            const el = document.getElementById(id);
            // Ne jamais masquer l'atelier galactique pendant le blocage post-voyage
            if (id === 'galactic-shop-modal' && postTravelLock) return;
            el.classList.remove('active');
        }
    });
    if (wasActive) {
        target.classList.remove('active');
    } else {
        target.classList.add('active');
        if (onOpen) onOpen();
    }
}
function toggleSettings() {
    showExclusiveModal('settings-modal');
}

function toggleStats() {
    showExclusiveModal('stats-modal', renderStats);
}

// ============================================
// DISPLAY
// ============================================

let displayElementsCache = null;

function getDisplayElements() {
    if (displayElementsCache === null) {
        displayElementsCache = {
            scoreValue: document.getElementById('score-value'),
            gainValue: document.getElementById('gain-value'),
            modalPartsValues: Array.from(document.querySelectorAll('.modal-parts-value')),
            modalPartsGains: Array.from(document.querySelectorAll('.modal-parts-gain')),
            stardustValues: Array.from(document.querySelectorAll('#stardust-value, #stardust-value-2')),
            bonusTimer: document.getElementById('bonus-timer')
        };
    }
    return displayElementsCache;
}

function updateDisplay() {
    getBuildingGainsSnapshot();
    const els = getDisplayElements();
    if (els.gainValue) els.gainValue.textContent = formatNumber(partsPerSecond);
    updateModalPartsCounter();
    updateStardustDisplay();
    updateStardustPreview();
    updateBonusTimer();
}

// Compteur fluide : la valeur affichee rattrape le score reel en douceur,
// et chaque chiffre qui change deroule comme une machine a sous.
let animatedScore = null;
// Ruban vertical type odometre : chaque colonne contient les 10 chiffres
// empiles ; changer de chiffre deplace le ruban (transition CSS douce).
// L'effet reste fluide meme si la valeur change a chaque frame.
function splitCounterText(text) {
    const segs = [];
    let i = 0;
    while (i < text.length) {
        const isDigit = /\d/.test(text[i]);
        let j = i;
        while (j < text.length && /\d/.test(text[j]) === isDigit) j++;
        segs.push({ digits: isDigit, str: text.slice(i, j) });
        i = j;
    }
    return segs;
}
// Hauteur de colonne en pixels entiers : une hauteur fractionnaire fait
// reposer le ruban sur un sous-pixel different selon le chiffre affiche
// (rendu de police legerement variable d'une ligne a l'autre). On snappe
// donc la hauteur sur un entier et on deplace le ruban en px entiers.
function syncCchHeight(el) {
    if (!el) return;
    let h = Math.round(parseFloat(getComputedStyle(el).fontSize) * 1.5);
    if (!Number.isFinite(h) || h <= 0) h = 20;
    if (el.__cchH !== h) {
        el.__cchH = h;
        el.style.setProperty('--cch-h', h + 'px');
        el.__segs = null;
    }
}
function makeDigitCol() {
    const col = document.createElement('span');
    col.className = 'cch';
    const reel = document.createElement('span');
    reel.className = 'cch-reel';
    for (let d = 0; d < 10; d++) {
        const dn = document.createElement('span');
        dn.className = 'digit';
        dn.textContent = String(d);
        reel.appendChild(dn);
    }
    col.appendChild(reel);
    return { col, reel };
}
function renderCounterChars(el, text) {
    if (!el) return;
    syncCchHeight(el);
    const segs = splitCounterText(text);
    const prev = el.__segs;
    const sameShape = prev
        && prev.length === segs.length
        && prev.every((p, k) => p.digits === segs[k].digits);
    if (!sameShape) {
        while (el.firstChild) el.removeChild(el.firstChild);
        const nodes = [];
        segs.forEach(seg => {
            if (!seg.digits) {
                const tn = document.createElement('span');
                tn.className = 'cch-sep';
                tn.textContent = seg.str;
                el.appendChild(tn);
                nodes.push(tn);
            } else {
                const wrap = document.createElement('span');
                wrap.className = 'cch-group';
                const cols = [];
                for (const ch of seg.str) {
                    const c = makeDigitCol();
                    c.reel.style.transform = 'translateY(-' + (ch * el.__cchH) + 'px)';
                    wrap.appendChild(c.col);
                    cols.push(c.reel);
                }
                el.appendChild(wrap);
                nodes.push(cols);
            }
        });
        el.__segs = segs.map(sg => ({ digits: sg.digits, len: sg.str.length }));
        el.__nodes = nodes;
        return;
    }
    const nodes = el.__nodes;
    segs.forEach((seg, k) => {
        if (!seg.digits) {
            if (nodes[k] && nodes[k].textContent !== seg.str) nodes[k].textContent = seg.str;
            return;
        }
        const cols = nodes[k];
        const oldLen = el.__segs[k].len;
        const newLen = seg.str.length;
        if (newLen === oldLen) {
            for (let c = 0; c < newLen; c++) {
                const target = 'translateY(-' + (seg.str[c] * el.__cchH) + 'px)';
                if (cols[c].style.transform !== target) cols[c].style.transform = target;
            }
        } else {
            const wrap = cols[0].closest('.cch-group');
            if (newLen === oldLen + 1) {
                const c = makeDigitCol();
                c.reel.style.transform = 'translateY(-' + (seg.str[0] * el.__cchH) + 'px)';
                wrap.insertBefore(c.col, wrap.firstChild);
                cols.unshift(c.reel);
                for (let ci = 1; ci < newLen; ci++) {
                    const target = 'translateY(-' + (seg.str[ci] * el.__cchH) + 'px)';
                    if (cols[ci].style.transform !== target) cols[ci].style.transform = target;
                }
            } else {
                while (wrap.firstChild) wrap.removeChild(wrap.firstChild);
                const newCols = [];
                for (const ch of seg.str) {
                    const c = makeDigitCol();
                    c.reel.style.transform = 'translateY(-' + (ch * el.__cchH) + 'px)';
                    wrap.appendChild(c.col);
                    newCols.push(c.reel);
                }
                nodes[k] = newCols;
            }
            el.__segs[k].len = newLen;
        }
    });
}
// Auto-ajustement de la police du compteur : si les chiffres debordent de
// leur boite (petits ecrans PC / tablette paysage avec grands nombres),
// on reduit la font-size du .counter conteneur jusqu'a ce que tout rentre.
// Reaugmente progressivement quand l'espace redevient suffisant.
function fitCounterFontSize() {
    // Adaptation directe a la largeur de l'encadre : on repart de la
    // taille CSS de base a chaque passe (retour automatique a la taille
    // normale quand l'espace redevient suffisant), puis on reduit
    // d'un coup jusqu'a ce que tout le nombre tienne dans la boite,
    // au lieu de rogner les chiffres (tablette paysage, grands nombres).
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const boxes = Array.from(document.querySelectorAll('.hud-top-row .counter'));
    boxes.forEach(box => {
        if (box.style.fontSize) {
            box.style.fontSize = '';
            void box.offsetWidth;
        }
    });
    // Taille homogene : les deux compteurs partagent la police du plus
    // contraint d'entre eux, sinon un compteur retreci et pas l'autre.
    const basePx = boxes.length ? (parseFloat(getComputedStyle(boxes[0]).fontSize) || rootPx * 1.6) : 0;
    let common = basePx;
    boxes.forEach(box => {
        let fs = basePx;
        let guard = 0;
        while ((box.scrollWidth > box.clientWidth + 1 || box.scrollHeight > box.clientHeight + 1) && fs > rootPx * 0.6 && guard < 24) {
            fs = Math.max(rootPx * 0.6, fs * 0.92);
            box.style.fontSize = fs + 'px';
            guard++;
        }
        common = Math.min(common, fs);
        if (box.style.fontSize) box.style.fontSize = '';
    });
    boxes.forEach(box => { box.style.fontSize = common + 'px'; });
}
setInterval(fitCounterFontSize, 500);
window.addEventListener('orientationchange', () => setTimeout(refreshBonusBadgePosition, 250));
document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(fitCounterFontSize); });
function counterAnimLoop() {
    const el = getDisplayElements().scoreValue;
    if (el) {
        // Afficher la valeur reelle au moment du tick, meme si elle a evolue
        // plusieurs fois entre deux ticks : pas de rattrapage progressif.
        const shown = score < 1000
            ? Math.round(score * 10) / 10
            : Math.round(score);
        const text = shown < 1000 ? shown.toFixed(1) : formatNumber(shown, true);        renderCounterChars(el, text);
    }
    setTimeout(counterAnimLoop, 250);
}
setTimeout(counterAnimLoop, 250);

function rollCounterText(el, text) {
    renderCounterChars(el, text);
}

function updateModalPartsCounter() {
    const els = getDisplayElements();
    const hasOpenModal = document.querySelector('.modal.active') !== null;
    if (!hasOpenModal) return;
    // Meme odometer que le compteur principal : le rendu anime est conserve
    // dans les modales atelier et collection.
    els.modalPartsValues.forEach(el => { rollCounterText(el, formatNumber(score, true)); });
    els.modalPartsGains.forEach(el => { rollCounterText(el, formatNumber(partsPerSecond)); });
}

function updateStardustDisplay() {
    const els = getDisplayElements();
    const text = formatNumber(starDust);
    els.stardustValues.forEach(el => { rollCounterText(el, text); });
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

// Re-evalue la position du badge de bonus (a cote ou sous le compteur)
// apres un redimensionnement de la fenetre.
function refreshBonusBadgePosition() {
    const badge = document.getElementById('bonus-timer');
    if (!badge || badge.style.display === 'none') return;
    const badgeRow = badge.closest('.hud-counters-row');
    // Parent contraignant : .hud-top-row (max-width calc(100cqw - 24cqw)),
    // PAS .center-panel : sur tablette paysage le badge pouvait sembler
    // tenir dans le panneau central alors qu'il debordait de la zone HUD.
    const panel = badgeRow?.parentElement;
    if (!badgeRow || !panel) return;
    const rowRect = badgeRow.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const badgeW = badge.getBoundingClientRect().width;
    const fitsRight = rowRect.right + 8 + badgeW <= panelRect.right - 8;
    const fitsLeft = rowRect.left - 8 - badgeW >= panelRect.left + 8;
    badge.classList.toggle('bonus-below', !(fitsRight || fitsLeft));
}

function updateBonusTimer() {
    const els = getDisplayElements();
    if (els.bonusTimer) {
        const repositionBadge = () => {
            const badgeRow = els.bonusTimer.closest('.hud-counters-row');
            const panel = badgeRow ? badgeRow.parentElement : null;
            if (!badgeRow || !panel) return;
            const rowRect = badgeRow.getBoundingClientRect();
            const panelRect = panel.getBoundingClientRect();
            const badgeW = els.bonusTimer.getBoundingClientRect().width;
            const fitsRight = rowRect.right + 8 + badgeW <= panelRect.right - 8;
            const fitsLeft = rowRect.left - 8 - badgeW >= panelRect.left + 8;
            els.bonusTimer.classList.toggle('bonus-below', !(fitsRight || fitsLeft));
        };
        // Affiche le multiplicateur temporaire actif et le temps restant
        // (ex: "×5 · 12 s") a cote du compteur tant que le bonus dure.
        const active = activeRandomBonuses.find(b => (b.effect === 'multiplier' || b.effect === 'click' || b.id === 'flare') && b.endTime > Date.now());
        if (active && active.multiplier) {
            const secLeft = Math.ceil((active.endTime - Date.now()) / 1000);
            const label = active.effect === 'click'
                ? t('Clic') + ' ×' + active.multiplier
                : '×' + active.multiplier;
            els.bonusTimer.textContent = label + ' · ' + secLeft + ' s';
            // 'block' explicite : le CSS de .bonus-timer est display:none,
            // style.display='' retirerait le style inline et le cacherait.
            els.bonusTimer.style.display = 'block';
            // Refroidissement force : garantit que la largeur mesuree du
            // badge (et donc le bascule bonus-below) correspond au texte
            // reellement affiche, meme au premier rendu de la frame.
            void els.bonusTimer.offsetWidth;
            repositionBadge();
        } else {
            els.bonusTimer.textContent = '';
            els.bonusTimer.style.display = 'none';
            els.bonusTimer.classList.remove('bonus-below');
        }
    }
    const countersEl = document.querySelector('.counters');
    if (!countersEl) return;
    const hasBonus = activeRandomBonuses.some(b => b.effect === 'multiplier' || b.id === 'flare');
    countersEl.classList.toggle('bonus-active', hasBonus);
    // Le boost temporaire multiplie aussi la vitesse (partsPerSecond inclus
    // autoMultiplier) : meme effet rainbow sur la tuile Vitesse.
    const speedTile = document.getElementById('sidebar-speed');
    if (speedTile) speedTile.closest('.stat-tile')?.classList.toggle('bonus-active', hasBonus);
}

// ============================================
// CONTRATS DE FABRICATION (mini-jeu)
// Contrats INTERACTIFS de 30 secondes : le joueur doit realiser une
// action pendant la duree (cliquer, intercepter des cometes, produire)
// pour gagner des Parts instantanees ou des bonus temporaires.
// 5 types de contrats, chacun en 3 difficultes (prix et gains croissants).
// Rotation des offres toutes les 2 minutes ; un contrat a la fois.
// ============================================
const CONTRACT_ROTATION_MS = 2 * 60 * 1000;
const CONTRACT_DURATION_MS = 30 * 1000;
const CONTRACT_UNLOCK_BUILDING_TYPES = 2;
const CARD_COLLECTION_UNLOCK_BUILDING_TYPES = 4;

// Definitions des types de contrats interactifs.
// objective     : cle d'i18n decrivant l'objectif (avec {target})
// track         : comment la progression est mesurEe
// rewardType    : 'instant' (Parts instantanees) | 'mult' (multiplicateur temporaire) | 'click' (multiplicateur de clic temporaire)
function getContractTypes() {
    const pps = Math.max(1, getBasePartsPerSecond());
    const clickParts = Math.max(1, getNaturalClickParts());
    return [
        {
            id: 'clicks',
            icon: 'images/parts.png',
            // Objectif : nombre de clics sur la piece pendant 30 s
            objective: 'Cliquez {target} fois sur la piece',
            track: 'clicks',
            diffs: [
                { target: 60,  price: Math.max(5, pps * 5),  rewardMult: 2,   rewardType: 'instant', instantSec: 30 },
                { target: 90, price: Math.max(50, pps * 12), rewardMult: 3,   rewardType: 'instant', instantSec: 60 },
                { target: 180, price: Math.max(200, pps * 30), rewardMult: 5,   rewardType: 'instant', instantSec: 80 }
            ]
        },
        {
            id: 'clickParts',
            icon: 'images/cursor.svg',
            // Objectif : Parts produites en cliquant pendant 30 s
            objective: 'Produisez {target} Parts en cliquant',
            track: 'clickParts',
            diffs: [
                { target: Math.max(60, clickParts * 60), price: Math.max(5, pps * 6),  rewardMult: 2, rewardType: 'mult', mult: 2, duration: 30 },
                { target: Math.max(90, clickParts * 90), price: Math.max(20, pps * 15), rewardMult: 3, rewardType: 'mult', mult: 3, duration: 45 },
                { target: Math.max(180, clickParts * 180), price: Math.max(75, pps * 35), rewardMult: 5, rewardType: 'mult', mult: 4, duration: 45 }
            ]
        },
        {
            id: 'comets',
            icon: 'images/effects/missile.png',
            // Objectif : intercepter des cometes pour proteger la fusee
            objective: 'Defense parfaite : aucune comete ne doit toucher la fusee ({target} cometes)',
            track: 'comets',
            diffs: [
                { target: 4, price: Math.max(12, pps * 8),  rewardMult: 2, rewardType: 'instant', instantSec: 45 },
                { target: 7, price: Math.max(100, pps * 20), rewardMult: 3, rewardType: 'instant', instantSec: 90 },
                { target: 11, price: Math.max(375, pps * 45), rewardMult: 5, rewardType: 'instant', instantSec: 120 }
            ]
        },
        {
            id: 'production',
            icon: 'images/buildings/factory.png',
            // Objectif : produire un quota de Parts (toute production confondue)
            objective: 'Produisez {target} Parts (toutes sources)',
            track: 'parts',
            diffs: [
                { target: Math.max(50, pps * 22),  price: Math.max(5, pps * 5),  rewardMult: 2, rewardType: 'click', clickMult: 2, duration: 30 },
                { target: Math.max(150, pps * 40), price: Math.max(20, pps * 12), rewardMult: 3, rewardType: 'click', clickMult: 3, duration: 45 },
                // Cible atteignable : le contrat dure 30 s, la production
                // passive y vaut pps*30 — pps*40 demande ~33% d'apport actif
                // (clics, boost), contre pps*70 (233%) quasi impossible.
                { target: Math.max(500, pps * 40), price: Math.max(75, pps * 28), rewardMult: 5, rewardType: 'click', clickMult: 4, duration: 45 }
            ]
        },
        {
            id: 'shower',
            icon: 'images/effects/comete.png',
            // Objectif : attraper les cometes d'une pluie provoquee pour le contrat
            objective: 'Survivez a la pluie : attrapez {target} cometes',
            track: 'comets',
            diffs: [
                { target: 5, price: Math.max(20, pps * 10), rewardMult: 3, rewardType: 'instant', instantSec: 60, shower: 6 },
                { target: 8, price: Math.max(150, pps * 25), rewardMult: 4, rewardType: 'instant', instantSec: 120, shower: 9 },
                { target: 12, price: Math.max(500, pps * 55), rewardMult: 6, rewardType: 'instant', instantSec: 150, shower: 14 }
            ]
        }
    ];
}

let contractState = {
    offers: [],
    nextRotationAt: 0,
    active: null,
    unlockedSeen: false,
    offersSeenIds: []
};

function areCardsUnlocked() {
    return getUnlockedBuildingTypes() >= CARD_COLLECTION_UNLOCK_BUILDING_TYPES;
}
function areContractsUnlocked() {
    return getUnlockedBuildingTypes() >= CONTRACT_UNLOCK_BUILDING_TYPES;
}

// Genere 2 a 3 offres aleatoires parmi les 5 types, difficultes variees.
function generateContractOffers() {
    const now = Date.now();
    const types = getContractTypes();
    const picked = [];
    const pool = types.slice();
    const n = Math.min(3, pool.length);
    for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        const type = pool.splice(idx, 1)[0];
        // Difficulte ponderee vers le milieu : 40% normal, 35% facile, 25% difficile.
        const roll = Math.random();
        const diffIdx = roll < 0.35 ? 0 : (roll < 0.75 ? 1 : 2);
        const diff = type.diffs[diffIdx];
        picked.push({
            id: 'contract-' + type.id + '-' + diffIdx + '-' + now + '-' + Math.floor(Math.random() * 1e6),
            typeId: type.id,
            diffIdx: diffIdx,
            target: Math.max(1, Math.floor(diff.target)),
            price: Math.floor(diff.price),
            rewardType: diff.rewardType,
            instantSec: diff.instantSec || 0,
            clickMult: diff.clickMult || 0,
            mult: diff.mult || 0,
            duration: diff.duration || 0,
            shower: diff.shower || 0,
            expiresAt: now + CONTRACT_ROTATION_MS
        });
    }
    contractState.offers = picked;
    contractState.nextRotationAt = now + CONTRACT_ROTATION_MS;
    if (typeof renderContracts === 'function' && document.getElementById('contracts-modal').classList.contains('active')) {
        renderContracts();
    }
}

function findContractType(typeId) {
    return getContractTypes().find(tp => tp.id === typeId) || null;
}
// Icone de contrat : image du jeu (piece, curseur, missile, usine, comete).
function contractIconHtml(type, cls) {
    if (!type) return '';
    return '<img src="' + type.icon + '" class="' + (cls || 'contract-icon') + '" alt="">';
}

function getContractPrice() {
    return Math.max(50, Math.floor(getBasePartsPerSecond() * 20));
}

function contractObjectiveText(offer) {
    const type = findContractType(offer.typeId);
    if (!type) return '';
    return tf(type.objective, { target: formatNumber(offer.target) });
}

function contractRewardText(offer) {
    const pps = Math.max(1, getBasePartsPerSecond());
    if (offer.rewardType === 'instant') {
        return tf('Gains : +{parts} Parts instantanees', { parts: formatNumber(Math.floor(pps * offer.instantSec)) });
    }
    if (offer.rewardType === 'mult') {
        return tf('Gains : production x{mult} pendant {sec} s', { mult: offer.mult, sec: offer.duration });
    }
    if (offer.rewardType === 'click') {
        return tf('Gains : clic x{mult} pendant {sec} s', { mult: offer.clickMult, sec: offer.duration });
    }
    return '';
}

function openContracts() {
    if (!areContractsUnlocked()) {
        showToast('\uD83D\uDD12 ' + tf('Debloque {count} types de batiments pour les contrats', { count: CONTRACT_UNLOCK_BUILDING_TYPES }));
        return;
    }
    // Le joueur a vu les contrats : le pulse d'attention s'eteint.
    clearPulseHint(document.getElementById('contracts-card-status')?.closest('.mini-game-card'));
    showExclusiveModal('contracts-modal', renderContracts);
}
function closeContracts() {
    document.getElementById('contracts-modal').classList.remove('active');
}

function acceptContract(offerId) {
    Sounds.contractAccept();
    const offer = contractState.offers.find(o => o.id === offerId);
    if (!offer) return;
    if (contractState.active) {
        showToast('\u26A0\uFE0F ' + t('Un contrat a la fois !'));
        return;
    }
    if (score < offer.price) {
        Sounds.lose();
        showToast('\u274C ' + t('Pas assez de Parts'));
        return;
    }
    score -= offer.price;
    partsSinceLaunch = Math.max(0, partsSinceLaunch - offer.price);
    contractState.active = {
        offerId: offer.id,
        typeId: offer.typeId,
        target: offer.target,
        progress: 0,
        rewardType: offer.rewardType,
        instantSec: offer.instantSec,
        clickMult: offer.clickMult,
        mult: offer.mult,
        duration: offer.duration,
        shower: offer.shower,
        startTotal: totalPartsEarnedThisLaunch,
        naturalStartTotal: naturalPartsThisLaunch,
        startClickParts: totalPartsFromClicks,
        acceptedAt: Date.now(),
        expiresAt: Date.now() + CONTRACT_DURATION_MS
    };
    contractState.offers = contractState.offers.filter(o => o.id !== offer.id);
    const type = findContractType(offer.typeId);
    showToast('\u2705 ' + t('Contrat accepte !'), type ? type.icon : null);
    // Contrat "pluie" : on declenche SA pluie immediatement, les cometes
    // a attraper sont celles du contrat.
    if (offer.shower) {
        triggerContractShower(offer.shower);
    }
    // Contrat "cometes" : on fait tomber les cometes a intercepter.
    if (offer.typeId === 'comets' && !offer.shower) {
        // Defense parfaite : on lance exactement la cible — le joueur doit
        // toutes les intercepter, rater UNE seule fait echouer le contrat.
        triggerContractShower(offer.target);
    }
    if (offer.typeId === 'comets' || offer.shower) {
        showToast('\u2604\uFE0F ' + t('Des cometes arrivent ! Interception !'), null);
    }
    // La modale se ferme : le contrat se joue en direct sur la scene,
    // le joueur doit voir la fusee, la piece, les cometes.
    closeContracts();
    clearPulseHint(document.getElementById('contracts-card-status')?.closest('.mini-game-card'));
    saveGame();
}

// Pluie dediee au contrat : meme mecanique que startCometShower mais sans
// verrou cometShowerActive (les pluies de contrat sont independantes).
function triggerContractShower(count) {
    // Les cometes lancees ici sont des cometes de CONTRAT (aucun bonus direct
    // de parts), a distinguer des pluies naturelles qui, elles, en donnent.
    // Les cometes sont lancees UNE PAR UNE avec un intervalle fixe de
    // 0,33 seconde entre chaque : le rythme reste soutenu sans decomployer
    // la pluie d'un seul coup.
    // Sur mobile on MAINTIENT le nombre de cometes prevues : la reduction
    // a 60% rendait les contrats IMPOSSIBLES (defense parfaite facile :
    // cible 4, seulement 3 cometes lancees). Le contrat doit toujours etre
    // gagnable, on garde donc le compte exact.
    const COUNT = count;
    const COMET_INTERVAL_MS = 330;
    // Suivi de la pluie du contrat : le total prevu, combien sont lancees
    // et combien sont encore en vol. Sert a echouer DES la derniere comete
    // passe si la cible n'est plus atteignable (plus de cometes a venir).
    if (contractState.active) {
        contractState.active.showerTotal = COUNT;
        contractState.active.showerLaunched = 0;
        contractState.active.showerInFlight = 0;
    }
    for (let k = 0; k < COUNT; k++) {
        setTimeout(() => {
            if (!contractState.active) return;
            contractState.active.showerLaunched += 1;
            contractState.active.showerInFlight += 1;
            spawnRandomBonus(true, true);
        }, k * COMET_INTERVAL_MS);
    }
}

// Hook appele depuis addScore (clics sur la piece) : alimente les contrats
// de type 'clicks' et 'clickParts'.
function notifyContractClick(points) {
    const c = contractState.active;
    if (!c) return;
    if (c.typeId === 'clicks') {
        c.progress += 1;
    } else if (c.typeId === 'clickParts') {
        c.progress += points;
    }
    updateContractHud();
}

// Hook appele quand une comete est interceptee/attrapee (clickedBonusesCount
// vient d'incrementer) : alimente les contrats 'comets' et 'shower'.
function notifyContractComet() {
    const c = contractState.active;
    if (!c) return;
    if (c.typeId === 'comets' || c.typeId === 'shower') {
        c.progress += 1;
        updateContractHud();
    }
}

function updateContractProgress() {
    const c = contractState.active;
    if (!c) return;
    // Contrat "production" : Parts naturelles gagnees toutes sources confondues
    // (production de base + clics naturels), coherentes avec la cible calculee
    // sur le PPS naturel. Les boosts temporaires ne faussent plus la progression.
    if (c.typeId === 'production') {
        c.progress = Math.max(0, naturalPartsThisLaunch - (c.naturalStartTotal || 0));
    }
    // clicks / clickParts / comets : progression incrementee par les hooks.
    if (c.progress >= c.target) {
        completeContract();
    }
}

function completeContract() {
    Sounds.contractDone();
    const c = contractState.active;
    if (!c) return;
    const pps = Math.max(1, getBasePartsPerSecond());
    if (c.rewardType === 'instant') {
        const gain = Math.floor(pps * c.instantSec);
        score += gain;
        partsSinceLaunch += gain;
        trackPartsEarned(gain);
        showBonusPopup('+' + formatNumber(gain) + ' ' + t('Parts'), 'instant');
        showToast(tf('Contrat rempli ! +{parts} Parts', { parts: formatNumber(gain) }), 'images/parts.png');
    } else if (c.rewardType === 'mult') {
        activateContractTempMultiplier(c.mult, c.duration * 1000);
        showToast(tf('Contrat rempli ! Production x{mult} pendant {sec} s', { mult: c.mult, sec: c.duration }), null);
    } else if (c.rewardType === 'click') {
        activateContractTempClickMultiplier(c.clickMult, c.duration * 1000);
        showToast(tf('Contrat rempli ! Clic x{mult} pendant {sec} s', { mult: c.clickMult, sec: c.duration }), null);
    }
    contractState.active = null;
    contractState.offers = [];
    contractState.nextRotationAt = Date.now() + CONTRACT_ROTATION_MS;
    updateDisplay();
    updateContractHud();
    checkTrophies();
    saveGame();
}

// Multiplicateur de production temporaire accorde par un contrat : passe
// par le meme canal que la flare (activeRandomBonuses) pour profiter du
// rainbow et du timer existants, avec un id distinct.
function activateContractTempMultiplier(mult, durationMs) {
    const endTime = Date.now() + durationMs;
    activeRandomBonuses.push({
        id: 'contract-mult',
        effect: 'multiplier',
        multiplier: mult,
        endTime: endTime
    });
    rebuildAutoMultipliers();
    updateDisplay();
    setTimeout(() => {
        activeRandomBonuses = activeRandomBonuses.filter(bonus => bonus.endTime !== endTime);
        rebuildAutoMultipliers();
        updateDisplay();
    }, durationMs);
}

// Multiplicateur de clic temporaire accorde par un contrat.
function activateContractTempClickMultiplier(mult, durationMs) {
    const endTime = Date.now() + durationMs;
    activeRandomBonuses.push({
        id: 'contract-click',
        effect: 'click',
        multiplier: mult,
        endTime: endTime
    });
    rebuildAutoMultipliers();
    updateDisplay();
    setTimeout(() => {
        activeRandomBonuses = activeRandomBonuses.filter(bonus => bonus.endTime !== endTime);
        rebuildAutoMultipliers();
        updateDisplay();
    }, durationMs);
}

function failContract() {
    Sounds.contractFail();
    const c = contractState.active;
    if (!c) return;
    // Defense parfaite : echec cause par UNE comete ratee, pas par le temps.
    // Message distinct pour que le joueur comprenne pourquoi il a perdu.
    const missedComet = c.failed && c.typeId === 'comets';
    const failMsg = missedComet
        ? t('Defense parfaite echouee : une comete a frappe la fusee !')
        : (c.typeId === 'shower' && c.failed
            ? t('Trop de cometes ratees... Le contrat est perdu.')
            : t('Contrat echoue... Le temps est ecoule.'));
    showToast('\u274C ' + failMsg, null, undefined, { failure: true });
    contractState.active = null;
    contractState.offers = [];
    contractState.nextRotationAt = Date.now() + CONTRACT_ROTATION_MS;
    updateContractHud();
    saveGame();
}

function tickContracts() {
    const now = Date.now();
    if (areContractsUnlocked() && !contractState.unlockedSeen) {
        contractState.unlockedSeen = true;
        if (contractState.offers.length === 0 && !contractState.active) {
            generateContractOffers();
        }
    }
    const rotationPaused = !!contractState.active;
    if (!rotationPaused && areContractsUnlocked()
        && (contractState.nextRotationAt === 0 || now >= contractState.nextRotationAt)) {
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
    renderCollectionCardStatus();
    updateContractHud();
}
function renderCollectionCardStatus() {
    const statusEl = document.getElementById('collection-card-status');
    if (!statusEl) return;
    // Badge informatif dans la case du mini-jeu : cartes / total + bonus,
    // visible des le deblocage de la collection.
    const ccbOwned = document.getElementById('ccb-owned');
    if (ccbOwned) {
        const collected = Object.keys(cardCollection).filter(id => cardCollection[id] > 0);
        ccbOwned.textContent = collected.length;
        document.getElementById('ccb-total').textContent = COLLECTIBLE_CARDS.length;
        document.getElementById('ccb-bonus').textContent = '\u00d7' + getCollectionMultiplier().toFixed(2);
    }
    if (!areCardsUnlocked()) {
        statusEl.className = 'game-status visible';
        statusEl.textContent = '\uD83D\uDD12 ' + tf('{count} batiments requis', { count: CARD_COLLECTION_UNLOCK_BUILDING_TYPES });
        return;
    }
    statusEl.className = 'game-status';
    statusEl.textContent = '';
}
function renderContractsCardStatus() {
    const statusEl = document.getElementById('contracts-card-status');
    if (!statusEl) return;
    const now = Date.now();
    if (!areContractsUnlocked()) {
        statusEl.className = 'game-status visible';
        statusEl.textContent = '\uD83D\uDD12 ' + tf('{count} batiments requis', { count: CONTRACT_UNLOCK_BUILDING_TYPES });
        return;
    }
    if (contractState.active) {
        const c = contractState.active;
        const type = findContractType(c.typeId);
        const remaining = Math.max(0, c.expiresAt - now);
        const pct = Math.min(100, (c.progress / c.target) * 100);
        statusEl.className = 'game-status visible';
        const html = (type ? contractIconHtml(type, 'status-contract-icon') + ' ' : '')
            + '<span class="status-timer">' + formatContractTime(remaining) + '</span>'
            + '<span class="status-bar"><div style="width:' + pct + '%"></div></span>';
        if (statusEl.dataset.lastHtml !== html) {
            statusEl.dataset.lastHtml = html;
            statusEl.innerHTML = html;
        }
    } else if (contractState.offers.length > 0) {
        const nextIn = Math.max(0, contractState.nextRotationAt - now);
        statusEl.className = 'game-status visible';
        statusEl.innerHTML = '<span class="status-offers">' + contractState.offers.length + ' ' + t('contrat(s) propose(s)') + '</span>'
            + ' \u00b7 ' + tf('nouveaux contrats dans {time}', { time: formatContractTime(nextIn) });
        // Nouveaux contrats disponibles : pulse sur la case pour attirer l'oeil,
        // uniquement pour des offres jamais annoncees.
        const seen = contractState.offersSeenIds || [];
        const hasNew = contractState.offers.some(o => !seen.includes(o.id));
        if (hasNew) {
            contractState.offersSeenIds = contractState.offers.map(o => o.id);
            pulseHint(statusEl.closest('.mini-game-card'));
        }
    } else {
        // Permanence : meme sans offre active, la case affiche TOUJOURS
        // quand arrive la prochaine rotation de contrats.
        const nextIn = Math.max(0, contractState.nextRotationAt - now);
        statusEl.className = 'game-status visible';
        statusEl.textContent = '\u23F3 ' + tf('prochain contrat dans {time}', { time: formatContractTime(nextIn) });
    }
}
function contractsStructureKey() {
    if (contractState.active) return 'active:' + contractState.active.offerId;
    return 'offers:' + contractState.offers.map(o => o.id).join(',');
}
// Panneau flottant du contrat actif (HUD central) : objectif court,
// progression cible et chrono restant, mis a jour par tickContracts
// et par les hooks de progression pour rester reactif entre deux ticks.
function getContractHudShortLabel(c) {
    // Toujours juste "Contrat" : le type complet ne tenait jamais dans la
    // largeur du HUD, le reste de la ligne (progression + chrono) etait rogne.
    return t('Contrat');
}
function updateContractHud() {
    const hud = document.getElementById('contract-hud');
    if (!hud) return;
    const c = contractState.active;
    if (!c) {
        hud.style.display = 'none';
        return;
    }
    const labelEl = document.getElementById('contract-hud-label');
    const progressEl = document.getElementById('contract-hud-progress');
    const timeEl = document.getElementById('contract-hud-time');
    const barEl = document.getElementById('contract-hud-bar-fill');
    const secLeft = Math.max(0, Math.ceil((c.expiresAt - Date.now()) / 1000));
    const current = c.typeId === 'production'
        ? Math.max(0, naturalPartsThisLaunch - (c.naturalStartTotal || 0))
        : Math.max(0, c.progress);
    if (labelEl) labelEl.textContent = getContractHudShortLabel(c);
    if (progressEl) progressEl.textContent = formatNumber(Math.min(current, c.target)) + ' / ' + formatNumber(c.target);
    if (timeEl) timeEl.textContent = secLeft + ' s';
    if (barEl) barEl.style.width = Math.min(100, (current / c.target) * 100) + '%';
    hud.style.display = 'block';
}
function renderContracts() {
    const modal = document.getElementById('contracts-modal');
    if (!modal.classList.contains('active')) return;
    const listEl = document.getElementById('contracts-list');
    if (!listEl) return;
    const now = Date.now();
    const key = contractsStructureKey();
    // Reconstruire le DOM seulement si la structure change (nouvelles offres,
    // contrat actif/termine). Sinon mise a jour ciblee des valeurs dynamiques.
    if (listEl.dataset.structureKey !== key) {
        listEl.dataset.structureKey = key;
        listEl.innerHTML = buildContractsHtml();
    }
    updateContractsDynamicValues(listEl, now);
}
function contractDifficultyLabel(diffIdx) {
    return diffIdx === 0 ? t('Facile') : (diffIdx === 1 ? t('Normal') : t('Difficile'));
}
// Couleur du label de difficulte : vert = facile, gris-bleu = normal, rouge = difficile.
function contractDifficultyClass(diffIdx) {
    return diffIdx === 0 ? 'diff-easy' : (diffIdx === 1 ? 'diff-normal' : 'diff-hard');
}
function buildContractsHtml() {
    let html = '<div class="contract-rotation">\u23f3 ' + tf('nouveaux contrats dans {time}', { time: '<span class="contract-rotation-timer">' + formatContractTime(Math.max(0, contractState.nextRotationAt - Date.now())) + '</span>' }) + '</div>';
    if (contractState.active) {
        const c = contractState.active;
        const type = findContractType(c.typeId);
        html += '<div class="contract-card active">'
            + '<div class="contract-head">' + contractIconHtml(type) + '<div><div class="contract-title">' + tf(type ? type.objective : '', { target: formatNumber(c.target) }) + '</div>'
            + '<div class="contract-sub">' + t('Contrat en cours') + '</div></div></div>'
            + '<div class="contract-progress"><div class="contract-progress-fill" style="width:0%"></div></div>'
            + '<div class="contract-meta"><span class="contract-progress-text"></span>'
            + '<span class="contract-timer"></span></div>'
            + '</div>';
    } else if (contractState.offers.length === 0) {
        html += '<div class="contract-empty">' + t('Aucun contrat disponible') + '</div>';
    } else {
        contractState.offers.forEach(offer => {
            const type = findContractType(offer.typeId);
            const rewardLabel = offer.rewardType === 'instant'
                ? tf('+{parts} Parts', { parts: formatNumber(Math.floor(Math.max(1, getBasePartsPerSecond()) * offer.instantSec)) })
                : (offer.rewardType === 'mult'
                    ? 'x' + offer.mult + ' ' + t('production') + ' (' + offer.duration + ' s)'
                    : 'x' + offer.clickMult + ' ' + t('clic') + ' (' + offer.duration + ' s)');
            html += '<div class="contract-card">'
                + '<div class="contract-head">' + contractIconHtml(type) + '<div>'
                + '<div class="contract-title">' + contractObjectiveText(offer) + '</div>'
                + '<div class="contract-sub">' + t('30 secondes') + ' \u00b7 <span class="' + contractDifficultyClass(offer.diffIdx) + '">' + contractDifficultyLabel(offer.diffIdx) + '</span></div></div></div>'
                + '<div class="contract-reward">' + contractRewardText(offer) + '</div>'
                + '<button class="contract-buy-btn" data-offer-id="' + offer.id + '" onclick="acceptContract(\'' + offer.id + '\')">'
                + '<img src="images/parts.png" class="coin-icon" alt=""> ' + formatNumber(offer.price) + ' ' + t('Parts') + '</button>'
                + '</div>';
        });
    }
    return html;
}
function updateContractsDynamicValues(listEl, now) {
    const rotationEl = listEl.querySelector('.contract-rotation-timer');
    if (rotationEl) rotationEl.textContent = formatContractTime(Math.max(0, contractState.nextRotationAt - now));
    if (contractState.active) {
        const c = contractState.active;
        const remaining = Math.max(0, c.expiresAt - now);
        const pct = Math.min(100, (c.progress / c.target) * 100);
        const fill = listEl.querySelector('.contract-progress-fill');
        if (fill) fill.style.width = pct + '%';
        const text = listEl.querySelector('.contract-progress-text');
        if (text) {
            if (c.typeId === 'clickParts' || c.typeId === 'production') {
                text.textContent = formatNumber(Math.floor(c.progress)) + ' / ' + formatNumber(c.target) + ' ' + t('Parts');
            } else {
                text.textContent = Math.floor(c.progress) + ' / ' + c.target;
            }
        }
        const timer = listEl.querySelector('.contract-timer');
        if (timer) timer.textContent = formatContractTime(remaining);
    } else {
        contractState.offers.forEach(offer => {
            const btn = listEl.querySelector('.contract-buy-btn[data-offer-id="' + offer.id + '"]');
            if (btn) btn.disabled = score < offer.price;
        });
    }
}
function formatContractTime(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    const mm = (m < 10 ? '0' : '') + m;
    const rr = (r < 10 ? '0' : '') + r;
    return (h > 0 ? h + ':' : '') + mm + ':' + rr;
}
function resetContractState() {
    contractState.offers = [];
    contractState.active = null;
    contractState.nextRotationAt = 0;
    contractState.unlockedSeen = contractState.unlockedSeen;
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

const COLLECTIBLE_CARDS = [    { id: 'earth-card',     name: 'Terre',                 rarity: 'common',     icon: '', imgPath: 'images/cards/collection/earth-card.png' },    { id: 'moon-card',      name: 'Lune',                  rarity: 'common',     icon: '', imgPath: 'images/cards/collection/moon-card.png' },    { id: 'mars-card',      name: 'Mars',                  rarity: 'common',     icon: '', imgPath: 'images/cards/collection/mars-card.png' },    { id: 'wrench-card',    name: 'Atelier',               rarity: 'common',     icon: '', imgPath: 'images/cards/collection/workshop-card.png' },    { id: 'factory-card',   name: 'Usine',                 rarity: 'common',     icon: '', imgPath: 'images/cards/collection/factory-card.png' },    { id: 'mining-card',    name: 'Mine stellaire',        rarity: 'common',     icon: '', imgPath: 'images/cards/collection/stellar-mine-card.png' },    { id: 'solar-card',     name: 'Centrale solaire',      rarity: 'common',     icon: '', imgPath: 'images/cards/collection/solar-factory-card.png' },    { id: 'comet-card',     name: 'Comète',                rarity: 'common',     icon: '', imgPath: 'images/cards/collection/comet-card.png' },    { id: 'neptune-card',   name: 'Neptune',               rarity: 'rare',       icon: '', imgPath: 'images/cards/collection/neptune-card.png' },    { id: 'pluto-card',     name: 'Pluton',                rarity: 'rare',       icon: '', imgPath: 'images/cards/collection/pluto-card.png' },    { id: 'proxima-card',   name: 'Proxima Centauri',      rarity: 'rare',       icon: '', imgPath: 'images/cards/collection/proxima-centauri-card.png' },    { id: 'foundry-card',   name: 'Autofab orbitale',      rarity: 'rare',       icon: '', imgPath: 'images/cards/collection/orbital-autofab-card.png' },    { id: 'station-card',   name: 'Essaim de sondes',      rarity: 'rare',       icon: '', imgPath: 'images/cards/collection/probe-swarm-card.png' },    { id: 'quasar-card',    name: 'Moteur à quasar',       rarity: 'rare',       icon: '', imgPath: 'images/cards/collection/quasar-engine-card.png' },    { id: 'sirius-card',    name: 'Sirius',                rarity: 'epic',       icon: '', imgPath: 'images/cards/collection/sirius-card.png' },    { id: 'oort-card',      name: "Nuage d'Oort",           rarity: 'epic',       icon: '', imgPath: 'images/cards/collection/oort-cloud-card.png' },    { id: 'pulsar-card',    name: 'Horloger de pulsar',    rarity: 'epic',       icon: '', imgPath: 'images/cards/collection/pulsar-clock-card.png' },    { id: 'milkyway-card',  name: 'Centre Voie lactée',  rarity: 'legendary',  icon: '', imgPath: 'images/cards/collection/milky-way-center-card.png' },    { id: 'missile-card', name: 'Missile',               rarity: 'legendary',  icon: '', imgPath: 'images/cards/collection/missile-card.png' },    { id: 'andromeda-card', name: 'Andromède',            rarity: 'alternative', icon: '', imgPath: 'images/cards/collection/andromeda-card.png' }];

const BOOSTERS = {
    standard:  { name: 'Standard',   cardCount: 1, cost: () => Math.max(100, Math.floor(getBasePartsPerSecond() * 8)),     rarities: { common: 0.80, rare: 0.18, epic: 0.02 } },
    premium:   { name: 'Premium',    cardCount: 2, cost: () => Math.max(500, Math.floor(getBasePartsPerSecond() * 40)),    rarities: { common: 0.50, rare: 0.30, epic: 0.15, legendary: 0.04, alternative: 0.01 } },
    legendary: { name: 'Légendaire', cardCount: 3, cost: () => Math.max(2000, Math.floor(getBasePartsPerSecond() * 160)),  rarities: { common: 0.25, rare: 0.30, epic: 0.25, legendary: 0.15, alternative: 0.05 } }
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
    { id: 'off1', branch: 'offline', tier: 1, name: 'Pilote automatique',          desc: 'Production continue jusqu\u0027\u00e0 20min apr\u00e8s fermeture du jeu.',  baseCost: 1,   costMult: 1.0, maxLevel: 1, effectPerLevel: 1/3 },
    { id: 'off2', branch: 'offline', tier: 2, name: 'Drone de maintenance',         desc: 'Production continue jusqu\u0027\u00e0 40min apr\u00e8s fermeture du jeu.',  baseCost: 3,   costMult: 1.0, maxLevel: 1, effectPerLevel: 2/3, requires: ['off1'] },
    { id: 'off3', branch: 'offline', tier: 3, name: 'IA de bord',                  desc: 'Production continue jusqu\u0027\u00e0 1h20 apr\u00e8s fermeture du jeu.',  baseCost: 8,  costMult: 1.0, maxLevel: 1, effectPerLevel: 4/3, requires: ['off2'] },
    { id: 'off4', branch: 'offline', tier: 4, name: 'Colonie autonome',            desc: 'Production continue jusqu\u0027\u00e0 2h40 apr\u00e8s fermeture du jeu.',  baseCost: 20,  costMult: 1.0, maxLevel: 1, effectPerLevel: 8/3, requires: ['off3'] },
    { id: 'off5', branch: 'offline', tier: 5, name: 'Civilisation robotis\u00e9e', desc: 'Production continue jusqu\u0027\u00e0 5h20 apr\u00e8s fermeture du jeu.', baseCost: 50, costMult: 1.0, maxLevel: 1, effectPerLevel: 16/3, requires: ['off4'] }
];

let galacticUpgrades = {};

let cardCollection = {};

function openCardCollection() {
    if (!areCardsUnlocked()) {
        showToast('\uD83D\uDD12 ' + tf('Debloque {count} types de batiments pour la collection', { count: CARD_COLLECTION_UNLOCK_BUILDING_TYPES }));
        return;
    }
    showExclusiveModal('card-collection-modal', () => {
        updateCardCollectionDisplay();
        showCardShop();
    });
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
        showToast(t('Pas assez de Parts pour ce booster !'));
        return;
    }
    score -= cost;
    Sounds.booster();
    updateDisplay();

    const drawn = [];
    let cardCount = booster.cardCount;
    cardCount += getGalacticUpgradeLevel('coll6');
    for (let i = 0; i < cardCount; i++) {
        drawn.push(drawCard(booster.rarities));
    }

    for (const card of drawn) {
        cardCollection[card.id] = (cardCollection[card.id] || 0) + 1;
        invalidateBuildingGainsCache();
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
    const intro = document.getElementById('cc-reveal-intro');
    if (intro) intro.style.display = '';
    container.style.setProperty('--card-count', cards.length);
    document.getElementById('cc-reveal-shop-btn').style.display = 'none';
    document.getElementById('cc-reveal-album-btn').style.display = 'none';
    const revealAllBtn = document.getElementById('cc-reveal-all-btn');
    if (revealAllBtn) revealAllBtn.style.display = '';
    const total = cards.length;
    let revealed = 0;
    const checkAllRevealed = function () {
        if (revealed >= total) {
            document.getElementById('cc-reveal-shop-btn').style.display = 'inline-flex';
            document.getElementById('cc-reveal-album-btn').style.display = 'inline-flex';
            if (revealAllBtn) revealAllBtn.style.display = 'none';
        }
    };

    // Paquet sequential : une seule carte visible a la fois, comme un
    // vrai booster. Le joueur retourne la carte, la decouvre un instant,
    // puis elle s'envole et la suivante arrive a sa place.
    let idx = 0;
    const revealedCards = [];
    const showSummary = function () {
        container.innerHTML = '';
        const intro = document.getElementById('cc-reveal-intro');
        if (intro) intro.style.display = 'none';
        revealedCards.forEach(function (rc, i) {
            const el = document.createElement('div');
            el.className = 'cc-reveal-card summary rarity-' + rc.card.rarity;
            el.style.animationDelay = (i * 0.08) + 's';
            el.innerHTML =
                '<div class="cc-reveal-inner flipped">' +
                    '<div class="cc-reveal-front"><img src="images/cards/backs/card-back.png" class="cc-card-img" alt="Dos de carte"></div>' +
                    '<div class="cc-reveal-back">' +
                        '<img src="' + rc.card.imgPath + '" class="cc-card-img" alt="' + rc.card.name + '">' +
                        (rc.isNew ? '<div class="cc-card-new">' + t('NOUVELLE !') + '</div>' : '') +
                    '</div>' +
                '</div>';
            container.appendChild(el);
        });
        checkAllRevealed();
    };
    const showCard = function () {
        if (idx >= total) { showSummary(); return; }
        const card = cards[idx];
        const isNew = (cardCollection[card.id] || 0) <= 1;
        const el = document.createElement('div');
        // Les cartes suivantes arrivent deja retournees (face visible), comme
        // si le booster montrait la carte gagnee avant de passer a la suivante.
        el.className = 'cc-reveal-card pack rarity-' + card.rarity + (idx > 0 ? ' flipped' : '');
        el.innerHTML =
            '<div class="cc-reveal-inner">' +
                '<div class="cc-reveal-front"><img src="images/cards/backs/card-back.png" class="cc-card-img" alt="Dos de carte"></div>' +
                '<div class="cc-reveal-back">' +
                    '<img src="' + card.imgPath + '" class="cc-card-img" alt="' + card.name + '">' +
                    (isNew ? '<div class="cc-card-new">' + t('NOUVELLE !') + '</div>' : '') +
                '</div>' +
            '</div>';
        let discovered = false;
        el.addEventListener('click', function () {
            if (!discovered) {
                // Premier clic : retourner (ou decouvrir) la carte, elle reste affichee
                discovered = true;
                if (!el.classList.contains('flipped')) el.classList.add('flipped');
                revealed++;
                revealedCards.push({ card, isNew });
                return;
            }
            // Second clic : elle s'envole et la suivante arrive (ou le recap)
            el.classList.add('pack-out');
            setTimeout(function () {
                el.remove();
                idx++;
                showCard();
            }, 320);
        });
        container.appendChild(el);
    };
    showCard();
}

function revealAllCards() {
    // Paquet sequential : retourner la carte courante puis l'envoler,
    // en chaine, jusqu'au recap final.
    const el = document.querySelector('#cc-reveal-cards .cc-reveal-card.pack:not(.pack-out)');
    if (el) {
        el.click();
        if (el.classList.contains('flipped')) {
            setTimeout(function () {
                if (el.isConnected) el.click();
            }, 750);
        }
        setTimeout(function () { revealAllCards(); }, 1200);
    } else {
        document.getElementById('cc-reveal-shop-btn').style.display = 'inline-flex';
        document.getElementById('cc-reveal-album-btn').style.display = 'inline-flex';
        const revealAllBtn = document.getElementById('cc-reveal-all-btn');
        if (revealAllBtn) revealAllBtn.style.display = 'none';
    }
}

function renderCardAlbum() {
    const grid = document.getElementById('cc-album-grid');
    grid.innerHTML = '';

    const complete = isCollectionComplete();
    if (complete) {
        const banner = document.createElement('div');
        banner.className = 'cc-set-complete';
        banner.textContent = t('Collection complète ! +20% prod');
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
    document.getElementById('cc-lightbox-name').textContent = t(card.name);
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
    return window.matchMedia('(max-width: 1024px) and (pointer: coarse)').matches;
}

function closeAllModalsForMobileNav() {
    document.querySelectorAll('.modal.active').forEach(m => {
        if (m.classList.contains('post-travel')) return;
        m.classList.remove('active');
    });
}

function setMobileView(view) {
    mobileActiveView = view;
    const grid = document.querySelector('.main-grid');
    const nav = document.getElementById('mobile-nav');
    if (!grid) return;
    // Panneau central masque : les animations de pluie de pieces sont figees
    // par display:none et s'accumulent. On purge et suspend la pluie.
    if (typeof partsRain !== 'undefined' && partsRain) {
        if (view === 'center') {
            partsRain.suspended = false;
            resizeRainCanvas();
        } else {
            partsRain.suspended = true;
            partsRain.parts.length = 0;
        }
    }
    const viewClass = 'mobile-view-' + view;
    if (!grid.classList.contains(viewClass)) {
        grid.classList.remove('mobile-view-left', 'mobile-view-center', 'mobile-view-right');
        grid.classList.add(viewClass);
    }
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
function applyUiScale() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (isMobileLayout()) {
        // Reference visuelle mobile : iPhone 13 (390x844). Le master layout
        // mobile etait regle a la main avec --ui-scale = 0.8 (plancher
        // desktop) : on le preserve et on applique partout la meme echelle
        // uniforme (px via --mscale, rem via --ui-scale).
        const wScale = vw / 390;
        const hScale = vh / 844;
        const mscale = Math.max(0.85, Math.min(1.35, Math.min(wScale, hScale)));
        document.documentElement.style.setProperty('--mscale', mscale.toFixed(3));
        // 0.95 : texte mobile tres lisible (base 15.2px sur iPhone 13)
        document.documentElement.style.setProperty('--ui-scale', (1.1 * mscale).toFixed(3));
        return;
    }
    document.documentElement.style.removeProperty('--mscale');
    // Echelle pilotee surtout par la hauteur : c'est elle qui manque sur
    // les fenetres desktop compactes. La largeur ne compte que sous 1150px.
    const wScale = Math.min(1, vw / 1150);
    const hScale = Math.min(1, vh / 820);
    // Plancher 0.8 : sous cette taille le texte deviendrait illisible ;
    // les panneaux lateraux scrollent deja en interne.
    const scale = Math.max(0.8, Math.min(wScale, hScale));
    document.documentElement.style.setProperty('--ui-scale', scale.toFixed(3));
}
function applySceneScale() {
    // Le monde scene-world (1024x744, dimensions natives du fond) contient le
    // decor ET la fusée dans le meme repere : une seule echelle uniforme,
    // jamais de desynchronisation au redimensionnement.
    const world = document.getElementById('scene-world');
    if (!world || launchSequenceActive) return;
    const scene = world.parentElement;
    if (!scene) return;
    const sceneHeight = scene.clientHeight;
    const sceneWidth = scene.clientWidth;
    if (!sceneHeight || !sceneWidth) return;
    const WORLD_WIDTH = 1024;
    const WORLD_HEIGHT = 744;
    // Sommet de la fusée dans le repere monde (piece la plus haute : pas de tir).
    const ROCKET_TOP_Y = 205;
    const rocketAboveGround = WORLD_HEIGHT - ROCKET_TOP_Y;
    const MARGIN = 24;
    // 1) Echelle "cover" : le decor remplit toujours la scene (ancré bas-centre,
    //    le debordement part vers le ciel).
    let scale = Math.max(sceneWidth / WORLD_WIDTH, sceneHeight / WORLD_HEIGHT);
    // 2) Garde-fou : le sommet de la fusée reste toujours visible avec une
    //    marge, même sur des ecrans tres larges et bas.
    scale = Math.min(scale, (sceneHeight - MARGIN) / rocketAboveGround);
    world.style.transformOrigin = '50% 100%';
    world.style.transform = 'translateX(-50%) scale(' + scale + ')';
    // Prolongation du sol : le decor a sa ligne de sol vers y=480 (sur 744).
    // On aligne le remplissage sur cette ligne pour une jonction invisible.
    const GROUND_LINE_Y = 480;
    const groundFill = document.getElementById('scene-ground-fill');
    if (groundFill) groundFill.style.height = (scale * (WORLD_HEIGHT - GROUND_LINE_Y)) + 'px';
}

function initMobileNav() {
    const nav = document.getElementById('mobile-nav');
    if (!nav) return;
    nav.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModalsForMobileNav();
            setMobileView(btn.dataset.view);
        });
    });
    if (isMobileLayout()) setMobileView(mobileActiveView);
    let resizeTimer = null;
    let lastResizeW = window.innerWidth;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            relocateBuildingProductions();
            // Barre d'URL mobile : un resize de hauteur seul (scroll masque la
            // barre) ne doit pas rescaler l'UI en plein scroll, sinon la
            // hauteur du contenu change et le scrollTop est reclampe.
            if (window.innerWidth !== lastResizeW) applyUiScale();
            // Sur mobile, scroller masque/affiche la barre d'URL du navigateur :
            // un changement de hauteur seul ne doit pas reinitialiser la vue,
            // sinon le scroll du panneau batiments remonte de force.
            const widthChanged = window.innerWidth !== lastResizeW;
            if (isMobileLayout() && widthChanged) {
                setMobileView(mobileActiveView);
            }
            lastResizeW = window.innerWidth;
            // La scène se recale à toutes les tailles d'écran (desktop inclus)
            applySceneScale();
        }, 150);
    });
    window.addEventListener('orientationchange', () => {
        applyUiScale();
        setTimeout(applySceneScale, 250);
    });
    applyUiScale();
}

// --- Chronometre depuis le dernier lancement ---
// Format de duree complet : toutes les unites non nulles sont affichees,
// avec zero non significatif quand une unite superieure est presente.
// 3h45m50s / 45m50s / 50s / jamais une seule unite tronquee.
function formatDurationHMS(ms) {
    if (ms < 0) ms = 0;
    const totalSec = Math.floor(ms / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (d > 0) return d + 'j' + String(h).padStart(2, '0') + 'h' + String(m).padStart(2, '0') + 'm';
    if (h > 0) return h + 'h' + String(m).padStart(2, '0') + 'm' + String(s).padStart(2, '0') + 's';
    if (m > 0) return m + 'm' + String(s).padStart(2, '0') + 's';
    return s + 's';
}
function formatLaunchTimer(ms) {
    return formatDurationHMS(ms);
}

function updateLaunchTimer() {
    const el = document.getElementById('launch-timer');
    if (!el) return;
    // Avant le premier lancement, le chrono court depuis le debut de la partie
    const start = lastLaunchAt || gameStartTime || 0;
    if (!start) return;
    setTextIfChanged(el, formatLaunchTimer(Date.now() - start));
    el.classList.toggle('has-launch', !!lastLaunchAt);
}
// Ecriture DOM dEdoublonnEe : ne toucher el que si le texte change vraiment.
function setTextIfChanged(el, text) {
    if (el.textContent !== text) el.textContent = text;
}

// ============================================
// INITIALIZATION
// ============================================

// ============================================
// ============================================
// TUTORIEL DEBUT DE PARTIE
// Coach proactif : au lieu d'une presentation que le joueur subit,
// un guide flottant suit ses premiers gestes (clic, achat, construction)
// et passe a l'etape suivante QUAND l'action est faite. Le jeu reste
// jouable a chaque instant (pas d'overlay bloquant).
// Persiste dans la save (tutorialSeen).
// ============================================
const TUTORIAL_STEPS = [
    {
        img: 'images/parts.png',
        titleKey: 'Clique sur la pièce',
        textKey: 'Chaque clic te rapporte des Parts. Clique pour en gagner !',
        done: () => totalPartsFromClicks >= 1,
    },
    {
        img: 'images/buildings/workshop.png',
        titleKey: 'Construis ton premier Atelier',
        textKey: 'Les bâtiments produisent des Parts tout seuls. Achète un Atelier dans le panneau Bâtiments.',
        done: () => (findBuildingById('workshop')?.count || 0) >= 1,
    },
    {
        img: 'images/rocket/Fusée3.png',
        titleKey: 'Construis ta première pièce de fusée',
        textKey: 'La carte Prochaine étape indique ta progression. Construis la première pièce !',
        done: () => ROCKET_PARTS.some(p => p.purchased),
    },
];
let tutorialStep = 0;
let tutorialActive = false;
let tutorialPollTimer = null;

function isTutorialSeen() {
    return !!tutorialSeen;
}

// Choix de la langue a la premiere visite : affiche le sélecteur
// au-dessus de tout (z-index 14500) et differe le tutoriel.
function shouldAskLanguage() {
    return localStorage.getItem('starcruiser-language') === null;
}

function showLanguagePicker() {
    const overlay = document.getElementById('lang-picker-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
}

function closeLanguagePicker() {
    const overlay = document.getElementById('lang-picker-overlay');
    if (overlay) overlay.classList.remove('active');
}

function chooseGameLanguage(lang) {
    setGameLanguage(lang);
    closeLanguagePicker();
    // Le tutoriel attend que la langue soit choisie pour demarrer.
    if (!tutorialActive && !isTutorialSeen()) startTutorial(false);
}

function startTutorial(force) {
    if (tutorialActive) return;
    if (!force && isTutorialSeen()) return;
    // Deja de la progression sauvegardee : le coach n'a plus lieu d'etre.
    const workshop = findBuildingById('workshop');
    if (!force && (workshop?.count > 0 || ROCKET_PARTS.some(p => p.purchased))) {
        tutorialSeen = true;
        return;
    }
    tutorialActive = true;
    tutorialStep = 0;
    renderTutorialStep();
    if (tutorialPollTimer) clearInterval(tutorialPollTimer);
    tutorialPollTimer = setInterval(pollTutorialProgress, 400);
}

function renderTutorialStep() {
    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step) { endTutorial(); return; }
    const coach = document.getElementById('tutorial-coach');
    if (!coach) return;
    coach.classList.add('active');
    const stepEl = coach.querySelector('.tutorial-coach-step');
    const imgEl = coach.querySelector('.tutorial-coach-visual');
    const titleEl = coach.querySelector('.tutorial-coach-title');
    const textEl = coach.querySelector('.tutorial-coach-text');
    if (stepEl) stepEl.textContent = (tutorialStep + 1) + '/' + TUTORIAL_STEPS.length;
    if (imgEl) imgEl.src = step.img;
    if (titleEl) titleEl.textContent = t(step.titleKey);
    if (textEl) textEl.textContent = t(step.textKey);
}

// Le joueur fait l'action (clic, achat...) : on verifie regulierement
// si l'etape courante est accomplie et on avance automatiquement.
function pollTutorialProgress() {
    if (!tutorialActive) return;
    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step) { endTutorial(); return; }
    if (step.done && step.done()) {
        tutorialStep++;
        if (tutorialStep >= TUTORIAL_STEPS.length) {
            endTutorial();
        } else {
            renderTutorialStep();
        }
    }
}

// Compatible avec les anciens appels : passer une etape a la main reste
// possible, mais le coach avance surtout tout seul.
function nextTutorialStep() {
    if (!tutorialActive) return;
    tutorialStep++;
    if (tutorialStep >= TUTORIAL_STEPS.length) endTutorial();
    else renderTutorialStep();
}

function skipTutorial() {
    endTutorial();
}

function endTutorial() {
    tutorialActive = false;
    tutorialSeen = true;
    if (tutorialPollTimer) { clearInterval(tutorialPollTimer); tutorialPollTimer = null; }
    saveGame();
    const coach = document.getElementById('tutorial-coach');
    if (coach) coach.classList.remove('active');
}

function init() {
    initGlobals();
    const npnLaunchBtn = document.getElementById('npn-launch-btn');
    if (npnLaunchBtn) {
        npnLaunchBtn.addEventListener('click', () => {
            closeNextPlanetNotification();
            launchRocket();
        });
    }
    const npnOverlay = document.getElementById('next-planet-notification');
    if (npnOverlay) {
        npnOverlay.addEventListener('click', (e) => {
            if (e.target === npnOverlay) closeNextPlanetNotification();
        });
    }
    loadGame();
    // Refleter le multiplicateur d'achat restaure (bouton actif de la sidebar).
    if (typeof setBuyMultiplier === 'function') setBuyMultiplier(buyMultiplier);
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
    }
    // Recalage systematique de la scene (desktop aussi) : la mise a l'echelle
    // depend de la hauteur rendue de la scene, fausse tant que le CSS et les
    // polices ne sont pas appliques.
    applySceneScale();
    if (shouldAskLanguage()) {
        showLanguagePicker();
    } else {
        startTutorial(false);
    }
    hideLoadingScreen();
}

// Masque l'ecran de chargement des que le jeu est initialise (pas de duree
// minimum forcee) : on attend juste le logo pour eviter un flash.
function hideLoadingScreen() {
    const overlay = document.getElementById('loading-screen');
    if (!overlay) return;
    const logo = overlay.querySelector('.loading-logo');
    const hide = () => {
        overlay.classList.add('hidden');
        setTimeout(() => overlay.remove(), 500);
    };
    if (logo && !logo.complete) {
        logo.addEventListener('load', hide, { once: true });
        logo.addEventListener('error', hide, { once: true });
    } else {
        hide();
    }
}

// Pieces de fusee deja construites : initialise ICI, avant startGame qui
// recharge la sauvegarde (loadGame y ajoute les pieces achetees) — la
// declaration etait avant plus bas dans le fichier, apres l'IIFE d'init,
// ce qui levait une ReferenceError (TDZ) au chargement d'une sauvegarde.
let constructedParts = new Set();

const DEBUG_MODE = new URLSearchParams(window.location.search).has('debug');

const Debug = {
    addScore(n) {
        score += n;
        partsSinceLaunch += n;
        trackPartsEarned(n);
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
    comet(n) {
        // Fait apparaitre n cometes immediatement (1 par defaut)
        const count = Math.max(1, Math.min(20, parseInt(n, 10) || 1));
        for (let i = 0; i < count; i++) {
            setTimeout(() => spawnRandomBonus(false), i * 350);
        }
    },
    shower() {
        startCometShower();
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
        localStorage.removeItem('starcruiserClickerSave');
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
    shower() { startCometShower(); },
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

// ============================================
// TIMERS
// ============================================

let bonusSpawnTimer = null;
function scheduleBonusSpawn() {
    const bonus = getCometFrequencyBonus();
    const delay = Math.max(800, BONUS_SPAWN_INTERVAL_MS / (1 + bonus));
    clearTimeout(bonusSpawnTimer);
    bonusSpawnTimer = setTimeout(() => {
        if (!cometShowerActive) spawnRandomBonus();
        scheduleBonusSpawn();
    }, delay);
}
scheduleBonusSpawn();
// Etat du bouton son au chargement (icône cohérente avec le réglage sauvegardé)
(() => { const b = document.getElementById('sound-toggle-btn'); if (b) b.textContent = Sound.enabled ? '🔊' : '🔇'; })();
// Prechargement du sprite du missile : il n'est insere dans le DOM qu'au
// premier tir, sans ce prechargement le premier missile vole sans image
// le temps du premier telechargement.
(() => { const preload = new Image(); preload.src = 'images/effects/missile.png'; })();

// ============================================
// PLUIE DE COMÈTES (événement régulier)
// ============================================
// Toutes les 4 à 6 minutes, une cascade de comètes dorées traverse
// l'écran : chacune ne donne que du bonus instantané (jamais de flare),
// pour éviter tout cumul de multiplicateurs.
let cometShowerActive = false;
let firstCometShower = true;
function scheduleCometShower() {
    // Premiere pluie rapide (~1 min) pour que le joueur la voie tot,
    // ensuite cadence normale toutes les 4 a 6 minutes.
    const delay = firstCometShower
        ? 55000 + Math.random() * 25000
        : 240000 + Math.random() * 120000;
    firstCometShower = false;
    setTimeout(() => {
        startCometShower();
        scheduleCometShower();
    }, delay);
}
function startCometShower() {
    if (cometShowerActive) return;
    cometShowerActive = true;
    Sounds.showerAlert();
    showToast('\ud83c\udf20 ' + t('Pluie de com\u00e8tes ! Attrapez-les !'));
    // Mobile/tablette : moitie moins de cometes, la pluie y coute tres cher
    const isMobileLike = window.matchMedia('(max-width: 1024px) and (pointer: coarse)').matches;
    const COUNT = isMobileLike ? 6 : 12;
    const SPREAD_MS = 8000;
    for (let i = 0; i < COUNT; i++) {
        setTimeout(() => spawnRandomBonus(true), (i / COUNT) * SPREAD_MS + Math.random() * 400);
    }
    setTimeout(() => { cometShowerActive = false; }, SPREAD_MS + 8000);
}
scheduleCometShower();
let lastGameTick = Date.now();

setInterval(gameLoop, GAME_LOOP_INTERVAL_MS);
setInterval(tickContracts, 500);
setInterval(() => {
    if (Date.now() - lastSaveTime > SAVE_INTERVAL_MS) {
        saveGame();
    }
}, 10000);

// Initialisation des que le script s'execute (il est charge en fin de body,
// le DOM est deja parse) : NE PAS attendre window.onload — il ne se declenche
// qu'une fois TOUTES les ressources chargees (polices Google, images), et
// sur une premiere visite vierge une ressource lente/bloquee figeait
// l'ecran de chargement indéfiniment.
(function startGame() {
    if (typeof initLanguage === 'function') initLanguage();
    init();
    if (!gameStartTime) {
        gameStartTime = Date.now();
    }
    initDebugMode();
    // Recalage de la scene une fois le layout stabilise : polices, images,
    // et dimensions finales de la scene. Plusieurs passes car le premier
    // rendu a lieu avant l'application complete du CSS.
    requestAnimationFrame(applySceneScale);
    setTimeout(applySceneScale, 100);
    setTimeout(applySceneScale, 400);
    window.addEventListener('load', applySceneScale);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(applySceneScale);
    }
})();

// ============================================
// MODE DEBUG (test de progression rapide)
// Activer via ?debug=1 dans l'URL.
// Commandes globales: Debug.comet(n), Debug.shower(), Debug.addScore(n), Debug.addStardust(n),
// Debug.buyAllParts(), Debug.launch(), Debug.fast(n),
// Debug.giveBuildings(id, n), Debug.reset(), Debug.setPlanet(index)
// ============================================


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
    return { ...result, formatted: formatDurationHMS(result.seconds * 1000) };
}

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
    panel.appendChild(btn('Comète', () => Debug.comet(1)));
    panel.appendChild(btn('x10 Comètes', () => Debug.comet(10)));
    panel.appendChild(btn('Pluie de comètes', () => Debug.shower()));
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
    console.log('%c[DEBUG] mode test actif. Console: Debug.comet(n), Debug.shower(), Debug.addScore(n), Debug.addStardust(n), Debug.buyAllParts(), Debug.launch(), Debug.fast(sec), Debug.giveBuildings(id, n), Debug.setPlanet(i), Debug.reset()', 'color:#0f0');
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
    Sounds.buy();
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
        // Toutes les pieces sont achetees : eteindre tout pulse residuel
        // (carte courante ou conteneur) pour ne pas briller une fois complet.
        clearPulseHint(container);
        clearPulseHint(container.querySelector('.rocket-part-frame'));
        if (container.dataset.partId !== '__complete__') {
            container.dataset.partId = '__complete__';
            container.innerHTML =
                '<div class="rocket-part-frame complete">' +
                    '<div class="rocket-part-frame-title">' + t('Pi\u00e8ces compl\u00e8tes') + '</div>' +
                    '<div class="rocket-part-frame-complete">\u2713 ' + t('Fus\u00e9e pr\u00eate \u00e0 lancer') + '</div>' +
                '</div>';
        } else {
            const titleEl = container.querySelector('.rocket-part-frame-title');
            if (titleEl) titleEl.textContent = t('Pièces complètes');
            const completeEl = container.querySelector('.rocket-part-frame-complete');
            if (completeEl) completeEl.textContent = '✓ ' + t('Fusée prête à lancer');
        }
        return;
    }
    const cost = getRocketPartCost(nextPart);
    const isAffordable = score >= cost;
    // Calcule au niveau de la fonction : la branche de mise a jour (else)
    // en a besoin aussi, sinon ReferenceError au changement de langue.
    const purchasedCount = ROCKET_PARTS.filter(p => p.purchased).length;
    // Ne recrerer le DOM que si la piece affichee change. Sinon, mettre a jour
    // uniquement le cout et l'etat du bouton pour eviter le clignotement du hover.
    if (container.dataset.partId !== nextPart.id) {
        container.dataset.partId = nextPart.id;
        const imageUrl = nextPart.imgPath || '';
        const imageHtml = imageUrl
            ? '<img src="' + imageUrl + '" class="rocket-part-icon" alt="' + nextPart.name + '">'
            : '<span class="rocket-part-icon-placeholder"></span>';
        container.innerHTML =
            '<div class="rocket-part-frame' + (!isAffordable ? ' locked' : '') + '">' +
                '<div class="rocket-part-frame-title">' + t('Prochaine \u00e9tape') + '</div>' +
                '<div class="rocket-part-left">' + imageHtml + '</div>' +
                '<div class="rocket-part-info">' +
                    '<span class="rocket-part-name">' + t(nextPart.name) + '</span>' +
                    '<span class="rocket-part-cost">' + formatNumber(Math.floor(score)) + ' / ' + formatNumber(cost) + ' ' + t('Parts') + '</span>' +
                    '<div class="rocket-part-progress">' +
                        '<div class="rocket-part-progress-fill"></div>' +
                        '<span class="rocket-part-progress-label"></span>' +
                    '</div>' +
                '</div>' +
                '<button class="rocket-part-btn" onclick="buyRocketPart(\'' + nextPart.id + '\')"' + (!isAffordable ? ' disabled' : '') + '>' + t('Construire') + ' \u2014 ' + formatNumber(cost) + ' ' + t('Parts') + '</button>' +
            '</div>';
    } else {
        const costEl = container.querySelector('.rocket-part-cost');
        if (costEl) costEl.textContent = formatNumber(Math.floor(score)) + ' / ' + formatNumber(cost) + ' ' + t('Parts');
        const fillEl = container.querySelector('.rocket-part-progress-fill');
        const labelEl = container.querySelector('.rocket-part-progress-label');
        if (fillEl) fillEl.style.width = Math.min(100, (score / cost) * 100) + '%';
        if (labelEl) labelEl.textContent = Math.min(100, Math.floor((score / cost) * 100)) + ' %';
        // Textes traduits rafraichis aussi sans re-creation du DOM : sinon un
        // changement de langue n'etait pris en compte qu'apres rechargement.
        const titleEl = container.querySelector('.rocket-part-frame-title');
        if (titleEl) titleEl.textContent = t('Prochaine étape');
        const nameEl = container.querySelector('.rocket-part-name');
        if (nameEl) nameEl.textContent = t(nextPart.name);
        const btn = container.querySelector('.rocket-part-btn');
        if (btn) {
            btn.disabled = !isAffordable;
            const btnLabel = t('Construire') + ' — ' + formatNumber(cost) + ' ' + t('Parts');
            if (btn.textContent !== btnLabel) btn.textContent = btnLabel;
        }
        const frame = container.querySelector('.rocket-part-frame');
        if (frame) {
            if (isAffordable) frame.classList.remove('locked');
            else frame.classList.add('locked');
        }
    }
    // Piece de fusee abordable : pulse pour attirer l'oeil (10 s max).
    // Cible la carte de la piece, pas le conteneur : celui-ci est une colonne
    // laterale haute comme la page et la lueur s'etalerait sur toute sa longueur.
    const fillEl0 = container.querySelector('.rocket-part-progress-fill');
    const labelEl0 = container.querySelector('.rocket-part-progress-label');
    if (fillEl0) fillEl0.style.width = Math.min(100, (score / cost) * 100) + '%';
    if (labelEl0) labelEl0.textContent = Math.min(100, Math.floor((score / cost) * 100)) + ' %';
    const partCard = container.querySelector('.rocket-part-frame');
    if (partCard) {
        if (isAffordable) pulseHint(partCard);
        else clearPulseHint(partCard);
    }
}

// ============================================
// ROCKET CONSTRUCTION SCENE
// ============================================
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
            piece.title = t(part.name);
            
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
                spawnBuildDust(container, part);
                // Bruit d'empilement au moment où la pièce touche la fusée
                // (0.55 s ≈ fin de l'animation de chute de 0.6 s)
                setTimeout(() => Sounds.partStack(), 550);
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

// Effet de poussiere de construction : quand une piece atterrit, des particules
// jaillissent aux points ou elle touche les pieces deja en place (ou le sol
// pour la premiere piece posee). Les coordonnees des pieces sont en px dans le
// repere 100x100 du conteneur (part.x %, part.y px, ancrage haut-centre).
function spawnBuildDust(container, newPart) {
    const contacts = [];
    const newLeft = (newPart.x || 50) / 100 * 100;
    const newWidth = newPart.width || 150;
    const newTop = newPart.y || 0;
    const newBottom = newTop + (newPart.height || 150);
    ROCKET_PARTS.forEach(other => {
        if (other.id === newPart.id || !other.purchased) return;
        const oTop = other.y || 0;
        const oBottom = oTop + (other.height || 150);
        const oLeftPct = other.x || 50;
        const oWidth = other.width || 150;
        // Piece posee sur le dessus d'une autre : le bas de la nouvelle
        // touche le haut de l'existante.
        if (Math.abs(newBottom - oTop) <= 6) {
            contacts.push({ x: oLeftPct, y: oTop });
        } else if (Math.abs(newTop - oBottom) <= 6) {
            // Piece glissee sous une autre (ex. tuyeres sous moteurs).
            contacts.push({ x: oLeftPct, y: newTop });
        } else if (newTop < oBottom && newBottom > oTop && Math.abs(oLeftPct - (newPart.x || 50)) < 12) {
            // Pieces collees lateralement (ex. boosters) : poussiere sur
            // toute la zone de contact vertical commun.
            const overlapTop = Math.max(newTop, oTop);
            const overlapBottom = Math.min(newBottom, oBottom);
            const steps = Math.max(2, Math.min(5, Math.floor((overlapBottom - overlapTop) / 80)));
            for (let i = 0; i <= steps; i++) {
                contacts.push({ x: ((newPart.x || 50) + oLeftPct) / 2, y: overlapTop + (overlapBottom - overlapTop) * i / steps });
            }
        }
    });
    if (!contacts.length) return;
    // Maximum 3 points de contact par piece : au-dela la poussiere fait un nuage opaque.
    while (contacts.length > 3) {
        contacts.splice(Math.floor(Math.random() * contacts.length), 1);
    }
    // Delai = duree de l'animation de chute : la poussiere jaillit a l'impact.
    setTimeout(() => {
        if (!container.isConnected) return;
        contacts.forEach(c => {
            const count = 7;
            for (let i = 0; i < count; i++) {
                const dust = document.createElement('div');
                dust.className = 'build-dust';
                const angle = (Math.PI * (0.15 + Math.random() * 0.7)) * (Math.random() < 0.5 ? 1 : -1);
                const dist = 18 + Math.random() * 34;
                dust.style.left = c.x + '%';
                dust.style.top = c.y + 'px';
                dust.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
                dust.style.setProperty('--dy', (-Math.abs(Math.sin(angle)) * dist - 12).toFixed(1) + 'px');
                dust.style.animationDelay = (Math.random() * 0.12).toFixed(2) + 's';
                container.appendChild(dust);
                dust.addEventListener('animationend', () => dust.remove());
            }
        });
    }, 600);
}

function checkRocketComplete() {
    const allConstructed = ROCKET_PARTS.every(p => p.purchased && constructedParts.has(p.id));
    
    const scene = document.getElementById('construction-scene');
    if (allConstructed && scene) {
        scene.classList.add('rocket-complete');
    } else if (scene) {
        scene.classList.remove('rocket-complete');
    }
    checkNextPlanetNotification();
}
function checkNextPlanetNotification() {
    if (nextPlanetNotified) return;
    const allConstructed = ROCKET_PARTS.every(p => p.purchased && constructedParts.has(p.id));
    if (!allConstructed) return;
    const progress = calculatePlanetProgress(maxDistance);
    const nextPlanet = progress && progress.nextPlanet ? progress.nextPlanet : null;
    const kmReached = !nextPlanet || calculateDistance() >= nextPlanet.distanceRequired;
    if (kmReached) {
        nextPlanetNotified = true;
        showNextPlanetNotification();
    }
}
function showNextPlanetNotification() {
    const notif = document.getElementById('next-planet-notification');
    if (!notif) return;
    const progress = calculatePlanetProgress(maxDistance);
    const planet = progress && progress.nextPlanet ? progress.nextPlanet : null;
    const imgEl = document.getElementById('npn-planet-img');
    const nameEl = document.getElementById('npn-planet-name');
    const distEl = document.getElementById('npn-planet-distance');
    if (planet) {
        imgEl.src = planet.imgPath;
        nameEl.textContent = t(planet.name);
        distEl.textContent = formatNumber(planet.distanceRequired) + ' km';
    } else {
        imgEl.src = 'images/rocket/Fusée3.png';
        nameEl.textContent = t('Dernière destination atteinte !');
        distEl.textContent = '';
    }
    notif.classList.add('active');
}
function closeNextPlanetNotification() {
    const notif = document.getElementById('next-planet-notification');
    if (notif) notif.classList.remove('active');
}

// Call in buyBuilding
// (À intégrer dans la fonction existante)

// Call in gameLoop
// (À intégrer dans la fonction existante)

// Initialize on start
// (À intégrer dans initGame)
