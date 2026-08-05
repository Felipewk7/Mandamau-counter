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


// ================================================================
// CHAPTER 2 MAP & NAVIGATION SYSTEM
// ================================================================
let currentMapChapter = 1; // Always start on Chapter 1; user must navigate to Chapter 2 via arrow

function switchMapChapter(chapterNum) {
    currentMapChapter = chapterNum;
    localStorage.setItem('mandamau_current_map_chapter', chapterNum.toString());

    const mapCap1 = document.getElementById('map-chapter-1');
    const mapCap2 = document.getElementById('map-chapter-2');
    const btnNavPrev = document.getElementById('btn-map-nav-prev');
    const btnNavNext = document.getElementById('btn-map-nav-next');
    const titleEl = document.getElementById('journey-title');
    const subtitleEl = document.getElementById('journey-subtitle');

    const isCap1Completed = localStorage.getItem('mandamau_journey_fase5_completed') === 'true';

    if (chapterNum === 2) {
        if (mapCap1) { mapCap1.style.display = 'none'; mapCap1.classList.remove('active'); }
        if (mapCap2) { mapCap2.style.display = 'block'; mapCap2.classList.add('active'); }
        if (titleEl) titleEl.textContent = 'Capítulo 2: O Caos Deselegante';
        if (subtitleEl) subtitleEl.textContent = 'O Deus da Mentira foi libertado! Enfrente as novas ameaças e restabeleça a ordem!';
        
        if (btnNavPrev) btnNavPrev.style.display = 'inline-flex';
        if (btnNavNext) btnNavNext.style.display = 'none';

        const isFase6Completed = localStorage.getItem('mandamau_journey_fase6_completed') === 'true';

        const nodeFase6 = document.getElementById('node-fase6');
        const lineFase6 = document.querySelector('.line-fase6');
        if (nodeFase6) {
            nodeFase6.className = 'map-node node-active';
            nodeFase6.title = 'Fase 6 - O Urso da Tempestade (Volibear)';
            const iconSpan = nodeFase6.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚡';
        }
        if (lineFase6) lineFase6.classList.add('line-active');

        const nodeFase7 = document.getElementById('node-fase7');
        const lineFase7 = document.querySelector('.line-fase7');
        if (isFase6Completed) {
            if (nodeFase7) {
                nodeFase7.className = 'map-node node-active';
                nodeFase7.title = 'Fase 7 - Warwick';
                const iconSpan = nodeFase7.querySelector('.node-icon');
                if (iconSpan) iconSpan.textContent = '🐺';
            }
            if (lineFase7) lineFase7.classList.add('line-active');
        } else {
            if (nodeFase7) {
                nodeFase7.className = 'map-node node-locked';
                nodeFase7.title = 'Fase 7 - Bloqueada (Derrote Volibear na Fase 6 primeiro)';
                const iconSpan = nodeFase7.querySelector('.node-icon');
                if (iconSpan) iconSpan.textContent = '🔒';
            }
            if (lineFase7) lineFase7.classList.remove('line-active');
        }

        if (journeyPlayerToken) {
            if (isFase6Completed) {
                journeyPlayerToken.style.left = '40%';
                journeyPlayerToken.style.top = '50%';
            } else {
                journeyPlayerToken.style.left = '25%';
                journeyPlayerToken.style.top = '62%';
            }
        }
    } else {

        if (mapCap2) { mapCap2.style.display = 'none'; mapCap2.classList.remove('active'); }
        if (mapCap1) { mapCap1.style.display = 'block'; mapCap1.classList.add('active'); }
        if (titleEl) titleEl.textContent = 'A Jornada pelo Remédio Supremo (Capítulo 1)';
        if (subtitleEl) subtitleEl.textContent = 'Desbrave o caminho até a sede do GGOPA para curar a maldição do Bako';
        
        if (btnNavPrev) btnNavPrev.style.display = 'none';
        if (btnNavNext) btnNavNext.style.display = isCap1Completed ? 'inline-flex' : 'none';
    }
}

const journeyOverlay = document.getElementById('journey-overlay');
const btnCloseJourneyView = document.getElementById('btn-close-journey-view');
const journeyPlayerToken = document.getElementById('journey-player-token');
const journeyEncounterOverlay = document.getElementById('journey-encounter-overlay');
const btnAcceptChallenge = document.getElementById('btn-accept-challenge');
const nodeFase1 = document.getElementById('node-fase1');
const pathLineFase1 = document.querySelector('.line-fase1');

btnJourneyTrigger.addEventListener('click', () => {
    playSound('click');
    openJourney();
});

if (btnCloseJourneyView) {
    btnCloseJourneyView.addEventListener('click', () => {
        journeyOverlay.classList.remove('active');
        playSound('click');
    });
}

let currentBossEncounter = 'kleber';
let isGwenTutorialOpen = false;
let isSamTutorialOpen = false;

function setupBossEncounterUI() {
    const portrait = document.querySelector('.encounter-portrait');
    const nameText = document.querySelector('.encounter-name');
    const titleText = document.querySelector('.encounter-title');
    const authorText = document.querySelector('.dialog-author');
    const bubblePara = document.querySelector('.encounter-dialog-bubble p');
    
    if (currentBossEncounter === 'kleber') {
        portrait.src = "img/kleber_clown.jpg";
        portrait.alt = "Kleber O palhaço dos mil dentes";
        nameText.textContent = "Kleber";
        titleText.textContent = "O palhaço dos mil dentes";
        authorText.textContent = "Kleber";
        bubblePara.textContent = "pra passar de mim terá que me vencer numa queda de braço krl";
    } else if (currentBossEncounter === 'warwick') {
        portrait.onerror = function() { this.src = 'img/kleber_clown.jpg'; };
        portrait.src = "img/warwick.png";
        portrait.alt = "Warwick O Caçador da Noite";
        nameText.textContent = "Warwick";
        titleText.textContent = "O Caçador da Noite — Capítulo 2: Fase 7";
        authorText.textContent = "Warwick";
        bubblePara.textContent = "sinto cheiro de cu virgem , é o seu ?";
    } else if (currentBossEncounter === 'volibear') {
        portrait.onerror = function() { this.src = 'img/kleber_clown.jpg'; };
        portrait.src = "img/volibear.png";
        portrait.alt = "Volibear O Urso da Tempestade";
        nameText.textContent = "Volibear";
        titleText.textContent = "O Urso da Tempestade — Capítulo 2: Fase 6";
        authorText.textContent = "Volibear";
        bubblePara.textContent = "Para chegar no meu mestre terá que passar por mim, que o boga do bako é só meu!";
    } else if (currentBossEncounter === 'gwen') {
        portrait.src = "img/gwen.jpg";
        portrait.alt = "Gwen";
        nameText.textContent = "Gwen";
        titleText.textContent = "A mestre do quiz";
        authorText.textContent = "Gwen";
        bubblePara.textContent = "Eai porra, vc é bom em matematica ? Não ? que pena vai ter que ser pra passar Hahahaha!!!";
    } else if (currentBossEncounter === 'sam') {
        portrait.onerror = function() {
            if (!this.src.endsWith('img/kleber_clown.jpg')) {
                this.onerror = function() { this.src = 'img/kleber_clown.jpg'; this.onerror = null; };
                this.src = 'img/sam.jpg';
            }
        };
        portrait.src = '';
        portrait.src = 'img/sam.png';
        portrait.alt = 'Sam';
        nameText.textContent = 'Sam';
        titleText.textContent = 'O Gordão do Esmaga';
        authorText.textContent = 'Sam';
        bubblePara.textContent = 'Eai porra, vc é bom em esmagar comida? Não? que pena vai ter que ser pra passar Hahahaha!!!';
    } else if (currentBossEncounter === 'claudio') {
        portrait.src = 'img/claudio.png';
        portrait.alt = 'Cláudio O Cubo Gey';
        portrait.onerror = function() { this.src = 'img/kleber_clown.jpg'; };
        nameText.textContent = 'Cláudio';
        titleText.textContent = 'O Cubo Gey';
        authorText.textContent = 'Cláudio';
        bubblePara.textContent = 'Eu sou um cubo gey, me vença se for capaz!';

    } else if (currentBossEncounter === 'fase6_fakenews') {
        portrait.src = "img/kleber_clown.jpg";
        portrait.alt = "Fake News Kleber";
        nameText.textContent = "Kleber Fake News";
        titleText.textContent = "Capítulo 2 - Fase 6";
        authorText.textContent = "Kleber Fake News";
        bubblePara.textContent = "Eu voltei no Capítulo 2 e agora espalho FAKE NEWS pelo mundo todo! Tente me parar se for capaz!";
    } else if (currentBossEncounter === 'felifep') {

        portrait.onerror = function() { if (!this.src.endsWith('img/kleber_clown.jpg')) this.src = 'img/kleber_clown.jpg'; };
        portrait.src = '';
        portrait.src = 'img/felifep.png';
        portrait.alt = 'Felifep';
        nameText.textContent  = 'Felifep';
        titleText.textContent = 'O Deus da Etiqueta e da Verdade';
        authorText.textContent= 'Felifep';
        bubblePara.textContent= 'Você chegou até aqui? Impressionante. Prepare-se para o Julgamento Final!';
    }
}

btnAcceptChallenge.addEventListener('click', () => {
    journeyEncounterOverlay.classList.remove('active');
    // CRITICAL: close journey overlay so it doesn't block clicks after game ends
    journeyOverlay.classList.remove('active');
    playSound('click');
    
    if (currentBossEncounter === 'kleber') {
        closeGwenQuiz();
        closeSamGame();
        
        armWrestlingOverlay.classList.add('active');
        armTutorialModal.classList.add('active');
        isTutorialOpen = true;
        isArmGameActive = false;
        armWrestlingState = 0;
        updateArmWrestlingUI();
    } else if (currentBossEncounter === 'gwen') {
        cleanupArmWrestlingEffects();
        closeSamGame();
        
        gwenQuizOverlay.classList.add('active');
        gwenTutorialModal.classList.add('active');
        isGwenTutorialOpen = true;
        gwenActive = false;
        gwenScore = 0;
        gwenLives = 3;
        isPrankQuestion = false;
        updateGwenUI();
    } else if (currentBossEncounter === 'sam') {
        cleanupArmWrestlingEffects();
        closeGwenQuiz();
        
        samSmashOverlay.classList.add('active');
        samTutorialModal.classList.add('active');
        isSamTutorialOpen = true;
        samGameActive = false;
        samTugProgress = 50;
        samTimeLeft = 15;
        lastPressedKey = '';
        updateSamTugUI();
    } else if (currentBossEncounter === 'claudio') {
        cleanupArmWrestlingEffects();
        closeGwenQuiz();
        closeSamGame();

        claudioGeniusOverlay.classList.add('active');
        claudioTutorialModal.classList.add('active');
        isClaudioTutorialOpen = true;
        claudioGameActive = false;
        resetClaudioGame();
    } else if (currentBossEncounter === 'felifep') {
        cleanupArmWrestlingEffects();
        closeGwenQuiz();
        closeSamGame();
        openBlackjack();
    } else if (currentBossEncounter === 'volibear') {
        cleanupArmWrestlingEffects();
        closeGwenQuiz();
        closeSamGame();
        openVolibearGame();
    } else if (currentBossEncounter === 'warwick') {
        cleanupArmWrestlingEffects();
        closeGwenQuiz();
        closeSamGame();
        openWarwickGame();
    }
});


function openJourney() {
    journeyOverlay.classList.add('active');
    
    // CRITICAL: always close game overlays before opening journey map
    if (warwickStealthOverlay) warwickStealthOverlay.classList.remove('active');
    if (volibearStormOverlay) volibearStormOverlay.classList.remove('active');
    
    // If Chapter 1 (Fase 5) is completed, open directly on Chapter 2 map!
    const isCap1Completed = localStorage.getItem('mandamau_journey_fase5_completed') === 'true';
    if (isCap1Completed) {
        currentMapChapter = 2;
        switchMapChapter(2);
    } else {
        currentMapChapter = 1;
        switchMapChapter(1);
    }
    journeyEncounterOverlay.classList.remove('active');
    pathLineFase1.classList.remove('line-active');
    nodeFase1.classList.remove('node-active');
    
    isTutorialOpen = false;
    isGwenTutorialOpen = false;
    isSamTutorialOpen = false;
    isClaudioTutorialOpen = false;
    
    const journeyFase1Completed = localStorage.getItem('mandamau_journey_fase1_completed') === 'true';
    const journeyFase2Completed = localStorage.getItem('mandamau_journey_fase2_completed') === 'true';
    const journeyFase3Completed = localStorage.getItem('mandamau_journey_fase3_completed') === 'true';
    const journeyFase4Completed = localStorage.getItem('mandamau_journey_fase4_completed') === 'true';
    
    // Reset all nodes/paths classes first to ensure clean state load
    nodeFase1.classList.remove('node-active');
    pathLineFase1.classList.remove('line-active');
    
    const nodeFase2 = document.getElementById('node-fase2');
    const pathLineFase2 = document.querySelector('.line-fase2');
    if (nodeFase2) {
        nodeFase2.className = 'map-node node-locked';
        const iconSpan = nodeFase2.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '🔒';
    }
    if (pathLineFase2) pathLineFase2.classList.remove('line-active');
    
    const nodeFase3 = document.getElementById('node-fase3');
    const pathLineFase3 = document.querySelector('.line-fase3');
    if (nodeFase3) {
        nodeFase3.className = 'map-node node-locked';
        const iconSpan = nodeFase3.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '🔒';
    }
    if (pathLineFase3) pathLineFase3.classList.remove('line-active');
    
    const nodeFase4 = document.getElementById('node-fase4');
    const pathLineFase4 = document.querySelector('.line-fase4');
    if (nodeFase4) {
        nodeFase4.className = 'map-node node-locked';
        const iconSpan = nodeFase4.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '🔒';
    }
    if (pathLineFase4) pathLineFase4.classList.remove('line-active');

    const nodeGgopa = document.getElementById('node-ggopa');
    const pathLineFase5 = document.querySelector('.line-fase5');
    if (nodeGgopa) {
        nodeGgopa.className = 'map-node node-locked';
        const iconSpan = nodeGgopa.querySelector('.node-icon');
        if (iconSpan) iconSpan.textContent = '🏗️';
    }
    if (pathLineFase5) pathLineFase5.classList.remove('line-active');

    // Run map initialization to unlock correct nodes/paths
    initJourneyMapState();
    
    if (journeyFase4Completed) {
        journeyPlayerToken.style.left = '90%';
        journeyPlayerToken.style.top = '20%';
    } else if (journeyFase3Completed) {
        journeyPlayerToken.style.left = '55%';
        journeyPlayerToken.style.top = '40%';
    } else if (journeyFase2Completed) {
        journeyPlayerToken.style.left = '40%';
        journeyPlayerToken.style.top = '50%';
    } else if (journeyFase1Completed) {
        journeyPlayerToken.style.left = '25%';
        journeyPlayerToken.style.top = '62%';
    } else {
        // Reset player token position to Start Node and walk to Fase 1
        journeyPlayerToken.style.left = '10%';
        journeyPlayerToken.style.top = '75%';
        
        setTimeout(() => {
            journeyPlayerToken.style.left = '25%';
            journeyPlayerToken.style.top = '62%';
            
            setTimeout(() => {
                nodeFase1.classList.add('node-active');
                pathLineFase1.classList.add('line-active');
                playSound('rank_up_med');
                
                currentBossEncounter = 'kleber';
                setupBossEncounterUI();
                journeyEncounterOverlay.classList.add('active');
            }, 2500);
        }, 800);
    }
}

const bakoChats = {
    patinhos: {
        question: "Bako pq vc fez aquilo com os patinhos?",
        bakoAnswer: "eu gosto de patinhos sabe, só de pensar nas penas deles eu tenho um orgasmo",
        playerReply: "ok..."
    },
    terrorista: {
        question: "bako vc é um terrorista?",
        bakoAnswer: "eu gosto de explodir coisas,o osama era meu brother",
        playerReply: "Misericórdia..."
    },
    peixes: {
        question: "Bako pq vc gosta de mijar em peixes?",
        bakoAnswer: "isso me acalma sabe , mijar neles enqunto se debatem no chão é prazeroso, e meter na boca deles depois  é melhor ainda",
        playerReply: "..."
    }
};

function appendChatMessage(text, isPlayer = false, author = '') {
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${isPlayer ? 'player-msg' : 'bako-msg'}`;
    
    const authorSpan = document.createElement('span');
    authorSpan.className = 'msg-author';
    authorSpan.textContent = author;
    
    const p = document.createElement('p');
    p.textContent = text;
    
    bubble.appendChild(authorSpan);
    bubble.appendChild(p);
    
    chatMessagesContainer.appendChild(bubble);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function renderChatOptions() {
    chatOptionsPanel.innerHTML = '';
    
    if (chatCompleted) {
        const titleSpan = document.createElement('span');
        titleSpan.className = 'options-title';
        titleSpan.textContent = 'Mapeamento Concluído';
        chatOptionsPanel.appendChild(titleSpan);
        return;
    }
            const isF3Done = localStorage.getItem('mandamau_journey_fase3_completed') === 'true';
            if (isF3Done) {
                try { playSound('click'); } catch(err) {}
                currentBossEncounter = 'claudio';
                setupBossEncounterUI();
                if (journeyEncounterOverlay) journeyEncounterOverlay.classList.add('active');
            } else {
                try { playSound('click'); } catch(err) {}
                showAchievementToast({ icon: '🔒', title: 'FASE BLOQUEADA', desc: 'Derrote Sam na Fase 3 primeiro!' });
            }
        };
    }

    const nodeGgopa = document.getElementById('node-ggopa');
    if (nodeGgopa) {
        nodeGgopa.onclick = () => {
            const isF4Done = localStorage.getItem('mandamau_journey_fase4_completed') === 'true';
            if (isF4Done) {
                try { playSound('click'); } catch(err) {}
                currentBossEncounter = 'felifep';
                setupBossEncounterUI();
                if (journeyEncounterOverlay) journeyEncounterOverlay.classList.add('active');
            } else {
                try { playSound('click'); } catch(err) {}
                showAchievementToast({ icon: '🔒', title: 'FASE BLOQUEADA', desc: 'Derrote Cláudio na Fase 4 primeiro!' });
            }
        };
    }

    // CHAPTER 2 NODES
    const node6 = document.getElementById('node-fase6');
    if (node6) {
        node6.onclick = () => {
            try { playSound('click'); } catch(err) {}
            currentBossEncounter = 'volibear';
            setupBossEncounterUI();
            if (journeyEncounterOverlay) journeyEncounterOverlay.classList.add('active');
        };
    }

    const node7 = document.getElementById('node-fase7');
    if (node7) {
        node7.onclick = () => {
            const isF6Done = localStorage.getItem('mandamau_journey_fase6_completed') === 'true';
            if (isF6Done) {
                try { playSound('click'); } catch(err) {}
                currentBossEncounter = 'warwick';
                setupBossEncounterUI();
                if (journeyEncounterOverlay) journeyEncounterOverlay.classList.add('active');
            } else {
                try { playSound('click'); } catch(err) {}
                showAchievementToast({ icon: '🔒', title: 'FASE BLOQUEADA', desc: 'Derrote Volibear na Fase 6 primeiro!' });
            }
        };
    }
}

// Call setup automatically on DOM ready & load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setupCentralizedMapListeners();
} else {
    document.addEventListener('DOMContentLoaded', setupCentralizedMapListeners);
}
