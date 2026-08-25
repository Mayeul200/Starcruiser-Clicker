// ===== GESTION DE SAUVEGARDE AVEC COOKIES =====
// (Alternative à localStorage qui est bloqué par les extensions)

function getSaveCookie() {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});
    return cookies.gloryOfFranceSave;
}

function setSaveCookie(data) {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // Valable 1 an
    document.cookie = `gloryOfFranceSave=${data}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

function deleteSaveCookie() {
    document.cookie = "gloryOfFranceSave=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

// ===== SAUVEGARDE =====
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
    setSaveCookie(JSON.stringify(saveData));
}

// ===== CHARGEMENT =====
function loadGame() {
    const saveData = getSaveCookie();
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
        console.error("Erreur chargement :", e);
        deleteSaveCookie(); // Supprimer le cookie corrompu
    }
}

// ===== SUPPRESSION =====
function deleteSave() {
    deleteSaveCookie();
    showToast("🗑️ Sauvegarde supprimée ! Rechargement...");
    setTimeout(() => {
        window.location.href = window.location.href.split('?')[0] + '?nocache=' + Date.now();
    }, 1000);
}

// ===== EXPORT =====
function exportSave() {
    const saveData = getSaveCookie();
    if (saveData) {
        navigator.clipboard.writeText(saveData)
            .then(() => showToast("✅ Sauvegarde copiée !"))
            .catch(() => {
                prompt("Copiez cette sauvegarde :", saveData);
                showToast("✅ Sauvegarde copiée manuellement.");
            });
    } else {
        showToast("❌ Aucune sauvegarde trouvée.");
    }
}

// ===== IMPORT =====
function importSaveFromTextarea() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) {
        showToast("❌ Aucune sauvegarde à importer.");
        return;
    }

    try {
        JSON.parse(importText); // Vérifier que c'est un JSON valide
        setSaveCookie(importText);
        showToast("✅ Sauvegarde importée ! Rechargement...");
        setTimeout(() => {
            window.location.href = window.location.href.split('?')[0] + '?nocache=' + Date.now();
        }, 1000);
    } catch (e) {
        showToast("❌ Format invalide. Collez une sauvegarde valide.");
    }
}
