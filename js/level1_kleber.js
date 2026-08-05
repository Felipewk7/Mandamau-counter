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
