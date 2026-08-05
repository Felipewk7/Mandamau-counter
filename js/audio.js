// ================================================================
// THEME MUSIC SYSTEM
// ================================================================
const gameThemeAudio = document.getElementById('game-theme');
const bgMusicAudio   = document.getElementById('bg-music');
let currentThemeFile = '';




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