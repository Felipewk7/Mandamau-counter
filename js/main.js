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

function bindDecorationModalEvents() {
    const btnDecTop = document.getElementById('btn-decorations-top');
    const modalDec = document.getElementById('decorations-modal');
    const btnCloseDec = document.getElementById('btn-close-decorations');

    if (btnDecTop && modalDec) {
        btnDecTop.onclick = () => {
            renderDecorationsModal();
            modalDec.classList.add('active');
            try { playSound('click'); } catch(e) {}
        };
    }
    if (btnCloseDec && modalDec) {
        btnCloseDec.onclick = () => {
            modalDec.classList.remove('active');
            try { playSound('click'); } catch(e) {}
        };
    }
}
bindDecorationModalEvents();

document.addEventListener('DOMContentLoaded', () => {
    bindDecorationModalEvents();
    
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
            if (journeyPlayerToken) {
                journeyPlayerToken.style.left = '25%';
                journeyPlayerToken.style.top = '62%';
            }
            currentBossEncounter = 'volibear';
            setupBossEncounterUI();
            const overlay = document.getElementById('journey-encounter-overlay') || journeyEncounterOverlay;
            if (overlay) overlay.classList.add('active');
        });
    }

    const nodeFase7 = document.getElementById('node-fase7');
    if (nodeFase7) {
        nodeFase7.addEventListener('click', () => {
            const isFase6Done = localStorage.getItem('mandamau_journey_fase6_completed') === 'true';
            if (isFase6Done) {
                try { playSound('click'); } catch(e) {}
                if (journeyPlayerToken) {
                    journeyPlayerToken.style.left = '40%';
                    journeyPlayerToken.style.top = '50%';
                }
                currentBossEncounter = 'warwick';
                setupBossEncounterUI();
                const overlay = document.getElementById('journey-encounter-overlay') || journeyEncounterOverlay;
                if (overlay) overlay.classList.add('active');
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