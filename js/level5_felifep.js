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
    // Force close Warwick game completely
    closeWarwickGame();

    const overlay = document.getElementById('volibear-storm-overlay');
    if (!overlay) return;
    overlay.classList.add('active');