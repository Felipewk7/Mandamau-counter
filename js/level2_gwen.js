// Gwen Quiz System (Fase 2)
const gwenQuizOverlay = document.getElementById('gwen-quiz-overlay');
const gwenQuizCard = document.getElementById('gwen-quiz-card');
const btnGwenQuit = document.getElementById('btn-gwen-quit');
const gwenSpeech = document.getElementById('gwen-speech');
const gwenTimerBar = document.getElementById('gwen-timer-bar');
const gwenTimerText = document.getElementById('gwen-timer-text');
const gwenEquationDisplay = document.getElementById('gwen-equation-display');
const gwenAnswerButtons = document.querySelectorAll('.gwen-answer-btn');
const gwenProgressText = document.getElementById('gwen-progress-text');
const gwenProgressBar = document.getElementById('gwen-progress-bar');
const gwenLivesHearts = document.getElementById('gwen-lives-hearts');

const gwenWinOverlay = document.getElementById('gwen-win-overlay');
const gwenLoseOverlay = document.getElementById('gwen-lose-overlay');
const btnGwenWinOk = document.getElementById('btn-gwen-win-ok');
const btnGwenRestart = document.getElementById('btn-gwen-restart');
const gwenWinSpeech = document.getElementById('gwen-win-speech');

const gwenTutorialModal = document.getElementById('gwen-tutorial-modal');
const btnCloseGwenTutorial = document.getElementById('btn-close-gwen-tutorial');

let gwenScore = 0;
let gwenLives = 3;
let gwenTimer = null;
let gwenTimeLeft = 15;
let gwenActive = false;
let currentCorrectAnswer = 0;
let isPrankQuestion = false;

const gwenPhrasesNormal = [
    "Resolve essa se for capaz! 🧠",
    "Mais uma! Quero ver se você aguenta o ritmo! ⚡",
    "Hum... essa é um pouco mais chata, hein?",
    "Não vale usar calculadora! 📱❌",
    "Aposto que você vai vacilar nessa."
];

const gwenPhrasesCorrect = [
    "Humph... você deu sorte! 😤",
    "Acertou? Tá bom, mas a próxima vai te derrubar!",
    "Ok, talvez você não seja tão burro assim.",
    "Ah! Essa era muito fácil mesmo.",
    "Blergh... continue assim e eu vou ter que me esforçar."
];

const gwenPhrasesIncorrect = [
    "Hahaha! Errado! Tente de novo, novato! 😜",
    "Poxa, sério? Essa era nível pré-escola! 👶",
    "Errou feio, errou rude! 😂",
    "Ih, travou? Que vergonha! 🤭",
    "Erradíssimo! Minha avó resolveria essa mais rápido!"
];

function openGwenQuiz() {
    gwenQuizOverlay.classList.add('active');
    gwenWinOverlay.style.display = 'none';
    gwenLoseOverlay.style.display = 'none';
    gwenTutorialModal.classList.add('active'); // force tutorial modal first!
    isGwenTutorialOpen = true;
    gwenScore = 0;
    gwenLives = 3;
    isPrankQuestion = false;
    gwenActive = false; // paused
    updateGwenUI();
}

function updateGwenUI() {
    gwenProgressText.textContent = `Perguntas respondidas: ${gwenScore}/5`;
    gwenProgressBar.style.width = `${gwenScore * 20}%`;
    
    let hearts = "";
    for (let i = 0; i < 3; i++) {
        hearts += i < gwenLives ? "❤️" : "🖤";
    }
    gwenLivesHearts.textContent = hearts;
}

function generateGwenQuestion() {
    if (!gwenActive) return;
    
    gwenAnswerButtons.forEach(btn => {
        btn.className = 'gwen-answer-btn';
        btn.disabled = false;
    });
    
    if (gwenScore === 4) {
        const xList = [10, 20, 25, 30, 40, 50, 75];
        const yList = [20, 40, 50, 80, 100, 120, 150, 200];
        const x = xList[Math.floor(Math.random() * xList.length)];
        const y = yList[Math.floor(Math.random() * yList.length)];
        
        currentCorrectAnswer = (x * y) / 100;
        gwenEquationDisplay.textContent = `${x}% de ${y} = ?`;
        gwenSpeech.textContent = "Olha só: a quinta pergunta é de porcentagem! Vai encarar? 😈";
        
        setupGwenChoices(currentCorrectAnswer, false);
        startGwenTimer();
    } else {
        const opType = Math.floor(Math.random() * 4); // 0 = addition, 1 = subtraction, 2 = multiplication, 3 = division
        let equationText = "";
        
        if (opType === 0) {
            const a = Math.floor(Math.random() * 46) + 5;
            const b = Math.floor(Math.random() * 46) + 5;
            currentCorrectAnswer = a + b;
            equationText = `${a} + ${b} = ?`;
        } else if (opType === 1) {
            const a = Math.floor(Math.random() * 46) + 15;
            const b = Math.floor(Math.random() * (a - 5)) + 5;
            currentCorrectAnswer = a - b;
            equationText = `${a} - ${b} = ?`;
        } else if (opType === 2) {
            const a = Math.floor(Math.random() * 9) + 2;
            const b = Math.floor(Math.random() * 11) + 2;
            currentCorrectAnswer = a * b;
            equationText = `${a} × ${b} = ?`;
        } else {
            const b = Math.floor(Math.random() * 9) + 2;
            const ans = Math.floor(Math.random() * 9) + 2;
            const a = b * ans;
            currentCorrectAnswer = ans;
            equationText = `${a} ÷ ${b} = ?`;
        }
        
        gwenEquationDisplay.textContent = equationText;
        gwenSpeech.textContent = gwenPhrasesNormal[Math.floor(Math.random() * gwenPhrasesNormal.length)];
        
        setupGwenChoices(currentCorrectAnswer, false);
        startGwenTimer();
    }
}

function setupGwenChoices(correctVal, isPrank) {
    let choices = [correctVal];
    
    if (isPrank) {
        choices = [0.9, 1.2, 0.5, 1.5];
    } else {
        while (choices.length < 4) {
            let offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
            let wrongVal = correctVal + offset;
            
            if (wrongVal >= 0 && !choices.includes(wrongVal)) {
                choices.push(wrongVal);
            }
        }
        choices.sort(() => Math.random() - 0.5);
    }
    
    gwenAnswerButtons.forEach((btn, idx) => {
        btn.textContent = choices[idx];
        btn.dataset.correct = (choices[idx] === correctVal).toString();
    });
}

function startGwenTimer() {
    if (gwenTimer) clearInterval(gwenTimer);
    
    const totalDuration = 15;
    let timeElapsed = 0;
    
    gwenTimerText.textContent = "15s";
    gwenTimerBar.style.width = "100%";
    
    gwenTimer = setInterval(() => {
        if (!gwenActive || isTutorialOpen || isGwenTutorialOpen) return;
        
        timeElapsed += 0.1;
        gwenTimeLeft = totalDuration - timeElapsed;
        
        if (gwenTimeLeft <= 0) {
            gwenTimeLeft = 0;
            clearInterval(gwenTimer);
            gwenTimerBar.style.width = "0%";
            gwenTimerText.textContent = "0s";
            handleGwenTimeout();
        } else {
            gwenTimerBar.style.width = `${(gwenTimeLeft / totalDuration) * 100}%`;
            gwenTimerText.textContent = `${Math.ceil(gwenTimeLeft)}s`;
        }
    }, 100);
}

function handleGwenTimeout() {
    playSound('bako_cheat');
    gwenSpeech.textContent = "Tempo esgotado! Dormiu no ponto? 😴";
    
    gwenScore = Math.max(0, gwenScore - 1);
    gwenLives--;
    updateGwenUI();
    
    gwenQuizCard.classList.add('gwen-shake');
    setTimeout(() => gwenQuizCard.classList.remove('gwen-shake'), 500);
    
    if (gwenLives <= 0) {
        showGwenGameOver();
    } else {
        setTimeout(generateGwenQuestion, 1500);
    }
}

gwenAnswerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!gwenActive) return;
        
        clearInterval(gwenTimer);
        gwenAnswerButtons.forEach(b => b.disabled = true);
        
        const isCorrect = btn.dataset.correct === "true";
        
        if (isPrankQuestion) {
            if (isCorrect) {
                gwenWinSpeech.textContent = "Caraca, você é um NERD mesmo! Como você acertou isso de cabeça?! Enfim, você passou, pegue o seu acesso.";
            } else {
                gwenWinSpeech.textContent = "Hahaha, era zoeira! Como se alguém soubesse isso de cabeça! Você passou, toma aqui o acesso à próxima fase.";
            }
            showGwenVictory();
        } else {
            if (isCorrect) {
                btn.classList.add('correct');
                playSound('rank_up_med');
                if (gwenScore === 4) {
                    unlockAchievement('gwen_bonus');
                }
                gwenScore++;
                gwenSpeech.textContent = gwenPhrasesCorrect[Math.floor(Math.random() * gwenPhrasesCorrect.length)];
            } else {
                btn.classList.add('incorrect');
                gwenAnswerButtons.forEach(b => {
                    if (b.dataset.correct === "true") b.classList.add('correct');
                });
                
                playSound('bako_cheat');
                gwenScore = Math.max(0, gwenScore - 1);
                gwenLives--;
                gwenSpeech.textContent = gwenPhrasesIncorrect[Math.floor(Math.random() * gwenPhrasesIncorrect.length)];
                
                gwenQuizCard.classList.add('gwen-shake');
                setTimeout(() => gwenQuizCard.classList.remove('gwen-shake'), 500);
            }
            
            updateGwenUI();
            
            if (gwenLives <= 0) {
                setTimeout(showGwenGameOver, 1200);
            } else if (gwenScore === 5) {
                setTimeout(launchLinearRegressionPrank, 1200);
            } else {
                setTimeout(generateGwenQuestion, 1200);
            }
        }
    });
});

function launchLinearRegressionPrank() {
    isPrankQuestion = true;
    
    gwenAnswerButtons.forEach(btn => {
        btn.className = 'gwen-answer-btn';
        btn.disabled = false;
    });
    
    gwenEquationDisplay.textContent = "y = a + bx";
    gwenEquationDisplay.style.fontSize = "2.2rem";
    gwenSpeech.textContent = "Calcule o coeficiente angular b1 da reta de regressão linear para os pontos: (1,2), (2,3), (3,5), (4,4), (5,6) 😈";
    
    gwenTimerBar.style.width = "0%";
    gwenTimerText.textContent = "Sem tempo limite";
    
    setupGwenChoices(0.9, true);
}

function showGwenVictory() {
    unlockAchievement('gwen_win');
    unlockCosmetic('gwen');
    gwenWinOverlay.style.display = 'flex';
}

function showGwenGameOver() {
    gwenLoseOverlay.style.display = 'flex';
}

function closeGwenQuiz() {
    gwenActive = false;
    clearInterval(gwenTimer);
    fadeOutTheme();
    gwenQuizOverlay.classList.remove('active');
    gwenTutorialModal.classList.remove('active');
    isGwenTutorialOpen = false;
    gwenQuizCard.classList.remove('gwen-shake');
}

btnGwenQuit.addEventListener('click', () => {
    closeGwenQuiz();
    playSound('click');
});

btnGwenWinOk.addEventListener('click', () => {
    closeGwenQuiz();
    playSound('rank_up');
    
    localStorage.setItem('mandamau_journey_fase2_completed', 'true');
    
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
    
    // AUTO-WALK from Fase 2 node (40%, 50%) to Fase 3 node (55%, 40%)
    setTimeout(() => {
        journeyPlayerToken.style.left = '55%';
        journeyPlayerToken.style.top = '40%';
        
        setTimeout(() => {
            playSound('rank_up_med');
            currentBossEncounter = 'sam';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1500); // 1.5s walking animation
    }, 800);
});

// Add the click listener for Fase 3 Node
document.getElementById('node-fase3').addEventListener('click', () => {
    const journeyFase2Completed = localStorage.getItem('mandamau_journey_fase2_completed') === 'true';
    if (journeyFase2Completed) {
        playSound('click');
        
        // Walk from Fase 2 node (40%, 50%) to Fase 3 node (55%, 40%)
        journeyPlayerToken.style.left = '55%';
        journeyPlayerToken.style.top = '40%';
        
        setTimeout(() => {
            const nodeFase3Element = document.getElementById('node-fase3');
            const pathLineFase3Element = document.querySelector('.line-fase3');
            if (nodeFase3Element) nodeFase3Element.classList.add('node-active');
            if (pathLineFase3Element) pathLineFase3Element.classList.add('line-active');
            
            playSound('rank_up_med');
            currentBossEncounter = 'sam';
            setupBossEncounterUI();
            journeyEncounterOverlay.classList.add('active');
        }, 1500);
    }
});

btnGwenRestart.addEventListener('click', () => {
    playSound('click');
    gwenQuizOverlay.classList.add('active');
    gwenWinOverlay.style.display = 'none';
    gwenLoseOverlay.style.display = 'none';
    isGwenTutorialOpen = false;
    gwenScore = 0;
    gwenLives = 3;
    isPrankQuestion = false;
    gwenActive = true;
    updateGwenUI();
    generateGwenQuestion();
});

btnCloseGwenTutorial.addEventListener('click', () => {
    isGwenTutorialOpen = false;
    gwenTutorialModal.classList.remove('active');
    playSound('click');
    playTheme('fase2');
    gwenActive = true;
    startGwenTimer();
    generateGwenQuestion();
});

// Sam Food Smash System (Fase 3)