// ===== SAUVEGARDE AVEC COOKIES (Alternative à localStorage) =====
function saveGame() {
    const saveData = {
        score: score,
        autoGain: autoGain,
        clickMultiplier: clickMultiplier,
        autoMultiplier: autoMultiplier,
        buildingMultipliers: { ...buildingMultipliers },
        clickPDGTotal: clickPDGTotal,
        clickBonus: clickBonus,
        activatedClickUpgrades: [...activatedClickUpgrades],
        buildings: ERA.buildings.map(b => ({ id: b.id, count: b.count })),
        activeRandomBonuses: activeRandomBonuses.map(b => ({
            id: b.id, effect: b.effect, multiplier: b.multiplier, endTime: b.endTime
        }))
    };

    // Sauvegarder dans un cookie (valable 1 an)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `gloryOfFranceSave=${JSON.stringify(saveData)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

function loadGame() {
    // Récupérer depuis le cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const saveData = cookies.gloryOfFranceSave;
    if (!saveData) return;

    try {
        const parsed = JSON.parse(saveData);

        score = parsed.score || 0;
        autoGain = parsed.autoGain || 0;
        clickMultiplier = parsed.clickMultiplier || 1;
        autoMultiplier = parsed.autoMultiplier || 1;

        if (parsed.buildingMultipliers) {
            Object.keys(buildingMultipliers).forEach(key => {
                buildingMultipliers[key] = parsed.buildingMultipliers[key] || 1;
            });
        }

        clickPDGTotal = parsed.clickPDGTotal || 0;
        clickBonus = parsed.clickBonus || 0;
        activatedClickUpgrades = parsed.activatedClickUpgrades || [];

        if (parsed.buildings) {
            parsed.buildings.forEach(savedBuilding => {
                const building = ERA.buildings.find(b => b.id === savedBuilding.id);
                if (building) building.count = savedBuilding.count || 0;
            });
        }

        if (parsed.activeRandomBonuses) {
            activeRandomBonuses = parsed.activeRandomBonuses;
            activeRandomBonuses.forEach(bonus => {
                if (bonus.effect === "auto") autoMultiplier = bonus.multiplier;
                if (bonus.effect === "click") clickMultiplier = bonus.multiplier;
            });
        }
    } catch (e) {
        console.error("Erreur chargement cookie :", e);
        // Supprimer le cookie corrompu
        document.cookie = "gloryOfFranceSave=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

// ===== SUPPRESSION AVEC COOKIES =====
function deleteSave() {
    try {
        document.cookie = "gloryOfFranceSave=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        showToast("🗑️ Sauvegarde supprimée !");
        setTimeout(() => {
            window.location.href = window.location.href.split('?')[0] + '?nocache=' + Date.now();
        }, 1000);
    } catch (e) {
        showToast("❌ Erreur suppression cookie");
    }
}
