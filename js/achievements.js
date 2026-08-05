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
