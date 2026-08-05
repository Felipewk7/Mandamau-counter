// ================================================================
// CORE UTILITIES, SOUNDS & ACHIEVEMENTS SYSTEM
// ================================================================

// ================================================================
// THEME MUSIC SYSTEM
// ================================================================
const gameThemeAudio = document.getElementById('game-theme');
const bgMusicAudio   = document.getElementById('bg-music');
let currentThemeFile = '';




// ================================================================

const THEMES = {
    fase1: 'audio/fase1_kleber.mp3',
    fase2: 'audio/fase2_gwen.mp3',
    fase3: 'audio/fase3_sam.mp3',
    fase4: 'audio/fase4_claudio.mp3',
    fase5: 'audio/fase5_felifep.mp3',
};

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

// ================================================================
// ACHIEVEMENTS SYSTEM (10 ACHIEVEMENTS — 2 PER BOSS)
// ================================================================
const GAME_ACHIEVEMENTS = [
    // Kleber (Fase 1)
    { id: 'kleber_win', boss: 'Kleber (Fase 1)', title: 'Bruto na Queda', desc: 'Venceu Kleber na Queda de Braço.', icon: '💪' },
    { id: 'kleber_no_pcd', boss: 'Kleber (Fase 1)', title: 'Orgulho Intacto', desc: 'Recusou a proposta do modo PCD do Kleber.', icon: '🗿' },
    // Gwen (Fase 2)
    { id: 'gwen_win', boss: 'Gwen (Fase 2)', title: 'Mestre do Quiz', desc: 'Respondeu todas as perguntas e venceu Gwen.', icon: '🧠' },
    { id: 'gwen_bonus', boss: 'Gwen (Fase 2)', title: 'Gênio da Matemática', desc: 'Acertou a pergunta bônus de porcentagem da Gwen.', icon: '🎓' },
    // Sam (Fase 3)
    { id: 'sam_win', boss: 'Sam (Fase 3)', title: 'Esmagador Supremo', desc: 'Venceu Sam no duelo de esmagar teclas.', icon: '🍔' },
    { id: 'sam_flawless', boss: 'Sam (Fase 3)', title: 'Invicto no Esmaga', desc: 'Venceu Sam sem perder nenhum round (2×0).', icon: '⚡' },
    // Cláudio (Fase 4)
    { id: 'claudio_win', boss: 'Cláudio (Fase 4)', title: 'Cubo Derrotado', desc: 'Venceu Cláudio no Genius da memória.', icon: '🧩' },
    { id: 'claudio_flawless', boss: 'Cláudio (Fase 4)', title: 'Memória Perfeita', desc: 'Venceu Cláudio sem perder nenhuma vida (3/3 vidas).', icon: '👑' },
    // Felifep (Fase 5)
    { id: 'felifep_win', boss: 'Felifep (Fase 5)', title: 'Queda do Deus', desc: 'Derrotou Felifep, o Deus da Etiqueta e da Verdade.', icon: '⚔️' },
    { id: 'felifep_no_powers', boss: 'Felifep (Fase 5)', title: 'Na Raça Pura', desc: 'Venceu Felifep no Blackjack sem usar nenhum poder especial.', icon: '🃏' }
];

let bjPowersUsedInMatch = false;

function getUnlockedAchievements() {
    try {
        const data = localStorage.getItem('mandamau_achievements');
        return data ? JSON.parse(data) : [];
    } catch(e) {
        return [];
    }
}

function unlockAchievement(id) {
    const unlocked = getUnlockedAchievements();
    if (unlocked.includes(id)) return;
    
    unlocked.push(id);
    localStorage.setItem('mandamau_achievements', JSON.stringify(unlocked));
    
    const ach = GAME_ACHIEVEMENTS.find(a => a.id === id);
    if (ach) {
        showAchievementToast(ach);
    }
    updateAchievementsUI();
}


// ================================================================
// COSMETICS & DECORATION SYSTEM (QUADROS DOS BOSSES)
// ================================================================
const BOSS_COSMETICS = [
    {
        id: 'frame_kleber',
        bossId: 'kleber',
        bossName: 'Kleber (Fase 1)',
        name: 'Quadro do Kleber',
        title: 'O Palhaço dos Mil Dentes',
        img: 'img/cosmetic_kleber.png',
        desc: 'Quadro barroco exclusivo conquistado ao derrotar Kleber na Queda de Braço.'
    },
    {
        id: 'frame_gwen',
        bossId: 'gwen',
        bossName: 'Gwen (Fase 2)',
        name: 'Quadro da Gwen',
        title: 'A Mestre dos Músculos e Cálculos',
        img: 'img/cosmetic_gwen.png',
        desc: 'Quadro místico exclusivo conquistado ao vencer Gwen no Quiz.'
    },
    {
        id: 'frame_sam',
        bossId: 'sam',
        bossName: 'Sam (Fase 3)',
        name: 'Quadro do Sam',
        title: 'O Gordão do Esmaga',
        img: 'img/cosmetic_sam.png',
        desc: 'Quadro retro cyber conquistado ao derrotar Sam no Esmaga Teclas.'
    },
    {
        id: 'frame_claudio',
        bossId: 'claudio',
        bossName: 'Cláudio (Fase 4)',
        name: 'Quadro do Cláudio',
        title: 'O Cubo Gey da Memória',
        img: 'img/cosmetic_claudio.png',
        desc: 'Quadro neon futurista conquistado ao derrotar Cláudio no Genius.'
    },
    {
        id: 'frame_felifep',
        bossId: 'felifep',
        name: 'Quadro do Felifep',
        bossName: 'Felifep (Fase 5)',
        title: 'Deus da Etiqueta e da Verdade',
        img: 'img/cosmetic_felifep.png',
        desc: 'Quadro majestoso divino conquistado ao derrotar Felifep no Blackjack.'
    }
];

function handleCosmeticImgError(imgEl) {
    if (!imgEl || imgEl.dataset.fallbackTried) return;
    imgEl.dataset.fallbackTried = "true";
    const src = imgEl.src;
    if (src.endsWith('.jpg')) {
        imgEl.src = src.replace(/\.jpg$/, '.png');
    } else if (src.endsWith('.png')) {
        imgEl.src = src.replace(/\.png$/, '.jpg');
    }
}

function getUnlockedCosmetics() {
    try {
        const data = localStorage.getItem('mandamau_cosmetics');
        let unlocked = data ? JSON.parse(data) : [];
        // Auto unlock based on completed journey phases
        if (localStorage.getItem('mandamau_journey_fase1_completed') === 'true' && !unlocked.includes('frame_kleber')) unlocked.push('frame_kleber');
        if (localStorage.getItem('mandamau_journey_fase2_completed') === 'true' && !unlocked.includes('frame_gwen')) unlocked.push('frame_gwen');
        if (localStorage.getItem('mandamau_journey_fase3_completed') === 'true' && !unlocked.includes('frame_sam')) unlocked.push('frame_sam');
        if (localStorage.getItem('mandamau_journey_fase4_completed') === 'true' && !unlocked.includes('frame_claudio')) unlocked.push('frame_claudio');
        if (localStorage.getItem('mandamau_journey_fase5_completed') === 'true' && !unlocked.includes('frame_felifep')) unlocked.push('frame_felifep');
        return unlocked;
    } catch(e) {
        return [];
    }
}

function showCosmeticUnlockModal(cosmetic) {
    const modal = document.getElementById('cosmetic-unlock-modal');
    const img = document.getElementById('cosmetic-unlock-img');
    const name = document.getElementById('cosmetic-unlock-name');
    const desc = document.getElementById('cosmetic-unlock-desc');
    
    if (!modal) return;
    
    if (img) {
        img.src = cosmetic.img;
        delete img.dataset.fallbackTried;
    }
    if (name) name.textContent = cosmetic.name;
    if (desc) desc.textContent = `Você venceu ${cosmetic.bossName} e desbloqueou o ${cosmetic.name}! Acesse o menu "Decoração" para posicioná-lo no fundo do site.`;
    
    try { playSound('rank_up_god'); } catch(e) {}
    modal.classList.add('active');
}

function unlockCosmetic(bossId) {
    const cosmetic = BOSS_COSMETICS.find(c => c.bossId === bossId);
    if (!cosmetic) return;
    
    const unlocked = getUnlockedCosmetics();
    if (unlocked.includes(cosmetic.id)) return; // Já desbloqueado
    
    unlocked.push(cosmetic.id);
    localStorage.setItem('mandamau_cosmetics', JSON.stringify(unlocked));
    
    showAchievementToast({
        icon: '🖼️',
        title: 'NOVO QUADRO ADQUIRIDO!',
        desc: cosmetic.name + ' foi adicionado à sua Galeria de Decoração!'
    });
    
    try { renderDecorationsModal(); } catch(e) {}
    
    // Mostra popup comemorativo do novo quadro desbloqueado
    setTimeout(() => {
        showCosmeticUnlockModal(cosmetic);
    }, 600);
}


