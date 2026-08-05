// ================================================================


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

let toastTimeout = null;
function showAchievementToast(ach) {
    const toast = document.getElementById('achievement-toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');
    
    if (!toast || !toastTitle) return;
    
    toastIcon.textContent = ach.icon || '🏆';
    toastTitle.textContent = ach.title;
    toastDesc.textContent = ach.desc;
    
    try { playSound('rank_up_god'); } catch(e) {}
    
    toast.classList.add('visible');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
    }, 4500);
}

function updateAchievementsUI() {
    const unlocked = getUnlockedAchievements();
    const totalCount = GAME_ACHIEVEMENTS.length;
    const unlockedCount = unlocked.length;
    const percent = Math.round((unlockedCount / totalCount) * 100);
    
    const mapBadge = document.getElementById('map-achievements-badge');
    if (mapBadge) mapBadge.textContent = `${unlockedCount}/${totalCount}`;
    
    const fill = document.getElementById('achievements-progress-fill');
    const countText = document.getElementById('achievements-count-text');
    if (fill) fill.style.width = `${percent}%`;
    if (countText) countText.textContent = `${unlockedCount} / ${totalCount} Desbloqueadas (${percent}%)`;
    
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = GAME_ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        return `
            <div class="achievement-item-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-item-icon">${ach.icon}</div>
                <div class="achievement-item-info">
                    <span class="achievement-item-boss">${ach.boss}</span>
                    <h4 class="achievement-item-title">${ach.title}</h4>
                    <p class="achievement-item-desc">${ach.desc}</p>
                </div>
                <span class="achievement-item-status ${isUnlocked ? 'status-unlocked' : 'status-locked'}">
                    ${isUnlocked ? '✔ Desbloqueada' : '🔒 Bloqueada'}
                </span>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const btnMapAch = document.getElementById('btn-open-achievements-map');
    const modalAch = document.getElementById('achievements-modal');
    const btnCloseAch = document.getElementById('btn-close-achievements');

    if (btnMapAch && modalAch) {
        btnMapAch.addEventListener('click', () => {
            updateAchievementsUI();
            modalAch.classList.add('active');
            playSound('click');
        });
    }
    if (btnCloseAch && modalAch) {
        btnCloseAch.addEventListener('click', () => {
            modalAch.classList.remove('active');
            playSound('click');
        });
    }
    updateAchievementsUI();
});
// ================================================================


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
    
    renderDecorationsModal();
    
    // Mostra popup comemorativo do novo quadro desbloqueado
    setTimeout(() => {
        showCosmeticUnlockModal(cosmetic);
    }, 600);
}


function getPlacedDecorations() {
    try {
        const data = localStorage.getItem('mandamau_placed_decorations');
        return data ? JSON.parse(data) : [];
    } catch(e) {
        return [];
    }
}

function savePlacedDecorations(placedArray) {
    localStorage.setItem('mandamau_placed_decorations', JSON.stringify(placedArray));
}

function togglePlacedDecoration(cosmeticId) {
    let placed = getPlacedDecorations();
    const existingIndex = placed.findIndex(p => p.id === cosmeticId);
    
    if (existingIndex >= 0) {
        // Remover do fundo
        placed.splice(existingIndex, 1);
    } else {
        // Colocar no fundo em posições estrategicas nas laterais (sem cobrir o contador central)
        const winW = window.innerWidth;
        const cardW = 440;
        const frameW = 180;
        
        const leftX1 = Math.max(15, Math.floor((winW / 2) - (cardW / 2) - frameW - 25));
        const leftX2 = Math.max(15, Math.floor((winW / 2) - (cardW / 2) - frameW - 55));
        const rightX1 = Math.min(winW - frameW - 15, Math.floor((winW / 2) + (cardW / 2) + 25));
        const rightX2 = Math.min(winW - frameW - 15, Math.floor((winW / 2) + (cardW / 2) + 55));

        const defaultPositions = [
            { x: leftX1, y: 110 },
            { x: rightX1, y: 110 },
            { x: leftX2 > 0 ? leftX2 : 20, y: 360 },
            { x: rightX2, y: 360 },
            { x: Math.max(15, leftX1 - 15), y: 230 }
        ];
        const pos = defaultPositions[placed.length % defaultPositions.length];
        placed.push({ id: cosmeticId, x: Math.max(10, pos.x), y: Math.max(10, pos.y) });
    }

    
    savePlacedDecorations(placed);
    renderPlacedDecorations();
    renderDecorationsModal();
}

function renderPlacedDecorations() {
    const layer = document.getElementById('bg-decorations-layer');
    if (!layer) return;
    
    const placed = getPlacedDecorations();
    layer.innerHTML = '';
    
    placed.forEach(pItem => {
        const cosmetic = BOSS_COSMETICS.find(c => c.id === pItem.id);
        if (!cosmetic) return;
        
        const frameEl = document.createElement('div');
        frameEl.className = 'bg-placed-frame';
        frameEl.id = 'placed-' + cosmetic.id;
        frameEl.style.left = pItem.x + 'px';
        frameEl.style.top = pItem.y + 'px';
        
        frameEl.innerHTML = `
            <div class="placed-frame-bar">
                <span class="placed-frame-drag-label">🖐️ ${cosmetic.name}</span>
                <button class="btn-remove-placed-frame" title="Remover" data-id="${cosmetic.id}">&times;</button>
            </div>
            <img src="${cosmetic.img}" alt="${cosmetic.name}" class="placed-frame-img" onerror="handleCosmeticImgError(this)">
            <div class="placed-frame-caption">${cosmetic.title}</div>
        `;
        
        // Remove button event
        const removeBtn = frameEl.querySelector('.btn-remove-placed-frame');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlacedDecoration(cosmetic.id);
            playSound('click');
        });
        
        // Make Draggable
        makeFrameDraggable(frameEl, cosmetic.id);
        
        layer.appendChild(frameEl);
    });
}

function makeFrameDraggable(element, cosmeticId) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    const onStart = (e) => {
        if (e.target.classList.contains('btn-remove-placed-frame')) return;
        isDragging = true;
        element.classList.add('dragging');
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;
        
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    };
    
    const onMove = (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        let newX = initialLeft + deltaX;
        let newY = initialTop + deltaY;
        
        // Keep within viewport boundaries
        const maxX = window.innerWidth - element.offsetWidth - 5;
        const maxY = window.innerHeight - element.offsetHeight - 5;
        
        newX = Math.max(5, Math.min(maxX, newX));
        newY = Math.max(5, Math.min(maxY, newY));
        
        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
    };
    
    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        element.classList.remove('dragging');
        
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchend', onEnd);
        
        // Save new position
        let placed = getPlacedDecorations();
        const item = placed.find(p => p.id === cosmeticId);
        if (item) {
            item.x = element.offsetLeft;
            item.y = element.offsetTop;
            savePlacedDecorations(placed);
        }
    };
    
    element.addEventListener('mousedown', onStart);
    element.addEventListener('touchstart', onStart, { passive: false });
}

function renderDecorationsModal() {
    const grid = document.getElementById('decorations-grid');
    if (!grid) return;
    
    const unlocked = getUnlockedCosmetics();
    const placed = getPlacedDecorations();
    
    grid.innerHTML = BOSS_COSMETICS.map(cosmetic => {
        const isUnlocked = unlocked.includes(cosmetic.id);
        const isPlaced = placed.some(p => p.id === cosmetic.id);
        
        return `
            <div class="decoration-item-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="decoration-item-preview-wrap">
                    <img src="${cosmetic.img}" alt="${cosmetic.name}" class="decoration-item-img" onerror="handleCosmeticImgError(this)">
                </div>
                <div class="decoration-item-body">
                    <span class="decoration-item-boss">${cosmetic.bossName}</span>
                    <h4 class="decoration-item-title">${cosmetic.name}</h4>
                    <p class="decoration-item-desc">${cosmetic.desc}</p>
                    
                    ${isUnlocked ? `
                        <button class="btn-toggle-decoration ${isPlaced ? 'remove' : 'place'}" data-id="${cosmetic.id}">
                            ${isPlaced ? '❌ Remover do Fundo' : '🖼️ Colocar no Fundo'}
                        </button>
                    ` : `
                        <button class="btn-toggle-decoration locked-btn" disabled>
                            🔒 Bloqueado (Derrote o Boss)
                        </button>
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

document.addEventListener('DOMContentLoaded', () => {
    const btnDecTop = document.getElementById('btn-decorations-top');
    const modalDec = document.getElementById('decorations-modal');
    const btnCloseDec = document.getElementById('btn-close-decorations');

    if (btnDecTop && modalDec) {
        btnDecTop.addEventListener('click', () => {
            renderDecorationsModal();
            modalDec.classList.add('active');
            playSound('click');
        });
    }
    if (btnCloseDec && modalDec) {
        btnCloseDec.addEventListener('click', () => {
            modalDec.classList.remove('active');
            playSound('click');
        });
    }
    
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
const contentCounter = document.getElementById('content-counter');
const contentStats = document.getElementById('content-stats');
const contentDuel = document.getElementById('content-duel');

// Sub-Tab Elements
const subtabStatsGeneral = document.getElementById('subtab-stats-general');
const subtabStats2 = document.getElementById('subtab-stats-2');
const subcontentStatsGeneral = document.getElementById('subcontent-stats-general');
const subcontentStats2 = document.getElementById('subcontent-stats-2');

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
        updateStats2UI();
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

// Sub-Tab Navigation
function selectSubTab(subTabName) {
    [subtabStatsGeneral, subtabStats2].forEach(t => t.classList.remove('active'));
    [subcontentStatsGeneral, subcontentStats2].forEach(c => c.classList.remove('active'));
    
    if (subTabName === 'general') {
        subtabStatsGeneral.classList.add('active');
        subcontentStatsGeneral.classList.add('active');
    } else if (subTabName === 'stats2') {
        subtabStats2.classList.add('active');
        subcontentStats2.classList.add('active');
        updateStats2UI();
    }
    playSound('click');
}

subtabStatsGeneral.addEventListener('click', () => selectSubTab('general'));
subtabStats2.addEventListener('click', () => selectSubTab('stats2'));

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
    }, 4000);
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
    
    // Tier 1: Very Small (< 10) - Just the number
    if (absNum < 10) {
        return num.toLocaleString('pt-BR');
    }
    
    const fmt = (n) => Number.isInteger(n) ? n.toLocaleString('pt-BR') : n.toFixed(2).replace('.', ',');

    // Tier 2: Small (10 <= num < 100) - Arithmetic/Algebra
    if (absNum < 100) {
        const equations = [
            () => `&radic;${fmt(num * num)}`,
            () => {
                const x = Math.floor(Math.random() * 20) + 5;
                return `(${fmt(num + x)} - ${x})`;
            },
            () => {
                const x = Math.floor(Math.random() * 3) + 2;
                return `(${fmt(num * x)} / ${x})`;
            },
            () => {
                const x = Math.floor(Math.random() * 8) + 2;
                const y = num - x;
                return `(${fmt(y)} + ${fmt(x)})`;
            }
        ];
        return equations[Math.floor(Math.random() * equations.length)]();
    }
    
    // Tier 3: Medium (100 <= num < 1000) - Basic Calculus & Logs
    if (absNum < 1000) {
        const equations = [
            () => `&int;<sub>0</sub><sup>${fmt(num)}</sup> 1 dx`,
            () => `log<sub>e</sub>(e<sup>${fmt(num)}</sup>)`,
            () => `${fmt(num)} &times; (sin&sup2;(&theta;) + cos&sup2;(&theta;))`,
            () => `&radic;(${fmt(num * num * 2)} / 2)`,
            () => {
                const base = Math.floor(Math.log2(num));
                const diff = num - Math.pow(2, base);
                return `2<sup>${base}</sup> + ${fmt(diff)}`;
            }
        ];
        return equations[Math.floor(Math.random() * equations.length)]();
    }
    
    // Tier 4: Large (1000 <= num < 10000) - Calculus & Limits
    if (absNum < 10000) {
        const equations = [
            () => `lim<sub>x&rarr;&infin;</sub> (${fmt(num)}x&sup2; - 7) / (x&sup2; + 1)`,
            () => `d/dx [ ${fmt(num)}x + &pi;&sup2; ]`,
            () => `&int;<sub>0</sub><sup>1</sup> ${fmt(num * 2)}t dt`,
            () => {
                const val = num - 1;
                return `e<sup>i&pi;</sup> + ${fmt(val + 2)}`;
            },
            () => {
                const diff = num - 15;
                return `(&sum;<sub>i=1</sub><sup>5</sup> i) + ${fmt(diff)}`;
            }
        ];
        return equations[Math.floor(Math.random() * equations.length)]();
    }
    
    // Tier 5: Very Large (10000 <= num < 100000) - Advanced Calculus & Matrix
    if (absNum < 100000) {
        const equations = [
            () => `&int;<sub>0</sub><sup>&pi;</sup> (${fmt(num / 2)}) sin(&phi;) d&phi;`,
            () => `det([[ ${fmt(num)}, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ]])`,
            () => `lim<sub>x&rarr;0</sub> [ ${fmt(num)} &times; sin(x)/x ]`,
            () => `&int;<sub>1</sub><sup>e</sup> (${fmt(num)} / x) dx`,
            () => `&sum;<sub>n=0</sub><sup>&infin;</sup> (${fmt(num)} / 2<sup>n+1</sup>)`
        ];
        return equations[Math.floor(Math.random() * equations.length)]();
    }
    
    // Tier 6: Cosmic Absurdity (num >= 100000) - Quantum Mechanics & Chalkboard math
    const equations = [
        () => `[ &int;<sub>-&infin;</sub><sup>&infin;</sup> &Psi;*(x) H &Psi;(x) dx ] &times; ${fmt(num)}`,
        () => `(&nabla; &times; E = -&part;B/&part;t) &rarr; ${fmt(num)}`,
        () => `&int;<sub>0</sub><sup>1</sup>&int;<sub>0</sub><sup>2</sup> ${fmt(num)} xy dx dy`,
        () => `[ R<sub>&mu;&nu;</sub> - 1/2 Rg<sub>&mu;&nu;</sub> + &Lambda;g<sub>&mu;&nu;</sub> ]<sub>eval</sub> &times; ${fmt(num)}`,
        () => `Tr([ [${fmt(num)}, i], [-i, 0] ])`,
        () => `[ -(&hbar;&sup2; / 2m) &nabla;&sup2;&Psi; + V&Psi; ] &rarr; E = ${fmt(num)}`
    ];
    return equations[Math.floor(Math.random() * equations.length)]();
}

// Dynamically adjust font size to prevent overflow
function adjustFontSize() {
    const visibleText = counterEl.textContent || counterEl.innerText || "";
    const len = visibleText.length;
    
    let fontSize = '5.5rem';
    if (len > 40) {
        fontSize = '1.2rem';
    } else if (len > 25) {
        fontSize = '1.5rem';
    } else if (len > 16) {
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
        if (len > 40) {
            fontSize = '0.9rem';
        } else if (len > 25) {
            fontSize = '1.1rem';
        } else if (len > 16) {
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
    updateStats2UI();
}

function formatStat2Value(val, suffix = '') {
    if (val === 0) return '0' + suffix;
    
    // Very small numbers
    if (val < 0.01) {
        if (val < 0.000001) {
            return val.toExponential(2).replace('e', ' &times; 10<sup>') + '</sup>' + suffix;
        }
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) + suffix;
    }
    
    // Large numbers compact formatting (K, mi, bi, tri)
    if (val >= 1e12) { // Trillion
        return (val / 1e12).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' tri' + suffix;
    }
    if (val >= 1e9) { // Billion
        return (val / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' bi' + suffix;
    }
    if (val >= 1e6) { // Million
        return (val / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi' + suffix;
    }
    if (val >= 1e4) { // 10 thousand or above
        return (val / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' + suffix;
    }
    if (val >= 1000) { // between 1000 and 10000
        return Math.floor(val).toLocaleString('pt-BR') + suffix;
    }
    
    // Medium/Normal numbers
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + suffix;
}

function updateStats2UI() {
    const elLies = document.getElementById('stats-2-total-lies');
    if (!elLies) return;
    
    // Also compact the count in the intro if it gets very large
    elLies.innerHTML = formatStat2Value(count);
    
    const cristo = count / 38;
    const everest = count / 8848;
    const ponte = count / 13290;
    const muralha = count / 21196000;
    const terra = count / 40075000;
    const lua = count / 384400000;
    
    document.getElementById('stat-2-cristo').innerHTML = formatStat2Value(cristo);
    document.getElementById('stat-2-everest').innerHTML = formatStat2Value(everest);
    document.getElementById('stat-2-ponte').innerHTML = formatStat2Value(ponte);
    document.getElementById('stat-2-muralha').innerHTML = formatStat2Value(muralha);
    document.getElementById('stat-2-terra').innerHTML = formatStat2Value(terra);
    
    if (lua < 0.01) {
        document.getElementById('stat-2-lua').innerHTML = formatStat2Value(lua * 100, '%');
    } else {
        document.getElementById('stat-2-lua').innerHTML = (lua * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%';
    }
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
    "Isso é coisa do navegador!",
    "Eu não molestei os patinhos, e essa jogada também não é sua!",
    "Meu navegador bugou, a minha jogada vale por duas.",
    "O juiz de inteligência artificial disse que esse espaço agora é meu.",
    "Eu joguei ali sim! Você que não viu.",
    "Essa regra de alinhar 3 em diagonal foi inventada pela mídia.",
    "Bako venceu! Eu mesmo confirmei.",
    "Você clicou errado, meu script corrigiu pra você.",
    "Eu não sou terrorista, mas explodi o seu X do tabuleiro.",
    "No Jogo da Velha do Bako, o O sempre ganha de primeira.",
    "Eu gosto de cachorros mortos e de ganhar no Jogo da Velha.",
    "Você acha que sabe jogar? Eu treinei em segredo contra supercomputadores."
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

    // Automatically restart duel after 2.5 seconds
    setTimeout(() => {
        initDuel();
    }, 2500);
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
            
            cheatSpeech = "O sistema cancelou sua jogada por suspeita de mentira deslavada. Esse X agora é um O.";
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
            
            cheatSpeech = "Joguei duas vezes porque achei você meio lento. E o sistema permite nas minhas regras.";
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
        
        triggerBakoWin([0, 4, 8], "Empate? Não toleramos empates. Fui declarado vencedor por WO técnico.");
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

// Smartphone Chat system
const btnPhoneTrigger = document.getElementById('btn-phone-trigger');
const smartphoneContainer = document.getElementById('smartphone-container');
const btnClosePhone = document.getElementById('btn-close-phone');
const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatTypingIndicator = document.getElementById('chat-typing-indicator');
const chatOptionsPanel = document.getElementById('chat-options-panel');
const btnJourneyTrigger = document.getElementById('btn-journey-trigger');

// Persisted State
const askedQuestions = JSON.parse(localStorage.getItem('mandamau_asked_questions')) || { patinhos: false, terrorista: false, peixes: false };
let chatCompleted = localStorage.getItem('mandamau_chat_completed') === 'true';

btnPhoneTrigger.addEventListener('click', () => {
    smartphoneContainer.classList.toggle('active');
    // Hide notification badge when opened
    const badge = btnPhoneTrigger.querySelector('.phone-badge');
    if (badge) badge.style.display = 'none';
    playSound('click');
});

btnClosePhone.addEventListener('click', () => {
    smartphoneContainer.classList.remove('active');
    playSound('click');
});




btnBjRestart.addEventListener('click', () => {
    bjLoseScreen.classList.remove('active');
    bjLoseScreen.style.display = '';
    playSound('click');
    bjInitGame();
    bjStartRound();
});

btnBjQuit.addEventListener('click', () => {
    bjGameActive = false;
    fadeOutTheme();
    blackjackOverlay.classList.remove('active');
    bjWinScreen.classList.remove('active');
    bjLoseScreen.classList.remove('active');
    bjTutorialModal.classList.remove('active');
    bjRoundResult.style.display = 'none';
    bjFireworks.innerHTML = '';
    playSound('click');
});

// ---- Tutorial ----
btnCloseBjTutorial.addEventListener('click', () => {
    bjTutorialModal.classList.remove('active');
    bjTutorialOpen = false;
    playSound('click');
    playTheme('fase5');
    bjStartRound();
});

// ---- Init ----
function bjInitGame() {
    bjPowersUsedInMatch = false;
    try {
        bjDeck      = bjShuffle(bjBuildDeck());
        bjPlayerHP  = BJ_MAX_HP;
        bjBossHP    = BJ_MAX_HP;
        bjRound     = 0;
        bjPower1Uses= 1;
        bjPower2Uses= 1;
        bjPower3Uses= 2;
        bjGameActive = true;
        bjPlayerTurn = false;
        if (bjJudgmentBadge) bjJudgmentBadge.classList.remove('active');
        bjUpdateHP();
        bjUpdatePowerUI();
        if (bjBossCards)   bjBossCards.innerHTML   = '';
        if (bjPlayerCards) bjPlayerCards.innerHTML = '';
        if (bjBossScore)   bjBossScore.textContent   = '?';
        if (bjPlayerScore) bjPlayerScore.textContent = '0';
        if (bjRoundResult) bjRoundResult.style.display = 'none';
        // Reset end screens
        if (bjWinScreen)  { bjWinScreen.classList.remove('active');  bjWinScreen.style.display = ''; }
        if (bjLoseScreen) { bjLoseScreen.classList.remove('active'); bjLoseScreen.style.display = ''; }
        if (bjFireworks)  bjFireworks.innerHTML = '';
        bjSetSpeech('Sua falta de etiqueta me diverte. Compre uma carta!');
        bjSetControls(false);
        console.log('[BJ] bjInitGame OK');
    } catch(e) {
        console.error('[BJ] bjInitGame error:', e);
        alert('ERRO bjInitGame: ' + e.message);
    }
}
