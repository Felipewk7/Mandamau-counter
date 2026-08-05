                
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