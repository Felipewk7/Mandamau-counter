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


