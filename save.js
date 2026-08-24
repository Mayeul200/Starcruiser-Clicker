// ===== SAUVEGARDE & CHARGEMENT =====

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
        buildings: ERA.buildings.map(building => ({
            id: building.id,
            count: building.count
        })),
        activeRandomBonuses: activeRandomBonuses.map(bonus => ({
            id: bonus.id,
            effect: bonus.effect,
            multiplier: bonus.multiplier,
            endTime: bonus.endTime
        }))
    };
    localStorage.setItem('gloryOfFranceSave', JSON.stringify(saveData));
}

function loadGame() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
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
                if (building) {
                    building.count = savedBuilding.count || 0;
                }
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
        console.error("Erreur de chargement de la sauvegarde :", e);
        localStorage.removeItem('gloryOfFranceSave');
    }
}

// ===== IMPORT DE SAUVEGARDE =====
function importSave() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) {
        showToast("❌ Aucune sauvegarde à importer.");
        return;
    }

    try {
        // Vérifier que c'est un JSON valide
        JSON.parse(importText);
        localStorage.setItem('gloryOfFranceSave', importText);
        showToast("✅ Sauvegarde importée ! Rechargement en cours...");

        // Recharger la page après un court délai
        setTimeout(() => {
            location.reload();
        }, 1000);
    } catch (e) {
        console.error("Erreur lors de l'import :", e);
        showToast("❌ Format invalide. Collez une sauvegarde valide.");
    }
}
