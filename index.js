// DMC Ranks Configuration
const ranks = [
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
    "Isso é coisa do Cláudio",
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
const contentCounter = document.getElementById('content-counter');
const contentStats = document.getElementById('content-stats');

// Theme, Sound, and Music controls elements
const themeBtns = document.querySelectorAll('.theme-btn');
const btnSound = document.getElementById('btn-sound');
const soundIconOn = document.getElementById('sound-icon-on');
const soundIconOff = document.getElementById('sound-icon-off');
const btnMusic = document.getElementById('btn-music');
const musicIconOn = document.getElementById('music-icon-on');
const musicIconOff = document.getElementById('music-icon-off');

// Audio System (Web Audio Synth)
let audioCtx = null;
let isMuted = localStorage.getItem('mandamau_muted') === 'true';
let isMusicPlaying = false;
let isMusicEnabled = localStorage.getItem('mandamau_music') === 'true';
let musicInterval = null;
let currentStep = 0;
let bpm = 100;
let lastScheduledTime = 0;
const lookahead = 25.0; // ms
const scheduleAheadTime = 0.1; // seconds

// Procedural Scales (Bass & Melody loops)
const bassScale = [110.00, 110.00, 130.81, 146.83, 164.81, 164.81, 146.83, 130.81];
const melodyScale = [220.00, 0, 261.63, 293.66, 329.63, 0, 293.66, 261.63];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            if (isMusicEnabled && !isMusicPlaying) {
                startMusic();
            }
        });
    } else {
        if (isMusicEnabled && !isMusicPlaying) {
            startMusic();
        }
    }
}

function playSound(type) {
    if (isMuted) return;
    try {
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                triggerSynthSound(type);
            });
        } else {
            triggerSynthSound(type);
        }
    } catch (e) {
        console.error("Audio Synthesis Error:", e);
    }
}

function triggerSynthSound(type) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    
    if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.002, now + 0.08);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + 0.08);
    } 
    else if (type === 'multiply') {
        const duration = 0.2;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + duration);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.002, now + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + duration);
    }
    else if (type === 'reset') {
        const duration = 0.55;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.linearRampToValueAtTime(50, now + duration);
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + duration);
    }
    else if (type === 'rank_up_low') {
        playArpeggio([440, 554, 659], 0.08);
    }
    else if (type === 'rank_up_med') {
        playArpeggio([523, 659, 784, 1046], 0.07);
    }
    else if (type === 'rank_up_high') {
        playArpeggio([587, 740, 880, 1175, 1480], 0.06);
    }
    else if (type === 'rank_up_god') {
        playArpeggio([261, 329, 392, 523, 659, 784, 1046, 1318, 1568, 2093, 2637, 3136, 4186], 0.035);
    }
}

function playArpeggio(notes, noteLength) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    notes.forEach((freq, idx) => {
        const noteTime = now + (idx * noteLength);
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);
        
        const vibrato = audioCtx.createOscillator();
        const vibratoGain = audioCtx.createGain();
        vibrato.frequency.value = 14; 
        vibratoGain.gain.value = 6; 
        
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.12, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.003, noteTime + noteLength * 1.8);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        vibrato.start(noteTime);
        osc.start(noteTime);
        
        vibrato.stop(noteTime + noteLength * 1.8);
        osc.stop(noteTime + noteLength * 1.8);
    });
}

// BGM Procedural Sequencer Loops
function playStep(time, step) {
    if (!isMusicEnabled) return;
    
    const stepDuration = 60.0 / bpm / 2; // eighth notes
    
    // Bassline (Square/Triangle wave)
    const bassFreq = bassScale[step % bassScale.length];
    if (bassFreq > 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bassFreq, time);
        
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.07, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration - 0.01);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(time);
        osc.stop(time + stepDuration);
    }
    
    // Dynamic Melody (Plays if Rank >= C or Combo active >= 3)
    const matchedRankIndex = ranks.findIndex(r => count >= r.min);
    const isRankCPlus = matchedRankIndex !== -1 && ranks[matchedRankIndex].min >= 500;
    const isComboActive = comboCount >= 3;
    
    if (isRankCPlus || isComboActive) {
        const melodyFreq = melodyScale[step % melodyScale.length];
        if (melodyFreq > 0) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(melodyFreq, time);
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, time);
            
            gain.gain.setValueAtTime(0.001, time);
            gain.gain.linearRampToValueAtTime(0.02, time + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 0.7);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(time);
            osc.stop(time + stepDuration);
        }
    }
}

function scheduler() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    while (lastScheduledTime < audioCtx.currentTime + scheduleAheadTime) {
        playStep(lastScheduledTime, currentStep);
        
        const stepDuration = 60.0 / bpm / 2; // eighth notes
        lastScheduledTime += stepDuration;
        currentStep = (currentStep + 1) % 16;
    }
}

function startMusic() {
    if (!isMusicEnabled) return;
    initAudio();
    
    if (isMusicPlaying) return;
    isMusicPlaying = true;
    
    lastScheduledTime = audioCtx.currentTime + 0.05;
    musicInterval = setInterval(scheduler, lookahead);
}

function stopMusic() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
    isMusicPlaying = false;
}

function updateMusicBPM() {
    // bpm increases based on active combo (max x5.0 combo -> 160bpm)
    bpm = 100 + (comboMultiplier - 1.0) * 15;
}

function updateSoundUI() {
    if (isMuted) {
        soundIconOn.style.display = 'none';
        soundIconOff.style.display = 'block';
        btnSound.style.opacity = '0.5';
    } else {
        soundIconOn.style.display = 'block';
        soundIconOff.style.display = 'none';
        btnSound.style.opacity = '1';
    }
}

function updateMusicUI() {
    if (isMusicEnabled) {
        musicIconOn.style.display = 'block';
        musicIconOff.style.display = 'none';
        btnMusic.style.opacity = '1';
        if (audioCtx && audioCtx.state === 'running') {
            startMusic();
        }
    } else {
        musicIconOn.style.display = 'none';
        musicIconOff.style.display = 'block';
        btnMusic.style.opacity = '0.5';
        stopMusic();
    }
}

btnSound.addEventListener('click', () => {
    isMuted = !isMuted;
    localStorage.setItem('mandamau_muted', isMuted);
    updateSoundUI();
    if (!isMuted) {
        playSound('click');
    }
});

btnMusic.addEventListener('click', () => {
    isMusicEnabled = !isMusicEnabled;
    localStorage.setItem('mandamau_music', isMusicEnabled);
    updateMusicUI();
    if (isMusicEnabled) {
        initAudio();
    }
});

// Theme Manager
function setTheme(themeName) {
    document.body.classList.remove('theme-cosmic', 'theme-cyberpunk', 'theme-infernal', 'theme-synthwave', 'theme-gold');
    document.body.classList.add(`theme-${themeName}`);
    
    themeBtns.forEach(btn => {
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    localStorage.setItem('mandamau_theme', themeName);
}

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-theme');
        setTheme(selected);
        playSound('click');
    });
});

function initTheme() {
    const saved = localStorage.getItem('mandamau_theme') || 'cosmic';
    setTheme(saved);
}

// Tab Navigation
tabCounter.addEventListener('click', () => {
    tabCounter.classList.add('active');
    tabStats.classList.remove('active');
    contentCounter.classList.add('active');
    contentStats.classList.remove('active');
    playSound('click');
});

tabStats.addEventListener('click', () => {
    tabStats.classList.add('active');
    tabCounter.classList.remove('active');
    contentStats.classList.add('active');
    contentCounter.classList.remove('active');
    updateStatsUI();
    playSound('click');
});

// Style Combo calculations
function registerCombo() {
    if (comboTimer) {
        clearTimeout(comboTimer);
    }
    
    comboCount++;
    comboMultiplier = Math.min(5.0, 1.0 + (comboCount - 1) * 0.1);
    
    const comboContainer = document.getElementById('combo-container');
    const comboBadge = document.getElementById('combo-badge');
    
    if (comboCount >= 2) {
        comboContainer.style.display = 'flex';
        comboBadge.textContent = `Combo x${comboMultiplier.toFixed(1)}`;
        
        comboBadge.classList.remove('combo-active');
        void comboBadge.offsetWidth;
        comboBadge.classList.add('combo-active');
    }
    
    updateMusicBPM();
    
    comboTimer = setTimeout(() => {
        resetCombo();
    }, 1500);
}

// Resets Combo count and animation
function resetCombo() {
    comboCount = 0;
    comboMultiplier = 1.0;
    
    const comboContainer = document.getElementById('combo-container');
    const comboBadge = document.getElementById('combo-badge');
    
    if (comboContainer) {
        comboContainer.style.display = 'none';
    }
    if (comboBadge) {
        comboBadge.classList.remove('combo-active');
    }
    
    updateMusicBPM();
}

// Spawns Bako's floating lie phrase bubble
function triggerFloatingLie() {
    // 30% chance of appearing
    if (Math.random() >= 0.3) return;

    const phrase = bakoPhrases[Math.floor(Math.random() * bakoPhrases.length)];
    
    const el = document.createElement('div');
    el.className = 'floating-lie';
    el.innerHTML = `Bako: "${phrase}"`;
    
    // Random viewport position with safe margin
    const margin = 80;
    const x = margin + Math.random() * (window.innerWidth - margin * 2);
    const y = margin + Math.random() * (window.innerHeight - margin * 2);
    
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    
    document.body.appendChild(el);
    
    setTimeout(() => {
        el.remove();
    }, 1400);
}

// Format static numbers (used in stats panel)
function formatNumber(num) {
    const absNum = Math.abs(num);
    if (absNum < 1e6) {
        return num.toLocaleString('pt-BR');
    } else {
        const exponent = Math.floor(Math.log10(absNum));
        const mantissa = num / Math.pow(10, exponent);
        const roundedMantissa = Math.round(mantissa * 1000) / 1000;
        return `${roundedMantissa} &times; 10<sup>${exponent}</sup>`;
    }
}

// Mathematical Equation Generator for large numbers
function generateMathEquation(num) {
    const absNum = Math.abs(num);
    if (absNum < 1e6) {
        return num.toLocaleString('pt-BR');
    }
    
    const equations = [
        // Scientific Notation
        () => {
            const exponent = Math.floor(Math.log10(absNum));
            const mantissa = num / Math.pow(10, exponent);
            const roundedMantissa = Math.round(mantissa * 1000) / 1000;
            return `${roundedMantissa} &times; 10<sup>${exponent}</sup>`;
        },
        // Factorization: (a * b) + c
        () => {
            const a = Math.floor(Math.random() * 8) + 3; // 3 to 10
            const b = Math.floor(num / a);
            const c = Math.round((num % a) * 100) / 100;
            return `(${a} &times; ${b.toLocaleString('pt-BR')}) + ${c}`;
        },
        // Power of 2: 2^p + diff
        () => {
            const p = Math.floor(Math.log2(num));
            const base2Val = Math.pow(2, p);
            const diff = Math.round((num - base2Val) * 100) / 100;
            return `2<sup>${p}</sup> + ${diff.toLocaleString('pt-BR')}`;
        },
        // Integral Calculus
        () => {
            const half = Math.round((num / 2) * 100) / 100;
            return `&int;<sub>0</sub><sup>${half.toLocaleString('pt-BR')}</sup> 2 dt`;
        },
        // Limit to Infinity
        () => {
            const formatted = num.toLocaleString('pt-BR');
            return `lim<sub>x&rarr;&infin;</sub> (${formatted}x + 42) / x`;
        }
    ];
    
    const randomIndex = Math.floor(Math.random() * equations.length);
    return equations[randomIndex]();
}

// Dynamically adjust font size to prevent overflow
function adjustFontSize() {
    const visibleText = counterEl.textContent || counterEl.innerText || "";
    const len = visibleText.length;
    
    let fontSize = '5.5rem';
    if (len > 16) {
        fontSize = '1.8rem';
    } else if (len > 12) {
        fontSize = '2.4rem';
    } else if (len > 10) {
        fontSize = '3.0rem';
    } else if (len > 8) {
        fontSize = '3.6rem';
    } else if (len > 6) {
        fontSize = '4.5rem';
    }
    
    if (window.innerWidth <= 480) {
        if (len > 16) {
            fontSize = '1.4rem';
        } else if (len > 12) {
            fontSize = '1.8rem';
        } else if (len > 10) {
            fontSize = '2.2rem';
        } else if (len > 8) {
            fontSize = '2.6rem';
        } else if (len > 6) {
            fontSize = '3.2rem';
        } else {
            fontSize = '4.0rem';
        }
    }
    
    counterEl.style.fontSize = fontSize;
}

// Statistics Handling
function loadStats() {
    highScore = parseFloat(localStorage.getItem('mandamau_highscore')) || 0;
    totalClicks = parseInt(localStorage.getItem('mandamau_totalclicks')) || 0;
    const savedLast = localStorage.getItem('mandamau_lasttime');
    if (savedLast) {
        lastLieTimestamp = new Date(savedLast);
    }
    updateStatsUI();
}

function saveStats() {
    localStorage.setItem('mandamau_highscore', highScore);
    localStorage.setItem('mandamau_totalclicks', totalClicks);
    if (lastLieTimestamp) {
        localStorage.setItem('mandamau_lasttime', lastLieTimestamp.toISOString());
    } else {
        localStorage.removeItem('mandamau_lasttime');
    }
}

function registerActivity() {
    totalClicks++;
    lastLieTimestamp = new Date();
    
    const now = Date.now();
    lieTimes.push(now);
    lieTimes = lieTimes.filter(t => now - t < 60000);
    
    if (count > highScore) {
        highScore = count;
    }
    
    saveStats();
    updateStatsUI();
}

function updateLPM() {
    const now = Date.now();
    lieTimes = lieTimes.filter(t => now - t < 60000);
    const lpm = lieTimes.length;
    document.getElementById('stat-lpm').textContent = lpm.toFixed(1);
}

function updateStatsUI() {
    document.getElementById('stat-high-score').innerHTML = formatNumber(highScore);
    document.getElementById('stat-total-clicks').textContent = totalClicks.toLocaleString('pt-BR');
    
    if (lastLieTimestamp) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        document.getElementById('stat-last-time').textContent = lastLieTimestamp.toLocaleString('pt-BR', options);
    } else {
        document.getElementById('stat-last-time').textContent = 'Nenhuma ainda';
    }
    updateLPM();
}

// Active timer update interval
setInterval(() => {
    if (lastLieTimestamp) {
        const diffMs = Date.now() - lastLieTimestamp.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        
        let displayStr = `${diffSecs}s`;
        if (diffSecs >= 3600) {
            const hrs = Math.floor(diffSecs / 3600);
            const mins = Math.floor((diffSecs % 3600) / 60);
            const secs = diffSecs % 60;
            displayStr = `${hrs}h ${mins}m ${secs}s`;
        } else if (diffSecs >= 60) {
            const mins = Math.floor(diffSecs / 60);
            const secs = diffSecs % 60;
            displayStr = `${mins}m ${secs}s`;
        }
        document.getElementById('stat-time-since').textContent = displayStr;
    } else {
        document.getElementById('stat-time-since').textContent = '---';
    }
    updateLPM();
}, 1000);

// Load persisted state on startup
function loadSavedState() {
    const savedMultiplier = localStorage.getItem('mandamau_multiplier');
    if (savedMultiplier !== null) {
        multiplierInput.value = savedMultiplier;
    }

    const savedCount = localStorage.getItem('mandamau_count');
    if (savedCount !== null) {
        const parsed = parseFloat(savedCount);
        if (!isNaN(parsed)) {
            count = parsed;
        }
    }
    
    counterEl.innerHTML = generateMathEquation(count);
    adjustFontSize();
    updateStyleRank(true);
}

function getMultiplier() {
    let val = parseFloat(multiplierInput.value);
    if (isNaN(val) || val <= 0) {
        return 2; 
    }
    return val;
}

function updateMultiplierUI() {
    let val = multiplierInput.value;
    if (val === '' || isNaN(parseFloat(val))) {
        btnMulText.textContent = `Multiplicar (x2)`;
    } else {
        btnMulText.textContent = `Multiplicar (x${val})`;
        localStorage.setItem('mandamau_multiplier', val);
    }
}

function updateCounter(newValue) {
    if (!Number.isInteger(newValue)) {
        count = Math.round(newValue * 100) / 100;
    } else {
        count = newValue;
    }
    
    localStorage.setItem('mandamau_count', count);
    
    counterEl.innerHTML = generateMathEquation(count);
    adjustFontSize();
    
    counterEl.classList.remove('counter-pop');
    void counterEl.offsetWidth; 
    counterEl.classList.add('counter-pop');
    
    setTimeout(() => {
        counterEl.classList.remove('counter-pop');
    }, 150);

    updateStyleRank();
}

function triggerCardShake() {
    const card = document.querySelector('.card');
    card.classList.remove('card-shake');
    void card.offsetWidth; 
    card.classList.add('card-shake');
    setTimeout(() => {
        card.classList.remove('card-shake');
    }, 300);
}

function triggerScreenFlash(flashColor) {
    const flash = document.getElementById('screen-flash');
    flash.style.background = flashColor;
    flash.style.opacity = '0.35';
    
    flash.style.transition = 'none';
    void flash.offsetWidth; 
    
    flash.style.transition = 'opacity 0.5s cubic-bezier(0.1, 0.8, 0.3, 1)';
    flash.style.opacity = '0';
}

function triggerRankBurst(colorClass) {
    const badge = document.getElementById('rank-badge');
    const rect = badge.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const particleCount = 45; 

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.position = 'fixed';
        p.style.pointerEvents = 'none';
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 140 + 60; 
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        const size = Math.random() * 12 + 6; 
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        
        if (colorClass === 'rank-sss') {
            p.style.background = `hsl(${Math.random() * 360}, 100%, 65%)`; 
        } else if (colorClass === 'rank-ss') {
            p.style.background = '#ec4899';
        } else if (colorClass === 'rank-s') {
            p.style.background = '#a855f7';
        } else if (colorClass === 'rank-a') {
            p.style.background = '#eab308';
        } else if (colorClass === 'rank-b') {
            p.style.background = '#06b6d4';
        } else if (colorClass === 'rank-c') {
            p.style.background = '#10b981';
        } else {
            p.style.background = '#94a3b8';
        }
        
        p.style.boxShadow = `0 0 15px currentColor`;
        p.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%'; 
        
        const rot = Math.random() * 720 - 360;
        const anim = p.animate([
            { transform: 'translate(0, 0) scale(1.5) rotate(0deg)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0) rotate(${rot}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 600 + 400,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        });
        
        document.body.appendChild(p);
        anim.onfinish = () => p.remove();
    }
}

function updateStyleRank(isInitialLoad = false) {
    const matchedIndex = ranks.findIndex(r => count >= r.min);
    const rankContainer = document.getElementById('rank-container');
    const rankBadge = document.getElementById('rank-badge');
    const rankName = document.getElementById('rank-name');

    if (matchedIndex !== -1) {
        const rank = ranks[matchedIndex];
        
        if (matchedIndex !== currentRankIndex) {
            if (rankAnimTimeout) clearTimeout(rankAnimTimeout);
            
            rankBadge.textContent = rank.letter;
            rankName.textContent = rank.name;
            
            if (isInitialLoad) {
                rankBadge.className = `rank-badge ${rank.class} ${rank.idleClass}`;
            } else {
                rankBadge.className = `rank-badge ${rank.class} rank-bounce`;
                triggerCardShake();
                triggerRankBurst(rank.class);
                triggerScreenFlash(rank.flashColor);
                if (rank.sound) {
                    playSound(rank.sound);
                }
                
                rankAnimTimeout = setTimeout(() => {
                    rankBadge.classList.remove('rank-bounce');
                    rankBadge.classList.add(rank.idleClass);
                }, 500);
            }
            
            currentRankIndex = matchedIndex;
        }
        rankContainer.classList.add('active');
    } else {
        rankContainer.classList.remove('active');
        if (rankAnimTimeout) clearTimeout(rankAnimTimeout);
        rankBadge.className = 'rank-badge';
        currentRankIndex = -1;
    }
}

function openResetModal() {
    resetStep = 0;
    modalQuestion.textContent = resetQuestions[resetStep];
    modalContainer.classList.add('active');
}

function closeResetModal() {
    modalContainer.classList.remove('active');
}

// Event Listeners
btnSum.addEventListener('click', () => {
    initAudio();
    registerCombo();
    const addValue = 1 * comboMultiplier;
    updateCounter(count + addValue);
    registerActivity();
    playSound('click');
    triggerFloatingLie();
});

btnMul.addEventListener('click', () => {
    initAudio();
    registerCombo();
    const mult = getMultiplier();
    const activeMult = mult * comboMultiplier;
    updateCounter(count * activeMult);
    registerActivity();
    playSound('multiply');
    triggerFloatingLie();
});

btnReset.addEventListener('click', () => {
    openResetModal();
    playSound('click');
});

btnModalCancel.addEventListener('click', () => {
    closeResetModal();
    playSound('click');
});

btnModalConfirm.addEventListener('click', () => {
    resetStep++;
    if (resetStep < resetQuestions.length) {
        modalQuestion.style.opacity = 0;
        playSound('click');
        setTimeout(() => {
            modalQuestion.textContent = resetQuestions[resetStep];
            modalQuestion.style.opacity = 1;
        }, 150);
    } else {
        updateCounter(0);
        totalClicks = 0;
        lastLieTimestamp = null;
        lieTimes = [];
        resetCombo();
        saveStats();
        updateStatsUI();
        
        closeResetModal();
        playSound('reset');
    }
});

multiplierInput.addEventListener('input', () => {
    updateMultiplierUI();
});

btnDecMult.addEventListener('click', () => {
    let current = getMultiplier();
    if (current > 1) {
        multiplierInput.value = current - 1;
        updateMultiplierUI();
        playSound('click');
    }
});

btnIncMult.addEventListener('click', () => {
    let current = getMultiplier();
    multiplierInput.value = current + 1;
    updateMultiplierUI();
    playSound('click');
});

window.addEventListener('resize', () => {
    adjustFontSize();
});

// Initialize UI & State
initTheme();
loadSavedState();
loadStats();
updateMultiplierUI();
updateSoundUI();
updateMusicUI();

// Background Particles Generator
const particlesContainer = document.getElementById('particles');
const particleCount = 15;

for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    const size = Math.random() * 6 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = Math.random() * 10 + 10;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    
    if (Math.random() > 0.5) {
        particle.style.background = Math.random() > 0.5 ? 'rgba(6, 182, 212, 0.3)' : 'rgba(217, 70, 239, 0.3)';
        particle.style.boxShadow = '0 0 8px currentColor';
    }
    
    particlesContainer.appendChild(particle);
}
