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
    
    const allInitialAsked = askedQuestions.patinhos && askedQuestions.terrorista && askedQuestions.peixes;
    
    if (allInitialAsked) {
        const titleSpan = document.createElement('span');
        titleSpan.className = 'options-title';
        titleSpan.textContent = 'Pergunta Secreta Desbloqueada:';
        chatOptionsPanel.appendChild(titleSpan);
        
        const btn = document.createElement('button');
        btn.className = 'chat-opt-btn';
        btn.style.borderColor = 'rgba(234, 179, 8, 0.5)';
        btn.style.background = 'rgba(234, 179, 8, 0.05)';
        btn.innerHTML = '❓ Bako ta tudo bem ?';
        btn.addEventListener('click', () => {
            triggerSecretConversation();
        });
        chatOptionsPanel.appendChild(btn);
    } else {
        const titleSpan = document.createElement('span');
        titleSpan.className = 'options-title';
        titleSpan.textContent = 'Selecione uma pergunta para enviar:';
        chatOptionsPanel.appendChild(titleSpan);
        
        if (!askedQuestions.patinhos) {
            const btn = document.createElement('button');
            btn.className = 'chat-opt-btn';
            btn.textContent = '🦆 Bako pq vc fez aquilo com os patinhos?';
            btn.addEventListener('click', () => triggerConversation('patinhos'));
            chatOptionsPanel.appendChild(btn);
        }
        if (!askedQuestions.terrorista) {
            const btn = document.createElement('button');
            btn.className = 'chat-opt-btn';
            btn.textContent = '💣 bako vc é um terrorista?';
            btn.addEventListener('click', () => triggerConversation('terrorista'));
            chatOptionsPanel.appendChild(btn);
        }
        if (!askedQuestions.peixes) {
            const btn = document.createElement('button');
            btn.className = 'chat-opt-btn';
            btn.textContent = '🐟 Bako pq vc gosta de mijar em peixes?';
            btn.addEventListener('click', () => triggerConversation('peixes'));
            chatOptionsPanel.appendChild(btn);
        }
    }
}

function triggerConversation(key) {
    const chat = bakoChats[key];
    if (!chat) return;
    
    // Disable options panel during dialogue
    chatOptionsPanel.style.pointerEvents = 'none';
    chatOptionsPanel.style.opacity = '0.4';
    
    // 1. Send Player Question
    appendChatMessage(chat.question, true, 'Você');
    
    // 2. Typing indicator delay
    setTimeout(() => {
        chatTypingIndicator.style.display = 'flex';
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        
        // 3. Send Bako Answer
        setTimeout(() => {
            chatTypingIndicator.style.display = 'none';
            appendChatMessage(chat.bakoAnswer, false, 'Bako');
            playSound('rank_up_low');
            
            // 4. Send Player Reply
            setTimeout(() => {
                appendChatMessage(chat.playerReply, true, 'Você');
                
                // 5. Finalize this question and enable remaining options
                setTimeout(() => {
                    askedQuestions[key] = true;
                    localStorage.setItem('mandamau_asked_questions', JSON.stringify(askedQuestions));
                    
                    chatOptionsPanel.style.pointerEvents = 'all';
                    chatOptionsPanel.style.opacity = '1';
                    renderChatOptions();
                }, 2000);
                
            }, 1200);
            
        }, 1500);
        
    }, 800);
}

function triggerSecretConversation() {
    chatOptionsPanel.style.pointerEvents = 'none';
    chatOptionsPanel.style.opacity = '0.4';
    
    // 1. Player Question: Bako ta tudo bem ?
    appendChatMessage("Bako ta tudo bem ?", true, 'Você');
    
    // 2. Typing indicator -> Bako Answer
    setTimeout(() => {
        chatTypingIndicator.style.display = 'flex';
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        
        setTimeout(() => {
            chatTypingIndicator.style.display = 'none';
            appendChatMessage("na real não , eu fui amaldiçoado pra sempre mentir , mas tem um jeito de me curar , vc precisa apenas pegar o remedio supremo", false, 'Bako');
            playSound('rank_up_low');
            
            // 3. Player: onde consigo isso ?
            setTimeout(() => {
                appendChatMessage("onde consigo isso ?", true, 'Você');
                
                // 4. Typing indicator -> Bako: va ate a cede do GGOPA , depois que passar dos desafios vai conseguir
                setTimeout(() => {
                    chatTypingIndicator.style.display = 'flex';
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                    
                    setTimeout(() => {
                        chatTypingIndicator.style.display = 'none';
                        appendChatMessage("va ate a cede do GGOPA , depois que passar dos desafios vai conseguir", false, 'Bako');
                        playSound('rank_up_low');
                        
                        // 5. Player: ok , vamos tentar
                        setTimeout(() => {
                            appendChatMessage("ok , vamos tentar", true, 'Você');
                            
                            // 6. Complete and Unlock Map Icon (persisted)
                            setTimeout(() => {
                                chatCompleted = true;
                                localStorage.setItem('mandamau_chat_completed', 'true');
                                
                                renderChatOptions();
                                btnJourneyTrigger.classList.add('active');
                            }, 2500);
                            
                        }, 1200);
                        
                    }, 1500);
                    
                }, 800);
                
            }, 1200);
            
        }, 2000);
        
    }, 800);
}

function initPhoneChat() {
    if (chatCompleted) {
        btnJourneyTrigger.classList.add('active');
        chatMessagesContainer.innerHTML = `
            <div class="msg-bubble bako-msg">
                <span class="msg-author">Bako</span>
                <p>Obrigado pela ajuda! Vá até a sede da GGOPA para conseguir o remédio supremo e quebrar a minha maldição!</p>
            </div>
        `;
    } else {
        btnJourneyTrigger.classList.remove('active');
        chatMessagesContainer.innerHTML = `
            <div class="msg-bubble bako-msg">
                <span class="msg-author">Bako</span>
                <p>Diga lá, o que você quer me perguntar? Sem mentiras, hein! 😉</p>
            </div>
        `;
    }
    renderChatOptions();
    initJourneyMapState();
}

// Start Phone system
initPhoneChat();

// Queda de Braço Minigame System
function initJourneyMapState() {
    const journeyFase1Completed = localStorage.getItem('mandamau_journey_fase1_completed') === 'true';
    if (journeyFase1Completed) {
        const nodeFase2 = document.getElementById('node-fase2');
        const pathLineFase2 = document.querySelector('.line-fase2');
        if (nodeFase2) {
            nodeFase2.className = 'map-node node-active';
            nodeFase2.title = 'Fase 2 - Disponível';
            const iconSpan = nodeFase2.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚔️';
        }
        if (pathLineFase2) {
            pathLineFase2.classList.add('line-active');
        }
    }
    
    const journeyFase2Completed = localStorage.getItem('mandamau_journey_fase2_completed') === 'true';
    if (journeyFase2Completed) {
        const nodeFase3 = document.getElementById('node-fase3');
        const pathLineFase3 = document.querySelector('.line-fase3');
        if (nodeFase3) {
            nodeFase3.className = 'map-node node-active';
            nodeFase3.title = 'Fase 3 - Disponível';
            const iconSpan = nodeFase3.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚔️';
        }
        if (pathLineFase3) {
            pathLineFase3.classList.add('line-active');
        }
    }
    
    const journeyFase3Completed = localStorage.getItem('mandamau_journey_fase3_completed') === 'true';
    if (journeyFase3Completed) {
        const nodeFase4 = document.getElementById('node-fase4');
        const pathLineFase4 = document.querySelector('.line-fase4');
        if (nodeFase4) {
            nodeFase4.className = 'map-node node-active';
            nodeFase4.title = 'Fase 4 - Disponível';
            const iconSpan = nodeFase4.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚔️';
        }
        if (pathLineFase4) {
            pathLineFase4.classList.add('line-active');
        }
    }

    const journeyFase4Completed = localStorage.getItem('mandamau_journey_fase4_completed') === 'true';
    if (journeyFase4Completed) {
        const nodeGgopa = document.getElementById('node-ggopa');
        const pathLineFase5 = document.querySelector('.line-fase5');
        if (nodeGgopa) {
            nodeGgopa.className = 'map-node node-active';
            nodeGgopa.title = 'Fase 5 - Sede do GGOPA';
            const iconSpan = nodeGgopa.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '🏗️';
        }
        if (pathLineFase5) {
            pathLineFase5.classList.add('line-active');
        }
    }

    const journeyFase5Completed = localStorage.getItem('mandamau_journey_fase5_completed') === 'true';
    if (journeyFase5Completed) {
        const nodeFase6 = document.getElementById('node-fase6');
        const lineFase6 = document.querySelector('.line-fase6');
        if (nodeFase6) {
            nodeFase6.className = 'map-node node-active';
            nodeFase6.title = 'Fase 6 - Volibear';
            const iconSpan = nodeFase6.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '⚡';
        }
        if (lineFase6) lineFase6.classList.add('line-active');
    }

    const journeyFase6Completed = localStorage.getItem('mandamau_journey_fase6_completed') === 'true';
    const nodeFase7 = document.getElementById('node-fase7');
    const lineFase7 = document.querySelector('.line-fase7');
    if (journeyFase6Completed) {
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
            nodeFase7.title = 'Fase 7 - Bloqueada (Derrote Volibear primeiro)';
            const iconSpan = nodeFase7.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '🔒';
        }
        if (lineFase7) lineFase7.classList.remove('line-active');
    }

    const journeyFase7Completed = localStorage.getItem('mandamau_journey_fase7_completed') === 'true';
    if (journeyFase7Completed) {
        const nodeFase8 = document.getElementById('node-fase8');
        const lineFase8 = document.querySelector('.line-fase8');
        if (nodeFase8) {
            nodeFase8.className = 'map-node node-active';
            nodeFase8.title = 'Fase 8 - Disponível';
            const iconSpan = nodeFase8.querySelector('.node-icon');
            if (iconSpan) iconSpan.textContent = '🗣️';
        }
        if (lineFase8) lineFase8.classList.add('line-active');
    }
}

// Add the click listener for Fase 1 Node
document.getElementById('node-fase1').addEventListener('click', () => {
    playSound('click');
    
    // Walk to Fase 1 node (25%, 62%)
    journeyPlayerToken.style.left = '25%';
    journeyPlayerToken.style.top = '62%';
    
    setTimeout(() => {
        playSound('rank_up_med');
        currentBossEncounter = 'kleber';
        setupBossEncounterUI();
        journeyEncounterOverlay.classList.add('active');
    }, 1500);
});

// Add the click listener for Fase 2 Node
document.getElementById('node-fase2').addEventListener('click', () => {
    const journeyFase1Completed = localStorage.getItem('mandamau_journey_fase1_completed') === 'true';
    if (journeyFase1Completed) {
        playSound('click');
        
        // Walk from Fase 1 node (25%, 62%) to Fase 2 node (40%, 50%)
        journeyPlayerToken.style.left = '40%';
        journeyPlayerToken.style.top = '50%';
        
        setTimeout(() => {
            const nodeFase2Element = document.getElementById('node-fase2');
            const pathLineFase2Element = document.querySelector('.line-fase2');
            if (nodeFase2Element) nodeFase2Element.classList.add('node-active');
            if (pathLineFase2Element) pathLineFase2Element.classList.add('line-active');
            
            playSound('rank_up_med');
            currentBossEncounter = 'gwen';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1500);
    }
});

// ---- Journey map: GGOPA node click ----
document.getElementById('node-ggopa').addEventListener('click', () => {
    const fase4Done = localStorage.getItem('mandamau_journey_fase4_completed') === 'true';
    if (fase4Done) {
        playSound('click');
        journeyPlayerToken.style.left = '90%';
        journeyPlayerToken.style.top  = '20%';
        setTimeout(() => {
            currentBossEncounter = 'felifep';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1000);
    }
});