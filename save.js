// ===== SAUVEGARDE =====
function saveGame() {
    const saveData = {
        score: score,
        clickMultiplier: clickMultiplier,
        autoMultiplier: autoMultiplier,
        clickPDGTotal: clickPDGTotal,
        clickBonus: clickBonus,
        activatedClickUpgrades: activatedClickUpgrades,
        buildings: ERA.buildings.map(b => ({
            id: b.id,
            count: b.count
        })),
        buildingMultipliers: buildingMultipliers,
        randomBonuses: activeRandomBonuses.map(b => ({
            id: b.id,
            effect: b.effect,
            multiplier: b.multiplier,
            endTime: b.endTime
        }))
    };
    localStorage.setItem('gloryOfFranceSave', JSON.stringify(saveData));
}

// ===== CHARGEMENT =====
function loadGame() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (saveData) {
        try {
            const data = JSON.parse(saveData);
            score = data.score || 0;
            clickMultiplier = data.clickMultiplier || 1;
            autoMultiplier = data.autoMultiplier || 1;
            clickPDGTotal = data.clickPDGTotal || 0;
            clickBonus = data.clickBonus || 0;
            activatedClickUpgrades = data.activatedClickUpgrades || [];

            if (data.buildings) {
                data.buildings.forEach(savedBuilding => {
                    const building = ERA.buildings.find(b => b.id === savedBuilding.id);
                    if (building) building.count = savedBuilding.count || 0;
                });
            }

            if (data.buildingMultipliers) {
                buildingMultipliers = data.buildingMultipliers;
            }

            if (data.randomBonuses) {
                activeRandomBonuses = data.randomBonuses;
                activeRandomBonuses.forEach(bonus => {
                    if (bonus.effect === "auto") autoMultiplier = bonus.multiplier;
                    if (bonus.effect === "click") clickMultiplier = bonus.multiplier;
                });
            }
        } catch (e) {
            console.error("Erreur de chargement :", e);
        }
    }
}
