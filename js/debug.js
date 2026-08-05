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
        localStorage.setItem('mandamau_journey_fase6_completed', 'true');
        currentBossEncounter = 'warwick';
        if (debugPanel) debugPanel.style.display = 'none';
        if (journeyOverlay) journeyOverlay.classList.remove('active');
        openWarwickGame();
    });
}


