
    if (btnVolibearQuit) {
        btnVolibearQuit.addEventListener('click', () => {
            closeVolibearGame();
            try { playSound('click'); } catch(e) {}
        });
    }

    if (btnVolibearRestart) {
        btnVolibearRestart.addEventListener('click', () => {
            try { playSound('click'); } catch(e) {}
            startVolibearGame();
        });
    }

    if (btnVolibearWinOk) {
        btnVolibearWinOk.addEventListener('click', () => {
            closeVolibearGame();
            try { playSound('rank_up_high'); } catch(e) {}
            
            // Open journey and navigate DIRECTLY to Chapter 2 with Fase 7 unlocked
            openJourney();
            setTimeout(() => {
                // CRITICAL: go to Chapter 2 map (Volibear is Chapter 2!)
                switchMapChapter(2);
                
                const nodeF7 = document.getElementById('node-fase7');
                const lineF7 = document.querySelector('.line-fase7');
                if (nodeF7) {
                    nodeF7.className = 'map-node node-active';
                    nodeF7.title = 'Fase 7 - Warwick (Desbloqueado!)';
                    const iconSpan = nodeF7.querySelector('.node-icon');
                    if (iconSpan) iconSpan.textContent = '🐺';
                }
                if (lineF7) lineF7.classList.add('line-active');
                
                const token = document.getElementById('journey-player-token');
                if (token) {
                    token.style.left = '40%';
                    token.style.top = '50%';
                }
            }, 600);
        });
    }
});