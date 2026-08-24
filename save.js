// Sauvegarde la partie dans le localStorage
function saveGame() {
    const saveData = {
        score: score,
        multipliers: multipliers,
        eras: ERAS.map(era => ({
            name: era.name,
            requiredScore: era.requiredScore,
            items: era.items.map(item => ({
                id: item.id,
                count: item.count,
                globalUpgrade: item.globalUpgrade ? {
                    unlocked: item.globalUpgrade.unlocked
                } : null
            }))
        }))
    };
    localStorage.setItem('gloryOfFranceClicker', JSON.stringify(saveData));
}

// Charge la partie depuis le localStorage
function loadGame() {
    const saveData = localStorage.getItem('gloryOfFranceClicker');
    if (saveData) {
        try {
            const parsedData = JSON.parse(saveData);
            score = parsedData.score || 0;
            multipliers = parsedData.multipliers || {};

            if (parsedData.eras) {
                parsedData.eras.forEach((savedEra, eraIndex) => {
                    if (ERAS[eraIndex]) {
                        savedEra.items.forEach((savedItem, itemIndex) => {
                            if (ERAS[eraIndex].items[itemIndex]) {
                                ERAS[eraIndex].items[itemIndex].count = savedItem.count || 0;
                                if (ERAS[eraIndex].items[itemIndex].globalUpgrade && savedItem.globalUpgrade) {
                                    ERAS[eraIndex].items[itemIndex].globalUpgrade.unlocked = savedItem.globalUpgrade.unlocked || false;
                                }
                            }
                        });
                    }
                });
            }
        } catch (e) {
            console.error("Erreur lors du chargement de la sauvegarde :", e);
        }
    }
}
