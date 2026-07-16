/**
 * Mandamau Counter - Interactive Animated Canvas Background
 * Created by Antigravity
 * 
 * Provides unique, theme-adaptive, high-performance canvas particles and
 * micro-interactions for Midnight Cosmic, Cyberpunk, Crimson Infernal,
 * Synthwave Retro, and Golden Demiurge.
 */

(function () {
    let canvas = document.getElementById('bg-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'bg-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);
    }

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Mouse state
    const mouse = {
        x: null,
        y: null,
        radius: 140,
        lastX: null,
        lastY: null,
        speed: 0
    };

    // Track mouse
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        if (mouse.lastX !== null && mouse.lastY !== null) {
            const dx = mouse.x - mouse.lastX;
            const dy = mouse.y - mouse.lastY;
            mouse.speed = Math.min(50, Math.sqrt(dx * dx + dy * dy)); // Cap speed
        }
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
        mouse.speed = 0;
    });

    // Resize canvas
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    });

    // Hex/Color helpers
    function hexToRgba(colorStr, alpha) {
        if (!colorStr) return `rgba(255, 255, 255, ${alpha})`;
        colorStr = colorStr.trim();
        if (colorStr.startsWith('rgba')) {
            return colorStr.replace(/[\d\.]+\)$/, `${alpha})`);
        }
        if (colorStr.startsWith('rgb')) {
            return colorStr.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        }
        // Hex colors
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(colorStr)) {
            c = colorStr.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${alpha})`;
        }
        return colorStr;
    }

    // Retrieve active theme and custom properties
    function getTheme() {
        if (document.body.classList.contains('theme-cyberpunk')) return 'cyberpunk';
        if (document.body.classList.contains('theme-infernal')) return 'infernal';
        if (document.body.classList.contains('theme-synthwave')) return 'synthwave';
        if (document.body.classList.contains('theme-gold')) return 'gold';
        return 'cosmic'; // default
    }

    function getThemeColors() {
        const style = getComputedStyle(document.body);
        return {
            primary: style.getPropertyValue('--text-primary').trim() || '#ffffff',
            secondary: style.getPropertyValue('--text-secondary').trim() || '#94a3b8',
            btnSumStart: style.getPropertyValue('--btn-sum-start').trim() || '#06b6d4',
            btnMulStart: style.getPropertyValue('--btn-mul-start').trim() || '#d946ef'
        };
    }

    let currentTheme = getTheme();
    let themeColors = getThemeColors();
    let particles = [];

    // Particle design & physics class
    class Particle {
        constructor(theme) {
            this.reset(theme, true);
        }

        reset(theme, isStart = false) {
            this.x = Math.random() * width;
            // Spawn infernal embers at bottom, others randomly
            if (theme === 'infernal' && !isStart) {
                this.y = height + Math.random() * 20;
            } else {
                this.y = Math.random() * height;
            }

            this.size = Math.random() * 3 + 1.5;
            this.color = '';
            this.alpha = Math.random() * 0.5 + 0.3;
            this.phase = Math.random() * Math.PI * 2;
            this.phaseSpeed = Math.random() * 0.02 + 0.01;
            
            // Speed vectors based on themes
            if (theme === 'cosmic') {
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = (Math.random() - 0.5) * 0.35;
                this.size = Math.random() * 2.5 + 1;
            } else if (theme === 'cyberpunk') {
                // Digital grid-aligned drift
                if (Math.random() > 0.5) {
                    this.vx = (Math.random() > 0.5 ? 0.6 : -0.6);
                    this.vy = 0;
                } else {
                    this.vx = 0;
                    this.vy = (Math.random() > 0.5 ? 0.6 : -0.6);
                }
                this.size = Math.random() * 4 + 2;
                this.glitchTimer = Math.random() * 200;
            } else if (theme === 'infernal') {
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = -(Math.random() * 0.8 + 0.4); // moving upwards
                this.size = Math.random() * 4 + 1.5;
                this.maxLife = Math.random() * 150 + 100;
                this.life = this.maxLife;
            } else if (theme === 'synthwave') {
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.size = Math.random() * 3.5 + 1.5;
                this.shape = Math.random() > 0.5 ? 'triangle' : 'circle';
            } else if (theme === 'gold') {
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = Math.random() * 0.2 + 0.15; // slow golden descend
                this.size = Math.random() * 3 + 1;
                this.amplitude = Math.random() * 1.5 + 0.5;
            }
        }

        update(theme, colors) {
            this.phase += this.phaseSpeed;

            // Calculate distance to mouse
            let dx = 0;
            let dy = 0;
            let dist = 99999;
            if (mouse.x !== null) {
                dx = mouse.x - this.x;
                dy = mouse.y - this.y;
                dist = Math.sqrt(dx * dx + dy * dy);
            }

            if (theme === 'cosmic') {
                // Gentle gravity pull when cursor is near
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.vx += (dx / dist) * force * 0.04;
                    this.vy += (dy / dist) * force * 0.04;
                }
                // Drift + Friction
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.x += this.vx;
                this.y += this.vy;

                // Screen boundaries wrapping
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

            } else if (theme === 'cyberpunk') {
                // High repulsion force
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    // Push away fast
                    this.vx -= (dx / dist) * force * 1.2;
                    this.vy -= (dy / dist) * force * 1.2;
                }

                // Cyber friction and limits
                this.vx *= 0.88;
                this.vy *= 0.88;

                // Cyber grid re-alignment
                if (Math.abs(this.vx) < 0.15 && Math.abs(this.vy) < 0.15) {
                    if (Math.random() > 0.98) {
                        if (Math.random() > 0.5) {
                            this.vx = (Math.random() > 0.5 ? 0.6 : -0.6);
                            this.vy = 0;
                        } else {
                            this.vx = 0;
                            this.vy = (Math.random() > 0.5 ? 0.6 : -0.6);
                        }
                    }
                }

                this.x += this.vx;
                this.y += this.vy;

                // Glitch effect: 0.8% chance to teleport slightly
                if (Math.random() < 0.008) {
                    this.x += (Math.random() - 0.5) * 40;
                    this.y += (Math.random() - 0.5) * 40;
                }

                // Bounce
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

            } else if (theme === 'infernal') {
                // Repelled as heat drafts
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    // Push away horizontally
                    this.vx -= (dx / dist) * force * 0.9;
                    // Rising faster near heat (upwards)
                    this.vy -= force * 0.7;
                }

                this.vx *= 0.96;
                this.vy = Math.max(-3, this.vy * 0.98 + (-(Math.random() * 0.05 + 0.02))); // Cap upwards speed

                // Sway horizontal using sine wave
                this.x += this.vx + Math.sin(this.phase) * 0.4;
                this.y += this.vy;

                this.life--;

                // Recycle if dead or out of viewport
                if (this.life <= 0 || this.y < -10 || this.x < 0 || this.x > width) {
                    this.reset(theme);
                }

            } else if (theme === 'synthwave') {
                // Rubber sheet displacement (Warping)
                // Particles are not pushed permanently, but dynamically offset when rendered.
                // We keep their normal coordinate drift going.
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

            } else if (theme === 'gold') {
                // Orbit/attraction swirling around mouse
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    // Swirl components (perpendicular vector + attraction vector)
                    this.vx += Math.cos(angle + Math.PI / 2) * force * 0.22 + Math.cos(angle) * force * 0.12;
                    this.vy += Math.sin(angle + Math.PI / 2) * force * 0.22 + Math.sin(angle) * force * 0.12;
                }

                this.vx *= 0.95;
                this.vy = this.vy * 0.95 + 0.01; // constant slow gold dust weight

                // Wavy movement
                this.x += this.vx + Math.sin(this.phase) * this.amplitude * 0.6;
                this.y += this.vy;

                // Recycle if falling past screen
                if (this.y > height || this.x < 0 || this.x > width) {
                    this.reset(theme);
                }
            }
        }

        draw(ctx, theme, colors) {
            let drawX = this.x;
            let drawY = this.y;
            let drawSize = this.size;

            // Apply synthwave warp displacement
            if (theme === 'synthwave' && mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const warp = (mouse.radius - dist) / mouse.radius;
                    // Push rendering coordinate slightly away from cursor to warp the web
                    drawX = this.x - (dx / dist) * warp * 25;
                    drawY = this.y - (dy / dist) * warp * 25;
                }
            }

            ctx.save();

            if (theme === 'cosmic') {
                // Soft glowing circles
                const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, drawSize * 2.5);
                const baseColor = this.phase % 2 > 1 ? colors.btnSumStart : colors.btnMulStart;
                grad.addColorStop(0, hexToRgba(baseColor, this.alpha));
                grad.addColorStop(0.3, hexToRgba(baseColor, this.alpha * 0.6));
                grad.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(drawX, drawY, drawSize * 2.5, 0, Math.PI * 2);
                ctx.fill();

            } else if (theme === 'cyberpunk') {
                // Digital squares
                const isGlitching = Math.random() > 0.97;
                const color = isGlitching ? colors.primary : (this.phase % 2 > 1 ? colors.btnSumStart : colors.btnMulStart);
                
                // Drawing outer glow box manually (much faster than shadowBlur)
                ctx.fillStyle = hexToRgba(color, 0.15);
                ctx.fillRect(drawX - drawSize * 1.5, drawY - drawSize * 1.5, drawSize * 3, drawSize * 3);

                ctx.fillStyle = hexToRgba(color, this.alpha);
                ctx.fillRect(drawX - drawSize / 2, drawY - drawSize / 2, drawSize, drawSize);

            } else if (theme === 'infernal') {
                // Diamonds/brasas
                const ratio = this.life / this.maxLife;
                const sizeMult = 0.5 + 0.5 * ratio;
                const finalSize = drawSize * sizeMult;
                
                // Color gets redder/dimmer over life
                const col = ratio > 0.6 ? colors.btnMulStart : (ratio > 0.3 ? colors.btnSumStart : '#7f1d1d');
                
                ctx.fillStyle = hexToRgba(col, this.alpha * ratio);
                
                ctx.beginPath();
                ctx.moveTo(drawX, drawY - finalSize);
                ctx.lineTo(drawX + finalSize / 1.3, drawY);
                ctx.lineTo(drawX, drawY + finalSize);
                ctx.lineTo(drawX - finalSize / 1.3, drawY);
                ctx.closePath();
                ctx.fill();

            } else if (theme === 'synthwave') {
                // Neon shapes
                const baseColor = this.phase % 2 > 1 ? '#fe4cac' : '#38bdf8'; // Hot Pink / Neon Blue
                ctx.fillStyle = hexToRgba(baseColor, this.alpha);
                ctx.strokeStyle = hexToRgba(baseColor, this.alpha * 0.8);
                ctx.lineWidth = 1;

                if (this.shape === 'triangle') {
                    ctx.beginPath();
                    ctx.moveTo(drawX, drawY - drawSize);
                    ctx.lineTo(drawX + drawSize, drawY + drawSize / 2);
                    ctx.lineTo(drawX - drawSize, drawY + drawSize / 2);
                    ctx.closePath();
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(drawX, drawY, drawSize, 0, Math.PI * 2);
                    ctx.fill();
                }

            } else if (theme === 'gold') {
                // Sparkling stars/dust
                const spark = 0.5 + 0.5 * Math.sin(this.phase * 2);
                const finalSize = drawSize * (0.6 + 0.4 * spark);
                ctx.fillStyle = hexToRgba(colors.primary, this.alpha * (0.5 + 0.5 * spark));
                
                // Draw 4-point gold sparkle star
                ctx.beginPath();
                ctx.moveTo(drawX, drawY - finalSize * 1.5);
                ctx.quadraticCurveTo(drawX, drawY, drawX + finalSize * 1.5, drawY);
                ctx.quadraticCurveTo(drawX, drawY, drawX, drawY + finalSize * 1.5);
                ctx.quadraticCurveTo(drawX, drawY, drawX - finalSize * 1.5, drawY);
                ctx.quadraticCurveTo(drawX, drawY, drawX, drawY - finalSize * 1.5);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }
    }

    function initParticles() {
        particles = [];
        let count = 65;

        // Scale by theme count & screen density
        const theme = getTheme();
        if (theme === 'infernal') count = 100;
        else if (theme === 'cosmic') count = 75;
        else if (theme === 'cyberpunk') count = 50;
        else if (theme === 'synthwave') count = 40; // triangulations take more loop power
        else if (theme === 'gold') count = 80;

        if (width < 768) {
            count = Math.floor(count * 0.5); // 50% count on mobile
        }

        for (let i = 0; i < count; i++) {
            particles.push(new Particle(theme));
        }
    }

    // Extra background lines drawing for connection/constellation effects
    function drawConnections(theme, colors) {
        if (particles.length === 0) return;

        ctx.save();

        if (theme === 'cosmic') {
            // Cosmic connections: Simple distance constellation lines
            const maxDist = 95;
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                
                // Connect to mouse if close
                if (mouse.x !== null) {
                    const dx = mouse.x - p1.x;
                    const dy = mouse.y - p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        ctx.strokeStyle = hexToRgba(colors.btnSumStart, (1 - dist / mouse.radius) * 0.22);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDist) {
                        const alpha = (maxDist - dist) / maxDist * 0.12;
                        ctx.strokeStyle = hexToRgba(colors.btnMulStart, alpha);
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

        } else if (theme === 'synthwave') {
            // Retro wireframe mesh connection (Connecting nearest neighbors into triangles)
            const maxDist = 120;
            
            // Loop through and connect nearest neighbors
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                
                // Find nearest neighbors
                const neighbors = [];
                for (let j = 0; j < particles.length; j++) {
                    if (i === j) continue;
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDist) {
                        neighbors.push({ particle: p2, dist: dist });
                    }
                }

                // Sort by distance
                neighbors.sort((a, b) => a.dist - b.dist);

                // Draw triangles between p1 and nearest 2 neighbors
                if (neighbors.length >= 2) {
                    const n1 = neighbors[0].particle;
                    const n2 = neighbors[1].particle;

                    // Calculate warped positions for mesh warping under cursor
                    let x1 = p1.x, y1 = p1.y;
                    let x2 = n1.x, y2 = n1.y;
                    let x3 = n2.x, y3 = n2.y;

                    if (mouse.x !== null) {
                        [p1, n1, n2].forEach((p, idx) => {
                            const dxM = mouse.x - p.x;
                            const dyM = mouse.y - p.y;
                            const distM = Math.sqrt(dxM * dxM + dyM * dyM);
                            if (distM < mouse.radius) {
                                const warp = (mouse.radius - distM) / mouse.radius;
                                const ox = -(dxM / distM) * warp * 25;
                                const oy = -(dyM / distM) * warp * 25;
                                if (idx === 0) { x1 += ox; y1 += oy; }
                                else if (idx === 1) { x2 += ox; y2 += oy; }
                                else { x3 += ox; y3 += oy; }
                            }
                        });
                    }

                    // Render semi-transparent pink/cyan retro triangles
                    const fillAlpha = 0.015;
                    ctx.fillStyle = hexToRgba('#fe4cac', fillAlpha);
                    ctx.strokeStyle = hexToRgba('#38bdf8', 0.05);
                    ctx.lineWidth = 0.5;

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineTo(x3, y3);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }

        ctx.restore();
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update values dynamically from style
        themeColors = getThemeColors();

        particles.forEach(p => {
            p.update(currentTheme, themeColors);
            p.draw(ctx, currentTheme, themeColors);
        });

        drawConnections(currentTheme, themeColors);

        requestAnimationFrame(animate);
    }

    // Initialize theme state & Observer
    currentTheme = getTheme();
    themeColors = getThemeColors();
    initParticles();
    animate();

    // Watch for theme class changes on body
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const newTheme = getTheme();
                if (newTheme !== currentTheme) {
                    currentTheme = newTheme;
                    initParticles();
                }
            }
        });
    });
    observer.observe(document.body, { attributes: true });

})();
