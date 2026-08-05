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
            
            // Open journey and navigate DIRECTLY to Chapter 2 with Fase 7 unlocked
            openJourney();
            setTimeout(() => {
                // CRITICAL: go to Chapter 2 map (Volibear is Chapter 2!)
                switchMapChapter(2);
                
                const nodeF7 = document.getElementById('node-fase7');
                const lineF7 = document.querySelector('.line-fase7');
                if (nodeF7) {
                    nodeF7.className = 'map-node node-active';
                    nodeF7.title = 'Fase 7 - Warwick (Desbloqueado!)';
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