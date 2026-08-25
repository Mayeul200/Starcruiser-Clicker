// ===== GESTION COMPLÈTE DE SAUVEGARDE AVEC COOKIES =====

// ===== FONCTIONS DE COOKIES =====
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ===== SAUVEGARDE =====
function saveGame() {
    if (typeof score === 'undefined' || typeof ERA === 'undefined') {
        console.error("saveGame appelé trop tôt - variables non définies");
        return;
    }

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
    setCookie('gloryOfFranceSave', JSON.stringify(saveData));
    console.log("✅ Sauvegarde enregistrée dans cookie");
}

// ===== CHARGEMENT =====
function loadGame() {
    const saveData = getCookie('gloryOfFranceSave');
    if (!saveData) {
        console.log("Aucune sauvegarde trouvée");
        return;
    }

    try {
        const parsed = JSON.parse(saveData);

        // Vérifier que ERA est défini
        if (typeof ERA === 'undefined') {
            console.error("ERA non défini - chargement reporté");
            setTimeout(loadGame, 100);
            return;
        }

        // Récupérer les données
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

        console.log("✅ Sauvegarde chargée depuis cookie");
    } catch (e) {
        console.error("❌ Erreur chargement :", e);
        deleteCookie('gloryOfFranceSave');
    }
}

// ===== FONCTIONS PUBLIQUES (accessibles depuis game.js) =====
function exportSave() {
    const saveData = getCookie('gloryOfFranceSave');
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

function importSave() {
    const importText = document.getElementById('import-textarea').value.trim();
    if (!importText) {
        showToast("❌ Aucune sauvegarde à importer.");
        return;
    }

    try {
        JSON.parse(importText);
        setCookie('gloryOfFranceSave', importText);
        showToast("✅ Sauvegarde importée ! Rechargement...");
        setTimeout(() => {
            window.location.href = window.location.href.split('?')[0] + '?nocache=' + Date.now();
        }, 1000);
    } catch (e) {
        showToast("❌ Format invalide. Collez une sauvegarde valide.");
    }
}

function confirmDeleteSave() {
    if (confirm("⚠️ ATTENTION !\n\nVoulez-vous VRAIMENT supprimer votre sauvegarde ?\n\nTous vos Points De Gloire, bâtiments et progrès seront PERDUS définitivement !")) {
        deleteSave();
    }
}

function deleteSave() {
    deleteCookie('gloryOfFranceSave');
    showToast("🗑️ Sauvegarde supprimée ! Rechargement...");
    setTimeout(() => {
        window.location.href = window.location.href.split('?')[0] + '?nocache=' + Date.now();
    }, 1000);
}

// ===== TOAST (déplacée ici pour être accessible) =====
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}
