// ================================================================
// AUDIO SYSTEM (Web Audio Synthesis, Sound Effects, BGM & Themes)
// ================================================================
const gameThemeAudio = document.getElementById('game-theme');
const bgMusicAudio   = document.getElementById('bg-music');
let currentThemeFile = '';

const THEMES = {
    fase1: 'audio/fase1_kleber.mp3',
    fase2: 'audio/fase2_gwen.mp3',
    fase3: 'audio/fase3_sam.mp3',
    fase4: 'audio/fase4_claudio.mp3',
    fase5: 'audio/fase5_felifep.mp3',
    fase6: 'audio/fase6_volibear.mp3',
    fase7: 'audio/fase7_warwick.mp3'
};

let audioCtx = null;
let isMuted = localStorage.getItem('mandamau_muted') === 'true';

function initAudio() {
    try {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(err => console.warn("Failed to resume AudioContext:", err));
        }
    } catch (e) {
        console.warn("AudioContext initialization failed:", e);
    }
}

function playSound(type) {
    if (isMuted) return;
    try {
        initAudio();
        if (audioCtx && audioCtx.state === 'running') {
            triggerSynthSound(type);
        }
    } catch (e) {
        console.warn("Audio Synthesis Error:", e);
    }
}

function triggerSynthSound(type) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    try {
        if (type === 'click') {
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(200, now);
            osc1.frequency.exponentialRampToValueAtTime(800, now + 0.06);
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(400, now);
            osc2.frequency.exponentialRampToValueAtTime(100, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.08);
            osc2.stop(now + 0.08);
        } else if (type === 'rank_up_low') {
            playArpeggio([440, 554, 659], 0.08);
        } else if (type === 'rank_up_med') {
            playArpeggio([523, 659, 784, 1046], 0.07);
        } else if (type === 'rank_up_high') {
            playArpeggio([587, 740, 880, 1175, 1480], 0.06);
        } else if (type === 'rank_up_god') {
            playArpeggio([261, 329, 392, 523, 659, 784, 1046, 1318, 1568, 2093, 2637, 3136, 4186], 0.035);
        }
    } catch(e) {}
}

function playArpeggio(freqs, interval) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    freqs.forEach((freq, index) => {
        const startTime = audioCtx.currentTime + (index * interval);
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
    });
}

function startBgMusic() {
    if (!bgMusicAudio) return;
    bgMusicAudio.volume = 0.25;
    bgMusicAudio.play().catch(() => {});
}

function pauseBgMusic() {
    if (!bgMusicAudio) return;
    bgMusicAudio.pause();
}

function resumeBgMusic() {
    if (!bgMusicAudio) return;
    startBgMusic();
}

function playTheme(fase) {
    const file = THEMES[fase];
    if (!file || !gameThemeAudio) return;
    pauseBgMusic();
    if (currentThemeFile === file && !gameThemeAudio.paused) return;
    currentThemeFile = file;
    gameThemeAudio.src = file;
    gameThemeAudio.volume = 0.55;
    gameThemeAudio.currentTime = 0;
    gameThemeAudio.play().catch(() => {});
}

function stopTheme() {
    if (!gameThemeAudio) return;
    gameThemeAudio.pause();
    gameThemeAudio.currentTime = 0;
    currentThemeFile = '';
    resumeBgMusic();
}

function fadeOutTheme(duration = 1000) {
    if (!gameThemeAudio || gameThemeAudio.paused) {
        resumeBgMusic();
        return;
    }
    const startVol = gameThemeAudio.volume;
    const steps = 20;
    const interval = duration / steps;
    const decrement = startVol / steps;
    const fade = setInterval(() => {
        if (gameThemeAudio.volume > decrement) {
            gameThemeAudio.volume -= decrement;
        } else {
            clearInterval(fade);
            gameThemeAudio.pause();
            gameThemeAudio.currentTime = 0;
            currentThemeFile = '';
            gameThemeAudio.volume = 0.55;
            resumeBgMusic();
        }
    }, interval);
}
