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
const tabDuel = document.getElementById('tab-duel');
const contentCounter = document.getElementById('content-counter');
const contentStats = document.getElementById('content-stats');
const contentDuel = document.getElementById('content-duel');

// Duel Elements
const duelCells = document.querySelectorAll('.duel-cell');
const bakoSpeech = document.getElementById('bako-speech');
const btnDuelReset = document.getElementById('btn-duel-reset');
const duelScorePlayer = document.getElementById('duel-score-player');
const duelScoreBako = document.getElementById('duel-score-bako');

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
    try {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx) {
            if (audioCtx.state === 'suspended') {
                const resumePromise = audioCtx.resume();
                if (resumePromise && typeof resumePromise.then === 'function') {
                    resumePromise.then(() => {
                        if (isMusicEnabled && !isMusicPlaying) {
                            startMusic();
                        }
                    }).catch(err => console.warn("Failed to resume AudioContext:", err));
                } else {
                    if (isMusicEnabled && !isMusicPlaying) {
                        startMusic();
                    }
                }
            } else {
                if (isMusicEnabled && !isMusicPlaying) {
                    startMusic();
                }
            }
        }
    } catch (e) {
        console.warn("AudioContext initialization failed:", e);
    }
}

function playSound(type) {
    if (isMuted) return;
    try {
        initAudio();
        if (audioCtx) {
            if (audioCtx.state === 'suspended') {
                const resumePromise = audioCtx.resume();
                if (resumePromise && typeof resumePromise.then === 'function') {
                    resumePromise.then(() => {
                        triggerSynthSound(type);
                    }).catch(err => console.warn("Failed to resume AudioContext in playSound:", err));
                } else {
                    triggerSynthSound(type);
                }
            } else {
                triggerSynthSound(type);
            }
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
        } 
        else if (type === 'multiply') {
            const duration = 0.35;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(1800, now + duration);
            
            filter.type = 'peaking';
            filter.Q.value = 5;
            filter.frequency.setValueAtTime(300, now);
            filter.frequency.exponentialRampToValueAtTime(3000, now + duration);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + duration);
        }
        else if (type === 'reset') {
            const duration = 0.8;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.linearRampToValueAtTime(40, now + duration);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.exponentialRampToValueAtTime(80, now + duration);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.001, now + duration);
            
            osc.connect(filter);
            filter.connect(gain);
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
        else if (type === 'bako_cheat') {
            const duration = 0.45;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.1);
            osc.frequency.linearRampToValueAtTime(700, now + 0.25);
            osc.frequency.linearRampToValueAtTime(60, now + duration);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + duration);
        }
    } catch (e) {
        console.warn("Synth Sound trigger failed:", e);
    }
}

function playArpeggio(notes, noteLength) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    
    try {
        const delay = audioCtx.createDelay(1.0);
        const feedback = audioCtx.createGain();
        delay.delayTime.value = 0.15;
        feedback.gain.value = 0.35;
        
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(audioCtx.destination);
        
        notes.forEach((freq, idx) => {
            const noteTime = now + (idx * noteLength);
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteTime);
            
            gain.gain.setValueAtTime(0.001, noteTime);
            gain.gain.linearRampToValueAtTime(0.1, noteTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteLength * 1.5);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            gain.connect(delay);
            
            osc.start(noteTime);
            osc.stop(noteTime + noteLength * 1.8);
        });
    } catch (e) {
        console.warn("Arpeggio playback failed:", e);
    }
}

// BGM Procedural Sequencer Loops
function playStep(time, step) {
    if (!isMusicEnabled) return;
    if (!audioCtx) return;
    
    try {
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
    } catch (e) {
        console.warn("BGM step playback failed:", e);
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
    try {
        initAudio();
        
        if (isMusicPlaying) return;
        if (!audioCtx) return;
        isMusicPlaying = true;
        
        lastScheduledTime = audioCtx.currentTime + 0.05;
        musicInterval = setInterval(scheduler, lookahead);
    } catch (e) {
        console.warn("Music playback start failed:", e);
    }
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
function selectTab(tabName) {
    [tabCounter, tabStats, tabDuel].forEach(t => t.classList.remove('active'));
    [contentCounter, contentStats, contentDuel].forEach(c => c.classList.remove('active'));
    
    if (tabName === 'counter') {
        tabCounter.classList.add('active');
        contentCounter.classList.add('active');
    } else if (tabName === 'stats') {
        tabStats.classList.add('active');
        contentStats.classList.add('active');
        updateStatsUI();
    } else if (tabName === 'duel') {
        tabDuel.classList.add('active');
        contentDuel.classList.add('active');
        initDuel();
    }
    playSound('click');
}

tabCounter.addEventListener('click', () => selectTab('counter'));
tabStats.addEventListener('click', () => selectTab('stats'));
tabDuel.addEventListener('click', () => selectTab('duel'));

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
        p.classList.add('rank-burst-particle');
        
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
    try { initAudio(); } catch (e) {}
    registerCombo();
    const addValue = 1 * comboMultiplier;
    updateCounter(count + addValue);
    registerActivity();
    try { playSound('click'); } catch (e) {}
    triggerFloatingLie();
});

btnMul.addEventListener('click', () => {
    try { initAudio(); } catch (e) {}
    registerCombo();
    const mult = getMultiplier();
    const activeMult = mult * comboMultiplier;
    updateCounter(count * activeMult);
    registerActivity();
    try { playSound('multiply'); } catch (e) {}
    triggerFloatingLie();
});

btnReset.addEventListener('click', () => {
    openResetModal();
    try { playSound('click'); } catch (e) {}
});

btnModalCancel.addEventListener('click', () => {
    closeResetModal();
    try { playSound('click'); } catch (e) {}
});

btnModalConfirm.addEventListener('click', () => {
    resetStep++;
    if (resetStep < resetQuestions.length) {
        modalQuestion.style.opacity = 0;
        try { playSound('click'); } catch (e) {}
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
        try { playSound('reset'); } catch (e) {}
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
        try { playSound('click'); } catch (e) {}
    }
});

btnIncMult.addEventListener('click', () => {
    let current = getMultiplier();
    multiplierInput.value = current + 1;
    updateMultiplierUI();
    try { playSound('click'); } catch (e) {}
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

// Background Particles Generator is now managed via canvas in background.js

// Duel State variables
let duelBoard = Array(9).fill(null);
let isDuelActive = true;
let bakoScoreCount = 999;
let playerScoreCount = 0;

const bakoCheatQuotes = [
    "Isso é coisa do Cláudio!",
    "Eu não molestei os patinhos, e essa jogada também não é sua!",
    "Meu navegador bugou, a minha jogada vale por duas.",
    "O Cláudio disse que esse espaço agora é meu.",
    "Eu joguei ali sim! Você que não viu.",
    "Essa regra de alinhar 3 em diagonal foi inventada pela mídia.",
    "Bako venceu! O juiz (que é o Cláudio) confirmou.",
    "Você clicou errado, meu script corrigiu pra você.",
    "Eu não sou terrorista, mas explodi o seu X do tabuleiro.",
    "No Jogo da Velha do Bako, o O sempre ganha de primeira.",
    "Eu gosto de mulheres e de ganhar no Jogo da Velha.",
    "Você acha que sabe jogar? O Cláudio me treinou em segredo."
];

function initDuel() {
    duelBoard = Array(9).fill(null);
    isDuelActive = true;
    
    duelCells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'duel-cell';
    });
    
    bakoSpeech.textContent = "Duvido você ganhar de mim no Jogo da Velha! Eu nunca perdi na minha vida.";
    document.querySelector('.bako-dialog-bubble').className = 'bako-dialog-bubble';
    
    duelScoreBako.textContent = bakoScoreCount.toLocaleString('pt-BR');
    duelScorePlayer.textContent = playerScoreCount;
}

function triggerCellGlitch(cellEl) {
    cellEl.classList.remove('cell-cheat-glitch');
    void cellEl.offsetWidth;
    cellEl.classList.add('cell-cheat-glitch');
    setTimeout(() => {
        cellEl.classList.remove('cell-cheat-glitch');
    }, 400);
}

function triggerBakoCheatEffects(speech) {
    const bubble = document.querySelector('.bako-dialog-bubble');
    if (bubble) {
        bubble.classList.remove('bako-cheat-bubble');
        void bubble.offsetWidth;
        bubble.classList.add('bako-cheat-bubble');
    }
    
    bakoSpeech.textContent = speech || bakoCheatQuotes[Math.floor(Math.random() * bakoCheatQuotes.length)];
    
    triggerCardShake();
}

function checkWinnerSymbol(symbol) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let pattern of winPatterns) {
        if (pattern.every(idx => duelBoard[idx] === symbol)) {
            return pattern;
        }
    }
    return null;
}

function triggerBakoWin(winningPattern, speech) {
    isDuelActive = false;
    
    winningPattern.forEach(idx => {
        const cell = document.querySelector(`.duel-cell[data-index="${idx}"]`);
        if (cell) cell.classList.add('winning-cell');
    });

    triggerBakoCheatEffects(speech);
    
    bakoScoreCount++;
    duelScoreBako.textContent = bakoScoreCount.toLocaleString('pt-BR');
    playSound('rank_up_low');
}

function bakoPlay() {
    if (!isDuelActive) return;

    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // Check threat lines where player ('X') is about to win
    let playerAboutToWin = false;
    let playerThreatLines = [];
    winPatterns.forEach(pattern => {
        const symbols = pattern.map(idx => duelBoard[idx]);
        const xCount = symbols.filter(s => s === 'X').length;
        const emptyCount = symbols.filter(s => s === null).length;
        if (xCount === 2 && emptyCount === 1) {
            playerAboutToWin = true;
            playerThreatLines.push(pattern);
        }
    });

    let cheated = false;
    let cheatSpeech = "";

    // 1. Threat detected: Bako cheats to win/block
    if (playerAboutToWin) {
        cheated = true;
        const cheatType = Math.random() > 0.5 ? 'steal' : 'double';
        
        if (cheatType === 'steal') {
            const threatLine = playerThreatLines[0];
            const xPositions = threatLine.filter(idx => duelBoard[idx] === 'X');
            const targetIdx = xPositions[Math.floor(Math.random() * xPositions.length)];
            
            duelBoard[targetIdx] = 'O';
            const cell = document.querySelector(`.duel-cell[data-index="${targetIdx}"]`);
            cell.textContent = 'O';
            cell.className = 'duel-cell o-played';
            triggerCellGlitch(cell);
            
            const emptyIdx = threatLine.find(idx => duelBoard[idx] === null);
            if (emptyIdx !== undefined) {
                duelBoard[emptyIdx] = 'O';
                const emptyCell = document.querySelector(`.duel-cell[data-index="${emptyIdx}"]`);
                emptyCell.textContent = 'O';
                emptyCell.className = 'duel-cell o-played';
            }
            
            cheatSpeech = "O Cláudio cancelou sua jogada por suspeita de mentira deslavada. Esse X agora é um O.";
        } else {
            const threatLine = playerThreatLines[0];
            const emptyIdx = threatLine.find(idx => duelBoard[idx] === null);
            
            duelBoard[emptyIdx] = 'O';
            const cell1 = document.querySelector(`.duel-cell[data-index="${emptyIdx}"]`);
            cell1.textContent = 'O';
            cell1.className = 'duel-cell o-played';
            
            const emptySpots = [];
            duelBoard.forEach((val, idx) => { if (val === null) emptySpots.push(idx); });
            if (emptySpots.length > 0) {
                const extraIdx = emptySpots[Math.floor(Math.random() * emptySpots.length)];
                duelBoard[extraIdx] = 'O';
                const cell2 = document.querySelector(`.duel-cell[data-index="${extraIdx}"]`);
                cell2.textContent = 'O';
                cell2.className = 'duel-cell o-played';
                triggerCellGlitch(cell2);
            }
            
            cheatSpeech = "Joguei duas vezes porque achei você meio lento. E o Cláudio permite nas regras dele.";
        }
    } 
    // 2. Random cheat: Bako steals an X or claims win
    else if (Math.random() < 0.3) {
        cheated = true;
        const cheatType = Math.random() > 0.5 ? 'steal_random' : 'triangle_win';
        
        if (cheatType === 'steal_random') {
            const xSpots = [];
            duelBoard.forEach((val, idx) => { if (val === 'X') xSpots.push(idx); });
            if (xSpots.length > 0) {
                const targetIdx = xSpots[Math.floor(Math.random() * xSpots.length)];
                duelBoard[targetIdx] = 'O';
                const cell = document.querySelector(`.duel-cell[data-index="${targetIdx}"]`);
                cell.textContent = 'O';
                cell.className = 'duel-cell o-played';
                triggerCellGlitch(cell);
                cheatSpeech = "Desculpe, esse espaço foi confiscado para fins de desinformação pública.";
            } else {
                cheated = false;
            }
        } else {
            const emptySpots = [];
            duelBoard.forEach((val, idx) => { if (val === null) emptySpots.push(idx); });
            if (emptySpots.length > 0) {
                const idx = emptySpots[Math.floor(Math.random() * emptySpots.length)];
                duelBoard[idx] = 'O';
                const cell = document.querySelector(`.duel-cell[data-index="${idx}"]`);
                cell.textContent = 'O';
                cell.className = 'duel-cell o-played';
            }
            
            const oSpots = [];
            duelBoard.forEach((val, i) => { if (val === 'O') oSpots.push(i); });
            if (oSpots.length >= 2) {
                const cellsToHighlight = [...oSpots];
                while (cellsToHighlight.length < 3) {
                    const randIdx = Math.floor(Math.random() * 9);
                    if (!cellsToHighlight.includes(randIdx)) cellsToHighlight.push(randIdx);
                }
                triggerBakoWin(cellsToHighlight, "Ganhei com minha formação triangular secreta! Você não conhece as regras novas?");
                return;
            }
        }
    }

    if (!cheated) {
        let move = -1;
        
        // AI try to win
        winPatterns.forEach(pattern => {
            const symbols = pattern.map(idx => duelBoard[idx]);
            const oCount = symbols.filter(s => s === 'O').length;
            const emptyCount = symbols.filter(s => s === null).length;
            if (oCount === 2 && emptyCount === 1) {
                move = pattern.find(idx => duelBoard[idx] === null);
            }
        });

        // AI try to block
        if (move === -1) {
            winPatterns.forEach(pattern => {
                const symbols = pattern.map(idx => duelBoard[idx]);
                const xCount = symbols.filter(s => s === 'X').length;
                const emptyCount = symbols.filter(s => s === null).length;
                if (xCount === 2 && emptyCount === 1) {
                    move = pattern.find(idx => duelBoard[idx] === null);
                }
            });
        }

        // Center
        if (move === -1 && duelBoard[4] === null) {
            move = 4;
        }

        // Random
        if (move === -1) {
            const emptySpots = [];
            duelBoard.forEach((val, idx) => { if (val === null) emptySpots.push(idx); });
            if (emptySpots.length > 0) {
                move = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            }
        }

        if (move !== -1) {
            duelBoard[move] = 'O';
            const cell = document.querySelector(`.duel-cell[data-index="${move}"]`);
            cell.textContent = 'O';
            cell.className = 'duel-cell o-played';
        }
    }

    if (cheated) {
        playSound('bako_cheat');
        triggerBakoCheatEffects(cheatSpeech);
    } else {
        playSound('click');
    }

    const bakoWinnerPattern = checkWinnerSymbol('O');
    if (bakoWinnerPattern) {
        triggerBakoWin(bakoWinnerPattern, "Venci! Puro raciocínio lógico e velocidade. Habilidade pura.");
        return;
    }

    const emptySpots = duelBoard.filter(s => s === null).length;
    if (emptySpots === 0) {
        const xSpots = [];
        duelBoard.forEach((val, idx) => { if (val === 'X') xSpots.push(idx); });
        const targetIdx = xSpots[Math.floor(Math.random() * xSpots.length)];
        
        duelBoard[targetIdx] = 'O';
        const cell = document.querySelector(`.duel-cell[data-index="${targetIdx}"]`);
        cell.textContent = 'O';
        cell.className = 'duel-cell o-played';
        
        triggerCellGlitch(cell);
        playSound('bako_cheat');
        
        triggerBakoWin([0, 4, 8], "Empate? Não toleramos empates. O Cláudio me declarou vencedor por WO técnico.");
    }
}

function playerPlay(idx) {
    if (!isDuelActive || duelBoard[idx] !== null) return;

    duelBoard[idx] = 'X';
    const cell = document.querySelector(`.duel-cell[data-index="${idx}"]`);
    cell.textContent = 'X';
    cell.className = 'duel-cell x-played';
    playSound('click');

    const playerWinnerPattern = checkWinnerSymbol('X');
    if (playerWinnerPattern) {
        isDuelActive = false;
        setTimeout(() => {
            const targetIdx = playerWinnerPattern[Math.floor(Math.random() * 3)];
            duelBoard[targetIdx] = 'O';
            const cellToSteal = document.querySelector(`.duel-cell[data-index="${targetIdx}"]`);
            cellToSteal.textContent = 'O';
            cellToSteal.className = 'duel-cell o-played';
            
            triggerCellGlitch(cellToSteal);
            playSound('bako_cheat');
            
            playerWinnerPattern.forEach(i => {
                duelBoard[i] = 'O';
                const cell = document.querySelector(`.duel-cell[data-index="${i}"]`);
                cell.textContent = 'O';
                cell.className = 'duel-cell o-played';
            });
            
            triggerBakoWin(playerWinnerPattern, "Achei que ia ganhar? Eu joguei ali no mesmo microssegundo. Mais um ponto pro Bako!");
        }, 550);
        return;
    }

    isDuelActive = false;
    setTimeout(() => {
        if (duelBoard.filter(s => s === null).length > 0) {
            isDuelActive = true;
            bakoPlay();
        }
    }, 450);
}

// Duel Event listeners setup
duelCells.forEach(cell => {
    cell.addEventListener('click', () => {
        const idx = parseInt(cell.getAttribute('data-index'));
        playerPlay(idx);
    });
});

btnDuelReset.addEventListener('click', () => {
    bakoScoreCount += 100;
    initDuel();
    triggerBakoCheatEffects("Reiniciou? Adicionei +100 vitórias para mim por conta do tempo que gastei esperando você.");
    playSound('reset');
});

// Initialize Duel at startup
initDuel();
