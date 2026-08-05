    const jumpOv = document.getElementById('warwick-jumpscare-overlay');
    const tutModal = document.getElementById('warwick-tutorial-modal');
    
    if (winOv) winOv.style.display = 'none';
    if (loseOv) loseOv.style.display = 'none';
    if (jumpOv) jumpOv.style.display = 'none';
    if (tutModal) tutModal.style.display = 'flex';
    
    warwickGameActive = false;
    playTheme('fase6');
}

function startWarwickGame() {
    const tutModal = document.getElementById('warwick-tutorial-modal') || warwickTutorialModal;
    const winOv = document.getElementById('warwick-win-overlay') || warwickWinOverlay;
    const loseOv = document.getElementById('warwick-lose-overlay') || warwickLoseOverlay;
    const jumpOv = document.getElementById('warwick-jumpscare-overlay') || warwickJumpscare;

    if (tutModal) tutModal.style.display = 'none';
    if (winOv) winOv.style.display = 'none';
    if (loseOv) loseOv.style.display = 'none';
    if (jumpOv) jumpOv.style.display = 'none';
    
    warwickDistance = 0;
    warwickOxygen = 100;
    warwickIsWalking = false;
    warwickIsHoldingBreath = false;
    warwickHuntMode = false;
    warwickWarningMode = false;
    warwickGameActive = true;
    
    const card = document.getElementById('warwick-card') || warwickCard;
    const bloodAlert = document.getElementById('warwick-blood-alert') || warwickBloodAlert;

    if (card) card.classList.remove('hunt-mode-active');
    if (bloodAlert) bloodAlert.style.display = 'none';
    
    updateWarwickUI();
    
    if (warwickLoopId) cancelAnimationFrame(warwickLoopId);
    if (warwickHuntTimeout) clearTimeout(warwickHuntTimeout);
    
    scheduleNextWarwickHunt();
    runWarwickGameLoop();
}

function scheduleNextWarwickHunt() {
    if (!warwickGameActive) return;
    
    const nextInterval = Math.floor(Math.random() * 2200) + 2000;
    
    warwickHuntTimeout = setTimeout(() => {
        if (!warwickGameActive) return;
        
        // Step 1: Warning (1 sec)
        warwickWarningMode = true;
        if (warwickBloodAlert) {
            warwickAlertText.textContent = "🚨 ALERTA: SENSO DE SANGUE IMINENTE! 🚨";
            warwickBloodAlert.style.display = 'flex';
        }
        try { playSound('bako_cheat'); } catch(e) {}
        
        setTimeout(() => {
            if (!warwickGameActive) return;
            
            // Step 2: Active Hunt Mode (2s to 3.5s)
            warwickWarningMode = false;
            warwickHuntMode = true;
            if (warwickCard) warwickCard.classList.add('hunt-mode-active');
            if (warwickBloodAlert) {
                warwickAlertText.textContent = "🚨 MODO CAÇA ATIVO! PRENDA A RESPIRAÇÃO! 🚨";
            }
            if (warwickSpeechBubble) {
                warwickSpeechBubble.textContent = "EU SINTO SEU CHEIRO! NÃO SE MOVA!";
            }
            
            const huntDuration = Math.floor(Math.random() * 1500) + 2000;
            
            setTimeout(() => {
                if (!warwickGameActive) return;