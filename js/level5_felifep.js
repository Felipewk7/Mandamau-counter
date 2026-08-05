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
    // Ensure Chapter 2 starts cleanly at Volibear (Fase 6)
    localStorage.removeItem('mandamau_journey_fase6_completed');
    localStorage.removeItem('mandamau_journey_fase7_completed');
    currentMapChapter = 2;
    openJourney();
});
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