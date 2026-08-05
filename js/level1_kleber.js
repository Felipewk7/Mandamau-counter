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
    // 1. Force close Volibear game completely
    closeVolibearGame();
    
    // 2. Open Warwick stealth overlay
    const overlay = document.getElementById('warwick-stealth-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    
    const winOv = document.getElementById('warwick-win-overlay');
    const loseOv = document.getElementById('warwick-lose-overlay');