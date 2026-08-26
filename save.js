// SAUVEGARDE
function saveGame() {
    const saveData = {
        score: score,
        autoGain: autoGain,
        clickMultiplier: clickMultiplier,
        autoMultiplier: autoMultiplier,
        clickGloireTotal: clickGloireTotal,
        clickBonus: clickBonus,
        unlockedBuildings: Array.from(unlockedBuildings),
        lastMedalRainTime: lastMedalRainTime,
        currentEraIndex: currentEraIndex,
        buildingMultipliers: { ...buildingMultipliers },
        totalGeneratedByBuilding: { ...totalGeneratedByBuilding },
        activatedClickUpgrades: [...activatedClickUpgrades],
        activeRandomBonuses: activeRandomBonuses.map(bonus => ({
            id: bonus.id,
            effect: bonus.effect,
            multiplier: bonus.multiplier,
            endTime: bonus.endTime
        })),
        eras: ERAS.map(era => ({
            id: era.id,
            buildings: era.buildings.map(building => ({
                id: building.id,
                count: building.count
            }))
        })),
        lastSave: Date.now(),
        version: "2.0.0"
    };

    localStorage.setItem('gloryOfFranceSave', JSON.stringify(saveData));
}

// CHARGEMENT
function loadGame() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (!saveData) return;

    try {
        const parsed = JSON.parse(saveData);

        score = parsed.score || 0;
        autoGain = parsed.autoGain || 0;
        clickMultiplier = parsed.clickMultiplier || 1;
        autoMultiplier = parsed.autoMultiplier || 1;
        clickGloireTotal = parsed.clickGloireTotal || 0;
        clickBonus = parsed.clickBonus || 0;
        lastMedalRainTime = parsed.lastMedalRainTime || 0;
        currentEraIndex = parsed.currentEraIndex || 0;

        if (parsed.buildingMultipliers) {
            Object.keys(buildingMultipliers).forEach(key => {
                buildingMultipliers[key] = parsed.buildingMultipliers[key] || 1;
            });
        }

        if (parsed.totalGeneratedByBuilding) {
            Object.keys(totalGeneratedByBuilding).forEach(key => {
                totalGeneratedByBuilding[key] = parsed.totalGeneratedByBuilding[key] || 0;
            });
        }

        activatedClickUpgrades = parsed.activatedClickUpgrades || [];
        if (parsed.unlockedBuildings) {
            unlockedBuildings = new Set(parsed.unlockedBuildings);
        }

        if (parsed.activeRandomBonuses) {
            activeRandomBonuses = parsed.activeRandomBonuses;
            activeRandomBonuses.forEach(bonus => {
                if (bonus.effect === "auto" || bonus.effect === "both") autoMultiplier = bonus.multiplier;
                if (bonus.effect === "click" || bonus.effect === "both") clickMultiplier = bonus.multiplier;
            });
        }

        if (parsed.eras) {
            parsed.eras.forEach(savedEra => {
                const era = ERAS.find(e => e.id === savedEra.id);
                if (era) {
                    savedEra.buildings.forEach(savedBuilding => {
                        const building = era.buildings.find(b => b.id === savedBuilding.id);
                        if (building) {
                            building.count = savedBuilding.count || 0;
                        }
                    });
                }
            });
        }

        const now = Date.now();
        activeRandomBonuses = activeRandomBonuses.filter(bonus => bonus.endTime >= now);
        if (activeRandomBonuses.length === 0) {
            autoMultiplier = 1;
            clickMultiplier = 1;
        }

    } catch (e) {
        console.error("Erreur de chargement :", e);
        localStorage.removeItem('gloryOfFranceSave');
        showToast("⚠️ Sauvegarde corrompue. Nouvelle partie.");
    }
}

// EXPORT/IMPORT/DELETE
function exportSave() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (saveData) {
        navigator.clipboard.writeText(saveData)
            .then(() => showToast("✅ Sauvegarde copiée !"))
            .catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = saveData;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast("✅ Sauvegarde copiée !");
            });
    } else {
        showToast("❌ Aucune sauvegarde.");
    }
}

function importSave() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) { showToast("❌ Rien à importer."); return; }
    try {
        const testParse = JSON.parse(importText);
        if (testParse.version && testParse.eras && testParse.buildingMultipliers) {
            localStorage.setItem('gloryOfFranceSave', importText);
            showToast("✅ Importé ! Redémarrage...");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast("❌ Format invalide.");
        }
    } catch (e) {
        showToast("❌ Format invalide.");
    }
}

function confirmDeleteSave() {
    if (confirm("⚠️ Supprimer la sauvegarde ? Tous vos progrès seront PERDUS !")) {
        deleteSave();
    }
}

function deleteSave() {
    localStorage.removeItem('gloryOfFranceSave');
    showToast("🗑️ Supprimé !");
    window.location.reload(); // Rechargement immédiat
}
