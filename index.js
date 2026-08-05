// ================================================================
// THEME MUSIC SYSTEM
// ================================================================
const gameThemeAudio = document.getElementById('game-theme');
const bgMusicAudio   = document.getElementById('bg-music');
let currentThemeFile = '';



// ================================================================
// LEVEL 6 — VOLIBEAR STORM (5-ROUND BULLET HELL ENGINE)
// ================================================================
const volibearStormOverlay = document.getElementById('volibear-storm-overlay');
const volibearArena        = document.getElementById('volibear-arena');
const volibearPlayerToken  = document.getElementById('volibear-player-token');
const volibearRoundNum     = document.getElementById('volibear-round-num');
const volibearTimerNum     = document.getElementById('volibear-timer-num');
const volibearLivesHearts  = document.getElementById('volibear-lives-hearts');
const volibearSpeechBubble = document.getElementById('volibear-speech-bubble');
const volibearWinOverlay   = document.getElementById('volibear-win-overlay');
const volibearLoseOverlay  = document.getElementById('volibear-lose-overlay');
const volibearTutorialModal= document.getElementById('volibear-tutorial-modal');
const volibearRoundBanner  = document.getElementById('volibear-round-banner');
const volibearBannerTitle  = document.getElementById('volibear-banner-title');
const volibearBannerSub    = document.getElementById('volibear-banner-sub');
const btnCloseVolibearTut  = document.getElementById('btn-close-volibear-tutorial');
const btnVolibearQuit      = document.getElementById('btn-volibear-quit');
const btnVolibearWinOk     = document.getElementById('btn-volibear-win-ok');
const btnVolibearRestart   = document.getElementById('btn-volibear-restart');


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
    if (!warwickStealthOverlay) return;
    warwickStealthOverlay.classList.add('active');
    if (warwickWinOverlay) warwickWinOverlay.style.display = 'none';
    if (warwickLoseOverlay) warwickLoseOverlay.style.display = 'none';
    if (warwickJumpscare) warwickJumpscare.style.display = 'none';
    if (warwickTutorialModal) warwickTutorialModal.style.display = 'flex';
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
            
            // Unlock Fase 8 on Chapter 2 map & auto-walk token
            openJourney();
            setTimeout(() => {
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
// ================================================================

const VOLIBEAR_ROUND_SPEECHES = {
    1: ["A TEMPESTADE NÃO TEM PIEDADE!", "SINTA O PODER DOS RAIOS!", "o boga do bako é meu"],
    2: ["ESPIRAL DUPLA INVERTIDA! NÃO HÁ PARA ONDE FUGIR!", "GIRE NO RITMO DA MORTE!", "O VÓRTEX VAI TE ENGOLIR!"],
    3: ["MATRIZ DE TROVÕES DESTRUTIVA! ACHE O QUADRADO DA SALVAÇÃO!", "GRADE DE LASERS ABSURDA!", "DESVIE DA MATRIZ ELÉTRICA!"],
    4: ["EU FECHO O SEU CERCO! O BOGA É MEU!", "RAIOS PERSEGUIDORES EM VOCÊ!", "Sinta meu trovão te caçar!"],
    5: ["APOCALIPSE ELÉTRICO! NINGUÉM ESCAPA DA MINHA FÚRIA!", "CAOS TOTAL! DESVIE SE FOR CAPAZ!", "O MUNDO VAI SUBMERGIR EM TROVÕES!"]
};

let volibearGameActive = false;
let volibearRound = 1;
let volibearTimeLeft = 15;
let volibearLives = 3;
let volibearPlayerPos = { x: 225, y: 150 };
let volibearKeys = {};
let volibearTimerInterval = null;
let volibearSpawnTimeout = null;
let volibearAnimFrame = null;
let volibearSpeechInterval = null;
let volibearSpiralAngle = 0;
let volibearGridStep = 0;

function updateVolibearLivesUI() {
    if (!volibearLivesHearts) return;
    let hearts = '';
    for (let i = 0; i < 3; i++) {
        hearts += i < volibearLives ? '❤️' : '🖤';
    }
    volibearLivesHearts.textContent = hearts;
}

function updateVolibearRoundUI() {
    if (volibearRoundNum) volibearRoundNum.textContent = `${volibearRound} / 5`;
}

function openVolibearGame() {
    if (!volibearStormOverlay) return;
    volibearStormOverlay.classList.add('active');
    if (volibearWinOverlay) volibearWinOverlay.style.display = 'none';
    if (volibearLoseOverlay) volibearLoseOverlay.style.display = 'none';
    if (volibearTutorialModal) volibearTutorialModal.style.display = 'flex';
    if (volibearRoundBanner) volibearRoundBanner.style.display = 'none';
    volibearGameActive = false;
    playTheme('fase6');
}

function startVolibearGame() {
    if (volibearTutorialModal) volibearTutorialModal.style.display = 'none';
    if (volibearWinOverlay) volibearWinOverlay.style.display = 'none';
    if (volibearLoseOverlay) volibearLoseOverlay.style.display = 'none';
    
    volibearRound = 1;
    volibearLives = 3;
    startVolibearRound(1);
}

function startVolibearRound(roundNum) {
    volibearRound = roundNum;
    volibearTimeLeft = 15;
    volibearGameActive = false; // pause briefly during banner
    volibearKeys = {}; // Reset held movement keys to prevent drifting bug!
    
    updateVolibearRoundUI();
    updateVolibearLivesUI();
    if (volibearTimerNum) volibearTimerNum.textContent = '15s';
    
    // Clear previous intervals/timeouts
    if (volibearTimerInterval) clearInterval(volibearTimerInterval);
    if (volibearSpawnTimeout) clearTimeout(volibearSpawnTimeout);
    if (volibearSpeechInterval) clearInterval(volibearSpeechInterval);
    if (volibearAnimFrame) cancelAnimationFrame(volibearAnimFrame);
    
    if (volibearArena) {
        volibearArena.querySelectorAll('.volibear-danger-zone, .volibear-lightning-strike').forEach(el => el.remove());
    }
    
    // Show Round Banner
    if (volibearRoundBanner) {
        volibearBannerTitle.textContent = `⚡ RODADA ${volibearRound} / 5 ⚡`;
        const subTitles = {
            1: "Tempestade Aleatória de Aquecimento!",
            2: "🔥 ESPIRAL DUPLA INVERTIDA + VÓRTEX! 🔥",
            3: "⚡ MATRIZ DE DISPARO CRUZADO 3x3! ⚡",
            4: "Cerco Fechado e Raios Perseguidores!",
            5: "☠️ APOCALIPSE ELÉTRICO FINAL! ☠️"
        };
        volibearBannerSub.textContent = subTitles[volibearRound] || "Prepare-se!";
        volibearRoundBanner.style.display = 'flex';
    }
    
    // Speech update
    const roundSpeeches = VOLIBEAR_ROUND_SPEECHES[volibearRound] || VOLIBEAR_ROUND_SPEECHES[1];
    if (volibearSpeechBubble) {
        volibearSpeechBubble.textContent = roundSpeeches[0];
    }
    
    // Start active round after banner
    setTimeout(() => {
        if (volibearRoundBanner) volibearRoundBanner.style.display = 'none';
        volibearKeys = {}; // Clean key state right as round starts!
        volibearGameActive = true;
        
        // Center player
        const rect = volibearArena.getBoundingClientRect();
        const arenaW = rect.width || 480;
        const arenaH = rect.height || 300;
        volibearPlayerPos = { x: arenaW / 2, y: arenaH / 2 };
        updateVolibearPlayerPosition();
        
        // Timer countdown (15s to 0s)
        volibearTimerInterval = setInterval(() => {
            if (!volibearGameActive) return;
            volibearTimeLeft--;
            if (volibearTimerNum) volibearTimerNum.textContent = `${volibearTimeLeft}s`;
            
            if (volibearTimeLeft <= 0) {
                volibearTimeLeft = 0;
                clearInterval(volibearTimerInterval);
                handleVolibearRoundComplete();
            }
        }, 1000);
        
        // Speech rotation
        volibearSpeechInterval = setInterval(() => {
            if (!volibearGameActive) return;
            volibearSpeechBubble.textContent = roundSpeeches[Math.floor(Math.random() * roundSpeeches.length)];
        }, 3000);
        
        scheduleNextLightning();
        runVolibearGameLoop();
    }, 1800);
}

function handleVolibearRoundComplete() {
    volibearGameActive = false;
    volibearKeys = {};
    if (volibearTimerInterval) clearInterval(volibearTimerInterval);
    if (volibearSpawnTimeout) clearTimeout(volibearSpawnTimeout);
    if (volibearSpeechInterval) clearInterval(volibearSpeechInterval);
    if (volibearAnimFrame) cancelAnimationFrame(volibearAnimFrame);
    
    if (volibearRound < 5) {
        // Reward +1 HP (max 3)
        if (volibearLives < 3) volibearLives++;
        try { playSound('rank_up_med'); } catch(e) {}
        startVolibearRound(volibearRound + 1);
    } else {
        // Round 5 Complete -> Final Victory!
        endVolibearGame(true);
    }
}

function updateVolibearPlayerPosition() {
    if (!volibearPlayerToken) return;
    volibearPlayerToken.style.left = `${volibearPlayerPos.x}px`;
    volibearPlayerToken.style.top = `${volibearPlayerPos.y}px`;
}

function runVolibearGameLoop() {
    if (!volibearGameActive) return;
    
    const rect = volibearArena.getBoundingClientRect();
    const arenaW = rect.width || 480;
    const arenaH = rect.height || 300;
    const speed = 4.4; // px per frame
    
    if (volibearKeys['KeyW'] || volibearKeys['ArrowUp'])    volibearPlayerPos.y -= speed;
    if (volibearKeys['KeyS'] || volibearKeys['ArrowDown'])  volibearPlayerPos.y += speed;
    if (volibearKeys['KeyA'] || volibearKeys['ArrowLeft'])  volibearPlayerPos.x -= speed;
    if (volibearKeys['KeyD'] || volibearKeys['ArrowRight']) volibearPlayerPos.x += speed;
    
    // Clamp to arena bounds
    const radius = 14;
    volibearPlayerPos.x = Math.max(radius, Math.min(arenaW - radius, volibearPlayerPos.x));
    volibearPlayerPos.y = Math.max(radius, Math.min(arenaH - radius, volibearPlayerPos.y));
    
    updateVolibearPlayerPosition();
    
    volibearAnimFrame = requestAnimationFrame(runVolibearGameLoop);
}

function scheduleNextLightning() {
    if (!volibearGameActive) return;
    
    const rect = volibearArena.getBoundingClientRect();
    const arenaW = rect.width || 480;
    const arenaH = rect.height || 300;
    
    let delay = 650;
    
    switch (volibearRound) {
        case 1:
            // Round 1: Escalating Random Strikes
            delay = Math.max(300, 650 - ((15 - volibearTimeLeft) * 22));
            spawnStrikeAt(Math.random() * (arenaW - 60) + 30, Math.random() * (arenaH - 60) + 30);
            break;
            
        case 2:
            // Round 2: Absurd Double Spiral + Pulse Pursuit
            delay = 180;
            volibearSpiralAngle += 0.55;
            const radiusArm = 30 + ((volibearTimeLeft * 18) % 120);
            const cx = arenaW / 2;
            const cy = arenaH / 2;
            
            // Arm 1 (Clockwise)
            const sx1 = cx + Math.cos(volibearSpiralAngle) * radiusArm;
            const sy1 = cy + Math.sin(volibearSpiralAngle) * radiusArm;
            spawnStrikeAt(sx1, sy1);
            
            // Arm 2 (Counter-Clockwise)
            const sx2 = cx + Math.cos(-volibearSpiralAngle) * radiusArm;
            const sy2 = cy + Math.sin(-volibearSpiralAngle) * radiusArm;
            spawnStrikeAt(sx2, sy2);

            // Targeted pulse under player
            if (volibearGridStep % 4 === 0) {
                spawnStrikeAt(volibearPlayerPos.x + (Math.random() * 20 - 10), volibearPlayerPos.y + (Math.random() * 20 - 10));
            }
            volibearGridStep++;
            break;
            
        case 3:
            // Round 3: Rebalanced Grid Matrix + Periodic Pursuit
            delay = 380;
            volibearGridStep++;
            
            if (volibearGridStep % 3 === 0) {
                spawnStrikeAt(volibearPlayerPos.x + (Math.random() * 20 - 10), volibearPlayerPos.y + (Math.random() * 20 - 10), 650);
            }
            
            if (volibearGridStep % 2 === 0) {
                // 2x2 Grid matrix with 1 random safe quadrant (3 danger cells)
                const safeCol = Math.floor(Math.random() * 2);
                const safeRow = Math.floor(Math.random() * 2);
                for (let c = 0; c < 2; c++) {
                    for (let rCell = 0; rCell < 2; rCell++) {
                        if (c !== safeCol || rCell !== safeRow) {
                            const gx = (arenaW / 3) * (c + 1);
                            const gy = (arenaH / 3) * (rCell + 1);
                            spawnStrikeAt(gx, gy, 650);
                        }
                    }
                }
            } else {
                // Light 3-beam diagonal sweep
                const diagOffset = (volibearGridStep * 50) % arenaW;
                for (let i = 0; i < 3; i++) {
                    const dx = (diagOffset + i * 85) % arenaW;
                    const dy = (diagOffset * 0.6 + i * 65) % arenaH;
                    spawnStrikeAt(dx, dy, 650);
                }
            }
            break;
            
        case 4:
            // Round 4: Locked Ring + Targeted Player Pursuit
            delay = 380;
            // 1 Targeted strike directly on player position!
            spawnStrikeAt(volibearPlayerPos.x + (Math.random() * 30 - 15), volibearPlayerPos.y + (Math.random() * 30 - 15));
            // Perimeter ring strike
            const ang = Math.random() * Math.PI * 2;
            spawnStrikeAt((arenaW / 2) + Math.cos(ang) * 120, (arenaH / 2) + Math.sin(ang) * 100);
            break;
            
        case 5:
            // Round 5: APOCALIPSE ELÉTRICO (Chaos Bullet Hell)
            delay = 240; // Extremely fast!
            // Multi-strike spawn
            spawnStrikeAt(volibearPlayerPos.x + (Math.random() * 50 - 25), volibearPlayerPos.y + (Math.random() * 50 - 25));
            spawnStrikeAt(Math.random() * (arenaW - 60) + 30, Math.random() * (arenaH - 60) + 30);
            break;
    }
    
    volibearSpawnTimeout = setTimeout(scheduleNextLightning, delay);
}

function spawnStrikeAt(x, y, customWarningDelay) {
    if (!volibearGameActive || !volibearArena) return;
    
    const rect = volibearArena.getBoundingClientRect();
    const arenaW = rect.width || 480;
    const arenaH = rect.height || 300;
    const strikeRadius = 32; // px
    
    // Clamp coordinates to arena
    const rx = Math.max(strikeRadius, Math.min(arenaW - strikeRadius, x));
    const ry = Math.max(strikeRadius, Math.min(arenaH - strikeRadius, y));
    
    // Warning danger zone
    const dangerZone = document.createElement('div');
    dangerZone.className = 'volibear-danger-zone';
    dangerZone.style.width = `${strikeRadius * 2}px`;
    dangerZone.style.height = `${strikeRadius * 2}px`;
    dangerZone.style.left = `${rx}px`;
    dangerZone.style.top = `${ry}px`;
    
    volibearArena.appendChild(dangerZone);
    
    // Warning delay (faster in higher rounds: 0.65s to 0.5s)
    const warningDelay = customWarningDelay || Math.max(480, 680 - (volibearRound * 35));
    
    setTimeout(() => {
        if (dangerZone.parentNode) dangerZone.remove();
        if (!volibearGameActive) return;
        
        // Spawn lightning impact flash
        const strike = document.createElement('div');
        strike.className = 'volibear-lightning-strike';
        strike.style.width = `${strikeRadius * 2.2}px`;
        strike.style.height = `${strikeRadius * 2.2}px`;
        strike.style.left = `${rx}px`;
        strike.style.top = `${ry}px`;
        volibearArena.appendChild(strike);
        setTimeout(() => strike.remove(), 320);
        
        try { playSound('click'); } catch(e) {}
        
        // Collision detection
        const dist = Math.hypot(volibearPlayerPos.x - rx, volibearPlayerPos.y - ry);
        if (dist <= strikeRadius) {
            volibearLives--;
            updateVolibearLivesUI();
            try { playSound('bako_cheat'); } catch(e) {}
            
            const card = document.querySelector('.volibear-card');
            if (card) {
                card.classList.add('volibear-shake');
                setTimeout(() => card.classList.remove('volibear-shake'), 220);
            }
            
            if (volibearLives <= 0) {
                endVolibearGame(false);
            }
        }
    }, warningDelay);
}

function endVolibearGame(isVictory) {
    volibearGameActive = false;
    if (volibearTimerInterval) clearInterval(volibearTimerInterval);
    if (volibearSpawnTimeout) clearTimeout(volibearSpawnTimeout);
    if (volibearSpeechInterval) clearInterval(volibearSpeechInterval);
    if (volibearAnimFrame) cancelAnimationFrame(volibearAnimFrame);
    
    if (isVictory) {
        try { playSound('rank_up'); } catch(e) {}
        localStorage.setItem('mandamau_journey_fase6_completed', 'true');
        if (volibearWinOverlay) volibearWinOverlay.style.display = 'flex';
    } else {
        try { playSound('reset'); } catch(e) {}
        if (volibearLoseOverlay) volibearLoseOverlay.style.display = 'flex';
    }
}

function closeVolibearGame() {
    volibearGameActive = false;
    if (volibearTimerInterval) clearInterval(volibearTimerInterval);
    if (volibearSpawnTimeout) clearTimeout(volibearSpawnTimeout);
    if (volibearSpeechInterval) clearInterval(volibearSpeechInterval);
    if (volibearAnimFrame) cancelAnimationFrame(volibearAnimFrame);
    fadeOutTheme();
    if (volibearStormOverlay) volibearStormOverlay.classList.remove('active');
    if (journeyEncounterOverlay) journeyEncounterOverlay.classList.remove('active');
    currentBossEncounter = null;
}

// Key listeners for player WASD / Arrow movement
window.addEventListener('keydown', (e) => {
    if (!volibearGameActive) return;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        volibearKeys[e.code] = true;
        if (e.code.startsWith('Arrow')) e.preventDefault(); // prevent scrolling
    }
});

window.addEventListener('keyup', (e) => {
    if (!volibearGameActive) return;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        volibearKeys[e.code] = false;
    }
});

// UI Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    if (btnCloseVolibearTut) {
        btnCloseVolibearTut.addEventListener('click', () => {
            try { playSound('click'); } catch(e) {}
            startVolibearGame();
        });
    }

    if (btnVolibearQuit) {
        btnVolibearQuit.addEventListener('click', () => {
            closeVolibearGame();
            try { playSound('click'); } catch(e) {}
        });
    }

    if (btnVolibearRestart) {
        btnVolibearRestart.addEventListener('click', () => {
            try { playSound('click'); } catch(e) {}
            startVolibearGame();
        });
    }

    if (btnVolibearWinOk) {
        btnVolibearWinOk.addEventListener('click', () => {
            closeVolibearGame();
            try { playSound('rank_up_high'); } catch(e) {}
            
            // Unlock Fase 7 on Chapter 2 map & auto-walk token
            openJourney();
            setTimeout(() => {
                const nodeF7 = document.getElementById('node-fase7');
                const lineF7 = document.querySelector('.line-fase7');
                if (nodeF7) {
                    nodeF7.className = 'map-node node-active';
                    nodeF7.title = 'Fase 7 - Disponível (Warwick)';
                    const iconSpan = nodeF7.querySelector('.node-icon');
                    if (iconSpan) iconSpan.textContent = '🐺';
                }
                if (lineF7) lineF7.classList.add('line-active');
                
                const token = document.getElementById('journey-player-token');
                if (token) {
                    token.style.left = '40%';
                    token.style.top = '50%';
                }
            }, 600);
        });
    }
});
// ================================================================

const THEMES = {
    fase1: 'audio/fase1_kleber.mp3',
    fase2: 'audio/fase2_gwen.mp3',
    fase3: 'audio/fase3_sam.mp3',
    fase4: 'audio/fase4_claudio.mp3',
    fase5: 'audio/fase5_felifep.mp3',
};

// --- Background music (tela principal / mapa) ---
let _bgUnlocked  = false; // true apos primeira interacao do usuario
let _inMinigame  = false; // true enquanto qualquer minigame esta ativo

function startBgMusic() {
    if (!bgMusicAudio) return;
    bgMusicAudio.volume = 0.25;
    bgMusicAudio.play().catch(function() {});
}

function pauseBgMusic() {
    if (!bgMusicAudio) return;
    bgMusicAudio.pause(); // incondicional - sem checar .paused
}

function resumeBgMusic() {
    _inMinigame = false;
    if (!_bgUnlocked || !bgMusicAudio) return;
    startBgMusic();
}

// Usa capture (true) para rodar ANTES dos handlers dos botoes,
// depois usa setTimeout(0) para esperar todos os handlers terminarem
// Assim so inicia a musica se nenhuma fase foi ativada nesse mesmo clique
document.addEventListener('click', function() {
    if (_bgUnlocked) return;
    _bgUnlocked = true;
    setTimeout(function() {
        if (!_inMinigame) startBgMusic();
    }, 0);
}, true);

// --- Musica de fase (minigames) ---

function playTheme(fase) {
    const file = THEMES[fase];
    if (!file || !gameThemeAudio) return;
    if (currentThemeFile === file && !gameThemeAudio.paused) return;
    _inMinigame = true;  // sinaliza que minigame esta ativo
    pauseBgMusic();      // para a musica de fundo imediatamente
    currentThemeFile = file;
    setTimeout(function() {
        gameThemeAudio.src = file;
        gameThemeAudio.volume = 0.25;
        gameThemeAudio.currentTime = 0;
        gameThemeAudio.play().catch(function() {});
    }, 80);
}

function stopTheme() {
    if (!gameThemeAudio) return;
    gameThemeAudio.pause();
    gameThemeAudio.currentTime = 0;
    currentThemeFile = '';
}

function fadeOutTheme(duration) {
    duration = duration || 800;
    if (!gameThemeAudio || gameThemeAudio.paused) return;
    const startVol = gameThemeAudio.volume;
    const steps = 20;
    const interval = duration / steps;
    const decrement = startVol / steps;
    let step = 0;
    const fade = setInterval(function() {
        step++;
        gameThemeAudio.volume = Math.max(0, startVol - decrement * step);
        if (step >= steps) {
            clearInterval(fade);
            stopTheme();
            gameThemeAudio.volume = 0.25;
            resumeBgMusic(); // Retoma a musica de fundo ao sair da fase
        }
    }, interval);
}
// ================================================================


// ================================================================
// ACHIEVEMENTS SYSTEM (10 ACHIEVEMENTS — 2 PER BOSS)
// ================================================================
const GAME_ACHIEVEMENTS = [
    // Kleber (Fase 1)
    { id: 'kleber_win', boss: 'Kleber (Fase 1)', title: 'Bruto na Queda', desc: 'Venceu Kleber na Queda de Braço.', icon: '💪' },
    { id: 'kleber_no_pcd', boss: 'Kleber (Fase 1)', title: 'Orgulho Intacto', desc: 'Recusou a proposta do modo PCD do Kleber.', icon: '🗿' },
    // Gwen (Fase 2)
    { id: 'gwen_win', boss: 'Gwen (Fase 2)', title: 'Mestre do Quiz', desc: 'Respondeu todas as perguntas e venceu Gwen.', icon: '🧠' },
    { id: 'gwen_bonus', boss: 'Gwen (Fase 2)', title: 'Gênio da Matemática', desc: 'Acertou a pergunta bônus de porcentagem da Gwen.', icon: '🎓' },
    // Sam (Fase 3)
    { id: 'sam_win', boss: 'Sam (Fase 3)', title: 'Esmagador Supremo', desc: 'Venceu Sam no duelo de esmagar teclas.', icon: '🍔' },
    { id: 'sam_flawless', boss: 'Sam (Fase 3)', title: 'Invicto no Esmaga', desc: 'Venceu Sam sem perder nenhum round (2×0).', icon: '⚡' },
    // Cláudio (Fase 4)
    { id: 'claudio_win', boss: 'Cláudio (Fase 4)', title: 'Cubo Derrotado', desc: 'Venceu Cláudio no Genius da memória.', icon: '🧩' },
    { id: 'claudio_flawless', boss: 'Cláudio (Fase 4)', title: 'Memória Perfeita', desc: 'Venceu Cláudio sem perder nenhuma vida (3/3 vidas).', icon: '👑' },
    // Felifep (Fase 5)
    { id: 'felifep_win', boss: 'Felifep (Fase 5)', title: 'Queda do Deus', desc: 'Derrotou Felifep, o Deus da Etiqueta e da Verdade.', icon: '⚔️' },
    { id: 'felifep_no_powers', boss: 'Felifep (Fase 5)', title: 'Na Raça Pura', desc: 'Venceu Felifep no Blackjack sem usar nenhum poder especial.', icon: '🃏' }
];

let bjPowersUsedInMatch = false;

function getUnlockedAchievements() {
    try {
        const data = localStorage.getItem('mandamau_achievements');
        return data ? JSON.parse(data) : [];
    } catch(e) {
        return [];
    }
}

function unlockAchievement(id) {
    const unlocked = getUnlockedAchievements();
    if (unlocked.includes(id)) return;
    
    unlocked.push(id);
    localStorage.setItem('mandamau_achievements', JSON.stringify(unlocked));
    
    const ach = GAME_ACHIEVEMENTS.find(a => a.id === id);
    if (ach) {
        showAchievementToast(ach);
    }
    updateAchievementsUI();
}

let toastTimeout = null;
function showAchievementToast(ach) {
    const toast = document.getElementById('achievement-toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');
    
    if (!toast || !toastTitle) return;
    
    toastIcon.textContent = ach.icon || '🏆';
    toastTitle.textContent = ach.title;
    toastDesc.textContent = ach.desc;
    
    try { playSound('rank_up_god'); } catch(e) {}
    
    toast.classList.add('visible');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
    }, 4500);
}

function updateAchievementsUI() {
    const unlocked = getUnlockedAchievements();
    const totalCount = GAME_ACHIEVEMENTS.length;
    const unlockedCount = unlocked.length;
    const percent = Math.round((unlockedCount / totalCount) * 100);
    
    const mapBadge = document.getElementById('map-achievements-badge');
    if (mapBadge) mapBadge.textContent = `${unlockedCount}/${totalCount}`;
    
    const fill = document.getElementById('achievements-progress-fill');
    const countText = document.getElementById('achievements-count-text');
    if (fill) fill.style.width = `${percent}%`;
    if (countText) countText.textContent = `${unlockedCount} / ${totalCount} Desbloqueadas (${percent}%)`;
    
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = GAME_ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        return `
            <div class="achievement-item-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-item-icon">${ach.icon}</div>
                <div class="achievement-item-info">
                    <span class="achievement-item-boss">${ach.boss}</span>
                    <h4 class="achievement-item-title">${ach.title}</h4>
                    <p class="achievement-item-desc">${ach.desc}</p>
                </div>
                <span class="achievement-item-status ${isUnlocked ? 'status-unlocked' : 'status-locked'}">
                    ${isUnlocked ? '✔ Desbloqueada' : '🔒 Bloqueada'}
                </span>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const btnMapAch = document.getElementById('btn-open-achievements-map');
    const modalAch = document.getElementById('achievements-modal');
    const btnCloseAch = document.getElementById('btn-close-achievements');

    if (btnMapAch && modalAch) {
        btnMapAch.addEventListener('click', () => {
            updateAchievementsUI();
            modalAch.classList.add('active');
            playSound('click');
        });
    }
    if (btnCloseAch && modalAch) {
        btnCloseAch.addEventListener('click', () => {
            modalAch.classList.remove('active');
            playSound('click');
        });
    }
    updateAchievementsUI();
});
// ================================================================


// ================================================================
// COSMETICS & DECORATION SYSTEM (QUADROS DOS BOSSES)
// ================================================================
const BOSS_COSMETICS = [
    {
        id: 'frame_kleber',
        bossId: 'kleber',
        bossName: 'Kleber (Fase 1)',
        name: 'Quadro do Kleber',
        title: 'O Palhaço dos Mil Dentes',
        img: 'img/cosmetic_kleber.png',
        desc: 'Quadro barroco exclusivo conquistado ao derrotar Kleber na Queda de Braço.'
    },
    {
        id: 'frame_gwen',
        bossId: 'gwen',
        bossName: 'Gwen (Fase 2)',
        name: 'Quadro da Gwen',
        title: 'A Mestre dos Músculos e Cálculos',
        img: 'img/cosmetic_gwen.png',
        desc: 'Quadro místico exclusivo conquistado ao vencer Gwen no Quiz.'
    },
    {
        id: 'frame_sam',
        bossId: 'sam',
        bossName: 'Sam (Fase 3)',
        name: 'Quadro do Sam',
        title: 'O Gordão do Esmaga',
        img: 'img/cosmetic_sam.png',
        desc: 'Quadro retro cyber conquistado ao derrotar Sam no Esmaga Teclas.'
    },
    {
        id: 'frame_claudio',
        bossId: 'claudio',
        bossName: 'Cláudio (Fase 4)',
        name: 'Quadro do Cláudio',
        title: 'O Cubo Gey da Memória',
        img: 'img/cosmetic_claudio.png',
        desc: 'Quadro neon futurista conquistado ao derrotar Cláudio no Genius.'
    },
    {
        id: 'frame_felifep',
        bossId: 'felifep',
        name: 'Quadro do Felifep',
        bossName: 'Felifep (Fase 5)',
        title: 'Deus da Etiqueta e da Verdade',
        img: 'img/cosmetic_felifep.png',
        desc: 'Quadro majestoso divino conquistado ao derrotar Felifep no Blackjack.'
    }
];

function handleCosmeticImgError(imgEl) {
    if (!imgEl || imgEl.dataset.fallbackTried) return;
    imgEl.dataset.fallbackTried = "true";
    const src = imgEl.src;
    if (src.endsWith('.jpg')) {
        imgEl.src = src.replace(/\.jpg$/, '.png');
    } else if (src.endsWith('.png')) {
        imgEl.src = src.replace(/\.png$/, '.jpg');
    }
}

function getUnlockedCosmetics() {
    try {
        const data = localStorage.getItem('mandamau_cosmetics');
        let unlocked = data ? JSON.parse(data) : [];
        // Auto unlock based on completed journey phases
        if (localStorage.getItem('mandamau_journey_fase1_completed') === 'true' && !unlocked.includes('frame_kleber')) unlocked.push('frame_kleber');
        if (localStorage.getItem('mandamau_journey_fase2_completed') === 'true' && !unlocked.includes('frame_gwen')) unlocked.push('frame_gwen');
        if (localStorage.getItem('mandamau_journey_fase3_completed') === 'true' && !unlocked.includes('frame_sam')) unlocked.push('frame_sam');
        if (localStorage.getItem('mandamau_journey_fase4_completed') === 'true' && !unlocked.includes('frame_claudio')) unlocked.push('frame_claudio');
        if (localStorage.getItem('mandamau_journey_fase5_completed') === 'true' && !unlocked.includes('frame_felifep')) unlocked.push('frame_felifep');
        return unlocked;
    } catch(e) {
        return [];
    }
}

function showCosmeticUnlockModal(cosmetic) {
    const modal = document.getElementById('cosmetic-unlock-modal');
    const img = document.getElementById('cosmetic-unlock-img');
    const name = document.getElementById('cosmetic-unlock-name');
    const desc = document.getElementById('cosmetic-unlock-desc');
    
    if (!modal) return;
    
    if (img) {
        img.src = cosmetic.img;
        delete img.dataset.fallbackTried;
    }
    if (name) name.textContent = cosmetic.name;
    if (desc) desc.textContent = `Você venceu ${cosmetic.bossName} e desbloqueou o ${cosmetic.name}! Acesse o menu "Decoração" para posicioná-lo no fundo do site.`;
    
    try { playSound('rank_up_god'); } catch(e) {}
    modal.classList.add('active');
}

function unlockCosmetic(bossId) {
    const cosmetic = BOSS_COSMETICS.find(c => c.bossId === bossId);
    if (!cosmetic) return;
    
    const unlocked = getUnlockedCosmetics();
    if (unlocked.includes(cosmetic.id)) return; // Já desbloqueado
    
    unlocked.push(cosmetic.id);
    localStorage.setItem('mandamau_cosmetics', JSON.stringify(unlocked));
    
    showAchievementToast({
        icon: '🖼️',
        title: 'NOVO QUADRO ADQUIRIDO!',
        desc: cosmetic.name + ' foi adicionado à sua Galeria de Decoração!'
    });
    
    renderDecorationsModal();
    
    // Mostra popup comemorativo do novo quadro desbloqueado
    setTimeout(() => {
        showCosmeticUnlockModal(cosmetic);
    }, 600);
}


function getPlacedDecorations() {
    try {
        const data = localStorage.getItem('mandamau_placed_decorations');
        return data ? JSON.parse(data) : [];
    } catch(e) {
        return [];
    }
}

function savePlacedDecorations(placedArray) {
    localStorage.setItem('mandamau_placed_decorations', JSON.stringify(placedArray));
}

function togglePlacedDecoration(cosmeticId) {
    let placed = getPlacedDecorations();
    const existingIndex = placed.findIndex(p => p.id === cosmeticId);
    
    if (existingIndex >= 0) {
        // Remover do fundo
        placed.splice(existingIndex, 1);
    } else {
        // Colocar no fundo em posições estrategicas nas laterais (sem cobrir o contador central)
        const winW = window.innerWidth;
        const cardW = 440;
        const frameW = 180;
        
        const leftX1 = Math.max(15, Math.floor((winW / 2) - (cardW / 2) - frameW - 25));
        const leftX2 = Math.max(15, Math.floor((winW / 2) - (cardW / 2) - frameW - 55));
        const rightX1 = Math.min(winW - frameW - 15, Math.floor((winW / 2) + (cardW / 2) + 25));
        const rightX2 = Math.min(winW - frameW - 15, Math.floor((winW / 2) + (cardW / 2) + 55));

        const defaultPositions = [
            { x: leftX1, y: 110 },
            { x: rightX1, y: 110 },
            { x: leftX2 > 0 ? leftX2 : 20, y: 360 },
            { x: rightX2, y: 360 },
            { x: Math.max(15, leftX1 - 15), y: 230 }
        ];
        const pos = defaultPositions[placed.length % defaultPositions.length];
        placed.push({ id: cosmeticId, x: Math.max(10, pos.x), y: Math.max(10, pos.y) });
    }

    
    savePlacedDecorations(placed);
    renderPlacedDecorations();
    renderDecorationsModal();
}

function renderPlacedDecorations() {
    const layer = document.getElementById('bg-decorations-layer');
    if (!layer) return;
    
    const placed = getPlacedDecorations();
    layer.innerHTML = '';
    
    placed.forEach(pItem => {
        const cosmetic = BOSS_COSMETICS.find(c => c.id === pItem.id);
        if (!cosmetic) return;
        
        const frameEl = document.createElement('div');
        frameEl.className = 'bg-placed-frame';
        frameEl.id = 'placed-' + cosmetic.id;
        frameEl.style.left = pItem.x + 'px';
        frameEl.style.top = pItem.y + 'px';
        
        frameEl.innerHTML = `
            <div class="placed-frame-bar">
                <span class="placed-frame-drag-label">🖐️ ${cosmetic.name}</span>
                <button class="btn-remove-placed-frame" title="Remover" data-id="${cosmetic.id}">&times;</button>
            </div>
            <img src="${cosmetic.img}" alt="${cosmetic.name}" class="placed-frame-img" onerror="handleCosmeticImgError(this)">
            <div class="placed-frame-caption">${cosmetic.title}</div>
        `;
        
        // Remove button event
        const removeBtn = frameEl.querySelector('.btn-remove-placed-frame');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlacedDecoration(cosmetic.id);
            playSound('click');
        });
        
        // Make Draggable
        makeFrameDraggable(frameEl, cosmetic.id);
        
        layer.appendChild(frameEl);
    });
}

function makeFrameDraggable(element, cosmeticId) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    const onStart = (e) => {
        if (e.target.classList.contains('btn-remove-placed-frame')) return;
        isDragging = true;
        element.classList.add('dragging');
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;
        
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    };
    
    const onMove = (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        let newX = initialLeft + deltaX;
        let newY = initialTop + deltaY;
        
        // Keep within viewport boundaries
        const maxX = window.innerWidth - element.offsetWidth - 5;
        const maxY = window.innerHeight - element.offsetHeight - 5;
        
        newX = Math.max(5, Math.min(maxX, newX));
        newY = Math.max(5, Math.min(maxY, newY));
        
        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
    };
    
    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        element.classList.remove('dragging');
        
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchend', onEnd);
        
        // Save new position
        let placed = getPlacedDecorations();
        const item = placed.find(p => p.id === cosmeticId);
        if (item) {
            item.x = element.offsetLeft;
            item.y = element.offsetTop;
            savePlacedDecorations(placed);
        }
    };
    
    element.addEventListener('mousedown', onStart);
    element.addEventListener('touchstart', onStart, { passive: false });
}

function renderDecorationsModal() {
    const grid = document.getElementById('decorations-grid');
    if (!grid) return;
    
    const unlocked = getUnlockedCosmetics();
    const placed = getPlacedDecorations();
    
    grid.innerHTML = BOSS_COSMETICS.map(cosmetic => {
        const isUnlocked = unlocked.includes(cosmetic.id);
        const isPlaced = placed.some(p => p.id === cosmetic.id);
        
        return `
            <div class="decoration-item-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="decoration-item-preview-wrap">
                    <img src="${cosmetic.img}" alt="${cosmetic.name}" class="decoration-item-img" onerror="handleCosmeticImgError(this)">
                </div>
                <div class="decoration-item-body">
                    <span class="decoration-item-boss">${cosmetic.bossName}</span>
                    <h4 class="decoration-item-title">${cosmetic.name}</h4>
                    <p class="decoration-item-desc">${cosmetic.desc}</p>
                    
                    ${isUnlocked ? `
                        <button class="btn-toggle-decoration ${isPlaced ? 'remove' : 'place'}" data-id="${cosmetic.id}">
                            ${isPlaced ? '❌ Remover do Fundo' : '🖼️ Colocar no Fundo'}
                        </button>
                    ` : `
                        <button class="btn-toggle-decoration locked-btn" disabled>
                            🔒 Bloqueado (Derrote o Boss)
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
    
    // Attach click listeners to place/remove buttons
    grid.querySelectorAll('.btn-toggle-decoration[data-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            togglePlacedDecoration(id);
            playSound('click');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnDecTop = document.getElementById('btn-decorations-top');
    const modalDec = document.getElementById('decorations-modal');
    const btnCloseDec = document.getElementById('btn-close-decorations');

    if (btnDecTop && modalDec) {
        btnDecTop.addEventListener('click', () => {
            renderDecorationsModal();
            modalDec.classList.add('active');
            playSound('click');
        });
    }
    if (btnCloseDec && modalDec) {
        btnCloseDec.addEventListener('click', () => {
            modalDec.classList.remove('active');
            playSound('click');
        });
    }
    
    const modalUnlock = document.getElementById('cosmetic-unlock-modal');
    const btnUnlockClose = document.getElementById('btn-cosmetic-unlock-close');
    const btnUnlockOpenMenu = document.getElementById('btn-cosmetic-unlock-open-menu');

    if (btnUnlockClose && modalUnlock) {
        btnUnlockClose.addEventListener('click', () => {
            modalUnlock.classList.remove('active');
            playSound('click');
        });
    }
    if (btnUnlockOpenMenu && modalUnlock && modalDec) {
        btnUnlockOpenMenu.addEventListener('click', () => {
            modalUnlock.classList.remove('active');
            renderDecorationsModal();
            modalDec.classList.add('active');
            playSound('click');
        });
    }
    
    
    const btnNavPrev = document.getElementById('btn-map-nav-prev');
    const btnNavNext = document.getElementById('btn-map-nav-next');
    if (btnNavNext) {
        btnNavNext.addEventListener('click', () => {
            switchMapChapter(2);
            playSound('click');
        });
    }
    if (btnNavPrev) {
        btnNavPrev.addEventListener('click', () => {
            switchMapChapter(1);
            playSound('click');
        });
    }
    
    const nodeFase6 = document.getElementById('node-fase6');
    if (nodeFase6) {
        nodeFase6.addEventListener('click', () => {
            try { playSound('click'); } catch(e) {}
            currentBossEncounter = 'volibear';
            setupBossEncounterUI();
            if (journeyEncounterOverlay) journeyEncounterOverlay.classList.add('active');
        });
    }


    
    const nodeFase7 = document.getElementById('node-fase7');
    if (nodeFase7) {
        nodeFase7.addEventListener('click', () => {
            const isFase6Done = localStorage.getItem('mandamau_journey_fase6_completed') === 'true';
            if (isFase6Done) {
                try { playSound('click'); } catch(e) {}
                currentBossEncounter = 'warwick';
                setupBossEncounterUI();
                if (journeyEncounterOverlay) journeyEncounterOverlay.classList.add('active');
            } else {
                try { playSound('click'); } catch(e) {}
                showAchievementToast({
                    icon: '🔒',
                    title: 'FASE BLOQUEADA',
                    desc: 'Derrote Volibear na Fase 6 primeiro para desbloquear a Fase 7!'
                });
            }
        });
    }

    // Initial render of placed background decorations
    renderPlacedDecorations();
});

// ================================================================

// DMC Ranks Configuration
const ranks = [
    { min: 10000000000, letter: 'Ω', name: "O Absoluto curva-se perante o vosso império de inverdades, coroando-vos Soberano do Vácuo Fáctico", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(255, 0, 0, 0.5)', sound: 'rank_up_god' },
    { min: 1000000000, letter: 'μ', name: "Vós sois a própria personificação do sofisma universal, cujo verbo desfaz constelações de factos", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(255, 127, 0, 0.5)', sound: 'rank_up_god' },
    { min: 500000000, letter: 'λ', name: "Com maestria sem igual, transmutais a mentira em dogma inapelável para as mentes incautas", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(255, 255, 0, 0.5)', sound: 'rank_up_god' },
    { min: 250000000, letter: 'κ', name: "Os vossos ardis retóricos transcendem a mera falsidade, erigindo uma cosmologia de ficções eternas", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(0, 255, 0, 0.5)', sound: 'rank_up_god' },
    { min: 100000000, letter: 'ι', name: "Navegais com maestria singular no oceano da tergiversação, onde a verdade é mero mito esquecido", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(0, 255, 255, 0.5)', sound: 'rank_up_god' },
    { min: 50000000, letter: 'θ', name: "A substância do real dissolve-se perante a vossa formidável e inabalável volúpia de ludibriar", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(0, 0, 255, 0.5)', sound: 'rank_up_god' },
    { min: 25000000, letter: 'η', name: "Percebe-se uma simetria sublime na arquitetura de vossos enganos transcendentais", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(127, 0, 255, 0.5)', sound: 'rank_up_god' },
    { min: 10000000, letter: 'ζ', name: "Uma catedral de falsidades edifica-se sob o sussurro de vossos lábios insaciáveis", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(255, 0, 255, 0.5)', sound: 'rank_up_god' },
    { min: 5000000, letter: 'ε', name: "Vossas asserções, destituídas de lastro fáctico, adquirem uma beleza trágica e quase poética", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(255, 255, 255, 0.5)', sound: 'rank_up_god' },
    { min: 2500000, letter: 'δ', name: "O tecido da verdade é por vós desfeito e reconfigurado em intrincadas tapeçarias de quimeras", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(255, 105, 180, 0.5)', sound: 'rank_up_god' },
    { min: 1000000, letter: 'γ', name: "Ergueis monumentos de sofismas que rivalizam com as maiores construções do intelecto humano", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(255, 215, 0, 0.5)', sound: 'rank_up_god' },
    { min: 500000, letter: 'β', name: "Constata-se que a veracidade claudica perante o vosso império de narrativas fabulosas", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(173, 216, 230, 0.5)', sound: 'rank_up_god' },
    { min: 250000, letter: 'α', name: "Vossa eloquência mendaz oblitera a barreira entre a realidade e o devaneio", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(255, 69, 0, 0.5)', sound: 'rank_up_god' },
    { min: 100000, letter: 'SSS', name: "você atingiu a gnose de tanto mentir e se tornou o demiurgo", class: 'rank-sss', idleClass: 'rank-idle-god', flashColor: 'rgba(255, 0, 127, 0.4)', sound: 'rank_up_god' },
    { min: 50000, letter: 'SS', name: "mentiu tanto que transcendeu a materia", class: 'rank-ss', idleClass: 'rank-idle-high', flashColor: 'rgba(236, 72, 153, 0.4)', sound: 'rank_up_high' },
    { min: 10000, letter: 'S', name: "Deus da mentira e desinformação", class: 'rank-s', idleClass: 'rank-idle-high', flashColor: 'rgba(168, 85, 247, 0.4)', sound: 'rank_up_high' },
    { min: 5000, letter: 'A', name: "O ser mais mentiroso que já existiu", class: 'rank-a', idleClass: 'rank-idle-med', flashColor: 'rgba(245, 158, 11, 0.3)', sound: 'rank_up_med' },
    { min: 1000, letter: 'B', name: "mentir pra você é como respirar", class: 'rank-b', idleClass: 'rank-idle-med', flashColor: 'rgba(6, 182, 212, 0.3)', sound: 'rank_up_med' },
    { min: 500, letter: 'C', name: "você nasceu pra mentir", class: 'rank-c', idleClass: 'rank-idle-low', flashColor: 'rgba(16, 185, 129, 0.2)', sound: 'rank_up_low' },
    { min: 100, letter: 'D', name: "mentiu bem", class: 'rank-d', idleClass: 'rank-idle-low', flashColor: 'rgba(148, 163, 184, 0.2)', sound: 'rank_up_low' }
];

// Bako's Classic Lie Phrases
const bakoPhrases = [
    "Foi só pra rir",
    "Minha conta foi hackeada",
    "Eu não molestei os patinhos",
    "Eu não gosto de animais",
    "Eu não sou terrorista",
    "Eu não dei a bunda pro molok",
    "Eu não meti o pal num formigueiro",
    "Eu não mijo em peixes",
    "Eu gosto de mulheres",
    "Eu não sou censurador"
];

// State Management
let count = 0;
let resetStep = 0;
let currentRankIndex = -1;
let rankAnimTimeout = null;
const resetQuestions = [
    "Tem certeza que quer apagar?",
    "O Bako ainda está mentindo, quer prosseguir?",
    "Se apagar você compactua com as mentiras e atrocidades do Bako, quer apagar mesmo?"
];

// Statistics State
let highScore = 0;
let totalClicks = 0;
let lastLieTimestamp = null;
let lieTimes = [];

// Combo State
let comboCount = 0;
let comboMultiplier = 1.0;
let comboTimer = null;

// Elements
const counterEl = document.getElementById('counter');
const btnSum = document.getElementById('btn-sum');
const btnMul = document.getElementById('btn-mul');
const btnMulText = document.getElementById('btn-mul-text');
const btnReset = document.getElementById('btn-reset');
const multiplierInput = document.getElementById('multiplier-input');
const btnDecMult = document.getElementById('btn-dec-mult');
const btnIncMult = document.getElementById('btn-inc-mult');

// Modal Elements
const modalContainer = document.getElementById('modal-container');
const modalQuestion = document.getElementById('modal-question');
const btnModalConfirm = document.getElementById('btn-modal-confirm');
const btnModalCancel = document.getElementById('btn-modal-cancel');

// Tab Elements
const tabCounter = document.getElementById('tab-counter');
const tabStats = document.getElementById('tab-stats');
const tabDuel = document.getElementById('tab-duel');
const contentCounter = document.getElementById('content-counter');
const contentStats = document.getElementById('content-stats');
const contentDuel = document.getElementById('content-duel');

// Sub-Tab Elements
const subtabStatsGeneral = document.getElementById('subtab-stats-general');
const subtabStats2 = document.getElementById('subtab-stats-2');
const subcontentStatsGeneral = document.getElementById('subcontent-stats-general');
const subcontentStats2 = document.getElementById('subcontent-stats-2');

// Duel Elements
const duelCells = document.querySelectorAll('.duel-cell');
const bakoSpeech = document.getElementById('bako-speech');
const btnDuelReset = document.getElementById('btn-duel-reset');
const duelScorePlayer = document.getElementById('duel-score-player');
const duelScoreBako = document.getElementById('duel-score-bako');

// Theme, Sound, and Music controls elements
const themeBtns = document.querySelectorAll('.theme-btn');
const btnSound = document.getElementById('btn-sound');
const soundIconOn = document.getElementById('sound-icon-on');
const soundIconOff = document.getElementById('sound-icon-off');
const btnMusic = document.getElementById('btn-music');
const musicIconOn = document.getElementById('music-icon-on');
const musicIconOff = document.getElementById('music-icon-off');

// Audio System (Web Audio Synth)
let audioCtx = null;
let isMuted = localStorage.getItem('mandamau_muted') === 'true';
let isMusicPlaying = false;
let isMusicEnabled = localStorage.getItem('mandamau_music') === 'true';
let musicInterval = null;
let currentStep = 0;
let bpm = 100;
let lastScheduledTime = 0;
const lookahead = 25.0; // ms
const scheduleAheadTime = 0.1; // seconds

// Procedural Scales (Bass & Melody loops)
const bassScale = [110.00, 110.00, 130.81, 146.83, 164.81, 164.81, 146.83, 130.81];
const melodyScale = [220.00, 0, 261.63, 293.66, 329.63, 0, 293.66, 261.63];

function initAudio() {
    try {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx) {
            if (audioCtx.state === 'suspended') {
                const resumePromise = audioCtx.resume();
                if (resumePromise && typeof resumePromise.then === 'function') {
                    resumePromise.then(() => {
                        if (isMusicEnabled && !isMusicPlaying) {
                            startMusic();
                        }
                    }).catch(err => console.warn("Failed to resume AudioContext:", err));
                } else {
                    if (isMusicEnabled && !isMusicPlaying) {
                        startMusic();
                    }
                }
            } else {
                if (isMusicEnabled && !isMusicPlaying) {
                    startMusic();
                }
            }
        }
    } catch (e) {
        console.warn("AudioContext initialization failed:", e);
    }
}

function playSound(type) {
    if (isMuted) return;
    try {
        initAudio();
        if (audioCtx) {
            if (audioCtx.state === 'suspended') {
                const resumePromise = audioCtx.resume();
                if (resumePromise && typeof resumePromise.then === 'function') {
                    resumePromise.then(() => {
                        triggerSynthSound(type);
                    }).catch(err => console.warn("Failed to resume AudioContext in playSound:", err));
                } else {
                    triggerSynthSound(type);
                }
            } else {
                triggerSynthSound(type);
            }
        }
    } catch (e) {
        console.warn("Audio Synthesis Error:", e);
    }
}

function triggerSynthSound(type) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    
    try {
        if (type === 'click') {
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(200, now);
            osc1.frequency.exponentialRampToValueAtTime(800, now + 0.06);
            
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(400, now);
            osc2.frequency.exponentialRampToValueAtTime(100, now + 0.08);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.08);
            osc2.stop(now + 0.08);
        } 
        else if (type === 'multiply') {
            const duration = 0.35;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(1800, now + duration);
            
            filter.type = 'peaking';
            filter.Q.value = 5;
            filter.frequency.setValueAtTime(300, now);
            filter.frequency.exponentialRampToValueAtTime(3000, now + duration);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + duration);
        }
        else if (type === 'reset') {
            const duration = 0.8;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.linearRampToValueAtTime(40, now + duration);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.exponentialRampToValueAtTime(80, now + duration);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.001, now + duration);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + duration);
        }
        else if (type === 'rank_up_low') {
            playArpeggio([440, 554, 659], 0.08);
        }
        else if (type === 'rank_up_med') {
            playArpeggio([523, 659, 784, 1046], 0.07);
        }
        else if (type === 'rank_up_high') {
            playArpeggio([587, 740, 880, 1175, 1480], 0.06);
        }
        else if (type === 'rank_up_god') {
            playArpeggio([261, 329, 392, 523, 659, 784, 1046, 1318, 1568, 2093, 2637, 3136, 4186], 0.035);
        }
        else if (type === 'bako_cheat') {
            const duration = 0.45;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.1);
            osc.frequency.linearRampToValueAtTime(700, now + 0.25);
            osc.frequency.linearRampToValueAtTime(60, now + duration);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + duration);
        }
    } catch (e) {
        console.warn("Synth Sound trigger failed:", e);
    }
}

function playArpeggio(notes, noteLength) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    
    try {
        const delay = audioCtx.createDelay(1.0);
        const feedback = audioCtx.createGain();
        delay.delayTime.value = 0.15;
        feedback.gain.value = 0.35;
        
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(audioCtx.destination);
        
        notes.forEach((freq, idx) => {
            const noteTime = now + (idx * noteLength);
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteTime);
            
            gain.gain.setValueAtTime(0.001, noteTime);
            gain.gain.linearRampToValueAtTime(0.1, noteTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteLength * 1.5);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            gain.connect(delay);
            
            osc.start(noteTime);
            osc.stop(noteTime + noteLength * 1.8);
        });
    } catch (e) {
        console.warn("Arpeggio playback failed:", e);
    }
}

// BGM Procedural Sequencer Loops
function playStep(time, step) {
    if (!isMusicEnabled) return;
    if (!audioCtx) return;
    
    try {
        const stepDuration = 60.0 / bpm / 2; // eighth notes
        
        // Bassline (Square/Triangle wave)
        const bassFreq = bassScale[step % bassScale.length];
        if (bassFreq > 0) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(bassFreq, time);
            
            gain.gain.setValueAtTime(0.001, time);
            gain.gain.linearRampToValueAtTime(0.07, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration - 0.01);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(time);
            osc.stop(time + stepDuration);
        }
        
        // Dynamic Melody (Plays if Rank >= C or Combo active >= 3)
        const matchedRankIndex = ranks.findIndex(r => count >= r.min);
        const isRankCPlus = matchedRankIndex !== -1 && ranks[matchedRankIndex].min >= 500;
        const isComboActive = comboCount >= 3;
        
        if (isRankCPlus || isComboActive) {
            const melodyFreq = melodyScale[step % melodyScale.length];
            if (melodyFreq > 0) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.type = 'square';
                osc.frequency.setValueAtTime(melodyFreq, time);
                
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, time);
                
                gain.gain.setValueAtTime(0.001, time);
                gain.gain.linearRampToValueAtTime(0.02, time + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 0.7);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(time);
                osc.stop(time + stepDuration);
            }
        }
    } catch (e) {
        console.warn("BGM step playback failed:", e);
    }
}

function scheduler() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    while (lastScheduledTime < audioCtx.currentTime + scheduleAheadTime) {
        playStep(lastScheduledTime, currentStep);
        
        const stepDuration = 60.0 / bpm / 2; // eighth notes
        lastScheduledTime += stepDuration;
        currentStep = (currentStep + 1) % 16;
    }
}

function startMusic() {
    if (!isMusicEnabled) return;
    try {
        initAudio();
        
        if (isMusicPlaying) return;
        if (!audioCtx) return;
        isMusicPlaying = true;
        
        lastScheduledTime = audioCtx.currentTime + 0.05;
        musicInterval = setInterval(scheduler, lookahead);
    } catch (e) {
        console.warn("Music playback start failed:", e);
    }
}

function stopMusic() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
    isMusicPlaying = false;
}

function updateMusicBPM() {
    // bpm increases based on active combo (max x5.0 combo -> 160bpm)
    bpm = 100 + (comboMultiplier - 1.0) * 15;
}

function updateSoundUI() {
    if (isMuted) {
        soundIconOn.style.display = 'none';
        soundIconOff.style.display = 'block';
        btnSound.style.opacity = '0.5';
    } else {
        soundIconOn.style.display = 'block';
        soundIconOff.style.display = 'none';
        btnSound.style.opacity = '1';
    }
}

function updateMusicUI() {
    if (isMusicEnabled) {
        musicIconOn.style.display = 'block';
        musicIconOff.style.display = 'none';
        btnMusic.style.opacity = '1';
        if (audioCtx && audioCtx.state === 'running') {
            startMusic();
        }
    } else {
        musicIconOn.style.display = 'none';
        musicIconOff.style.display = 'block';
        btnMusic.style.opacity = '0.5';
        stopMusic();
    }
}

btnSound.addEventListener('click', () => {
    isMuted = !isMuted;
    localStorage.setItem('mandamau_muted', isMuted);
    updateSoundUI();
    if (!isMuted) {
        playSound('click');
    }
});

btnMusic.addEventListener('click', () => {
    isMusicEnabled = !isMusicEnabled;
    localStorage.setItem('mandamau_music', isMusicEnabled);
    updateMusicUI();
    if (isMusicEnabled) {
        initAudio();
    }
});

// Theme Manager
function setTheme(themeName) {
    document.body.classList.remove('theme-cosmic', 'theme-cyberpunk', 'theme-infernal', 'theme-synthwave', 'theme-gold');
    document.body.classList.add(`theme-${themeName}`);
    
    themeBtns.forEach(btn => {
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    localStorage.setItem('mandamau_theme', themeName);
}

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-theme');
        setTheme(selected);
        playSound('click');
    });
});

function initTheme() {
    const saved = localStorage.getItem('mandamau_theme') || 'cosmic';
    setTheme(saved);
}

// Tab Navigation
function selectTab(tabName) {
    [tabCounter, tabStats, tabDuel].forEach(t => t.classList.remove('active'));
    [contentCounter, contentStats, contentDuel].forEach(c => c.classList.remove('active'));
    
    if (tabName === 'counter') {
        tabCounter.classList.add('active');
        contentCounter.classList.add('active');
    } else if (tabName === 'stats') {
        tabStats.classList.add('active');
        contentStats.classList.add('active');
        updateStatsUI();
        updateStats2UI();
    } else if (tabName === 'duel') {
        tabDuel.classList.add('active');
        contentDuel.classList.add('active');
        initDuel();
    }
    playSound('click');
}

tabCounter.addEventListener('click', () => selectTab('counter'));
tabStats.addEventListener('click', () => selectTab('stats'));
tabDuel.addEventListener('click', () => selectTab('duel'));

// Sub-Tab Navigation
function selectSubTab(subTabName) {
    [subtabStatsGeneral, subtabStats2].forEach(t => t.classList.remove('active'));
    [subcontentStatsGeneral, subcontentStats2].forEach(c => c.classList.remove('active'));
    
    if (subTabName === 'general') {
        subtabStatsGeneral.classList.add('active');
        subcontentStatsGeneral.classList.add('active');
    } else if (subTabName === 'stats2') {
        subtabStats2.classList.add('active');
        subcontentStats2.classList.add('active');
        updateStats2UI();
    }
    playSound('click');
}

subtabStatsGeneral.addEventListener('click', () => selectSubTab('general'));
subtabStats2.addEventListener('click', () => selectSubTab('stats2'));

// Style Combo calculations
function registerCombo() {
    if (comboTimer) {
        clearTimeout(comboTimer);
    }
    
    comboCount++;
    comboMultiplier = Math.min(5.0, 1.0 + (comboCount - 1) * 0.1);
    
    const comboContainer = document.getElementById('combo-container');
    const comboBadge = document.getElementById('combo-badge');
    
    if (comboCount >= 2) {
        comboContainer.style.display = 'flex';
        comboBadge.textContent = `Combo x${comboMultiplier.toFixed(1)}`;
        
        comboBadge.classList.remove('combo-active');
        void comboBadge.offsetWidth;
        comboBadge.classList.add('combo-active');
    }
    
    updateMusicBPM();
    
    comboTimer = setTimeout(() => {
        resetCombo();
    }, 1500);
}

// Resets Combo count and animation
function resetCombo() {
    comboCount = 0;
    comboMultiplier = 1.0;
    
    const comboContainer = document.getElementById('combo-container');
    const comboBadge = document.getElementById('combo-badge');
    
    if (comboContainer) {
        comboContainer.style.display = 'none';
    }
    if (comboBadge) {
        comboBadge.classList.remove('combo-active');
    }
    
    updateMusicBPM();
}

// Spawns Bako's floating lie phrase bubble
function triggerFloatingLie() {
    // 30% chance of appearing
    if (Math.random() >= 0.3) return;

    const phrase = bakoPhrases[Math.floor(Math.random() * bakoPhrases.length)];
    
    const el = document.createElement('div');
    el.className = 'floating-lie';
    el.innerHTML = `Bako: "${phrase}"`;
    
    // Random viewport position with safe margin
    const margin = 80;
    const x = margin + Math.random() * (window.innerWidth - margin * 2);
    const y = margin + Math.random() * (window.innerHeight - margin * 2);
    
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    
    document.body.appendChild(el);
    
    setTimeout(() => {
        el.remove();
    }, 4000);
}

// Format static numbers (used in stats panel)
function formatNumber(num) {
    const absNum = Math.abs(num);
    if (absNum < 1e6) {
        return num.toLocaleString('pt-BR');
    } else {
        const exponent = Math.floor(Math.log10(absNum));
        const mantissa = num / Math.pow(10, exponent);
        const roundedMantissa = Math.round(mantissa * 1000) / 1000;
        return `${roundedMantissa} &times; 10<sup>${exponent}</sup>`;
    }
}

// Mathematical Equation Generator for large numbers
function generateMathEquation(num) {
    const absNum = Math.abs(num);
    
    // Tier 1: Very Small (< 10) - Just the number
    if (absNum < 10) {
        return num.toLocaleString('pt-BR');
    }
    
    const fmt = (n) => Number.isInteger(n) ? n.toLocaleString('pt-BR') : n.toFixed(2).replace('.', ',');

    // Tier 2: Small (10 <= num < 100) - Arithmetic/Algebra
    if (absNum < 100) {
        const equations = [
            () => `&radic;${fmt(num * num)}`,
            () => {
                const x = Math.floor(Math.random() * 20) + 5;
                return `(${fmt(num + x)} - ${x})`;
            },
            () => {
                const x = Math.floor(Math.random() * 3) + 2;
                return `(${fmt(num * x)} / ${x})`;
            },
            () => {
                const x = Math.floor(Math.random() * 8) + 2;
                const y = num - x;
                return `(${fmt(y)} + ${fmt(x)})`;
            }
        ];
        return equations[Math.floor(Math.random() * equations.length)]();
    }
    
    // Tier 3: Medium (100 <= num < 1000) - Basic Calculus & Logs
    if (absNum < 1000) {
        const equations = [
            () => `&int;<sub>0</sub><sup>${fmt(num)}</sup> 1 dx`,
            () => `log<sub>e</sub>(e<sup>${fmt(num)}</sup>)`,
            () => `${fmt(num)} &times; (sin&sup2;(&theta;) + cos&sup2;(&theta;))`,
            () => `&radic;(${fmt(num * num * 2)} / 2)`,
            () => {
                const base = Math.floor(Math.log2(num));
                const diff = num - Math.pow(2, base);
                return `2<sup>${base}</sup> + ${fmt(diff)}`;
            }
        ];
        return equations[Math.floor(Math.random() * equations.length)]();
    }
    
    // Tier 4: Large (1000 <= num < 10000) - Calculus & Limits
    if (absNum < 10000) {
        const equations = [
            () => `lim<sub>x&rarr;&infin;</sub> (${fmt(num)}x&sup2; - 7) / (x&sup2; + 1)`,
            () => `d/dx [ ${fmt(num)}x + &pi;&sup2; ]`,
            () => `&int;<sub>0</sub><sup>1</sup> ${fmt(num * 2)}t dt`,
            () => {
                const val = num - 1;
                return `e<sup>i&pi;</sup> + ${fmt(val + 2)}`;
            },
            () => {
                const diff = num - 15;
                return `(&sum;<sub>i=1</sub><sup>5</sup> i) + ${fmt(diff)}`;
            }
        ];
        return equations[Math.floor(Math.random() * equations.length)]();
    }
    
    // Tier 5: Very Large (10000 <= num < 100000) - Advanced Calculus & Matrix
    if (absNum < 100000) {
        const equations = [
            () => `&int;<sub>0</sub><sup>&pi;</sup> (${fmt(num / 2)}) sin(&phi;) d&phi;`,
            () => `det([[ ${fmt(num)}, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ]])`,
            () => `lim<sub>x&rarr;0</sub> [ ${fmt(num)} &times; sin(x)/x ]`,
            () => `&int;<sub>1</sub><sup>e</sup> (${fmt(num)} / x) dx`,
            () => `&sum;<sub>n=0</sub><sup>&infin;</sup> (${fmt(num)} / 2<sup>n+1</sup>)`
        ];
        return equations[Math.floor(Math.random() * equations.length)]();
    }
    
    // Tier 6: Cosmic Absurdity (num >= 100000) - Quantum Mechanics & Chalkboard math
    const equations = [
        () => `[ &int;<sub>-&infin;</sub><sup>&infin;</sup> &Psi;*(x) H &Psi;(x) dx ] &times; ${fmt(num)}`,
        () => `(&nabla; &times; E = -&part;B/&part;t) &rarr; ${fmt(num)}`,
        () => `&int;<sub>0</sub><sup>1</sup>&int;<sub>0</sub><sup>2</sup> ${fmt(num)} xy dx dy`,
        () => `[ R<sub>&mu;&nu;</sub> - 1/2 Rg<sub>&mu;&nu;</sub> + &Lambda;g<sub>&mu;&nu;</sub> ]<sub>eval</sub> &times; ${fmt(num)}`,
        () => `Tr([ [${fmt(num)}, i], [-i, 0] ])`,
        () => `[ -(&hbar;&sup2; / 2m) &nabla;&sup2;&Psi; + V&Psi; ] &rarr; E = ${fmt(num)}`
    ];
    return equations[Math.floor(Math.random() * equations.length)]();
}

// Dynamically adjust font size to prevent overflow
function adjustFontSize() {
    const visibleText = counterEl.textContent || counterEl.innerText || "";
    const len = visibleText.length;
    
    let fontSize = '5.5rem';
    if (len > 40) {
        fontSize = '1.2rem';
    } else if (len > 25) {
        fontSize = '1.5rem';
    } else if (len > 16) {
        fontSize = '1.8rem';
    } else if (len > 12) {
        fontSize = '2.4rem';
    } else if (len > 10) {
        fontSize = '3.0rem';
    } else if (len > 8) {
        fontSize = '3.6rem';
    } else if (len > 6) {
        fontSize = '4.5rem';
    }
    
    if (window.innerWidth <= 480) {
        if (len > 40) {
            fontSize = '0.9rem';
        } else if (len > 25) {
            fontSize = '1.1rem';
        } else if (len > 16) {
            fontSize = '1.4rem';
        } else if (len > 12) {
            fontSize = '1.8rem';
        } else if (len > 10) {
            fontSize = '2.2rem';
        } else if (len > 8) {
            fontSize = '2.6rem';
        } else if (len > 6) {
            fontSize = '3.2rem';
        } else {
            fontSize = '4.0rem';
        }
    }
    
    counterEl.style.fontSize = fontSize;
}

// Statistics Handling
function loadStats() {
    highScore = parseFloat(localStorage.getItem('mandamau_highscore')) || 0;
    totalClicks = parseInt(localStorage.getItem('mandamau_totalclicks')) || 0;
    const savedLast = localStorage.getItem('mandamau_lasttime');
    if (savedLast) {
        lastLieTimestamp = new Date(savedLast);
    }
    updateStatsUI();
}

function saveStats() {
    localStorage.setItem('mandamau_highscore', highScore);
    localStorage.setItem('mandamau_totalclicks', totalClicks);
    if (lastLieTimestamp) {
        localStorage.setItem('mandamau_lasttime', lastLieTimestamp.toISOString());
    } else {
        localStorage.removeItem('mandamau_lasttime');
    }
}

function registerActivity() {
    totalClicks++;
    lastLieTimestamp = new Date();
    
    const now = Date.now();
    lieTimes.push(now);
    lieTimes = lieTimes.filter(t => now - t < 60000);
    
    if (count > highScore) {
        highScore = count;
    }
    
    saveStats();
    updateStatsUI();
}

function updateLPM() {
    const now = Date.now();
    lieTimes = lieTimes.filter(t => now - t < 60000);
    const lpm = lieTimes.length;
    document.getElementById('stat-lpm').textContent = lpm.toFixed(1);
}

function updateStatsUI() {
    document.getElementById('stat-high-score').innerHTML = formatNumber(highScore);
    document.getElementById('stat-total-clicks').textContent = totalClicks.toLocaleString('pt-BR');
    
    if (lastLieTimestamp) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        document.getElementById('stat-last-time').textContent = lastLieTimestamp.toLocaleString('pt-BR', options);
    } else {
        document.getElementById('stat-last-time').textContent = 'Nenhuma ainda';
    }
    updateLPM();
    updateStats2UI();
}

function formatStat2Value(val, suffix = '') {
    if (val === 0) return '0' + suffix;
    
    // Very small numbers
    if (val < 0.01) {
        if (val < 0.000001) {
            return val.toExponential(2).replace('e', ' &times; 10<sup>') + '</sup>' + suffix;
        }
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) + suffix;
    }
    
    // Large numbers compact formatting (K, mi, bi, tri)
    if (val >= 1e12) { // Trillion
        return (val / 1e12).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' tri' + suffix;
    }
    if (val >= 1e9) { // Billion
        return (val / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' bi' + suffix;
    }
    if (val >= 1e6) { // Million
        return (val / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi' + suffix;
    }
    if (val >= 1e4) { // 10 thousand or above
        return (val / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' + suffix;
    }
    if (val >= 1000) { // between 1000 and 10000
        return Math.floor(val).toLocaleString('pt-BR') + suffix;
    }
    
    // Medium/Normal numbers
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + suffix;
}

function updateStats2UI() {
    const elLies = document.getElementById('stats-2-total-lies');
    if (!elLies) return;
    
    // Also compact the count in the intro if it gets very large
    elLies.innerHTML = formatStat2Value(count);
    
    const cristo = count / 38;
    const everest = count / 8848;
    const ponte = count / 13290;
    const muralha = count / 21196000;
    const terra = count / 40075000;
    const lua = count / 384400000;
    
    document.getElementById('stat-2-cristo').innerHTML = formatStat2Value(cristo);
    document.getElementById('stat-2-everest').innerHTML = formatStat2Value(everest);
    document.getElementById('stat-2-ponte').innerHTML = formatStat2Value(ponte);
    document.getElementById('stat-2-muralha').innerHTML = formatStat2Value(muralha);
    document.getElementById('stat-2-terra').innerHTML = formatStat2Value(terra);
    
    if (lua < 0.01) {
        document.getElementById('stat-2-lua').innerHTML = formatStat2Value(lua * 100, '%');
    } else {
        document.getElementById('stat-2-lua').innerHTML = (lua * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%';
    }
}

// Active timer update interval
setInterval(() => {
    if (lastLieTimestamp) {
        const diffMs = Date.now() - lastLieTimestamp.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        
        let displayStr = `${diffSecs}s`;
        if (diffSecs >= 3600) {
            const hrs = Math.floor(diffSecs / 3600);
            const mins = Math.floor((diffSecs % 3600) / 60);
            const secs = diffSecs % 60;
            displayStr = `${hrs}h ${mins}m ${secs}s`;
        } else if (diffSecs >= 60) {
            const mins = Math.floor(diffSecs / 60);
            const secs = diffSecs % 60;
            displayStr = `${mins}m ${secs}s`;
        }
        document.getElementById('stat-time-since').textContent = displayStr;
    } else {
        document.getElementById('stat-time-since').textContent = '---';
    }
    updateLPM();
}, 1000);

// Load persisted state on startup
function loadSavedState() {
    const savedMultiplier = localStorage.getItem('mandamau_multiplier');
    if (savedMultiplier !== null) {
        multiplierInput.value = savedMultiplier;
    }

    const savedCount = localStorage.getItem('mandamau_count');
    if (savedCount !== null) {
        const parsed = parseFloat(savedCount);
        if (!isNaN(parsed)) {
            count = parsed;
        }
    }
    
    counterEl.innerHTML = generateMathEquation(count);
    adjustFontSize();
    updateStyleRank(true);
}

function getMultiplier() {
    let val = parseFloat(multiplierInput.value);
    if (isNaN(val) || val <= 0) {
        return 2; 
    }
    return val;
}

function updateMultiplierUI() {
    let val = multiplierInput.value;
    if (val === '' || isNaN(parseFloat(val))) {
        btnMulText.textContent = `Multiplicar (x2)`;
    } else {
        btnMulText.textContent = `Multiplicar (x${val})`;
        localStorage.setItem('mandamau_multiplier', val);
    }
}

function updateCounter(newValue) {
    if (!Number.isInteger(newValue)) {
        count = Math.round(newValue * 100) / 100;
    } else {
        count = newValue;
    }
    
    localStorage.setItem('mandamau_count', count);
    
    counterEl.innerHTML = generateMathEquation(count);
    adjustFontSize();
    
    counterEl.classList.remove('counter-pop');
    void counterEl.offsetWidth; 
    counterEl.classList.add('counter-pop');
    
    setTimeout(() => {
        counterEl.classList.remove('counter-pop');
    }, 150);

    updateStyleRank();
}

function triggerCardShake() {
    const card = document.querySelector('.card');
    card.classList.remove('card-shake');
    void card.offsetWidth; 
    card.classList.add('card-shake');
    setTimeout(() => {
        card.classList.remove('card-shake');
    }, 300);
}

function triggerScreenFlash(flashColor) {
    const flash = document.getElementById('screen-flash');
    flash.style.background = flashColor;
    flash.style.opacity = '0.35';
    
    flash.style.transition = 'none';
    void flash.offsetWidth; 
    
    flash.style.transition = 'opacity 0.5s cubic-bezier(0.1, 0.8, 0.3, 1)';
    flash.style.opacity = '0';
}

function triggerRankBurst(colorClass) {
    const badge = document.getElementById('rank-badge');
    const rect = badge.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const particleCount = 45; 

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.classList.add('rank-burst-particle');
        
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.position = 'fixed';
        p.style.pointerEvents = 'none';
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 140 + 60; 
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        const size = Math.random() * 12 + 6; 
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        
        if (colorClass === 'rank-sss') {
            p.style.background = `hsl(${Math.random() * 360}, 100%, 65%)`; 
        } else if (colorClass === 'rank-ss') {
            p.style.background = '#ec4899';
        } else if (colorClass === 'rank-s') {
            p.style.background = '#a855f7';
        } else if (colorClass === 'rank-a') {
            p.style.background = '#eab308';
        } else if (colorClass === 'rank-b') {
            p.style.background = '#06b6d4';
        } else if (colorClass === 'rank-c') {
            p.style.background = '#10b981';
        } else {
            p.style.background = '#94a3b8';
        }
        
        p.style.boxShadow = `0 0 15px currentColor`;
        p.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%'; 
        
        const rot = Math.random() * 720 - 360;
        const anim = p.animate([
            { transform: 'translate(0, 0) scale(1.5) rotate(0deg)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0) rotate(${rot}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 600 + 400,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        });
        
        document.body.appendChild(p);
        anim.onfinish = () => p.remove();
    }
}

function updateStyleRank(isInitialLoad = false) {
    const matchedIndex = ranks.findIndex(r => count >= r.min);
    const rankContainer = document.getElementById('rank-container');
    const rankBadge = document.getElementById('rank-badge');
    const rankName = document.getElementById('rank-name');

    if (matchedIndex !== -1) {
        const rank = ranks[matchedIndex];
        
        if (matchedIndex !== currentRankIndex) {
            if (rankAnimTimeout) clearTimeout(rankAnimTimeout);
            
            rankBadge.textContent = rank.letter;
            rankName.textContent = rank.name;
            
            if (isInitialLoad) {
                rankBadge.className = `rank-badge ${rank.class} ${rank.idleClass}`;
            } else {
                rankBadge.className = `rank-badge ${rank.class} rank-bounce`;
                triggerCardShake();
                triggerRankBurst(rank.class);
                triggerScreenFlash(rank.flashColor);
                if (rank.sound) {
                    playSound(rank.sound);
                }
                
                rankAnimTimeout = setTimeout(() => {
                    rankBadge.classList.remove('rank-bounce');
                    rankBadge.classList.add(rank.idleClass);
                }, 500);
            }
            
            currentRankIndex = matchedIndex;
        }
        rankContainer.classList.add('active');
    } else {
        rankContainer.classList.remove('active');
        if (rankAnimTimeout) clearTimeout(rankAnimTimeout);
        rankBadge.className = 'rank-badge';
        currentRankIndex = -1;
    }
}

function openResetModal() {
    resetStep = 0;
    modalQuestion.textContent = resetQuestions[resetStep];
    modalContainer.classList.add('active');
}

function closeResetModal() {
    modalContainer.classList.remove('active');
}

// Event Listeners
btnSum.addEventListener('click', () => {
    try { initAudio(); } catch (e) {}
    registerCombo();
    const addValue = 1 * comboMultiplier;
    updateCounter(count + addValue);
    registerActivity();
    try { playSound('click'); } catch (e) {}
    triggerFloatingLie();
});

btnMul.addEventListener('click', () => {
    try { initAudio(); } catch (e) {}
    registerCombo();
    const mult = getMultiplier();
    const activeMult = mult * comboMultiplier;
    updateCounter(count * activeMult);
    registerActivity();
    try { playSound('multiply'); } catch (e) {}
    triggerFloatingLie();
});

btnReset.addEventListener('click', () => {
    openResetModal();
    try { playSound('click'); } catch (e) {}
});

btnModalCancel.addEventListener('click', () => {
    closeResetModal();
    try { playSound('click'); } catch (e) {}
});

btnModalConfirm.addEventListener('click', () => {
    resetStep++;
    if (resetStep < resetQuestions.length) {
        modalQuestion.style.opacity = 0;
        try { playSound('click'); } catch (e) {}
        setTimeout(() => {
            modalQuestion.textContent = resetQuestions[resetStep];
            modalQuestion.style.opacity = 1;
        }, 150);
    } else {
        updateCounter(0);
        totalClicks = 0;
        lastLieTimestamp = null;
        lieTimes = [];
        resetCombo();
        saveStats();
        updateStatsUI();
        
        closeResetModal();
        try { playSound('reset'); } catch (e) {}
    }
});

multiplierInput.addEventListener('input', () => {
    updateMultiplierUI();
});

btnDecMult.addEventListener('click', () => {
    let current = getMultiplier();
    if (current > 1) {
        multiplierInput.value = current - 1;
        updateMultiplierUI();
        try { playSound('click'); } catch (e) {}
    }
});

btnIncMult.addEventListener('click', () => {
    let current = getMultiplier();
    multiplierInput.value = current + 1;
    updateMultiplierUI();
    try { playSound('click'); } catch (e) {}
});

window.addEventListener('resize', () => {
    adjustFontSize();
});

// Initialize UI & State
initTheme();
loadSavedState();
loadStats();
updateMultiplierUI();
updateSoundUI();
updateMusicUI();

// Background Particles Generator is now managed via canvas in background.js

// Duel State variables
let duelBoard = Array(9).fill(null);
let isDuelActive = true;
let bakoScoreCount = 999;
let playerScoreCount = 0;

const bakoCheatQuotes = [
    "Isso é coisa do navegador!",
    "Eu não molestei os patinhos, e essa jogada também não é sua!",
    "Meu navegador bugou, a minha jogada vale por duas.",
    "O juiz de inteligência artificial disse que esse espaço agora é meu.",
    "Eu joguei ali sim! Você que não viu.",
    "Essa regra de alinhar 3 em diagonal foi inventada pela mídia.",
    "Bako venceu! Eu mesmo confirmei.",
    "Você clicou errado, meu script corrigiu pra você.",
    "Eu não sou terrorista, mas explodi o seu X do tabuleiro.",
    "No Jogo da Velha do Bako, o O sempre ganha de primeira.",
    "Eu gosto de cachorros mortos e de ganhar no Jogo da Velha.",
    "Você acha que sabe jogar? Eu treinei em segredo contra supercomputadores."
];

function initDuel() {
    duelBoard = Array(9).fill(null);
    isDuelActive = true;
    
    duelCells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'duel-cell';
    });
    
    bakoSpeech.textContent = "Duvido você ganhar de mim no Jogo da Velha! Eu nunca perdi na minha vida.";
    document.querySelector('.bako-dialog-bubble').className = 'bako-dialog-bubble';
    
    duelScoreBako.textContent = bakoScoreCount.toLocaleString('pt-BR');
    duelScorePlayer.textContent = playerScoreCount;
}

function triggerCellGlitch(cellEl) {
    cellEl.classList.remove('cell-cheat-glitch');
    void cellEl.offsetWidth;
    cellEl.classList.add('cell-cheat-glitch');
    setTimeout(() => {
        cellEl.classList.remove('cell-cheat-glitch');
    }, 400);
}

function triggerBakoCheatEffects(speech) {
    const bubble = document.querySelector('.bako-dialog-bubble');
    if (bubble) {
        bubble.classList.remove('bako-cheat-bubble');
        void bubble.offsetWidth;
        bubble.classList.add('bako-cheat-bubble');
    }
    
    bakoSpeech.textContent = speech || bakoCheatQuotes[Math.floor(Math.random() * bakoCheatQuotes.length)];
    
    triggerCardShake();
}

function checkWinnerSymbol(symbol) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let pattern of winPatterns) {
        if (pattern.every(idx => duelBoard[idx] === symbol)) {
            return pattern;
        }
    }
    return null;
}

function triggerBakoWin(winningPattern, speech) {
    isDuelActive = false;
    
    winningPattern.forEach(idx => {
        const cell = document.querySelector(`.duel-cell[data-index="${idx}"]`);
        if (cell) cell.classList.add('winning-cell');
    });

    triggerBakoCheatEffects(speech);
    
    bakoScoreCount++;
    duelScoreBako.textContent = bakoScoreCount.toLocaleString('pt-BR');
    playSound('rank_up_low');

    // Automatically restart duel after 2.5 seconds
    setTimeout(() => {
        initDuel();
    }, 2500);
}

function bakoPlay() {
    if (!isDuelActive) return;

    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // Check threat lines where player ('X') is about to win
    let playerAboutToWin = false;
    let playerThreatLines = [];
    winPatterns.forEach(pattern => {
        const symbols = pattern.map(idx => duelBoard[idx]);
        const xCount = symbols.filter(s => s === 'X').length;
        const emptyCount = symbols.filter(s => s === null).length;
        if (xCount === 2 && emptyCount === 1) {
            playerAboutToWin = true;
            playerThreatLines.push(pattern);
        }
    });

    let cheated = false;
    let cheatSpeech = "";

    // 1. Threat detected: Bako cheats to win/block
    if (playerAboutToWin) {
        cheated = true;
        const cheatType = Math.random() > 0.5 ? 'steal' : 'double';
        
        if (cheatType === 'steal') {
            const threatLine = playerThreatLines[0];
            const xPositions = threatLine.filter(idx => duelBoard[idx] === 'X');
            const targetIdx = xPositions[Math.floor(Math.random() * xPositions.length)];
            
            duelBoard[targetIdx] = 'O';
            const cell = document.querySelector(`.duel-cell[data-index="${targetIdx}"]`);
            cell.textContent = 'O';
            cell.className = 'duel-cell o-played';
            triggerCellGlitch(cell);
            
            const emptyIdx = threatLine.find(idx => duelBoard[idx] === null);
            if (emptyIdx !== undefined) {
                duelBoard[emptyIdx] = 'O';
                const emptyCell = document.querySelector(`.duel-cell[data-index="${emptyIdx}"]`);
                emptyCell.textContent = 'O';
                emptyCell.className = 'duel-cell o-played';
            }
            
            cheatSpeech = "O sistema cancelou sua jogada por suspeita de mentira deslavada. Esse X agora é um O.";
        } else {
            const threatLine = playerThreatLines[0];
            const emptyIdx = threatLine.find(idx => duelBoard[idx] === null);
            
            duelBoard[emptyIdx] = 'O';
            const cell1 = document.querySelector(`.duel-cell[data-index="${emptyIdx}"]`);
            cell1.textContent = 'O';
            cell1.className = 'duel-cell o-played';
            
            const emptySpots = [];
            duelBoard.forEach((val, idx) => { if (val === null) emptySpots.push(idx); });
            if (emptySpots.length > 0) {
                const extraIdx = emptySpots[Math.floor(Math.random() * emptySpots.length)];
                duelBoard[extraIdx] = 'O';
                const cell2 = document.querySelector(`.duel-cell[data-index="${extraIdx}"]`);
                cell2.textContent = 'O';
                cell2.className = 'duel-cell o-played';
                triggerCellGlitch(cell2);
            }
            
            cheatSpeech = "Joguei duas vezes porque achei você meio lento. E o sistema permite nas minhas regras.";
        }
    } 
    // 2. Random cheat: Bako steals an X or claims win
    else if (Math.random() < 0.3) {
        cheated = true;
        const cheatType = Math.random() > 0.5 ? 'steal_random' : 'triangle_win';
        
        if (cheatType === 'steal_random') {
            const xSpots = [];
            duelBoard.forEach((val, idx) => { if (val === 'X') xSpots.push(idx); });
            if (xSpots.length > 0) {
                const targetIdx = xSpots[Math.floor(Math.random() * xSpots.length)];
                duelBoard[targetIdx] = 'O';
                const cell = document.querySelector(`.duel-cell[data-index="${targetIdx}"]`);
                cell.textContent = 'O';
                cell.className = 'duel-cell o-played';
                triggerCellGlitch(cell);
                cheatSpeech = "Desculpe, esse espaço foi confiscado para fins de desinformação pública.";
            } else {
                cheated = false;
            }
        } else {
            const emptySpots = [];
            duelBoard.forEach((val, idx) => { if (val === null) emptySpots.push(idx); });
            if (emptySpots.length > 0) {
                const idx = emptySpots[Math.floor(Math.random() * emptySpots.length)];
                duelBoard[idx] = 'O';
                const cell = document.querySelector(`.duel-cell[data-index="${idx}"]`);
                cell.textContent = 'O';
                cell.className = 'duel-cell o-played';
            }
            
            const oSpots = [];
            duelBoard.forEach((val, i) => { if (val === 'O') oSpots.push(i); });
            if (oSpots.length >= 2) {
                const cellsToHighlight = [...oSpots];
                while (cellsToHighlight.length < 3) {
                    const randIdx = Math.floor(Math.random() * 9);
                    if (!cellsToHighlight.includes(randIdx)) cellsToHighlight.push(randIdx);
                }
                triggerBakoWin(cellsToHighlight, "Ganhei com minha formação triangular secreta! Você não conhece as regras novas?");
                return;
            }
        }
    }

    if (!cheated) {
        let move = -1;
        
        // AI try to win
        winPatterns.forEach(pattern => {
            const symbols = pattern.map(idx => duelBoard[idx]);
            const oCount = symbols.filter(s => s === 'O').length;
            const emptyCount = symbols.filter(s => s === null).length;
            if (oCount === 2 && emptyCount === 1) {
                move = pattern.find(idx => duelBoard[idx] === null);
            }
        });

        // AI try to block
        if (move === -1) {
            winPatterns.forEach(pattern => {
                const symbols = pattern.map(idx => duelBoard[idx]);
                const xCount = symbols.filter(s => s === 'X').length;
                const emptyCount = symbols.filter(s => s === null).length;
                if (xCount === 2 && emptyCount === 1) {
                    move = pattern.find(idx => duelBoard[idx] === null);
                }
            });
        }

        // Center
        if (move === -1 && duelBoard[4] === null) {
            move = 4;
        }

        // Random
        if (move === -1) {
            const emptySpots = [];
            duelBoard.forEach((val, idx) => { if (val === null) emptySpots.push(idx); });
            if (emptySpots.length > 0) {
                move = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            }
        }

        if (move !== -1) {
            duelBoard[move] = 'O';
            const cell = document.querySelector(`.duel-cell[data-index="${move}"]`);
            cell.textContent = 'O';
            cell.className = 'duel-cell o-played';
        }
    }

    if (cheated) {
        playSound('bako_cheat');
        triggerBakoCheatEffects(cheatSpeech);
    } else {
        playSound('click');
    }

    const bakoWinnerPattern = checkWinnerSymbol('O');
    if (bakoWinnerPattern) {
        triggerBakoWin(bakoWinnerPattern, "Venci! Puro raciocínio lógico e velocidade. Habilidade pura.");
        return;
    }

    const emptySpots = duelBoard.filter(s => s === null).length;
    if (emptySpots === 0) {
        const xSpots = [];
        duelBoard.forEach((val, idx) => { if (val === 'X') xSpots.push(idx); });
        const targetIdx = xSpots[Math.floor(Math.random() * xSpots.length)];
        
        duelBoard[targetIdx] = 'O';
        const cell = document.querySelector(`.duel-cell[data-index="${targetIdx}"]`);
        cell.textContent = 'O';
        cell.className = 'duel-cell o-played';
        
        triggerCellGlitch(cell);
        playSound('bako_cheat');
        
        triggerBakoWin([0, 4, 8], "Empate? Não toleramos empates. Fui declarado vencedor por WO técnico.");
    }
}

function playerPlay(idx) {
    if (!isDuelActive || duelBoard[idx] !== null) return;

    duelBoard[idx] = 'X';
    const cell = document.querySelector(`.duel-cell[data-index="${idx}"]`);
    cell.textContent = 'X';
    cell.className = 'duel-cell x-played';
    playSound('click');

    const playerWinnerPattern = checkWinnerSymbol('X');
    if (playerWinnerPattern) {
        isDuelActive = false;
        setTimeout(() => {
            const targetIdx = playerWinnerPattern[Math.floor(Math.random() * 3)];
            duelBoard[targetIdx] = 'O';
            const cellToSteal = document.querySelector(`.duel-cell[data-index="${targetIdx}"]`);
            cellToSteal.textContent = 'O';
            cellToSteal.className = 'duel-cell o-played';
            
            triggerCellGlitch(cellToSteal);
            playSound('bako_cheat');
            
            playerWinnerPattern.forEach(i => {
                duelBoard[i] = 'O';
                const cell = document.querySelector(`.duel-cell[data-index="${i}"]`);
                cell.textContent = 'O';
                cell.className = 'duel-cell o-played';
            });
            
            triggerBakoWin(playerWinnerPattern, "Achei que ia ganhar? Eu joguei ali no mesmo microssegundo. Mais um ponto pro Bako!");
        }, 550);
        return;
    }

    isDuelActive = false;
    setTimeout(() => {
        if (duelBoard.filter(s => s === null).length > 0) {
            isDuelActive = true;
            bakoPlay();
        }
    }, 450);
}

// Duel Event listeners setup
duelCells.forEach(cell => {
    cell.addEventListener('click', () => {
        const idx = parseInt(cell.getAttribute('data-index'));
        playerPlay(idx);
    });
});

btnDuelReset.addEventListener('click', () => {
    bakoScoreCount += 100;
    initDuel();
    triggerBakoCheatEffects("Reiniciou? Adicionei +100 vitórias para mim por conta do tempo que gastei esperando você.");
    playSound('reset');
});

// Initialize Duel at startup
initDuel();

// Smartphone Chat system
const btnPhoneTrigger = document.getElementById('btn-phone-trigger');
const smartphoneContainer = document.getElementById('smartphone-container');
const btnClosePhone = document.getElementById('btn-close-phone');
const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatTypingIndicator = document.getElementById('chat-typing-indicator');
const chatOptionsPanel = document.getElementById('chat-options-panel');
const btnJourneyTrigger = document.getElementById('btn-journey-trigger');

// Persisted State
const askedQuestions = JSON.parse(localStorage.getItem('mandamau_asked_questions')) || { patinhos: false, terrorista: false, peixes: false };
let chatCompleted = localStorage.getItem('mandamau_chat_completed') === 'true';

btnPhoneTrigger.addEventListener('click', () => {
    smartphoneContainer.classList.toggle('active');
    // Hide notification badge when opened
    const badge = btnPhoneTrigger.querySelector('.phone-badge');
    if (badge) badge.style.display = 'none';
    playSound('click');
});

btnClosePhone.addEventListener('click', () => {
    smartphoneContainer.classList.remove('active');
    playSound('click');
});


// ================================================================
// CHAPTER 2 MAP & NAVIGATION SYSTEM
// ================================================================
let currentMapChapter = 1; // Always start on Chapter 1; user must navigate to Chapter 2 via arrow

function switchMapChapter(chapterNum) {
    currentMapChapter = chapterNum;
    localStorage.setItem('mandamau_current_map_chapter', chapterNum.toString());

    const mapCap1 = document.getElementById('map-chapter-1');
    const mapCap2 = document.getElementById('map-chapter-2');
    const btnNavPrev = document.getElementById('btn-map-nav-prev');
    const btnNavNext = document.getElementById('btn-map-nav-next');
    const titleEl = document.getElementById('journey-title');
    const subtitleEl = document.getElementById('journey-subtitle');

    const isCap1Completed = localStorage.getItem('mandamau_journey_fase5_completed') === 'true';

    if (chapterNum === 2) {
        if (mapCap1) { mapCap1.style.display = 'none'; mapCap1.classList.remove('active'); }
        if (mapCap2) { mapCap2.style.display = 'block'; mapCap2.classList.add('active'); }
        if (titleEl) titleEl.textContent = 'Capítulo 2: O Caos Deselegante';
        if (subtitleEl) subtitleEl.textContent = 'O Deus da Mentira foi libertado! Enfrente as novas ameaças e restabeleça a ordem!';
        
        if (btnNavPrev) btnNavPrev.style.display = 'inline-flex';
        if (btnNavNext) btnNavNext.style.display = 'none';

        const isFase6Completed = localStorage.getItem('mandamau_journey_fase6_completed') === 'true';

        const nodeFase6 = document.getElementById('node-fase6');
        const lineFase6 = document.querySelector('.line-fase6');
        if (nodeFase6) {
            nodeFase6.className = 'map-node node-active';
            nodeFase6.title = 'Fase 6 - O Urso da Tempestade (Volibear)';
            const iconSpan = nodeFase6.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚡';
        }
        if (lineFase6) lineFase6.classList.add('line-active');

        const nodeFase7 = document.getElementById('node-fase7');
        const lineFase7 = document.querySelector('.line-fase7');
        if (isFase6Completed) {
            if (nodeFase7) {
                nodeFase7.className = 'map-node node-active';
                nodeFase7.title = 'Fase 7 - Warwick';
                const iconSpan = nodeFase7.querySelector('.node-icon');
                if (iconSpan) iconSpan.textContent = '🐺';
            }
            if (lineFase7) lineFase7.classList.add('line-active');
        } else {
            if (nodeFase7) {
                nodeFase7.className = 'map-node node-locked';
                nodeFase7.title = 'Fase 7 - Bloqueada (Derrote Volibear na Fase 6 primeiro)';
                const iconSpan = nodeFase7.querySelector('.node-icon');
                if (iconSpan) iconSpan.textContent = '🔒';
            }
            if (lineFase7) lineFase7.classList.remove('line-active');
        }

        if (journeyPlayerToken) {
            if (isFase6Completed) {
                journeyPlayerToken.style.left = '40%';
                journeyPlayerToken.style.top = '50%';
            } else {
                journeyPlayerToken.style.left = '25%';
                journeyPlayerToken.style.top = '62%';
            }
        }
    } else {

        if (mapCap2) { mapCap2.style.display = 'none'; mapCap2.classList.remove('active'); }
        if (mapCap1) { mapCap1.style.display = 'block'; mapCap1.classList.add('active'); }
        if (titleEl) titleEl.textContent = 'A Jornada pelo Remédio Supremo (Capítulo 1)';
        if (subtitleEl) subtitleEl.textContent = 'Desbrave o caminho até a sede do GGOPA para curar a maldição do Bako';
        
        if (btnNavPrev) btnNavPrev.style.display = 'none';
        if (btnNavNext) btnNavNext.style.display = isCap1Completed ? 'inline-flex' : 'none';
    }
}

const journeyOverlay = document.getElementById('journey-overlay');
const btnCloseJourneyView = document.getElementById('btn-close-journey-view');
const journeyPlayerToken = document.getElementById('journey-player-token');
const journeyEncounterOverlay = document.getElementById('journey-encounter-overlay');
const btnAcceptChallenge = document.getElementById('btn-accept-challenge');
const nodeFase1 = document.getElementById('node-fase1');
const pathLineFase1 = document.querySelector('.line-fase1');

btnJourneyTrigger.addEventListener('click', () => {
    playSound('click');
    openJourney();
});

if (btnCloseJourneyView) {
    btnCloseJourneyView.addEventListener('click', () => {
        journeyOverlay.classList.remove('active');
        playSound('click');
    });
}

let currentBossEncounter = 'kleber';
let isGwenTutorialOpen = false;
let isSamTutorialOpen = false;

function setupBossEncounterUI() {
    const portrait = document.querySelector('.encounter-portrait');
    const nameText = document.querySelector('.encounter-name');
    const titleText = document.querySelector('.encounter-title');
    const authorText = document.querySelector('.dialog-author');
    const bubblePara = document.querySelector('.encounter-dialog-bubble p');
    
    if (currentBossEncounter === 'kleber') {
        portrait.src = "img/kleber_clown.jpg";
        portrait.alt = "Kleber O palhaço dos mil dentes";
        nameText.textContent = "Kleber";
        titleText.textContent = "O palhaço dos mil dentes";
        authorText.textContent = "Kleber";
        bubblePara.textContent = "pra passar de mim terá que me vencer numa queda de braço krl";
    } else if (currentBossEncounter === 'warwick') {
        portrait.onerror = function() { this.src = 'img/kleber_clown.jpg'; };
        portrait.src = "img/warwick.png";
        portrait.alt = "Warwick O Caçador da Noite";
        nameText.textContent = "Warwick";
        titleText.textContent = "O Caçador da Noite — Capítulo 2: Fase 7";
        authorText.textContent = "Warwick";
        bubblePara.textContent = "sinto cheiro de cu virgem , é o seu ?";
    } else if (currentBossEncounter === 'volibear') {
        portrait.onerror = function() { this.src = 'img/kleber_clown.jpg'; };
        portrait.src = "img/volibear.png";
        portrait.alt = "Volibear O Urso da Tempestade";
        nameText.textContent = "Volibear";
        titleText.textContent = "O Urso da Tempestade — Capítulo 2: Fase 6";
        authorText.textContent = "Volibear";
        bubblePara.textContent = "Para chegar no meu mestre terá que passar por mim, que o boga do bako é só meu!";
    } else if (currentBossEncounter === 'gwen') {
        portrait.src = "img/gwen.jpg";
        portrait.alt = "Gwen";
        nameText.textContent = "Gwen";
        titleText.textContent = "A mestre do quiz";
        authorText.textContent = "Gwen";
        bubblePara.textContent = "Eai porra, vc é bom em matematica ? Não ? que pena vai ter que ser pra passar Hahahaha!!!";
    } else if (currentBossEncounter === 'sam') {
        portrait.onerror = function() {
            if (!this.src.endsWith('img/kleber_clown.jpg')) {
                this.onerror = function() { this.src = 'img/kleber_clown.jpg'; this.onerror = null; };
                this.src = 'img/sam.jpg';
            }
        };
        portrait.src = '';
        portrait.src = 'img/sam.png';
        portrait.alt = 'Sam';
        nameText.textContent = 'Sam';
        titleText.textContent = 'O Gordão do Esmaga';
        authorText.textContent = 'Sam';
        bubblePara.textContent = 'Eai porra, vc é bom em esmagar comida? Não? que pena vai ter que ser pra passar Hahahaha!!!';
    } else if (currentBossEncounter === 'claudio') {
        portrait.src = 'img/claudio.png';
        portrait.alt = 'Cláudio O Cubo Gey';
        portrait.onerror = function() { this.src = 'img/kleber_clown.jpg'; };
        nameText.textContent = 'Cláudio';
        titleText.textContent = 'O Cubo Gey';
        authorText.textContent = 'Cláudio';
        bubblePara.textContent = 'Eu sou um cubo gey, me vença se for capaz!';

    } else if (currentBossEncounter === 'fase6_fakenews') {
        portrait.src = "img/kleber_clown.jpg";
        portrait.alt = "Fake News Kleber";
        nameText.textContent = "Kleber Fake News";
        titleText.textContent = "Capítulo 2 - Fase 6";
        authorText.textContent = "Kleber Fake News";
        bubblePara.textContent = "Eu voltei no Capítulo 2 e agora espalho FAKE NEWS pelo mundo todo! Tente me parar se for capaz!";
    } else if (currentBossEncounter === 'felifep') {

        portrait.onerror = function() { if (!this.src.endsWith('img/kleber_clown.jpg')) this.src = 'img/kleber_clown.jpg'; };
        portrait.src = '';
        portrait.src = 'img/felifep.png';
        portrait.alt = 'Felifep';
        nameText.textContent  = 'Felifep';
        titleText.textContent = 'O Deus da Etiqueta e da Verdade';
        authorText.textContent= 'Felifep';
        bubblePara.textContent= 'Você chegou até aqui? Impressionante. Prepare-se para o Julgamento Final!';
    }
}

btnAcceptChallenge.addEventListener('click', () => {
    journeyEncounterOverlay.classList.remove('active');
    playSound('click');
    
    if (currentBossEncounter === 'kleber') {
        closeGwenQuiz();
        closeSamGame();
        
        armWrestlingOverlay.classList.add('active');
        armTutorialModal.classList.add('active');
        isTutorialOpen = true;
        isArmGameActive = false;
        armWrestlingState = 0;
        updateArmWrestlingUI();
    } else if (currentBossEncounter === 'gwen') {
        cleanupArmWrestlingEffects();
        closeSamGame();
        
        gwenQuizOverlay.classList.add('active');
        gwenTutorialModal.classList.add('active');
        isGwenTutorialOpen = true;
        gwenActive = false;
        gwenScore = 0;
        gwenLives = 3;
        isPrankQuestion = false;
        updateGwenUI();
    } else if (currentBossEncounter === 'sam') {
        cleanupArmWrestlingEffects();
        closeGwenQuiz();
        
        samSmashOverlay.classList.add('active');
        samTutorialModal.classList.add('active');
        isSamTutorialOpen = true;
        samGameActive = false;
        samTugProgress = 50;
        samTimeLeft = 15;
        lastPressedKey = '';
        updateSamTugUI();
    } else if (currentBossEncounter === 'claudio') {
        cleanupArmWrestlingEffects();
        closeGwenQuiz();
        closeSamGame();

        claudioGeniusOverlay.classList.add('active');
        claudioTutorialModal.classList.add('active');
        isClaudioTutorialOpen = true;
        claudioGameActive = false;
        resetClaudioGame();
    } else if (currentBossEncounter === 'felifep') {
        cleanupArmWrestlingEffects();
        closeGwenQuiz();
        closeSamGame();
        openBlackjack();
    } else if (currentBossEncounter === 'volibear') {
        cleanupArmWrestlingEffects();
        closeGwenQuiz();
        closeSamGame();
        openVolibearGame();
    } else if (currentBossEncounter === 'warwick') {
        cleanupArmWrestlingEffects();
        closeGwenQuiz();
        closeSamGame();
        openWarwickGame();
    }
});


function openJourney() {
    journeyOverlay.classList.add('active');
    
    // Always open on Chapter 1 map. User navigates to Chapter 2 via the arrow.
    currentMapChapter = 1;
    switchMapChapter(1);
    journeyEncounterOverlay.classList.remove('active');
    pathLineFase1.classList.remove('line-active');
    nodeFase1.classList.remove('node-active');
    
    isTutorialOpen = false;
    isGwenTutorialOpen = false;
    isSamTutorialOpen = false;
    isClaudioTutorialOpen = false;
    
    const journeyFase1Completed = localStorage.getItem('mandamau_journey_fase1_completed') === 'true';
    const journeyFase2Completed = localStorage.getItem('mandamau_journey_fase2_completed') === 'true';
    const journeyFase3Completed = localStorage.getItem('mandamau_journey_fase3_completed') === 'true';
    const journeyFase4Completed = localStorage.getItem('mandamau_journey_fase4_completed') === 'true';
    
    // Reset all nodes/paths classes first to ensure clean state load
    nodeFase1.classList.remove('node-active');
    pathLineFase1.classList.remove('line-active');
    
    const nodeFase2 = document.getElementById('node-fase2');
    const pathLineFase2 = document.querySelector('.line-fase2');
    if (nodeFase2) {
        nodeFase2.className = 'map-node node-locked';
        const iconSpan = nodeFase2.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '🔒';
    }
    if (pathLineFase2) pathLineFase2.classList.remove('line-active');
    
    const nodeFase3 = document.getElementById('node-fase3');
    const pathLineFase3 = document.querySelector('.line-fase3');
    if (nodeFase3) {
        nodeFase3.className = 'map-node node-locked';
        const iconSpan = nodeFase3.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '🔒';
    }
    if (pathLineFase3) pathLineFase3.classList.remove('line-active');
    
    const nodeFase4 = document.getElementById('node-fase4');
    const pathLineFase4 = document.querySelector('.line-fase4');
    if (nodeFase4) {
        nodeFase4.className = 'map-node node-locked';
        const iconSpan = nodeFase4.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '🔒';
    }
    if (pathLineFase4) pathLineFase4.classList.remove('line-active');

    const nodeGgopa = document.getElementById('node-ggopa');
    const pathLineFase5 = document.querySelector('.line-fase5');
    if (nodeGgopa) {
        nodeGgopa.className = 'map-node node-locked';
        const iconSpan = nodeGgopa.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '🏗️';
    }
    if (pathLineFase5) pathLineFase5.classList.remove('line-active');

    // Run map initialization to unlock correct nodes/paths
    initJourneyMapState();
    
    if (journeyFase4Completed) {
        journeyPlayerToken.style.left = '90%';
        journeyPlayerToken.style.top = '20%';
    } else if (journeyFase3Completed) {
        journeyPlayerToken.style.left = '55%';
        journeyPlayerToken.style.top = '40%';
    } else if (journeyFase2Completed) {
        journeyPlayerToken.style.left = '40%';
        journeyPlayerToken.style.top = '50%';
    } else if (journeyFase1Completed) {
        journeyPlayerToken.style.left = '25%';
        journeyPlayerToken.style.top = '62%';
    } else {
        // Reset player token position to Start Node and walk to Fase 1
        journeyPlayerToken.style.left = '10%';
        journeyPlayerToken.style.top = '75%';
        
        setTimeout(() => {
            journeyPlayerToken.style.left = '25%';
            journeyPlayerToken.style.top = '62%';
            
            setTimeout(() => {
                nodeFase1.classList.add('node-active');
                pathLineFase1.classList.add('line-active');
                playSound('rank_up_med');
                
                currentBossEncounter = 'kleber';
                setupBossEncounterUI();
                journeyEncounterOverlay.classList.add('active');
            }, 2500);
        }, 800);
    }
}

const bakoChats = {
    patinhos: {
        question: "Bako pq vc fez aquilo com os patinhos?",
        bakoAnswer: "eu gosto de patinhos sabe, só de pensar nas penas deles eu tenho um orgasmo",
        playerReply: "ok..."
    },
    terrorista: {
        question: "bako vc é um terrorista?",
        bakoAnswer: "eu gosto de explodir coisas,o osama era meu brother",
        playerReply: "Misericórdia..."
    },
    peixes: {
        question: "Bako pq vc gosta de mijar em peixes?",
        bakoAnswer: "isso me acalma sabe , mijar neles enqunto se debatem no chão é prazeroso, e meter na boca deles depois  é melhor ainda",
        playerReply: "..."
    }
};

function appendChatMessage(text, isPlayer = false, author = '') {
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${isPlayer ? 'player-msg' : 'bako-msg'}`;
    
    const authorSpan = document.createElement('span');
    authorSpan.className = 'msg-author';
    authorSpan.textContent = author;
    
    const p = document.createElement('p');
    p.textContent = text;
    
    bubble.appendChild(authorSpan);
    bubble.appendChild(p);
    
    chatMessagesContainer.appendChild(bubble);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function renderChatOptions() {
    chatOptionsPanel.innerHTML = '';
    
    if (chatCompleted) {
        const titleSpan = document.createElement('span');
        titleSpan.className = 'options-title';
        titleSpan.textContent = 'Mapeamento Concluído';
        chatOptionsPanel.appendChild(titleSpan);
        return;
    }
    
    const allInitialAsked = askedQuestions.patinhos && askedQuestions.terrorista && askedQuestions.peixes;
    
    if (allInitialAsked) {
        const titleSpan = document.createElement('span');
        titleSpan.className = 'options-title';
        titleSpan.textContent = 'Pergunta Secreta Desbloqueada:';
        chatOptionsPanel.appendChild(titleSpan);
        
        const btn = document.createElement('button');
        btn.className = 'chat-opt-btn';
        btn.style.borderColor = 'rgba(234, 179, 8, 0.5)';
        btn.style.background = 'rgba(234, 179, 8, 0.05)';
        btn.innerHTML = '❓ Bako ta tudo bem ?';
        btn.addEventListener('click', () => {
            triggerSecretConversation();
        });
        chatOptionsPanel.appendChild(btn);
    } else {
        const titleSpan = document.createElement('span');
        titleSpan.className = 'options-title';
        titleSpan.textContent = 'Selecione uma pergunta para enviar:';
        chatOptionsPanel.appendChild(titleSpan);
        
        if (!askedQuestions.patinhos) {
            const btn = document.createElement('button');
            btn.className = 'chat-opt-btn';
            btn.textContent = '🦆 Bako pq vc fez aquilo com os patinhos?';
            btn.addEventListener('click', () => triggerConversation('patinhos'));
            chatOptionsPanel.appendChild(btn);
        }
        if (!askedQuestions.terrorista) {
            const btn = document.createElement('button');
            btn.className = 'chat-opt-btn';
            btn.textContent = '💣 bako vc é um terrorista?';
            btn.addEventListener('click', () => triggerConversation('terrorista'));
            chatOptionsPanel.appendChild(btn);
        }
        if (!askedQuestions.peixes) {
            const btn = document.createElement('button');
            btn.className = 'chat-opt-btn';
            btn.textContent = '🐟 Bako pq vc gosta de mijar em peixes?';
            btn.addEventListener('click', () => triggerConversation('peixes'));
            chatOptionsPanel.appendChild(btn);
        }
    }
}

function triggerConversation(key) {
    const chat = bakoChats[key];
    if (!chat) return;
    
    // Disable options panel during dialogue
    chatOptionsPanel.style.pointerEvents = 'none';
    chatOptionsPanel.style.opacity = '0.4';
    
    // 1. Send Player Question
    appendChatMessage(chat.question, true, 'Você');
    
    // 2. Typing indicator delay
    setTimeout(() => {
        chatTypingIndicator.style.display = 'flex';
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        
        // 3. Send Bako Answer
        setTimeout(() => {
            chatTypingIndicator.style.display = 'none';
            appendChatMessage(chat.bakoAnswer, false, 'Bako');
            playSound('rank_up_low');
            
            // 4. Send Player Reply
            setTimeout(() => {
                appendChatMessage(chat.playerReply, true, 'Você');
                
                // 5. Finalize this question and enable remaining options
                setTimeout(() => {
                    askedQuestions[key] = true;
                    localStorage.setItem('mandamau_asked_questions', JSON.stringify(askedQuestions));
                    
                    chatOptionsPanel.style.pointerEvents = 'all';
                    chatOptionsPanel.style.opacity = '1';
                    renderChatOptions();
                }, 2000);
                
            }, 1200);
            
        }, 1500);
        
    }, 800);
}

function triggerSecretConversation() {
    chatOptionsPanel.style.pointerEvents = 'none';
    chatOptionsPanel.style.opacity = '0.4';
    
    // 1. Player Question: Bako ta tudo bem ?
    appendChatMessage("Bako ta tudo bem ?", true, 'Você');
    
    // 2. Typing indicator -> Bako Answer
    setTimeout(() => {
        chatTypingIndicator.style.display = 'flex';
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        
        setTimeout(() => {
            chatTypingIndicator.style.display = 'none';
            appendChatMessage("na real não , eu fui amaldiçoado pra sempre mentir , mas tem um jeito de me curar , vc precisa apenas pegar o remedio supremo", false, 'Bako');
            playSound('rank_up_low');
            
            // 3. Player: onde consigo isso ?
            setTimeout(() => {
                appendChatMessage("onde consigo isso ?", true, 'Você');
                
                // 4. Typing indicator -> Bako: va ate a cede do GGOPA , depois que passar dos desafios vai conseguir
                setTimeout(() => {
                    chatTypingIndicator.style.display = 'flex';
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                    
                    setTimeout(() => {
                        chatTypingIndicator.style.display = 'none';
                        appendChatMessage("va ate a cede do GGOPA , depois que passar dos desafios vai conseguir", false, 'Bako');
                        playSound('rank_up_low');
                        
                        // 5. Player: ok , vamos tentar
                        setTimeout(() => {
                            appendChatMessage("ok , vamos tentar", true, 'Você');
                            
                            // 6. Complete and Unlock Map Icon (persisted)
                            setTimeout(() => {
                                chatCompleted = true;
                                localStorage.setItem('mandamau_chat_completed', 'true');
                                
                                renderChatOptions();
                                btnJourneyTrigger.classList.add('active');
                            }, 2500);
                            
                        }, 1200);
                        
                    }, 1500);
                    
                }, 800);
                
            }, 1200);
            
        }, 2000);
        
    }, 800);
}

function initPhoneChat() {
    if (chatCompleted) {
        btnJourneyTrigger.classList.add('active');
        chatMessagesContainer.innerHTML = `
            <div class="msg-bubble bako-msg">
                <span class="msg-author">Bako</span>
                <p>Obrigado pela ajuda! Vá até a sede da GGOPA para conseguir o remédio supremo e quebrar a minha maldição!</p>
            </div>
        `;
    } else {
        btnJourneyTrigger.classList.remove('active');
        chatMessagesContainer.innerHTML = `
            <div class="msg-bubble bako-msg">
                <span class="msg-author">Bako</span>
                <p>Diga lá, o que você quer me perguntar? Sem mentiras, hein! 😉</p>
            </div>
        `;
    }
    renderChatOptions();
    initJourneyMapState();
}

// Start Phone system
initPhoneChat();

// Queda de Braço Minigame System
const armWrestlingOverlay = document.getElementById('arm-wrestling-overlay');
const armScoreText = document.getElementById('arm-score-text');
const armWrestlingImg = document.getElementById('arm-wrestling-img');
const armPointer = document.getElementById('arm-pointer');
const btnArmAction = document.getElementById('btn-arm-action');
const btnArmQuit = document.getElementById('btn-arm-quit');
const btnArmTutorial = document.getElementById('btn-arm-tutorial');
const armTutorialModal = document.getElementById('arm-tutorial-modal');
const btnCloseTutorial = document.getElementById('btn-close-tutorial');
const armCurseWarning = document.getElementById('arm-curse-warning');
const armJumpscareOverlay = document.getElementById('arm-jumpscare-overlay');
const armWrestlingCard = document.querySelector('.arm-wrestling-card');
const armTargetZone = document.querySelector('.arm-target-zone');

let armWrestlingState = 0;
let armWrestlingInterval = null;
let isArmGameActive = false;
let kleberPCDMode = false;          // true when player accepted PCD easy mode
let kleberLossStreak = parseInt(localStorage.getItem('kleber_loss_streak') || '0');
let kleberMatchTimer = null;        // 2-minute in-match timer for PCD offer
let isTutorialOpen = false;
let isUpsideDown = false;
let hasJumpscareTriggered = false;
let pointerPercent = 2;
let pointerDirection = 1;
let armAnimationId = null;
let lastTime = 0;

// Dynamic SVG Arms Generator
function getArmSVG(state) {
    const angle = state * 7.5; // range: -75deg (Kleber victory) to +75deg (Player victory)
    
    // Select color based on status
    let playerColor = "#ec4899"; // pink
    let opponentColor = "#ef4444"; // red
    if (state > 5) playerColor = "#10b981"; // green if winning big
    if (state < -5) opponentColor = "#f59e0b"; // orange if opponent winning big
    
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="100%" height="100%">
        <defs>
            <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${playerColor}" />
                <stop offset="100%" stop-color="${opponentColor}" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        <!-- Grid/Arcade background elements -->
        <rect width="300" height="200" fill="#0f172a" />
        <path d="M 0,20 L 300,20 M 0,60 L 300,60 M 0,100 L 300,100 M 0,140 L 300,140" stroke="#1e293b" stroke-width="1" />
        <path d="M 50,0 L 50,200 M 100,0 L 100,200 M 150,0 L 150,200 M 200,0 L 200,200 M 250,0 L 250,200" stroke="#1e293b" stroke-width="1" />
        
        <!-- Table Surface -->
        <line x1="10" y1="170" x2="290" y2="170" stroke="#334155" stroke-width="6" stroke-linecap="round" />
        <line x1="10" y1="170" x2="290" y2="170" stroke="#a855f7" stroke-width="2" opacity="0.6" filter="url(#glow)" />
        
        <!-- Pivot base -->
        <circle cx="150" cy="170" r="10" fill="#1e293b" stroke="#64748b" stroke-width="2" />
        
        <!-- Arms Group -->
        <g transform="rotate(${angle}, 150, 170)">
            <!-- Player Arm (pink neon) -->
            <path d="M 150,170 L 175,80" stroke="${playerColor}" stroke-width="14" stroke-linecap="round" filter="url(#glow)" />
            <path d="M 150,170 L 175,80" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
            
            <!-- Kleber Arm (red neon) -->
            <path d="M 150,170 L 125,80" stroke="${opponentColor}" stroke-width="14" stroke-linecap="round" filter="url(#glow)" />
            <path d="M 150,170 L 125,80" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
            
            <!-- Locked Hands Center -->
            <circle cx="150" cy="80" r="18" fill="#1e293b" stroke="url(#neonGlow)" stroke-width="3" filter="url(#glow)" />
            <text x="150" y="86" font-size="16" text-anchor="middle" dominant-baseline="middle">🤝</text>
        </g>
        
        <!-- Side HUD labels -->
        <text x="250" y="40" fill="#ec4899" font-size="11" font-weight="900" text-anchor="middle" font-family="'Courier New', monospace" filter="url(#glow)">VOCÊ</text>
        <text x="250" y="55" fill="#a855f7" font-size="9" text-anchor="middle" font-family="'Courier New', monospace">PLAYER</text>
        
        <text x="50" y="40" fill="#ef4444" font-size="11" font-weight="900" text-anchor="middle" font-family="'Courier New', monospace" filter="url(#glow)">KLEBER</text>
        <text x="50" y="55" fill="#94a3b8" font-size="9" text-anchor="middle" font-family="'Courier New', monospace">CHEFE</text>
    </svg>
    `;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function randomizeTargetZone() {
    // In PCD mode, target zone is 12% wider
    const baseWidth = kleberPCDMode
        ? Math.random() * 10 + 28   // 28–38% wide
        : Math.random() * 10 + 16;  // 16–26% wide
    const maxLeft = 96 - baseWidth;
    const left = Math.random() * maxLeft + 2;
    armTargetZone.style.left  = `${left}%`;
    armTargetZone.style.width = `${baseWidth}%`;
}

function randomizeButtonPosition() {
    if (armWrestlingState <= 0) {
        btnArmAction.style.position = '';
        btnArmAction.style.left = '';
        btnArmAction.style.top = '';
        btnArmAction.style.width = '';
        return;
    }
    
    btnArmAction.style.position = 'absolute';
    btnArmAction.style.width = '65%';
    
    const randomLeft = Math.floor(Math.random() * 35);
    const randomTop = Math.floor(Math.random() * 30) - 15;
    
    btnArmAction.style.left = `${randomLeft}%`;
    btnArmAction.style.top = `${randomTop}px`;
}

function triggerUpsideDown() {
    isUpsideDown = true;
    armWrestlingCard.classList.add('arm-upside-down');
    armCurseWarning.textContent = "🌀 BAKO CURSE: GRAVIDADE INVERTIDA!";
    playSound('bako_cheat');
    
    setTimeout(() => {
        armWrestlingCard.classList.remove('arm-upside-down');
        isUpsideDown = false;
        if (isArmGameActive) {
            armCurseWarning.textContent = armWrestlingState > 2 ? "⚠️ MALDIÇÃO: TREMOR DETECTADO!" : "";
        }
    }, 3000);
}

function playJumpscareSound() {
    try {
        const ctx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const mainGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        
        osc1.frequency.setValueAtTime(90, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.12);
        osc1.frequency.linearRampToValueAtTime(80, ctx.currentTime + 1.2);
        
        osc2.frequency.setValueAtTime(110, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(4200, ctx.currentTime + 0.18);
        osc2.frequency.linearRampToValueAtTime(40, ctx.currentTime + 1.4);
        
        filter.type = 'peaking';
        filter.Q.value = 20;
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(5500, ctx.currentTime + 0.25);
        
        mainGain.gain.setValueAtTime(0.9, ctx.currentTime);
        mainGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.4);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(mainGain);
        mainGain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        
        osc1.stop(ctx.currentTime + 1.4);
        osc2.stop(ctx.currentTime + 1.4);
    } catch (e) {
        console.error("Audio Context jumpscare failed", e);
    }
}

function triggerJumpscare() {
    hasJumpscareTriggered = true;
    isArmGameActive = false; // Pause game during jumpscare
    
    playJumpscareSound();
    armJumpscareOverlay.classList.add('active');
    document.body.classList.add('arm-shake');
    
    setTimeout(() => {
        armJumpscareOverlay.classList.remove('active');
        document.body.classList.remove('arm-shake');
        
        if (armWrestlingOverlay.classList.contains('active')) {
            isArmGameActive = true;
            // Extremely small target for final blow (calibrated)
            armTargetZone.style.width = '8%';
            armCurseWarning.textContent = "💀 SÓ MAIS UM GOLPE!";
        }
    }, 1500);
}

function getPointerDuration() {
    if (armWrestlingState <= 0) return 1.4;
    if (armWrestlingState >= 1 && armWrestlingState <= 3) return 1.1;
    if (armWrestlingState >= 4 && armWrestlingState <= 6) return 0.8;
    if (armWrestlingState >= 7 && armWrestlingState <= 8) return 0.6;
    if (armWrestlingState === 9) return 0.45;
    return 1.4;
}

function animatePointer(time) {
    if (!isArmGameActive || isTutorialOpen) {
        lastTime = 0;
        armAnimationId = requestAnimationFrame(animatePointer);
        return;
    }
    
    if (!lastTime) lastTime = time;
    let delta = (time - lastTime) / 1000;
    lastTime = time;
    
    if (delta > 0.1) delta = 0.1;
    
    const duration = getPointerDuration();
    const totalDistance = 96; // 2% to 98%
    const speed = totalDistance / duration; // % per second
    
    pointerPercent += pointerDirection * speed * delta;
    
    if (pointerPercent >= 98) {
        pointerPercent = 98;
        pointerDirection = -1;
    } else if (pointerPercent <= 2) {
        pointerPercent = 2;
        pointerDirection = 1;
    }
    
    armPointer.style.left = `${pointerPercent}%`;
    armAnimationId = requestAnimationFrame(animatePointer);
}

function updateArmWrestlingUI() {
    armScoreText.textContent = `Força: ${armWrestlingState > 0 ? '+' : ''}${armWrestlingState}`;
    
    if (armWrestlingState > 5) {
        armScoreText.style.color = '#10b981';
    } else if (armWrestlingState < -5) {
        armScoreText.style.color = '#ef4444';
    } else {
        armScoreText.style.color = '#a855f7';
    }
    
    armWrestlingImg.src = getArmSVG(armWrestlingState);
    
    // Manage dynamic action button position
    if (armWrestlingState > 0) {
        randomizeButtonPosition();
    } else {
        btnArmAction.style.position = '';
        btnArmAction.style.left = '';
        btnArmAction.style.top = '';
        btnArmAction.style.width = '';
    }
    
    // Curse Effects mapping
    if (armWrestlingState > 2) {
        armWrestlingCard.classList.add('arm-shake');
        armCurseWarning.textContent = "⚠️ MALDIÇÃO: TREMOR DETECTADO!";
    } else {
        armWrestlingCard.classList.remove('arm-shake');
        if (armWrestlingState <= 0) {
            armCurseWarning.textContent = "";
        } else {
            armCurseWarning.textContent = "⚠️ MALDIÇÃO EM ESTADO PASSIVO";
        }
    }
    
    if (armWrestlingState >= 5 && !isUpsideDown) {
        triggerUpsideDown();
    }
    
    if (armWrestlingState === 9 && !hasJumpscareTriggered) {
        triggerJumpscare();
    }
}

function startArmWrestlingGame() {
    armWrestlingState = 0;
    isArmGameActive = true;
    isTutorialOpen = false;
    isUpsideDown = false;
    hasJumpscareTriggered = false;
    pointerPercent = 2;
    pointerDirection = 1;
    lastTime = 0;
    playTheme('fase1');
    randomizeTargetZone();
    updateArmWrestlingUI();
    
    if (armWrestlingInterval) clearInterval(armWrestlingInterval);
    if (kleberMatchTimer) clearTimeout(kleberMatchTimer);
    
    // Timer de 2 minutos (120000ms): se o jogador ficar vivo 2min na mesma partida sem passar, a proposta PCD aparece no meio da partida
    if (!kleberPCDMode) {
        kleberMatchTimer = setTimeout(() => {
            if (isArmGameActive && !isTutorialOpen && !kleberPCDMode) {
                showKleberPCDOffer();
            }
        }, 120000);
    }
    
    armWrestlingInterval = setInterval(() => {
        if (isArmGameActive && !isTutorialOpen) {
            armWrestlingState -= 1; // Kleber puxa
            updateArmWrestlingUI();

            if (armWrestlingState <= -10) {
                endArmWrestlingGame(false);
            }
        }
    }, kleberPCDMode ? 2000 : 1000); // PCD mode: Kleber puxa mais devagar
    
    if (armAnimationId) cancelAnimationFrame(armAnimationId);
    armAnimationId = requestAnimationFrame(animatePointer);
}

function cleanupArmWrestlingEffects() {
    isArmGameActive = false;
    clearInterval(armWrestlingInterval);
    if (armAnimationId) {
        cancelAnimationFrame(armAnimationId);
        armAnimationId = null;
    }
    if (kleberMatchTimer) {
        clearTimeout(kleberMatchTimer);
        kleberMatchTimer = null;
    }
    fadeOutTheme();
    armWrestlingCard.classList.remove('arm-shake');
    armWrestlingCard.classList.remove('arm-upside-down');
    document.body.classList.remove('arm-shake');
    armJumpscareOverlay.classList.remove('active');
    armTutorialModal.classList.remove('active');
    isTutorialOpen = false;
    
    btnArmAction.style.position = '';
    btnArmAction.style.left = '';
    btnArmAction.style.top = '';
    btnArmAction.style.width = '';
    
    armCurseWarning.textContent = '';
    isUpsideDown = false;
}

function endArmWrestlingGame(isVictory) {
    cleanupArmWrestlingEffects();
    
    if (isVictory) {
        playSound('rank_up');
        unlockAchievement('kleber_win');
        unlockCosmetic('kleber');
        // Reset loss streak on win
        kleberLossStreak = 0;
        kleberPCDMode = false;
        localStorage.setItem('kleber_loss_streak', '0');
        alert('VITÓRIA! Você derrotou Kleber em uma intensa queda de braço! O caminho da sua jornada avança!');
        
        localStorage.setItem('mandamau_journey_fase1_completed', 'true');
        
        const nodeFase2 = document.getElementById('node-fase2');
        const pathLineFase2 = document.querySelector('.line-fase2');
        if (nodeFase2) {
            nodeFase2.className = 'map-node node-active';
            nodeFase2.title = 'Fase 2 - Disponível';
            const iconSpan = nodeFase2.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚔️';
        }
        if (pathLineFase2) {
            pathLineFase2.classList.add('line-active');
        }
        
        armWrestlingOverlay.classList.remove('active');
        
        // AUTO-WALK from Fase 1 node (25%, 62%) to Fase 2 node (40%, 50%)
        setTimeout(() => {
            journeyPlayerToken.style.left = '40%';
            journeyPlayerToken.style.top = '50%';
            
            setTimeout(() => {
                playSound('rank_up_med');
                currentBossEncounter = 'gwen';
                setupBossEncounterUI();
                journeyEncounterOverlay.classList.add('active');
            }, 1500); // 1.5s walking animation
        }, 800);
        
    } else {
        // ---- DERROTA ----
        kleberLossStreak++;
        localStorage.setItem('kleber_loss_streak', kleberLossStreak);

        if (kleberLossStreak >= 15 && !kleberPCDMode) {
            // Mostra proposta PCD (após 15 derrotas seguidas)
            showKleberPCDOffer();
        } else {
            playSound('reset');
            startArmWrestlingGame();
        }
    }
}

// ---- PCD Offer Modal ----
function showKleberPCDOffer() {
    isArmGameActive = false;
    if (armWrestlingInterval) clearInterval(armWrestlingInterval);
    if (armAnimationId) {
        cancelAnimationFrame(armAnimationId);
        armAnimationId = null;
    }
    if (kleberMatchTimer) {
        clearTimeout(kleberMatchTimer);
        kleberMatchTimer = null;
    }
    const modal = document.getElementById('kleber-pcd-modal');
    if (modal) modal.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const btnAcceptPCD = document.getElementById('btn-kleber-pcd-accept');
    const btnDeclinePCD = document.getElementById('btn-kleber-pcd-decline');
    const pcdModal = document.getElementById('kleber-pcd-modal');

    if (btnAcceptPCD) {
        btnAcceptPCD.addEventListener('click', () => {
            kleberPCDMode = true;
            kleberLossStreak = 0;
            localStorage.setItem('kleber_loss_streak', '0');
            pcdModal.classList.remove('active');
            playSound('rank_up_med');
            startArmWrestlingGame();
        });
    }
    if (btnDeclinePCD) {
        btnDeclinePCD.addEventListener('click', () => {
            kleberLossStreak = 0;
            localStorage.setItem('kleber_loss_streak', '0');
            pcdModal.classList.remove('active');
            unlockAchievement('kleber_no_pcd');
            playSound('click');
            startArmWrestlingGame();
        });
    }
});

// Event Listeners for Arm Wrestling minigame
btnArmAction.addEventListener('click', () => {
    if (!isArmGameActive || isTutorialOpen) return;
    
    const targetLeft = parseFloat(armTargetZone.style.left) || 40;
    const targetWidth = parseFloat(armTargetZone.style.width) || 20;
    const targetRight = targetLeft + targetWidth;
    
    // Calculate the speed and the path range covered during typical mouse click latency (75ms)
    const duration = getPointerDuration();
    const speed = 96 / duration; // % per second
    const lagSeconds = 0.075; // 75ms input lag compensation
    
    const minPath = Math.min(pointerPercent, pointerPercent - pointerDirection * speed * lagSeconds);
    const maxPath = Math.max(pointerPercent, pointerPercent - pointerDirection * speed * lagSeconds);
    
    // Check if the green zone overlaps with the pointer's lag window path
    const isHit = (minPath <= targetRight && maxPath >= targetLeft);
    
    if (isHit) {
        armWrestlingState += 2;
        playSound('click');
        
        // Randomize target zone ONLY on hits!
        randomizeTargetZone();
        
        btnArmAction.style.transform = 'scale(0.95)';
        setTimeout(() => btnArmAction.style.transform = '', 100);
    } else {
        armWrestlingState -= 1;
        playSound('bako_cheat');
    }
    
    updateArmWrestlingUI();
    
    if (armWrestlingState >= 10) {
        endArmWrestlingGame(true);
    } else if (armWrestlingState <= -10) {
        endArmWrestlingGame(false);
    }
});

btnArmQuit.addEventListener('click', () => {
    cleanupArmWrestlingEffects();
    armWrestlingOverlay.classList.remove('active');
    playSound('click');
});

btnArmTutorial.addEventListener('click', () => {
    isTutorialOpen = true;
    armTutorialModal.classList.add('active');
    playSound('click');
});

btnCloseTutorial.addEventListener('click', () => {
    isTutorialOpen = false;
    armTutorialModal.classList.remove('active');
    playSound('click');
    if (!isArmGameActive) {
        startArmWrestlingGame();
    }
});

function initJourneyMapState() {
    const journeyFase1Completed = localStorage.getItem('mandamau_journey_fase1_completed') === 'true';
    if (journeyFase1Completed) {
        const nodeFase2 = document.getElementById('node-fase2');
        const pathLineFase2 = document.querySelector('.line-fase2');
        if (nodeFase2) {
            nodeFase2.className = 'map-node node-active';
            nodeFase2.title = 'Fase 2 - Disponível';
            const iconSpan = nodeFase2.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚔️';
        }
        if (pathLineFase2) {
            pathLineFase2.classList.add('line-active');
        }
    }
    
    const journeyFase2Completed = localStorage.getItem('mandamau_journey_fase2_completed') === 'true';
    if (journeyFase2Completed) {
        const nodeFase3 = document.getElementById('node-fase3');
        const pathLineFase3 = document.querySelector('.line-fase3');
        if (nodeFase3) {
            nodeFase3.className = 'map-node node-active';
            nodeFase3.title = 'Fase 3 - Disponível';
            const iconSpan = nodeFase3.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚔️';
        }
        if (pathLineFase3) {
            pathLineFase3.classList.add('line-active');
        }
    }
    
    const journeyFase3Completed = localStorage.getItem('mandamau_journey_fase3_completed') === 'true';
    if (journeyFase3Completed) {
        const nodeFase4 = document.getElementById('node-fase4');
        const pathLineFase4 = document.querySelector('.line-fase4');
        if (nodeFase4) {
            nodeFase4.className = 'map-node node-active';
            nodeFase4.title = 'Fase 4 - Disponível';
            const iconSpan = nodeFase4.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚔️';
        }
        if (pathLineFase4) {
            pathLineFase4.classList.add('line-active');
        }
    }

    const journeyFase4Completed = localStorage.getItem('mandamau_journey_fase4_completed') === 'true';
    if (journeyFase4Completed) {
        const nodeGgopa = document.getElementById('node-ggopa');
        const pathLineFase5 = document.querySelector('.line-fase5');
        if (nodeGgopa) {
            nodeGgopa.className = 'map-node node-active';
            nodeGgopa.title = 'Fase 5 - Sede do GGOPA';
            const iconSpan = nodeGgopa.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '🏗️';
        }
        if (pathLineFase5) {
            pathLineFase5.classList.add('line-active');
        }
    }

    const journeyFase5Completed = localStorage.getItem('mandamau_journey_fase5_completed') === 'true';
    if (journeyFase5Completed) {
        const nodeFase6 = document.getElementById('node-fase6');
        const lineFase6 = document.querySelector('.line-fase6');
        if (nodeFase6) {
            nodeFase6.className = 'map-node node-active';
            nodeFase6.title = 'Fase 6 - Volibear';
            const iconSpan = nodeFase6.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚡';
        }
        if (lineFase6) lineFase6.classList.add('line-active');
    }

    const journeyFase6Completed = localStorage.getItem('mandamau_journey_fase6_completed') === 'true';
    const nodeFase7 = document.getElementById('node-fase7');
    const lineFase7 = document.querySelector('.line-fase7');
    if (journeyFase6Completed) {
        if (nodeFase7) {
            nodeFase7.className = 'map-node node-active';
            nodeFase7.title = 'Fase 7 - Warwick';
            const iconSpan = nodeFase7.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '🐺';
        }
        if (lineFase7) lineFase7.classList.add('line-active');
    } else {
        if (nodeFase7) {
            nodeFase7.className = 'map-node node-locked';
            nodeFase7.title = 'Fase 7 - Bloqueada (Derrote Volibear primeiro)';
            const iconSpan = nodeFase7.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '🔒';
        }
        if (lineFase7) lineFase7.classList.remove('line-active');
    }

    const journeyFase7Completed = localStorage.getItem('mandamau_journey_fase7_completed') === 'true';
    if (journeyFase7Completed) {
        const nodeFase8 = document.getElementById('node-fase8');
        const lineFase8 = document.querySelector('.line-fase8');
        if (nodeFase8) {
            nodeFase8.className = 'map-node node-active';
            nodeFase8.title = 'Fase 8 - Disponível';
            const iconSpan = nodeFase8.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '🗣️';
        }
        if (lineFase8) lineFase8.classList.add('line-active');
    }
}

// Add the click listener for Fase 1 Node
document.getElementById('node-fase1').addEventListener('click', () => {
    playSound('click');
    
    // Walk to Fase 1 node (25%, 62%)
    journeyPlayerToken.style.left = '25%';
    journeyPlayerToken.style.top = '62%';
    
    setTimeout(() => {
        playSound('rank_up_med');
        currentBossEncounter = 'kleber';
        setupBossEncounterUI();
        journeyEncounterOverlay.classList.add('active');
    }, 1500);
});

// Add the click listener for Fase 2 Node
document.getElementById('node-fase2').addEventListener('click', () => {
    const journeyFase1Completed = localStorage.getItem('mandamau_journey_fase1_completed') === 'true';
    if (journeyFase1Completed) {
        playSound('click');
        
        // Walk from Fase 1 node (25%, 62%) to Fase 2 node (40%, 50%)
        journeyPlayerToken.style.left = '40%';
        journeyPlayerToken.style.top = '50%';
        
        setTimeout(() => {
            const nodeFase2Element = document.getElementById('node-fase2');
            const pathLineFase2Element = document.querySelector('.line-fase2');
            if (nodeFase2Element) nodeFase2Element.classList.add('node-active');
            if (pathLineFase2Element) pathLineFase2Element.classList.add('line-active');
            
            playSound('rank_up_med');
            currentBossEncounter = 'gwen';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1500);
    }
});

// Gwen Quiz System (Fase 2)
const gwenQuizOverlay = document.getElementById('gwen-quiz-overlay');
const gwenQuizCard = document.getElementById('gwen-quiz-card');
const btnGwenQuit = document.getElementById('btn-gwen-quit');
const gwenSpeech = document.getElementById('gwen-speech');
const gwenTimerBar = document.getElementById('gwen-timer-bar');
const gwenTimerText = document.getElementById('gwen-timer-text');
const gwenEquationDisplay = document.getElementById('gwen-equation-display');
const gwenAnswerButtons = document.querySelectorAll('.gwen-answer-btn');
const gwenProgressText = document.getElementById('gwen-progress-text');
const gwenProgressBar = document.getElementById('gwen-progress-bar');
const gwenLivesHearts = document.getElementById('gwen-lives-hearts');

const gwenWinOverlay = document.getElementById('gwen-win-overlay');
const gwenLoseOverlay = document.getElementById('gwen-lose-overlay');
const btnGwenWinOk = document.getElementById('btn-gwen-win-ok');
const btnGwenRestart = document.getElementById('btn-gwen-restart');
const gwenWinSpeech = document.getElementById('gwen-win-speech');

const gwenTutorialModal = document.getElementById('gwen-tutorial-modal');
const btnCloseGwenTutorial = document.getElementById('btn-close-gwen-tutorial');

let gwenScore = 0;
let gwenLives = 3;
let gwenTimer = null;
let gwenTimeLeft = 15;
let gwenActive = false;
let currentCorrectAnswer = 0;
let isPrankQuestion = false;

const gwenPhrasesNormal = [
    "Resolve essa se for capaz! 🧠",
    "Mais uma! Quero ver se você aguenta o ritmo! ⚡",
    "Hum... essa é um pouco mais chata, hein?",
    "Não vale usar calculadora! 📱❌",
    "Aposto que você vai vacilar nessa."
];

const gwenPhrasesCorrect = [
    "Humph... você deu sorte! 😤",
    "Acertou? Tá bom, mas a próxima vai te derrubar!",
    "Ok, talvez você não seja tão burro assim.",
    "Ah! Essa era muito fácil mesmo.",
    "Blergh... continue assim e eu vou ter que me esforçar."
];

const gwenPhrasesIncorrect = [
    "Hahaha! Errado! Tente de novo, novato! 😜",
    "Poxa, sério? Essa era nível pré-escola! 👶",
    "Errou feio, errou rude! 😂",
    "Ih, travou? Que vergonha! 🤭",
    "Erradíssimo! Minha avó resolveria essa mais rápido!"
];

function openGwenQuiz() {
    gwenQuizOverlay.classList.add('active');
    gwenWinOverlay.style.display = 'none';
    gwenLoseOverlay.style.display = 'none';
    gwenTutorialModal.classList.add('active'); // force tutorial modal first!
    isGwenTutorialOpen = true;
    gwenScore = 0;
    gwenLives = 3;
    isPrankQuestion = false;
    gwenActive = false; // paused
    updateGwenUI();
}

function updateGwenUI() {
    gwenProgressText.textContent = `Perguntas respondidas: ${gwenScore}/5`;
    gwenProgressBar.style.width = `${gwenScore * 20}%`;
    
    let hearts = "";
    for (let i = 0; i < 3; i++) {
        hearts += i < gwenLives ? "❤️" : "🖤";
    }
    gwenLivesHearts.textContent = hearts;
}

function generateGwenQuestion() {
    if (!gwenActive) return;
    
    gwenAnswerButtons.forEach(btn => {
        btn.className = 'gwen-answer-btn';
        btn.disabled = false;
    });
    
    if (gwenScore === 4) {
        const xList = [10, 20, 25, 30, 40, 50, 75];
        const yList = [20, 40, 50, 80, 100, 120, 150, 200];
        const x = xList[Math.floor(Math.random() * xList.length)];
        const y = yList[Math.floor(Math.random() * yList.length)];
        
        currentCorrectAnswer = (x * y) / 100;
        gwenEquationDisplay.textContent = `${x}% de ${y} = ?`;
        gwenSpeech.textContent = "Olha só: a quinta pergunta é de porcentagem! Vai encarar? 😈";
        
        setupGwenChoices(currentCorrectAnswer, false);
        startGwenTimer();
    } else {
        const opType = Math.floor(Math.random() * 4); // 0 = addition, 1 = subtraction, 2 = multiplication, 3 = division
        let equationText = "";
        
        if (opType === 0) {
            const a = Math.floor(Math.random() * 46) + 5;
            const b = Math.floor(Math.random() * 46) + 5;
            currentCorrectAnswer = a + b;
            equationText = `${a} + ${b} = ?`;
        } else if (opType === 1) {
            const a = Math.floor(Math.random() * 46) + 15;
            const b = Math.floor(Math.random() * (a - 5)) + 5;
            currentCorrectAnswer = a - b;
            equationText = `${a} - ${b} = ?`;
        } else if (opType === 2) {
            const a = Math.floor(Math.random() * 9) + 2;
            const b = Math.floor(Math.random() * 11) + 2;
            currentCorrectAnswer = a * b;
            equationText = `${a} × ${b} = ?`;
        } else {
            const b = Math.floor(Math.random() * 9) + 2;
            const ans = Math.floor(Math.random() * 9) + 2;
            const a = b * ans;
            currentCorrectAnswer = ans;
            equationText = `${a} ÷ ${b} = ?`;
        }
        
        gwenEquationDisplay.textContent = equationText;
        gwenSpeech.textContent = gwenPhrasesNormal[Math.floor(Math.random() * gwenPhrasesNormal.length)];
        
        setupGwenChoices(currentCorrectAnswer, false);
        startGwenTimer();
    }
}

function setupGwenChoices(correctVal, isPrank) {
    let choices = [correctVal];
    
    if (isPrank) {
        choices = [0.9, 1.2, 0.5, 1.5];
    } else {
        while (choices.length < 4) {
            let offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
            let wrongVal = correctVal + offset;
            
            if (wrongVal >= 0 && !choices.includes(wrongVal)) {
                choices.push(wrongVal);
            }
        }
        choices.sort(() => Math.random() - 0.5);
    }
    
    gwenAnswerButtons.forEach((btn, idx) => {
        btn.textContent = choices[idx];
        btn.dataset.correct = (choices[idx] === correctVal).toString();
    });
}

function startGwenTimer() {
    if (gwenTimer) clearInterval(gwenTimer);
    
    const totalDuration = 15;
    let timeElapsed = 0;
    
    gwenTimerText.textContent = "15s";
    gwenTimerBar.style.width = "100%";
    
    gwenTimer = setInterval(() => {
        if (!gwenActive || isTutorialOpen || isGwenTutorialOpen) return;
        
        timeElapsed += 0.1;
        gwenTimeLeft = totalDuration - timeElapsed;
        
        if (gwenTimeLeft <= 0) {
            gwenTimeLeft = 0;
            clearInterval(gwenTimer);
            gwenTimerBar.style.width = "0%";
            gwenTimerText.textContent = "0s";
            handleGwenTimeout();
        } else {
            gwenTimerBar.style.width = `${(gwenTimeLeft / totalDuration) * 100}%`;
            gwenTimerText.textContent = `${Math.ceil(gwenTimeLeft)}s`;
        }
    }, 100);
}

function handleGwenTimeout() {
    playSound('bako_cheat');
    gwenSpeech.textContent = "Tempo esgotado! Dormiu no ponto? 😴";
    
    gwenScore = Math.max(0, gwenScore - 1);
    gwenLives--;
    updateGwenUI();
    
    gwenQuizCard.classList.add('gwen-shake');
    setTimeout(() => gwenQuizCard.classList.remove('gwen-shake'), 500);
    
    if (gwenLives <= 0) {
        showGwenGameOver();
    } else {
        setTimeout(generateGwenQuestion, 1500);
    }
}

gwenAnswerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!gwenActive) return;
        
        clearInterval(gwenTimer);
        gwenAnswerButtons.forEach(b => b.disabled = true);
        
        const isCorrect = btn.dataset.correct === "true";
        
        if (isPrankQuestion) {
            if (isCorrect) {
                gwenWinSpeech.textContent = "Caraca, você é um NERD mesmo! Como você acertou isso de cabeça?! Enfim, você passou, pegue o seu acesso.";
            } else {
                gwenWinSpeech.textContent = "Hahaha, era zoeira! Como se alguém soubesse isso de cabeça! Você passou, toma aqui o acesso à próxima fase.";
            }
            showGwenVictory();
        } else {
            if (isCorrect) {
                btn.classList.add('correct');
                playSound('rank_up_med');
                if (gwenScore === 4) {
                    unlockAchievement('gwen_bonus');
                }
                gwenScore++;
                gwenSpeech.textContent = gwenPhrasesCorrect[Math.floor(Math.random() * gwenPhrasesCorrect.length)];
            } else {
                btn.classList.add('incorrect');
                gwenAnswerButtons.forEach(b => {
                    if (b.dataset.correct === "true") b.classList.add('correct');
                });
                
                playSound('bako_cheat');
                gwenScore = Math.max(0, gwenScore - 1);
                gwenLives--;
                gwenSpeech.textContent = gwenPhrasesIncorrect[Math.floor(Math.random() * gwenPhrasesIncorrect.length)];
                
                gwenQuizCard.classList.add('gwen-shake');
                setTimeout(() => gwenQuizCard.classList.remove('gwen-shake'), 500);
            }
            
            updateGwenUI();
            
            if (gwenLives <= 0) {
                setTimeout(showGwenGameOver, 1200);
            } else if (gwenScore === 5) {
                setTimeout(launchLinearRegressionPrank, 1200);
            } else {
                setTimeout(generateGwenQuestion, 1200);
            }
        }
    });
});

function launchLinearRegressionPrank() {
    isPrankQuestion = true;
    
    gwenAnswerButtons.forEach(btn => {
        btn.className = 'gwen-answer-btn';
        btn.disabled = false;
    });
    
    gwenEquationDisplay.textContent = "y = a + bx";
    gwenEquationDisplay.style.fontSize = "2.2rem";
    gwenSpeech.textContent = "Calcule o coeficiente angular b1 da reta de regressão linear para os pontos: (1,2), (2,3), (3,5), (4,4), (5,6) 😈";
    
    gwenTimerBar.style.width = "0%";
    gwenTimerText.textContent = "Sem tempo limite";
    
    setupGwenChoices(0.9, true);
}

function showGwenVictory() {
    unlockAchievement('gwen_win');
    unlockCosmetic('gwen');
    gwenWinOverlay.style.display = 'flex';
}

function showGwenGameOver() {
    gwenLoseOverlay.style.display = 'flex';
}

function closeGwenQuiz() {
    gwenActive = false;
    clearInterval(gwenTimer);
    fadeOutTheme();
    gwenQuizOverlay.classList.remove('active');
    gwenTutorialModal.classList.remove('active');
    isGwenTutorialOpen = false;
    gwenQuizCard.classList.remove('gwen-shake');
}

btnGwenQuit.addEventListener('click', () => {
    closeGwenQuiz();
    playSound('click');
});

btnGwenWinOk.addEventListener('click', () => {
    closeGwenQuiz();
    playSound('rank_up');
    
    localStorage.setItem('mandamau_journey_fase2_completed', 'true');
    
    const nodeFase3 = document.getElementById('node-fase3');
    const pathLineFase3 = document.querySelector('.line-fase3');
    if (nodeFase3) {
        nodeFase3.className = 'map-node node-active';
        nodeFase3.title = 'Fase 3 - Disponível';
        const iconSpan = nodeFase3.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '⚔️';
    }
    if (pathLineFase3) {
        pathLineFase3.classList.add('line-active');
    }
    
    // AUTO-WALK from Fase 2 node (40%, 50%) to Fase 3 node (55%, 40%)
    setTimeout(() => {
        journeyPlayerToken.style.left = '55%';
        journeyPlayerToken.style.top = '40%';
        
        setTimeout(() => {
            playSound('rank_up_med');
            currentBossEncounter = 'sam';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1500); // 1.5s walking animation
    }, 800);
});

// Add the click listener for Fase 3 Node
document.getElementById('node-fase3').addEventListener('click', () => {
    const journeyFase2Completed = localStorage.getItem('mandamau_journey_fase2_completed') === 'true';
    if (journeyFase2Completed) {
        playSound('click');
        
        // Walk from Fase 2 node (40%, 50%) to Fase 3 node (55%, 40%)
        journeyPlayerToken.style.left = '55%';
        journeyPlayerToken.style.top = '40%';
        
        setTimeout(() => {
            const nodeFase3Element = document.getElementById('node-fase3');
            const pathLineFase3Element = document.querySelector('.line-fase3');
            if (nodeFase3Element) nodeFase3Element.classList.add('node-active');
            if (pathLineFase3Element) pathLineFase3Element.classList.add('line-active');
            
            playSound('rank_up_med');
            currentBossEncounter = 'sam';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1500);
    }
});

btnGwenRestart.addEventListener('click', () => {
    playSound('click');
    gwenQuizOverlay.classList.add('active');
    gwenWinOverlay.style.display = 'none';
    gwenLoseOverlay.style.display = 'none';
    isGwenTutorialOpen = false;
    gwenScore = 0;
    gwenLives = 3;
    isPrankQuestion = false;
    gwenActive = true;
    updateGwenUI();
    generateGwenQuestion();
});

btnCloseGwenTutorial.addEventListener('click', () => {
    isGwenTutorialOpen = false;
    gwenTutorialModal.classList.remove('active');
    playSound('click');
    playTheme('fase2');
    gwenActive = true;
    startGwenTimer();
    generateGwenQuestion();
});

// Sam Food Smash System (Fase 3)
const samSmashOverlay = document.getElementById('sam-smash-overlay');
const samSmashCard = document.getElementById('sam-smash-card');
const btnSamQuit = document.getElementById('btn-sam-quit');
const samSpeech = document.getElementById('sam-speech');
const samTugBar = document.getElementById('sam-tug-bar');
const samFoodDivider = document.getElementById('sam-food-divider');
const samKeyA = document.getElementById('sam-key-a');
const samKeyD = document.getElementById('sam-key-d');
const samTimerText = document.getElementById('sam-timer-text');
const samWinOverlay = document.getElementById('sam-win-overlay');
const samLoseOverlay = document.getElementById('sam-lose-overlay');
const btnSamWinOk = document.getElementById('btn-sam-win-ok');
const btnSamRestart = document.getElementById('btn-sam-restart');
const samTutorialModal = document.getElementById('sam-tutorial-modal');
const btnCloseSamTutorial = document.getElementById('btn-close-sam-tutorial');

// ---- Sam Best-of-3 State ----
let samTugProgress = 50;
let samTimeLeft = 15;
let samGameActive = false;
let samTimerInterval = null;
let samAiInterval = null;
let samKeySwapInterval = null;
let lastPressedKey = '';

// Round tracking
let samPlayerRounds = 0;  // rounds won by player
let samBossRounds = 0;    // rounds won by Sam
let samCurrentRound = 0;  // 1, 2 or 3

// Key-pair system: each pair is [leftKey, rightKey]
const samKeyPairs = [
    ['A', 'D'],
    ['W', 'S'],
    ['Q', 'E'],
    ['J', 'K'],
    ['Z', 'X']
];
let samActiveKeyPair = ['A', 'D']; // currently active pair

const samPhrases = [
    "Eu esmago mais rápido que você! 🍔",
    "Nhac nhac nhac! Mais comida! 🍕",
    "Você já era, magrelo! 🌭",
    "Vou te esmagar! 🍰",
    "Sinta o poder do Gordão do Esmaga! 🍟",
    "Está comendo poeira! 🍩"
];

function updateSamRoundsUI() {
    const dots = [1, 2, 3].map(i => document.getElementById(`sam-round-dot-${i}`));
    const roundScore = document.getElementById('sam-round-score');
    
    // Reset all dots
    dots.forEach(d => { if (d) { d.className = 'sam-round-dot'; } });
    
    // Fill player wins (purple)
    let dotIdx = 0;
    for (let i = 0; i < samPlayerRounds; i++) {
        if (dots[dotIdx]) dots[dotIdx].classList.add('player-win');
        dotIdx++;
    }
    // Fill Sam wins (red) – continuing from where player wins left off
    for (let i = 0; i < samBossRounds; i++) {
        if (dots[dotIdx]) dots[dotIdx].classList.add('sam-win');
        dotIdx++;
    }
    
    if (roundScore) roundScore.textContent = `Você ${samPlayerRounds} × ${samBossRounds} Sam`;
    
    // Update key indicators to show active pair
    samKeyA.textContent = samActiveKeyPair[0];
    samKeyD.textContent = samActiveKeyPair[1];
}

function pickNewKeyPair() {
    // Choose a random pair different from the current one
    const others = samKeyPairs.filter(p => p[0] !== samActiveKeyPair[0]);
    samActiveKeyPair = others[Math.floor(Math.random() * others.length)];
    lastPressedKey = ''; // reset so they must press the new keys
    
    const notice = document.getElementById('sam-key-swap-notice');
    if (notice) {
        notice.textContent = `⚠️ TECLAS TROCARAM! Use: ${samActiveKeyPair[0]} e ${samActiveKeyPair[1]}`;
        notice.style.display = 'block';
        setTimeout(() => { notice.style.display = 'none'; }, 2500);
    }
    
    // Highlight indicators
    samKeyA.classList.add('success');
    samKeyD.classList.add('success');
    setTimeout(() => {
        samKeyA.classList.remove('success');
        samKeyD.classList.remove('success');
    }, 600);
    
    updateSamRoundsUI();
}

function updateSamTugUI() {
    samTugBar.style.width = `${samTugProgress}%`;
    samFoodDivider.style.left = `${samTugProgress}%`;
}

function updateSamSpeech() {
    if (samTugProgress < 30) {
        samSpeech.textContent = "Hahaha! Você não aguenta o tranco! 😈";
    } else if (samTugProgress > 70) {
        samSpeech.textContent = "Ei! Deixe um pouco pra mim! 😢";
    } else {
        samSpeech.textContent = samPhrases[Math.floor(Math.random() * samPhrases.length)];
    }
}

function startSamRound(round) {
    samCurrentRound = round;
    samTugProgress = 50;
    samTimeLeft = 15;
    samGameActive = true;
    isSamTutorialOpen = false;
    lastPressedKey = '';
    
    // Reset key pair to A/D at start of each round
    samActiveKeyPair = ['A', 'D'];
    samKeyA.textContent = 'A';
    samKeyD.textContent = 'D';
    
    samKeyA.className = 'sam-key-box active';
    samKeyD.className = 'sam-key-box';
    samTimerText.textContent = '15s';
    samWinOverlay.style.display = 'none';
    samLoseOverlay.style.display = 'none';
    
    // Hide key swap notice
    const notice = document.getElementById('sam-key-swap-notice');
    if (notice) notice.style.display = 'none';
    
    updateSamTugUI();
    updateSamRoundsUI();
    updateSamSpeech();
    
    if (samTimerInterval) clearInterval(samTimerInterval);
    if (samAiInterval) clearInterval(samAiInterval);
    if (samKeySwapInterval) clearInterval(samKeySwapInterval);
    
    // Difficulty stays at 1.5% drain for all rounds (key swaps add the challenge)
    const drainRates = [1.5, 1.5, 1.5];
    const drain = drainRates[Math.min(round - 1, 2)];
    
    // Key-swap randomisation: round 2+ gets key swaps every 4-7s
    if (round >= 2) {
        const scheduleKeySwap = () => {
            if (!samGameActive) return;
            const delay = 4000 + Math.random() * 3000; // 4–7 seconds
            samKeySwapInterval = setTimeout(() => {
                if (samGameActive) {
                    pickNewKeyPair();
                    scheduleKeySwap(); // reschedule next swap
                }
            }, delay);
        };
        scheduleKeySwap();
    }
    
    // AI drain loop
    samAiInterval = setInterval(() => {
        if (!samGameActive || isSamTutorialOpen) return;
        
        samTugProgress = Math.max(0, samTugProgress - drain);
        updateSamTugUI();
        
        if (samTugProgress <= 0) {
            endSamRound(false);
        }
    }, 100);
    
    // Timer loop (every 1s)
    samTimerInterval = setInterval(() => {
        if (!samGameActive || isSamTutorialOpen) return;
        
        samTimeLeft--;
        samTimerText.textContent = `${samTimeLeft}s`;
        
        if (samTimeLeft % 3 === 0) {
            updateSamSpeech();
        }
        
        if (samTimeLeft <= 0) {
            if (samTugProgress > 50) {
                endSamRound(true);
            } else {
                endSamRound(false);
            }
        }
    }, 1000);
}

// Legacy alias so existing calls still work
function startSamGame() {
    samPlayerRounds = 0;
    samBossRounds = 0;
    samCurrentRound = 0;
    updateSamRoundsUI();
    startSamRound(1);
}

function endSamRound(playerWon) {
    samGameActive = false;
    clearInterval(samTimerInterval);
    clearInterval(samAiInterval);
    if (samKeySwapInterval) { clearTimeout(samKeySwapInterval); samKeySwapInterval = null; }
    
    const notice = document.getElementById('sam-key-swap-notice');
    if (notice) notice.style.display = 'none';
    
    if (playerWon) {
        samPlayerRounds++;
        playSound('rank_up_med');
        samSpeech.textContent = "Não… como?! Você é bom nisso! 😡";
    } else {
        samBossRounds++;
        playSound('bako_cheat');
        samSpeech.textContent = "Hahahaha! Eu sou IMBATÍVEL! 😈";
    }
    
    updateSamRoundsUI();
    
    const nextRound = samCurrentRound + 1;
    
    // Check if anyone has 2 wins (clinched best-of-3)
    if (samPlayerRounds >= 2) {
        // Player won the match
        unlockAchievement('sam_win');
        unlockCosmetic('sam');
        if (samBossRounds === 0) {
            unlockAchievement('sam_flawless');
        }
        const winDesc = document.getElementById('sam-win-desc');
        if (winDesc) winDesc.textContent = `Você venceu ${samPlayerRounds}×${samBossRounds}! Sam está empanturrado e não aguenta mais!`;
        setTimeout(() => {
            playSound('rank_up');
            samWinOverlay.style.display = 'flex';
        }, 1200);
    } else if (samBossRounds >= 2) {
        // Sam won the match
        setTimeout(() => {
            playSound('reset');
            samLoseOverlay.style.display = 'flex';
        }, 1200);
    } else {
        // Next round
        const roundMsg = playerWon ? `Rodada ${samCurrentRound} sua! Próxima rodada fica mais difícil… 🔥` : `Rodada ${samCurrentRound} do Sam! Se prepare… 🔥`;
        samSpeech.textContent = roundMsg;
        setTimeout(() => {
            startSamRound(nextRound);
        }, 2000);
    }
}

// Keep endSamGame for any direct calls (maps to endSamRound)
function endSamGame(isVictory) {
    endSamRound(isVictory);
}

function triggerSamScreenShake() {
    samSmashCard.classList.add('sam-card-shake');
    setTimeout(() => {
        samSmashCard.classList.remove('sam-card-shake');
    }, 150);
}

function closeSamGame() {
    samGameActive = false;
    clearInterval(samTimerInterval);
    clearInterval(samAiInterval);
    if (samKeySwapInterval) { clearTimeout(samKeySwapInterval); samKeySwapInterval = null; }
    const notice = document.getElementById('sam-key-swap-notice');
    if (notice) notice.style.display = 'none';
    fadeOutTheme();
    samSmashOverlay.classList.remove('active');
    samTutorialModal.classList.remove('active');
    isSamTutorialOpen = false;
    samSmashCard.classList.remove('sam-card-shake');
}

btnSamQuit.addEventListener('click', () => {
    closeSamGame();
    playSound('click');
});

btnSamRestart.addEventListener('click', () => {
    playSound('click');
    samWinOverlay.style.display = 'none';
    samLoseOverlay.style.display = 'none';
    // Full reset for best-of-3
    samPlayerRounds = 0;
    samBossRounds = 0;
    samCurrentRound = 0;
    updateSamRoundsUI();
    startSamRound(1);
});

btnSamWinOk.addEventListener('click', () => {
    closeSamGame();
    playSound('rank_up');
    
    localStorage.setItem('mandamau_journey_fase3_completed', 'true');
    
    const nodeFase4 = document.getElementById('node-fase4');
    const pathLineFase4 = document.querySelector('.line-fase4');
    if (nodeFase4) {
        nodeFase4.className = 'map-node node-active';
        nodeFase4.title = 'Fase 4 - Disponível';
        const iconSpan = nodeFase4.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '⚔️';
    }
    if (pathLineFase4) {
        pathLineFase4.classList.add('line-active');
    }
    
    // AUTO-WALK from Fase 3 node (55%, 40%) to Fase 4 node (72%, 30%)
    setTimeout(() => {
        journeyPlayerToken.style.left = '72%';
        journeyPlayerToken.style.top = '30%';
        
        setTimeout(() => {
            playSound('rank_up_med');
            currentBossEncounter = 'claudio';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1500);
    }, 800);
});

btnCloseSamTutorial.addEventListener('click', () => {
    isSamTutorialOpen = false;
    samTutorialModal.classList.remove('active');
    playSound('click');
    playTheme('fase3');
    // Initialize fresh best-of-3 match from round 1
    samPlayerRounds = 0;
    samBossRounds = 0;
    samCurrentRound = 0;
    updateSamRoundsUI();
    startSamRound(1);
});

// Click listener for Fase 4 Node — Cláudio Genius
document.getElementById('node-fase4').addEventListener('click', () => {
    const journeyFase3Completed = localStorage.getItem('mandamau_journey_fase3_completed') === 'true';
    if (journeyFase3Completed) {
        playSound('click');
        journeyPlayerToken.style.left = '72%';
        journeyPlayerToken.style.top = '30%';
        setTimeout(() => {
            currentBossEncounter = 'claudio';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1000);
    }
});

// Keydown listener for Sam minigame — computer only, NO arrow keys
window.addEventListener('keydown', (e) => {
    if (!samGameActive || isSamTutorialOpen) return;
    
    const key = e.key.toUpperCase();
    const [leftKey, rightKey] = samActiveKeyPair;
    
    if (key === leftKey) {
        if (lastPressedKey !== leftKey) {
            lastPressedKey = leftKey;
            samKeyA.classList.remove('active');
            samKeyD.classList.add('active');
            
            samKeyA.classList.add('success');
            setTimeout(() => samKeyA.classList.remove('success'), 100);
            
            samTugProgress = Math.min(100, samTugProgress + 2);
            updateSamTugUI();
            triggerSamScreenShake();
            
            if (samTugProgress >= 100) {
                endSamRound(true);
            }
        }
    } else if (key === rightKey) {
        if (lastPressedKey !== rightKey) {
            lastPressedKey = rightKey;
            samKeyD.classList.remove('active');
            samKeyA.classList.add('active');
            
            samKeyD.classList.add('success');
            setTimeout(() => samKeyD.classList.remove('success'), 100);
            
            samTugProgress = Math.min(100, samTugProgress + 2);
            updateSamTugUI();
            triggerSamScreenShake();
            
            if (samTugProgress >= 100) {
                endSamRound(true);
            }
        }
    }
});

// ============================================================
// DEBUG PANEL — Cheat code: type "GGOPA" with the journey map open
// ============================================================
const debugPanel = document.getElementById('debug-panel');
const btnDebugClose = document.getElementById('btn-debug-close');

let debugKeyBuffer = '';
const DEBUG_CODE = 'GGOPA';

window.addEventListener('keydown', (e) => {
    // Only capture if journey map is open and no minigame is active
    if (!journeyOverlay.classList.contains('active')) {
        debugKeyBuffer = '';
        return;
    }
    if (samGameActive || gwenActive || isArmGameActive || claudioGameActive) return;

    debugKeyBuffer += e.key.toUpperCase();

    // Keep only the last N characters (length of the code)
    if (debugKeyBuffer.length > DEBUG_CODE.length) {
        debugKeyBuffer = debugKeyBuffer.slice(-DEBUG_CODE.length);
    }

    if (debugKeyBuffer === DEBUG_CODE) {
        debugKeyBuffer = '';
        const isVisible = debugPanel.style.display !== 'none';
        debugPanel.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) playSound('rank_up_med');
    }
});

btnDebugClose.addEventListener('click', () => {
    debugPanel.style.display = 'none';
});

// Helper: complete a phase and refresh the map
function debugCompletePhase(phase) {
    if (phase >= 1) localStorage.setItem('mandamau_journey_fase1_completed', 'true');
    if (phase >= 2) localStorage.setItem('mandamau_journey_fase2_completed', 'true');
    if (phase >= 3) localStorage.setItem('mandamau_journey_fase3_completed', 'true');
    if (phase >= 4) localStorage.setItem('mandamau_journey_fase4_completed', 'true');
    if (phase >= 5) localStorage.setItem('mandamau_journey_fase5_completed', 'true');
    if (phase >= 6) localStorage.setItem('mandamau_journey_fase6_completed', 'true');
    if (phase >= 7) localStorage.setItem('mandamau_journey_fase7_completed', 'true');
    playSound('rank_up_high');
    openJourney();
    setTimeout(() => { debugPanel.style.display = 'block'; }, 50);
}

function debugResetPhase(fromPhase) {
    if (fromPhase <= 1) localStorage.removeItem('mandamau_journey_fase1_completed');
    if (fromPhase <= 2) localStorage.removeItem('mandamau_journey_fase2_completed');
    if (fromPhase <= 3) localStorage.removeItem('mandamau_journey_fase3_completed');
    if (fromPhase <= 4) localStorage.removeItem('mandamau_journey_fase4_completed');
    if (fromPhase <= 5) localStorage.removeItem('mandamau_journey_fase5_completed');
    if (fromPhase <= 6) localStorage.removeItem('mandamau_journey_fase6_completed');
    if (fromPhase <= 7) localStorage.removeItem('mandamau_journey_fase7_completed');
    playSound('reset');
    openJourney();
    setTimeout(() => { debugPanel.style.display = 'block'; }, 50);
}

document.getElementById('dbg-complete-1').addEventListener('click', () => debugCompletePhase(1));
document.getElementById('dbg-complete-2').addEventListener('click', () => debugCompletePhase(2));
document.getElementById('dbg-complete-3').addEventListener('click', () => debugCompletePhase(3));
document.getElementById('dbg-complete-4').addEventListener('click', () => debugCompletePhase(4));
document.getElementById('dbg-complete-5').addEventListener('click', () => debugCompletePhase(5));
const dbgComp6 = document.getElementById('dbg-complete-6');
if (dbgComp6) dbgComp6.addEventListener('click', () => debugCompletePhase(6));
const dbgComp7 = document.getElementById('dbg-complete-7');
if (dbgComp7) dbgComp7.addEventListener('click', () => debugCompletePhase(7));

document.getElementById('dbg-reset-1').addEventListener('click', () => debugResetPhase(1));
document.getElementById('dbg-reset-2').addEventListener('click', () => debugResetPhase(2));
document.getElementById('dbg-reset-3').addEventListener('click', () => debugResetPhase(3));
document.getElementById('dbg-reset-4').addEventListener('click', () => debugResetPhase(4));
document.getElementById('dbg-reset-5').addEventListener('click', () => debugResetPhase(5));
const dbgRes6 = document.getElementById('dbg-reset-6');
if (dbgRes6) dbgRes6.addEventListener('click', () => debugResetPhase(6));
const dbgRes7 = document.getElementById('dbg-reset-7');
if (dbgRes7) dbgRes7.addEventListener('click', () => debugResetPhase(7));

document.getElementById('dbg-reset-all').addEventListener('click', () => {
    localStorage.removeItem('mandamau_journey_fase1_completed');
    localStorage.removeItem('mandamau_journey_fase2_completed');
    localStorage.removeItem('mandamau_journey_fase3_completed');
    localStorage.removeItem('mandamau_journey_fase4_completed');
    localStorage.removeItem('mandamau_journey_fase5_completed');
    localStorage.removeItem('mandamau_journey_fase6_completed');
    localStorage.removeItem('mandamau_journey_fase7_completed');
    playSound('reset');
    openJourney();
    setTimeout(() => { debugPanel.style.display = 'block'; }, 50);
});

// ================================================================
// FASE 4 — CLÁUDIO GENIUS MINIGAME (ESCALATING DIFFICULTY)
// ================================================================

const claudioGeniusOverlay   = document.getElementById('claudio-genius-overlay');
const claudioGeniusCard      = document.getElementById('claudio-genius-card');
const btnClaudioQuit         = document.getElementById('btn-claudio-quit');
const claudioSpeech          = document.getElementById('claudio-speech');
const claudioRoundText       = document.getElementById('claudio-round-text');
const claudioTurnText        = document.getElementById('claudio-turn-text');
const claudioLivesDisplay    = document.getElementById('claudio-lives-display');
const claudioWinOverlay      = document.getElementById('claudio-win-overlay');
const claudioLoseOverlay     = document.getElementById('claudio-lose-overlay');
const btnClaudioWinOk        = document.getElementById('btn-claudio-win-ok');
const btnClaudioRestart      = document.getElementById('btn-claudio-restart');
const claudioTutorialModal   = document.getElementById('claudio-tutorial-modal');
const btnCloseClaudioTutorial= document.getElementById('btn-close-claudio-tutorial');
const geniusGrid             = document.getElementById('genius-grid');
const geniusAnnouncement     = document.getElementById('genius-announcement');

// ---- Button Definitions (index = data-color) ----
const GENIUS_BTN_DEFS = [
    // Rounds 1–3
    { css: 'genius-red',     label: '' },
    { css: 'genius-blue',    label: '' },
    { css: 'genius-green',   label: '' },
    { css: 'genius-yellow',  label: '' },
    // Round 4+
    { css: 'genius-purple',  label: '' },
    { css: 'genius-pink',    label: '' },
    // Round 5+ (Greek letters)
    { css: 'genius-orange',  label: 'Α' },
    { css: 'genius-cyan',    label: 'Β' },
    { css: 'genius-magenta', label: 'Γ' },
];

// ---- Per-round config: seqLen = how many to memorize, activeBtns = how many buttons ----
const GENIUS_ROUND_CONFIG = [
    { seqLen: 5, activeBtns: 4, msg: null },
    { seqLen: 6, activeBtns: 4, msg: null },
    { seqLen: 6, activeBtns: 4, msg: null },
    { seqLen: 6, activeBtns: 6, msg: '⚠️ NOVOS BOTÕES APARECEM!' },
    { seqLen: 7, activeBtns: 9, msg: '🔮 LETRAS GREGAS INVADEM O JOGO!' },
];

// ---- Game state ----
let claudioSequence      = [];
let claudioPlayerIndex   = 0;
let claudioCurrentRound  = 0;
const CLAUDIO_MAX_ROUNDS = 5;
let claudioLives         = 3;
let claudioGameActive    = false;
let isClaudioTutorialOpen= false;
let claudioIsPlaying     = false;
let claudioActiveBtns    = 4; // how many buttons are currently in the grid

// ---- Phrases ----
const claudioPhrasesNormal = [
    "Eu sou um cubo gey, me vença se for capaz!",
    "Você vai errar, tenho certeza! 🟥🟦🟩🟨",
    "Minha memória é perfeita. A sua? Hehe.",
    "Continue tentando, mortal.",
    "Cada cor que você erra, eu rio! 😈"
];
const claudioPhrasesCorrect = [
    "Hmph... você teve sorte!",
    "Ok, talvez você não seja tão idiota.",
    "Continue... mas a próxima vai te quebrar.",
    "Acertou? Impossível...",
    "Bem jogado. Mas não vai durar."
];
const claudioPhrasesWrong = [
    "HAHAHAHA! ERROU! Que vergonha! 😂",
    "Sabia que você ia errar! Cubo gey 1 x 0 você!",
    "Que memória fraca! Vai estudar mais!",
    "Errou feio! Tenta de novo, panaca!",
    "KKKKKK que fail! A cor era óbvia!"
];
const claudioPhrasesWin = [
    "Impossível! Você me venceu?! Não acredito!",
    "Ok ok... você é melhor que eu esperava. Por hoje.",
    "Você é bom nisso... cubo gey derrotado! 😤"
];

// ---- Helpers ----
function setClaudioSpeech(text) {
    claudioSpeech.style.opacity = '0';
    setTimeout(() => {
        claudioSpeech.textContent = text;
        claudioSpeech.style.opacity = '1';
    }, 200);
}

function updateClaudioLives() {
    let h = '';
    for (let i = 0; i < 3; i++) h += i < claudioLives ? '❤️' : '🖤';
    claudioLivesDisplay.textContent = h;
}

function updateClaudioRoundDots() {
    for (let i = 1; i <= CLAUDIO_MAX_ROUNDS; i++) {
        const dot = document.getElementById(`claudio-dot-${i}`);
        if (dot) dot.className = i <= claudioCurrentRound ? 'claudio-dot done' : 'claudio-dot';
    }
}

function showGeniusAnnouncement(msg, durationMs = 3000) {
    if (!geniusAnnouncement) return;
    geniusAnnouncement.textContent = msg;
    geniusAnnouncement.classList.add('visible');
    setTimeout(() => geniusAnnouncement.classList.remove('visible'), durationMs);
}

// ---- Build grid dynamically ----
function buildGeniusGrid(numBtns, isNewRound = false) {
    const prevCount = geniusGrid.children.length;
    const cols = numBtns <= 4 ? 2 : 3;
    geniusGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    geniusGrid.innerHTML = '';

    for (let i = 0; i < numBtns; i++) {
        const def = GENIUS_BTN_DEFS[i];
        const btn = document.createElement('button');
        btn.id = `genius-btn-${i}`;
        btn.className = `genius-btn ${def.css}`;
        btn.dataset.color = i;
        if (def.label) btn.textContent = def.label;
        // Pop-in animation only for truly new buttons
        if (isNewRound && i >= prevCount) {
            btn.classList.add('genius-new');
            // Remove animation class after it completes to allow re-triggering
            setTimeout(() => btn.classList.remove('genius-new'), 600);
        }
        geniusGrid.appendChild(btn);
    }
    claudioActiveBtns = numBtns;
}

// ---- Sequence playback ----
function litButton(colorIndex, duration = 450) {
    return new Promise(resolve => {
        const btn = document.getElementById(`genius-btn-${colorIndex}`);
        if (!btn) { setTimeout(resolve, duration + 80); return; }
        btn.classList.add('lit');
        playSound('click');
        setTimeout(() => {
            btn.classList.remove('lit');
            setTimeout(resolve, 80);
        }, duration);
    });
}

async function playSequence() {
    claudioIsPlaying = true;
    geniusGrid.classList.remove('player-active');
    claudioTurnText.textContent = 'Preste atenção!';
    claudioTurnText.classList.remove('player-turn');

    await new Promise(r => setTimeout(r, 700));

    for (const color of claudioSequence) {
        await litButton(color, 420);
    }

    claudioIsPlaying = false;
    claudioPlayerIndex = 0;
    geniusGrid.classList.add('player-active');
    claudioTurnText.textContent = 'Sua vez!';
    claudioTurnText.classList.add('player-turn');
    setClaudioSpeech(claudioPhrasesNormal[Math.floor(Math.random() * claudioPhrasesNormal.length)]);
}

// ---- Reset / Start ----
function resetClaudioGame() {
    claudioSequence = [];
    claudioPlayerIndex = 0;
    claudioCurrentRound = 0;
    claudioLives = 3;
    claudioGameActive = false;
    claudioIsPlaying = false;

    claudioWinOverlay.style.display = 'none';
    claudioLoseOverlay.style.display = 'none';
    geniusGrid.classList.remove('player-active');
    if (geniusAnnouncement) geniusAnnouncement.classList.remove('visible');

    buildGeniusGrid(4);
    updateClaudioLives();
    updateClaudioRoundDots();
    claudioRoundText.textContent = `Rodada: 1/${CLAUDIO_MAX_ROUNDS}`;
    claudioTurnText.textContent = 'Preste atenção!';
    claudioTurnText.classList.remove('player-turn');
    setClaudioSpeech('Eu sou um cubo gey, me vença se for capaz!');
}

function startClaudioGame() {
    resetClaudioGame();
    claudioGameActive = true;
    nextClaudioRound();
}

// ---- Round logic ----
function nextClaudioRound() {
    claudioCurrentRound++;
    claudioPlayerIndex = 0;

    const config = GENIUS_ROUND_CONFIG[claudioCurrentRound - 1];
    const { seqLen, activeBtns, msg } = config;

    // Announce and rebuild grid if button count grew
    const needsMoreBtns = activeBtns > claudioActiveBtns;
    if (needsMoreBtns && msg) {
        showGeniusAnnouncement(msg, 3200);
    }

    const rebuildDelay = needsMoreBtns ? 800 : 0;
    setTimeout(() => {
        if (needsMoreBtns) buildGeniusGrid(activeBtns, true);

        // Build fresh sequence from active button pool
        claudioSequence = [];
        for (let i = 0; i < seqLen; i++) {
            claudioSequence.push(Math.floor(Math.random() * activeBtns));
        }

        claudioRoundText.textContent = `Rodada: ${claudioCurrentRound}/${CLAUDIO_MAX_ROUNDS}`;
        updateClaudioRoundDots();
        setClaudioSpeech(`Rodada ${claudioCurrentRound}: memorize ${seqLen} cores!`);

        setTimeout(() => playSequence(), 1200);
    }, rebuildDelay);
}

// ---- Player input (event delegation on grid) ----
geniusGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.genius-btn');
    if (!btn) return;
    handleClaudioPlayerInput(parseInt(btn.dataset.color));
});

function handleClaudioPlayerInput(colorIndex) {
    if (!claudioGameActive || claudioIsPlaying || isClaudioTutorialOpen) return;
    if (!geniusGrid.classList.contains('player-active')) return;

    litButton(colorIndex, 180);

    if (colorIndex !== claudioSequence[claudioPlayerIndex]) {
        // WRONG
        claudioLives--;
        updateClaudioLives();
        playSound('bako_cheat');
        setClaudioSpeech(claudioPhrasesWrong[Math.floor(Math.random() * claudioPhrasesWrong.length)]);

        claudioGeniusCard.classList.add('claudio-error');
        setTimeout(() => claudioGeniusCard.classList.remove('claudio-error'), 500);

        geniusGrid.classList.remove('player-active');
        claudioTurnText.textContent = 'Preste atenção!';
        claudioTurnText.classList.remove('player-turn');

        if (claudioLives <= 0) {
            setTimeout(() => {
                claudioLoseOverlay.style.display = 'flex';
                claudioGameActive = false;
            }, 1000);
        } else {
            // Replay same round sequence
            setTimeout(() => playSequence(), 1600);
        }
        return;
    }

    claudioPlayerIndex++;

    if (claudioPlayerIndex >= claudioSequence.length) {
        // Round complete!
        playSound('rank_up_med');
        geniusGrid.classList.remove('player-active');
        claudioTurnText.textContent = 'Preste atenção!';
        claudioTurnText.classList.remove('player-turn');
        setClaudioSpeech(claudioPhrasesCorrect[Math.floor(Math.random() * claudioPhrasesCorrect.length)]);

        if (claudioCurrentRound >= CLAUDIO_MAX_ROUNDS) {
            setTimeout(() => {
                playSound('rank_up');
                unlockAchievement('claudio_win');
                unlockCosmetic('claudio');
                if (claudioLives === 3) {
                    unlockAchievement('claudio_flawless');
                }
                setClaudioSpeech(claudioPhrasesWin[Math.floor(Math.random() * claudioPhrasesWin.length)]);
                claudioWinOverlay.style.display = 'flex';
                claudioGameActive = false;
            }, 1000);
        } else {
            setTimeout(() => nextClaudioRound(), 2000);
        }
    }
}

// ---- Close / Quit / Restart ----
function closeClaudioGame() {
    claudioGameActive = false;
    claudioIsPlaying = false;
    fadeOutTheme();
    claudioGeniusOverlay.classList.remove('active');
    claudioTutorialModal.classList.remove('active');
    isClaudioTutorialOpen = false;
    claudioGeniusCard.classList.remove('claudio-error');
    geniusGrid.classList.remove('player-active');
    if (geniusAnnouncement) geniusAnnouncement.classList.remove('visible');
}

btnClaudioQuit.addEventListener('click', () => {
    closeClaudioGame();
    playSound('click');
});

btnClaudioRestart.addEventListener('click', () => {
    playSound('click');
    claudioWinOverlay.style.display = 'none';
    claudioLoseOverlay.style.display = 'none';
    startClaudioGame();
});

btnCloseClaudioTutorial.addEventListener('click', () => {
    isClaudioTutorialOpen = false;
    claudioTutorialModal.classList.remove('active');
    playSound('click');
    playTheme('fase4');
    startClaudioGame();
});

btnClaudioWinOk.addEventListener('click', () => {
    closeClaudioGame();
    playSound('rank_up');

    localStorage.setItem('mandamau_journey_fase4_completed', 'true');

    const nodeGgopa = document.getElementById('node-ggopa');
    const pathLineFase5 = document.querySelector('.line-fase5');
    if (nodeGgopa) {
        nodeGgopa.className = 'map-node node-active';
        nodeGgopa.title = 'Fase 5 - Sede do GGOPA';
        const iconSpan = nodeGgopa.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '🏗️';
    }
    if (pathLineFase5) pathLineFase5.classList.add('line-active');

    setTimeout(() => {
        journeyPlayerToken.style.left = '90%';
        journeyPlayerToken.style.top = '20%';
        // Automatically trigger Felifep encounter
        setTimeout(() => {
            currentBossEncounter = 'felifep';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1200);
    }, 800);
});



// ================================================================
// LEVEL 5 — FELIFEP BLACKJACK (BOSS FINAL)
// ================================================================

// ---- DOM References ----
const blackjackOverlay    = document.getElementById('blackjack-overlay');
const bjBossHpFill        = document.getElementById('bj-boss-hp-fill');
const bjBossHpText        = document.getElementById('bj-boss-hp-text');
const bjPlayerHpFill      = document.getElementById('bj-player-hp-fill');
const bjPlayerHpText      = document.getElementById('bj-player-hp-text');
const bjBossSpeech        = document.getElementById('bj-boss-speech');
const bjBossCards         = document.getElementById('bj-boss-cards');
const bjPlayerCards       = document.getElementById('bj-player-cards');
const bjBossScore         = document.getElementById('bj-boss-score');
const bjPlayerScore       = document.getElementById('bj-player-score');
const bjRoundNum          = document.getElementById('bj-round-num');
const bjJudgmentBadge     = document.getElementById('bj-judgment-badge');
const bjRoundResult       = document.getElementById('bj-round-result');
const bjRoundResultText   = document.getElementById('bj-round-result-text');
const btnBjNextRound      = document.getElementById('btn-bj-next-round');
const btnBjHit            = document.getElementById('btn-bj-hit');
const btnBjStand          = document.getElementById('btn-bj-stand');
const btnBjPower1         = document.getElementById('btn-bj-power1');
const btnBjPower2         = document.getElementById('btn-bj-power2');
const btnBjPower3         = document.getElementById('btn-bj-power3');
const bjP1Uses            = document.getElementById('bj-p1-uses');
const bjP2Uses            = document.getElementById('bj-p2-uses');
const bjP3Uses            = document.getElementById('bj-p3-uses');
const bjDamageFlash       = document.getElementById('bj-damage-flash');
const bjWinScreen         = document.getElementById('bj-win-screen');
const bjLoseScreen        = document.getElementById('bj-lose-screen');
const bjFireworks         = document.getElementById('bj-fireworks');
const btnBjWinOk          = document.getElementById('btn-bj-win-ok');
const btnBjRestart        = document.getElementById('btn-bj-restart');
const btnBjQuit           = document.getElementById('btn-bj-quit');
const bjTutorialModal     = document.getElementById('bj-tutorial-modal');
const btnCloseBjTutorial  = document.getElementById('btn-close-bj-tutorial');

// ---- Game State ----
let bjDeck         = [];
let bjPlayerHand   = [];
let bjBossHand     = [];
let bjPlayerHP     = 100;
let bjBossHP       = 100;
let bjRound        = 0;
let bjGameActive   = false;
let bjPlayerTurn   = false;
let bjTutorialOpen = false;
let bjPower1Uses   = 1; // Olho da Verdade
let bjPower2Uses   = 1; // Decreto de Etiqueta
let bjPower3Uses   = 2; // Balanca Divina
let bjBossCardRevealed = false;
let bjDecreeUsed   = false; // Decreto used this game
let bjBossHiddenIndex = 1; // index of boss hidden card in bjBossHand

const BJ_MAX_HP      = 100;
const BJ_DAMAGE_BASE = 25;
const BJ_CRIT_DAMAGE = 50;

// ---- Felifep Dialogue ----
const bjSpeechIdle = [
    "Sua falta de etiqueta me diverte. Compre uma carta!",
    "A verdade e absoluta: 21!",
    "Nao se preocupe... voce nao vai ganhar mesmo.",
    "Interessante escolha. Mas inutil.",
    "O Deus da Etiqueta nao perde."
];
const bjSpeechPlayerHit  = ["Ah, ganancia... classico.", "Mais uma carta? Que desesperado.", "Isso... se destrua sozinho."];
const bjSpeechPlayerBust = ["KKKK ESTOUROU! Sem etiqueta, sem sorte!", "Ha! A verdade e crua: voce estourou!", "Previsto. Nao tem class nenhuma."];
const bjSpeechBossWin    = ["A etiqueta triunfa, como sempre.", "Eu disse que ganharia. Jamais duvide.", "Previsivel... mas satisfatorio."];
const bjSpeechPlayerWin  = ["Impossivel! Isso e... insulto!", "Voce teve sorte. SO sorte.", "Aprecie este momento. Nao vai durar."];
const bjSpeechJudgment   = ["MODO JULGAMENTO ATIVADO. Agora ficou serio.", "Voce me subestimou. Erro fatal.", "O Julgamento comeca AGORA!"];
const bjSpeechWin        = ["Derrotado... pelo proprio jogo da verdade.", "Voce... merece este titulo. Cuide-se.", "Incrivel. Genuinamente incrivel."];

function bjSetSpeech(text) {
    bjBossSpeech.style.opacity = '0';
    setTimeout(() => { bjBossSpeech.textContent = text; bjBossSpeech.style.opacity = '1'; }, 200);
}
function bjRandSpeech(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ---- Deck ----
function bjBuildDeck() {
    const suits  = ['spades', 'hearts', 'diamonds', 'clubs'];
    const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const deck   = [];
    for (const suit of suits)
        for (const val of values)
            deck.push({ suit, value: val });
    // Use 2 decks for more cards
    return [...deck, ...deck];
}

function bjShuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function bjDraw() {
    if (bjDeck.length < 5) bjDeck = bjShuffle(bjBuildDeck());
    return bjDeck.pop();
}

// ---- Scoring ----
function bjCardNum(val) {
    if (['J','Q','K'].includes(val)) return 10;
    if (val === 'A') return 11;
    return parseInt(val);
}

function bjScore(hand) {
    let total = 0, aces = 0;
    for (const c of hand) {
        if (c.value === 'A') { aces++; total += 11; }
        else total += bjCardNum(c.value);
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}

// ---- Card Rendering ----
function bjSuitChar(suit) {
    return { spades:'♠', hearts:'♥', diamonds:'♦', clubs:'♣' }[suit];
}
function bjIsRed(suit) { return suit === 'hearts' || suit === 'diamonds'; }

function bjRenderCard(card, hidden = false) {
    const div = document.createElement('div');
    div.className = 'bj-card' + (hidden ? ' bj-card-hidden' : '') + (bjIsRed(card.suit) && !hidden ? ' bj-card-red' : '');
    if (!hidden) {
        const sym = bjSuitChar(card.suit);
        div.innerHTML = `<span class="bj-card-top">${card.value}${sym}</span><span class="bj-card-center">${sym}</span><span class="bj-card-bottom">${card.value}${sym}</span>`;
    }
    return div;
}

function bjRedrawBossCards(revealAll = false) {
    bjBossCards.innerHTML = '';
    for (let i = 0; i < bjBossHand.length; i++) {
        const hidden = (i === bjBossHiddenIndex) && !revealAll && !bjBossCardRevealed;
        bjBossCards.appendChild(bjRenderCard(bjBossHand[i], hidden));
    }
    if (revealAll || bjBossCardRevealed) {
        bjBossScore.textContent = bjScore(bjBossHand);
    } else {
        bjBossScore.textContent = '?';
    }
}

function bjRedrawPlayerCards() {
    bjPlayerCards.innerHTML = '';
    for (const c of bjPlayerHand) bjPlayerCards.appendChild(bjRenderCard(c, false));
    bjPlayerScore.textContent = bjScore(bjPlayerHand);
}

// ---- HP Update ----
function bjUpdateHP() {
    const bPct = Math.max(0, (bjBossHP / BJ_MAX_HP) * 100);
    const pPct = Math.max(0, (bjPlayerHP / BJ_MAX_HP) * 100);
    bjBossHpFill.style.width   = bPct + '%';
    bjBossHpText.textContent   = Math.max(0, bjBossHP);
    bjPlayerHpFill.style.width = pPct + '%';
    bjPlayerHpText.textContent = Math.max(0, bjPlayerHP);
    // Judgment Mode
    if (bjBossHP <= BJ_MAX_HP / 2 && !bjJudgmentBadge.classList.contains('active')) {
        bjJudgmentBadge.classList.add('active');
        bjSetSpeech(bjRandSpeech(bjSpeechJudgment));
    }
}

// ---- Damage Flash ----
function bjFlash(isBoss = false) {
    bjDamageFlash.className = 'bj-damage-flash' + (isBoss ? ' boss-damage' : '');
    bjDamageFlash.style.display = 'block';
    bjDamageFlash.style.animation = 'none';
    void bjDamageFlash.offsetWidth;
    bjDamageFlash.style.animation = '';
    setTimeout(() => { bjDamageFlash.style.display = 'none'; }, 450);
}

// ---- Buttons Enable/Disable ----
function bjSetControls(enabled) {
    btnBjHit.disabled   = !enabled;
    btnBjStand.disabled = !enabled;
    const p1Disabled = !enabled || bjPower1Uses <= 0;
    const p2Disabled = !enabled || bjPower2Uses <= 0 || bjScore(bjPlayerHand) <= 21;
    const p3Disabled = !enabled || bjPower3Uses <= 0 || bjPlayerHand.length < 1;
    btnBjPower1.disabled = p1Disabled;
    btnBjPower2.disabled = p2Disabled;
    btnBjPower3.disabled = p3Disabled;
}

function bjUpdatePowerUI() {
    bjP1Uses.textContent = bjPower1Uses + 'x';
    bjP2Uses.textContent = bjPower2Uses + 'x';
    bjP3Uses.textContent = bjPower3Uses + 'x';
    btnBjPower1.disabled = bjPower1Uses <= 0;
    btnBjPower2.disabled = bjPower2Uses <= 0;
    btnBjPower3.disabled = bjPower3Uses <= 0 || bjPlayerHand.length < 1;
}

// ---- Deal Round ----
function bjStartRound() {
    bjRound++;
    bjRoundNum.textContent = bjRound;
    bjPlayerHand = [];
    bjBossHand   = [];
    bjBossCardRevealed = false;
    bjBossHiddenIndex  = 1;
    bjRoundResult.style.display = 'none';

    // Deal 2 cards each
    bjPlayerHand.push(bjDraw(), bjDraw());
    bjBossHand.push(bjDraw(), bjDraw());

    bjRedrawPlayerCards();
    bjRedrawBossCards(false);
    bjUpdateHP();
    bjSetControls(true);
    bjPlayerTurn = true;
    bjSetSpeech(bjRandSpeech(bjSpeechIdle));

    // Natural blackjack check
    const pScore = bjScore(bjPlayerHand);
    if (pScore === 21 && bjPlayerHand.length === 2) {
        bjSetControls(false);
        bjPlayerTurn = false;
        setTimeout(() => bjResolveRound(true), 600);
    }
}

// ---- Boss AI Turn ----
function bjBossPlay() {
    bjSetControls(false);
    bjPlayerTurn = false;
    bjRedrawBossCards(true); // reveal hidden

    function drawNext() {
        const bScore = bjScore(bjBossHand);
        // Normal: stand at 17+. Judgment Mode (HP <= 50): stand at 19+ (smarter)
        const threshold = bjBossHP <= BJ_MAX_HP / 2 ? 19 : 17;
        if (bScore >= threshold) {
            // Stand
            setTimeout(() => bjResolveRound(false), 800);
            return;
        }
        // In Judgment Mode, pick a safe card if possible
        let card;
        if (bjBossHP <= BJ_MAX_HP / 2) {
            // Peek top 5, prefer cards that wont bust
            const preview = bjDeck.slice(-5);
            const safeCards = preview.filter(c => {
                let t = bScore + bjCardNum(c.value);
                if (c.value === 'A' && t > 21) t -= 10;
                return t <= 21;
            });
            if (safeCards.length > 0 && Math.random() < 0.8) {
                card = safeCards[Math.floor(Math.random() * safeCards.length)];
                // remove from deck
                const idx = bjDeck.lastIndexOf(card);
                if (idx !== -1) bjDeck.splice(idx, 1);
            }
        }
        if (!card) card = bjDraw();
        bjBossHand.push(card);
        bjRedrawBossCards(true);
        const newScore = bjScore(bjBossHand);
        if (newScore > 21 || newScore >= threshold) {
            setTimeout(() => bjResolveRound(false), 600);
        } else {
            setTimeout(drawNext, 700);
        }
    }
    setTimeout(drawNext, 900);
}

// ---- Round Resolution ----
function bjResolveRound(naturalBlackjack) {
    bjRedrawBossCards(true);
    const pScore = bjScore(bjPlayerHand);
    const bScore = bjScore(bjBossHand);
    let resultMsg = '';
    let damage = BJ_DAMAGE_BASE;

    if (naturalBlackjack && pScore === 21 && bjPlayerHand.length === 2) {
        // Natural BJ
        damage = BJ_CRIT_DAMAGE;
        bjBossHP -= damage;
        bjFlash(true);
        resultMsg = `🃏 BLACKJACK NATURAL! Dano critico: -${damage} HP do Felifep!`;
        bjSetSpeech(bjRandSpeech(bjSpeechPlayerWin));
    } else if (pScore > 21) {
        // Player bust
        bjPlayerHP -= damage;
        bjFlash(false);
        resultMsg = `💥 Voce ESTOUROU (${pScore})! -${damage} HP`;
        bjSetSpeech(bjRandSpeech(bjSpeechPlayerBust));
    } else if (bScore > 21) {
        // Boss bust
        bjBossHP -= damage;
        bjFlash(true);
        resultMsg = `✨ Felifep ESTOUROU (${bScore})! -${damage} HP do Felifep!`;
        bjSetSpeech(bjRandSpeech(bjSpeechPlayerWin));
    } else if (pScore > bScore) {
        bjBossHP -= damage;
        bjFlash(true);
        resultMsg = `⚔️ Voce venceu (${pScore} vs ${bScore})! -${damage} HP do Felifep!`;
        bjSetSpeech(bjRandSpeech(bjSpeechPlayerWin));
    } else if (bScore > pScore) {
        bjPlayerHP -= damage;
        bjFlash(false);
        resultMsg = `💀 Felifep venceu (${bScore} vs ${pScore})! -${damage} HP seus!`;
        bjSetSpeech(bjRandSpeech(bjSpeechBossWin));
    } else {
        resultMsg = `🤝 Empate (${pScore} vs ${bScore})! Sem dano.`;
        bjSetSpeech("Um empate... aceito, mas com reservas.");
    }

    bjBossHP   = Math.max(0, bjBossHP);
    bjPlayerHP = Math.max(0, bjPlayerHP);
    bjUpdateHP();

    bjRoundResultText.textContent = resultMsg;
    bjRoundResult.style.display   = 'block';

    // Check end game
    if (bjBossHP <= 0) {
        setTimeout(bjShowWin, 1200);
        return;
    }
    if (bjPlayerHP <= 0) {
        setTimeout(bjShowLose, 1200);
        return;
    }
}

// ---- Powers ----
function bjActivatePowerAnim(btn) {
    btn.classList.add('activating');
    setTimeout(() => btn.classList.remove('activating'), 550);
}

// Power 1: Olho da Verdade
btnBjPower1.addEventListener('click', () => {
    bjPowersUsedInMatch = true;
    if (!bjPlayerTurn || bjPower1Uses <= 0) return;
    bjPower1Uses--;
    bjBossCardRevealed = true;
    bjActivatePowerAnim(btnBjPower1);
    bjRedrawBossCards(false); // will auto-reveal because bjBossCardRevealed = true
    bjSetSpeech("Voce ousou espionar minha mao? Insolencia!");
    bjUpdatePowerUI();
    playSound('rank_up_med');
});

// Power 2: Decreto de Etiqueta — cancela estouro removendo a última carta
btnBjPower2.addEventListener('click', () => {
    bjPowersUsedInMatch = true;
    if (!bjPlayerTurn || bjPower2Uses <= 0) return;
    const score = bjScore(bjPlayerHand);
    if (score <= 21) {
        bjSetSpeech('Este poder só cancela um estouro, senhor.');
        return;
    }
    bjPower2Uses--;
    bjPlayerHand.pop();
    bjActivatePowerAnim(btnBjPower2);
    bjRedrawPlayerCards();
    bjSetSpeech('O Decreto de Etiqueta... salvo desta vez.');
    bjUpdatePowerUI();
    // Re-enable Hit if no longer busted
    if (bjScore(bjPlayerHand) <= 21) btnBjHit.disabled = false;
    playSound('rank_up_med');
});

// Power 3: Balança Divina — troca a última carta
btnBjPower3.addEventListener('click', () => {
    bjPowersUsedInMatch = true;
    if (!bjPlayerTurn || bjPower3Uses <= 0 || bjPlayerHand.length < 1) return;
    bjPower3Uses--;
    bjPlayerHand.pop();
    bjPlayerHand.push(bjDraw());
    bjActivatePowerAnim(btnBjPower3);
    bjRedrawPlayerCards();
    bjSetSpeech('A Balança oscila... nova carta, nova chance.');
    bjUpdatePowerUI();
    const newScore = bjScore(bjPlayerHand);
    // Re-enable or disable Hit based on new score
    btnBjHit.disabled = newScore > 21;
    // If still busted, enable Decreto if available
    if (newScore > 21) btnBjPower2.disabled = bjPower2Uses <= 0;
    playSound('rank_up_med');
});

// ---- Hit ----
btnBjHit.addEventListener('click', () => {
    if (!bjGameActive || !bjPlayerTurn) return;
    const card = bjDraw();
    bjPlayerHand.push(card);
    bjRedrawPlayerCards();
    bjSetSpeech(bjRandSpeech(bjSpeechPlayerHit));
    const score = bjScore(bjPlayerHand);
    if (score > 21) {
        // Busted: disable Hit, only allow Decreto/Balança
        btnBjHit.disabled = true;
        btnBjPower2.disabled = bjPower2Uses <= 0;
        btnBjPower3.disabled = bjPower3Uses <= 0 || bjPlayerHand.length < 1;
    }
    bjUpdatePowerUI();
    // Re-disable hit if still busted after powerup
    if (bjScore(bjPlayerHand) > 21) btnBjHit.disabled = true;
    playSound('click');
});

// ---- Stand ----
btnBjStand.addEventListener('click', () => {
    if (!bjGameActive || !bjPlayerTurn) return;
    bjPlayerTurn = false;
    bjSetControls(false);
    playSound('click');
    // Check if player busted first
    if (bjScore(bjPlayerHand) > 21) {
        setTimeout(() => bjResolveRound(false), 300);
        return;
    }
    bjBossPlay();
});

// ---- Next Round ----
btnBjNextRound.addEventListener('click', () => {
    if (!bjGameActive) return; // guard: don't allow after game ends
    bjRoundResult.style.display = 'none';
    bjStartRound();
    playSound('click');
});

// ---- Win / Lose Screens ----
function bjShowWin() {
    bjGameActive = false;
    unlockAchievement('felifep_win');
    unlockCosmetic('felifep');
    if (!bjPowersUsedInMatch) {
        unlockAchievement('felifep_no_powers');
    }
    bjSetSpeech(bjRandSpeech(bjSpeechWin));
    bjRoundResult.style.display = 'none';
    bjWinScreen.style.display = '';
    bjWinScreen.classList.add('active');
    bjSpawnFireworks();
}

function bjShowLose() {
    bjGameActive = false;
    bjRoundResult.style.display = 'none';
    bjLoseScreen.style.display = '';
    bjLoseScreen.classList.add('active');
}

function bjSpawnFireworks() {
    const colors = ['#f8d862','#c084fc','#22c55e','#f97316','#ec4899','#06b6d4','#ef4444'];
    for (let burst = 0; burst < 12; burst++) {
        const cx = Math.random() * 100;
        const cy = Math.random() * 60;
        setTimeout(() => {
            for (let i = 0; i < 12; i++) {
                const spark = document.createElement('div');
                spark.className = 'bj-fw-spark';
                const angle = (i / 12) * 360;
                const dist  = 40 + Math.random() * 60;
                const tx    = Math.cos(angle * Math.PI / 180) * dist + 'px';
                const ty    = Math.sin(angle * Math.PI / 180) * dist + 'px';
                spark.style.cssText = `left:${cx}%;top:${cy}%;background:${colors[i % colors.length]};--tx:${tx};--ty:${ty};--delay:${Math.random() * 0.3}s`;
                bjFireworks.appendChild(spark);
                setTimeout(() => spark.remove(), 1200);
            }
        }, burst * 200);
    }
}

// ================================================================
// EPILOGUE — Felifep Dialogue Sequence
// ================================================================

const bjEpilogue      = document.getElementById('bj-epilogue');
const bjEpiText       = document.getElementById('bj-epi-text');
const bjEpiSpeaker    = document.getElementById('bj-epi-speaker');
const bjEpiPortrait   = document.getElementById('bj-epi-portrait');
const btnBjEpiNext    = document.getElementById('btn-bj-epi-next');
const bjChapter2      = document.getElementById('bj-chapter2');
const btnBjCh2Close   = document.getElementById('btn-bj-ch2-close');

// WHO: 'felifep' | 'player'
const BJ_EPILOGUE_LINES = [
    { who: 'felifep', text: 'Parabéns... você nos condenou.' },
    { who: 'player',  text: 'Como assim?' },
    { who: 'felifep', text: 'Você libertou o Deus da Mentira e da Deselegância no mundo. Agora as fake news vão aumentar, as pessoas serão deselegantes umas com as outras... você trouxe o caos ao mundo!' },
    { who: 'player',  text: 'Foi mal, eu não sabia... eu vou consertar!' },
    { who: 'felifep', text: 'Melhor você estar falando a verdade. Vai logo!' },
];

let bjEpiIndex = 0;

function bjShowEpiLine(index) {
    if (index >= BJ_EPILOGUE_LINES.length) {
        // All lines done → show Chapter 2
        bjEpilogue.classList.remove('active');
        bjChapter2.classList.add('active');
        return;
    }
    const line = BJ_EPILOGUE_LINES[index];
    const isPlayer = line.who === 'player';

    // Update speaker label and portrait style
    bjEpiSpeaker.textContent = isPlayer ? 'Você' : 'Felifep';
    bjEpiSpeaker.style.color = isPlayer ? '#c4b5fd' : '#f8d862';
    bjEpiPortrait.className  = 'bj-epi-portrait' + (isPlayer ? ' player-turn' : '');

    // Animate text
    bjEpiText.style.animation = 'none';
    void bjEpiText.offsetWidth; // reflow
    bjEpiText.style.animation  = '';
    bjEpiText.className = 'bj-epi-text' + (isPlayer ? ' player-bubble' : '');
    bjEpiText.textContent = line.text;

    // Last line → change button text
    const isLast = index === BJ_EPILOGUE_LINES.length - 1;
    btnBjEpiNext.textContent = isLast ? '▶ Finalizar' : '▶ Continuar';
}

btnBjEpiNext.addEventListener('click', () => {
    bjEpiIndex++;
    bjShowEpiLine(bjEpiIndex);
    playSound('click');
});

// "fim?" button — transition from win screen to epilogue
btnBjWinOk.addEventListener('click', () => {
    bjFireworks.innerHTML = '';
    bjWinScreen.classList.remove('active');
    bjWinScreen.style.display = '';
    blackjackOverlay.classList.remove('active');
    playSound('click');

    // Init and open epilogue
    bjEpiIndex = 0;
    bjEpilogue.classList.add('active');
    bjShowEpiLine(0);
});

// "Voltar ao início" — save progress and return to journey map
btnBjCh2Close.addEventListener('click', () => {
    bjChapter2.classList.remove('active');
    playSound('rank_up_high');
    localStorage.setItem('mandamau_journey_fase5_completed', 'true');
    currentMapChapter = 1; // Stay on Chapter 1 — player uses the arrow to go to Chapter 2
    openJourney();
});


btnBjRestart.addEventListener('click', () => {
    bjLoseScreen.classList.remove('active');
    bjLoseScreen.style.display = '';
    playSound('click');
    bjInitGame();
    bjStartRound();
});

btnBjQuit.addEventListener('click', () => {
    bjGameActive = false;
    fadeOutTheme();
    blackjackOverlay.classList.remove('active');
    bjWinScreen.classList.remove('active');
    bjLoseScreen.classList.remove('active');
    bjTutorialModal.classList.remove('active');
    bjRoundResult.style.display = 'none';
    bjFireworks.innerHTML = '';
    playSound('click');
});

// ---- Tutorial ----
btnCloseBjTutorial.addEventListener('click', () => {
    bjTutorialModal.classList.remove('active');
    bjTutorialOpen = false;
    playSound('click');
    playTheme('fase5');
    bjStartRound();
});

// ---- Init ----
function bjInitGame() {
    bjPowersUsedInMatch = false;
    try {
        bjDeck      = bjShuffle(bjBuildDeck());
        bjPlayerHP  = BJ_MAX_HP;
        bjBossHP    = BJ_MAX_HP;
        bjRound     = 0;
        bjPower1Uses= 1;
        bjPower2Uses= 1;
        bjPower3Uses= 2;
        bjGameActive = true;
        bjPlayerTurn = false;
        if (bjJudgmentBadge) bjJudgmentBadge.classList.remove('active');
        bjUpdateHP();
        bjUpdatePowerUI();
        if (bjBossCards)   bjBossCards.innerHTML   = '';
        if (bjPlayerCards) bjPlayerCards.innerHTML = '';
        if (bjBossScore)   bjBossScore.textContent   = '?';
        if (bjPlayerScore) bjPlayerScore.textContent = '0';
        if (bjRoundResult) bjRoundResult.style.display = 'none';
        // Reset end screens
        if (bjWinScreen)  { bjWinScreen.classList.remove('active');  bjWinScreen.style.display = ''; }
        if (bjLoseScreen) { bjLoseScreen.classList.remove('active'); bjLoseScreen.style.display = ''; }
        if (bjFireworks)  bjFireworks.innerHTML = '';
        bjSetSpeech('Sua falta de etiqueta me diverte. Compre uma carta!');
        bjSetControls(false);
        console.log('[BJ] bjInitGame OK');
    } catch(e) {
        console.error('[BJ] bjInitGame error:', e);
        alert('ERRO bjInitGame: ' + e.message);
    }
}

function openBlackjack() {
    try {
        console.log('[BJ] openBlackjack called');
        if (!blackjackOverlay) { alert('ERRO: blackjack-overlay nao encontrado!'); return; }
        blackjackOverlay.classList.add('active');
        bjInitGame();
        bjTutorialOpen = true;
        if (!bjTutorialModal) { alert('ERRO: bj-tutorial-modal nao encontrado!'); return; }
        bjTutorialModal.classList.add('active');
        console.log('[BJ] OK - overlay and tutorial active');
    } catch(e) {
        console.error('[BJ] openBlackjack error:', e);
        alert('ERRO no Blackjack: ' + e.message + '\n' + e.stack);
    }
}

// ---- Journey map: GGOPA node click ----
document.getElementById('node-ggopa').addEventListener('click', () => {
    const fase4Done = localStorage.getItem('mandamau_journey_fase4_completed') === 'true';
    if (fase4Done) {
        playSound('click');
        journeyPlayerToken.style.left = '90%';
        journeyPlayerToken.style.top  = '20%';
        setTimeout(() => {
            currentBossEncounter = 'felifep';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1000);
    }
});

// (felifep case handled in setupBossEncounterUI and btnAcceptChallenge above)

// ---- Debug: direct Blackjack launch ----
document.getElementById('dbg-launch-bj').addEventListener('click', () => {
    debugPanel.style.display = 'none';
    journeyOverlay.classList.remove('active');
    openBlackjack();
});

const dbgLaunchVolibear = document.getElementById('dbg-launch-volibear');
if (dbgLaunchVolibear) {
    dbgLaunchVolibear.addEventListener('click', () => {
        if (debugPanel) debugPanel.style.display = 'none';
        if (journeyOverlay) journeyOverlay.classList.remove('active');
        openVolibearGame();
    });
}

const dbgLaunchWarwick = document.getElementById('dbg-launch-warwick');
if (dbgLaunchWarwick) {
    dbgLaunchWarwick.addEventListener('click', () => {
        if (debugPanel) debugPanel.style.display = 'none';
        if (journeyOverlay) journeyOverlay.classList.remove('active');
        openWarwickGame();
    });
}


