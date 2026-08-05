    if (warwickHuntTimeout) clearTimeout(warwickHuntTimeout);
    
    if (warwickJumpscare) warwickJumpscare.style.display = 'flex';
    try { playSound('bako_cheat'); } catch(e) {}
    
    setTimeout(() => {
        if (warwickJumpscare) warwickJumpscare.style.display = 'none';
        endWarwickGame(false, reason);
    }, 1200);
}

function endWarwickGame(isVictory, reason) {
    warwickGameActive = false;
    if (warwickLoopId) cancelAnimationFrame(warwickLoopId);
    if (warwickHuntTimeout) clearTimeout(warwickHuntTimeout);
    if (warwickCard) warwickCard.classList.remove('hunt-mode-active');
    if (warwickBloodAlert) warwickBloodAlert.style.display = 'none';
    
    if (isVictory) {
        try { playSound('rank_up'); } catch(e) {}
        localStorage.setItem('mandamau_journey_fase7_completed', 'true');
        if (warwickWinOverlay) warwickWinOverlay.style.display = 'flex';
    } else {
        try { playSound('reset'); } catch(e) {}
        if (warwickLoseOverlay) {
            const desc = warwickLoseOverlay.querySelector('.warwick-end-desc');
            if (desc && reason) desc.textContent = reason;
            warwickLoseOverlay.style.display = 'flex';
        }
    }
}

function closeWarwickGame() {
    warwickGameActive = false;
    if (warwickLoopId) cancelAnimationFrame(warwickLoopId);
    if (warwickHuntTimeout) clearTimeout(warwickHuntTimeout);
    fadeOutTheme();
    if (warwickStealthOverlay) warwickStealthOverlay.classList.remove('active');
    if (journeyEncounterOverlay) journeyEncounterOverlay.classList.remove('active');
    currentBossEncounter = null;
}

// Input Controls (Keyboard & Buttons)
window.addEventListener('keydown', (e) => {
    if (!warwickGameActive) return;
    if (['KeyW', 'ArrowUp'].includes(e.code)) {
        warwickIsWalking = true;
        if (btnWarwickWalk) btnWarwickWalk.classList.add('active-holding');
        if (e.code.startsWith('Arrow')) e.preventDefault();
    }