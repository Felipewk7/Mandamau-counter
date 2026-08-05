// ================================================================
// LEVEL 7 — WARWICK STEALTH GAME ENGINE
// ================================================================
const warwickStealthOverlay = document.getElementById('warwick-stealth-overlay');
const warwickCard           = document.getElementById('warwick-card');
const warwickDistanceText   = document.getElementById('warwick-distance-text');
const warwickDistanceFill   = document.getElementById('warwick-distance-fill');
const warwickOxygenText     = document.getElementById('warwick-oxygen-text');
const warwickOxygenFill     = document.getElementById('warwick-oxygen-fill');
const warwickBloodAlert     = document.getElementById('warwick-blood-alert');
const warwickAlertText      = document.getElementById('warwick-alert-text');
const warwickPlayerSprite   = document.getElementById('warwick-player-sprite');
const warwickSpeechBubble   = document.getElementById('warwick-speech-bubble');
const warwickJumpscare      = document.getElementById('warwick-jumpscare-overlay');
const warwickWinOverlay     = document.getElementById('warwick-win-overlay');
const warwickLoseOverlay    = document.getElementById('warwick-lose-overlay');
const warwickTutorialModal  = document.getElementById('warwick-tutorial-modal');
const btnCloseWarwickTut    = document.getElementById('btn-close-warwick-tutorial');
const btnWarwickQuit        = document.getElementById('btn-warwick-quit');
const btnWarwickWinOk       = document.getElementById('btn-warwick-win-ok');
const btnWarwickRestart     = document.getElementById('btn-warwick-restart');
const btnWarwickWalk        = document.getElementById('btn-warwick-walk');
const btnWarwickBreath      = document.getElementById('btn-warwick-breath');

let warwickGameActive  = false;
let warwickDistance    = 0; // 0 to 100%
let warwickOxygen      = 100; // 0 to 100%
let warwickIsWalking   = false;
let warwickIsHoldingBreath = false;
let warwickHuntMode    = false; // true when red alert is active
let warwickWarningMode = false; // 1s warning before hunt mode
let warwickLoopId      = null;
let warwickHuntTimeout = null;

const WARWICK_SPEECHES = [
    "Sinto cheiro de medo no ar...",
    "Não adianta correr... eu sinto seu pulso!",
    "Minhas garras estão famintas...",
    "Hummm... fôlego curto?",
    "Ouço seus passos... pare de andar!"
];

function updateWarwickUI() {
    if (warwickDistanceText) warwickDistanceText.textContent = `${Math.floor(warwickDistance)}%`;
    if (warwickDistanceFill) warwickDistanceFill.style.width = `${Math.min(100, Math.floor(warwickDistance))}%`;
    if (warwickPlayerSprite) warwickPlayerSprite.style.left = `${Math.min(92, Math.floor(warwickDistance * 0.92))}%`;
    
    if (warwickOxygenText) warwickOxygenText.textContent = `${Math.floor(warwickOxygen)}%`;
    if (warwickOxygenFill) {
        warwickOxygenFill.style.width = `${Math.max(0, Math.floor(warwickOxygen))}%`;
        if (warwickOxygen < 25) {
            warwickOxygenFill.classList.add('low-oxygen');
        } else {
            warwickOxygenFill.classList.remove('low-oxygen');
        }
    }
}

function openWarwickGame() {
    const overlay = document.getElementById('warwick-stealth-overlay') || warwickStealthOverlay;
    if (!overlay) return;
    overlay.classList.add('active');
    
    const winOv = document.getElementById('warwick-win-overlay');
    const loseOv = document.getElementById('warwick-lose-overlay');
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
    if (warwickTutorialModal) warwickTutorialModal.style.display = 'none';
    if (warwickWinOverlay) warwickWinOverlay.style.display = 'none';
    if (warwickLoseOverlay) warwickLoseOverlay.style.display = 'none';
    if (warwickJumpscare) warwickJumpscare.style.display = 'none';
    
    warwickDistance = 0;
    warwickOxygen = 100;
    warwickIsWalking = false;
    warwickIsHoldingBreath = false;
    warwickHuntMode = false;
    warwickWarningMode = false;
    warwickGameActive = true;
    
    if (warwickCard) warwickCard.classList.remove('hunt-mode-active');
    if (warwickBloodAlert) warwickBloodAlert.style.display = 'none';
    
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
                
                // End Hunt Mode
                warwickHuntMode = false;
                if (warwickCard) warwickCard.classList.remove('hunt-mode-active');
                if (warwickBloodAlert) warwickBloodAlert.style.display = 'none';
                if (warwickSpeechBubble) {
                    warwickSpeechBubble.textContent = WARWICK_SPEECHES[Math.floor(Math.random() * WARWICK_SPEECHES.length)];
                }
                
                scheduleNextWarwickHunt();
            }, huntDuration);
        }, 1000);
    }, nextInterval);
}

function runWarwickGameLoop() {
    if (!warwickGameActive) return;
    
    // Process Walking
    if (warwickIsWalking) {
        if (warwickHuntMode) {
            triggerWarwickJumpscare("Você se moveu durante o Modo Caça!");
            return;
        }
        warwickDistance += 0.35;
        if (warwickDistance >= 100) {
            warwickDistance = 100;
            updateWarwickUI();
            endWarwickGame(true);
            return;
        }
    }
    
    // Process Holding Breath
    if (warwickIsHoldingBreath) {
        warwickOxygen -= 0.45;
        if (warwickOxygen <= 0) {
            warwickOxygen = 0;
            updateWarwickUI();
            triggerWarwickJumpscare("Seu fôlego acabou e você tossiu!");
            return;
        }
    } else {
        if (warwickOxygen < 100) {
            warwickOxygen = Math.min(100, warwickOxygen + 0.35);
        }
        
        if (warwickHuntMode) {
            triggerWarwickJumpscare("Você não prendeu a respiração durante o Modo Caça!");
            return;
        }
    }
    
    updateWarwickUI();
    warwickLoopId = requestAnimationFrame(runWarwickGameLoop);
}

function triggerWarwickJumpscare(reason) {
    warwickGameActive = false;
    if (warwickLoopId) cancelAnimationFrame(warwickLoopId);
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
    if (e.code === 'Space') {
        warwickIsHoldingBreath = true;
        if (btnWarwickBreath) btnWarwickBreath.classList.add('active-holding');
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (!warwickGameActive) return;
    if (['KeyW', 'ArrowUp'].includes(e.code)) {
        warwickIsWalking = false;
        if (btnWarwickWalk) btnWarwickWalk.classList.remove('active-holding');
    }
    if (e.code === 'Space') {
        warwickIsHoldingBreath = false;
        if (btnWarwickBreath) btnWarwickBreath.classList.remove('active-holding');
    }
});

// Button Controls (Mouse / Touch)
document.addEventListener('DOMContentLoaded', () => {
    if (btnWarwickWalk) {
        btnWarwickWalk.addEventListener('mousedown', () => { if (warwickGameActive) warwickIsWalking = true; });
        btnWarwickWalk.addEventListener('mouseup', () => { warwickIsWalking = false; });
        btnWarwickWalk.addEventListener('mouseleave', () => { warwickIsWalking = false; });
        btnWarwickWalk.addEventListener('touchstart', (e) => { e.preventDefault(); if (warwickGameActive) warwickIsWalking = true; });
        btnWarwickWalk.addEventListener('touchend', (e) => { e.preventDefault(); warwickIsWalking = false; });
    }

    if (btnWarwickBreath) {
        btnWarwickBreath.addEventListener('mousedown', () => { if (warwickGameActive) warwickIsHoldingBreath = true; });
        btnWarwickBreath.addEventListener('mouseup', () => { warwickIsHoldingBreath = false; });
        btnWarwickBreath.addEventListener('mouseleave', () => { warwickIsHoldingBreath = false; });
        btnWarwickBreath.addEventListener('touchstart', (e) => { e.preventDefault(); if (warwickGameActive) warwickIsHoldingBreath = true; });
        btnWarwickBreath.addEventListener('touchend', (e) => { e.preventDefault(); warwickIsHoldingBreath = false; });
    }

    if (btnCloseWarwickTut) {
        btnCloseWarwickTut.addEventListener('click', () => {
            try { playSound('click'); } catch(e) {}
            startWarwickGame();
        });
    }

    if (btnWarwickQuit) {
        btnWarwickQuit.addEventListener('click', () => {
            closeWarwickGame();
            try { playSound('click'); } catch(e) {}
        });
    }

    if (btnWarwickRestart) {
        btnWarwickRestart.addEventListener('click', () => {
            try { playSound('click'); } catch(e) {}
            startWarwickGame();
        });
    }

    if (btnWarwickWinOk) {
        btnWarwickWinOk.addEventListener('click', () => {
            closeWarwickGame();
            try { playSound('rank_up_high'); } catch(e) {}
            
            // Open journey on Chapter 2 (warwick victory → fase 8 unlocked)
            openJourney();
            setTimeout(() => {
                // Navigate to Chapter 2 where node-fase8 lives
                switchMapChapter(2);
                const nodeF8 = document.getElementById('node-fase8');
                const lineF8 = document.querySelector('.line-fase8');
                if (nodeF8) {
                    nodeF8.className = 'map-node node-active';
                    nodeF8.title = 'Fase 8 - Disponível';
                    const iconSpan = nodeF8.querySelector('.node-icon');
                    if (iconSpan) iconSpan.textContent = '🗣️';
                }
                if (lineF8) lineF8.classList.add('line-active');
                
                const token = document.getElementById('journey-player-token');
                if (token) {
                    token.style.left = '55%';
                    token.style.top = '40%';
                }
            }, 600);
        });
    }
});