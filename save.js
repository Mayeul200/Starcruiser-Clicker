// Sauvegarde
function saveGame() {
    const saveData = {
        score: score,
        clickMultiplier: clickMultiplier,
        autoMultiplier: autoMultiplier,
        buildings: ERA.buildings.map(b => ({
            id: b.id,
            count: b.count
        })),
        upgrades: ERA.upgrades.map(u => ({
            id: u.id,
            active: u.active,
            endTime: u.endTime
        }))
    };
    localStorage.setItem('gloryOfFranceSave', JSON.stringify(saveData));
}

// Chargement
function loadGame() {
    const saveData = localStorage.getItem('gloryOfFranceSave');
    if (saveData) {
        try {
            const data = JSON.parse(saveData);
            score = data.score || 0;
            clickMultiplier = data.clickMultiplier || 1;
            autoMultiplier = data.autoMultiplier || 1;

            if (data.buildings) {
                data.buildings.forEach(savedBuilding => {
                    const building = ERA.buildings.find(b => b.id === savedBuilding.id);
                    if (building) building.count = savedBuilding.count || 0;
                });
            }

            if (data.upgrades) {
                data.upgrades.forEach(savedUpgrade => {
                    const upgrade = ERA.upgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.active = savedUpgrade.active || false;
                        upgrade.endTime = savedUpgrade.endTime || 0;
                    }
                });
            }
        } catch (e) {
            console.error("Erreur de chargement :", e);
        }
    }
}
