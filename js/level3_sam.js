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
