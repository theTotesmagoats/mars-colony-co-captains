/**
 * Rendering Engine for Mars Colony Co-Captains
 * 
 * Manages canvas rendering, animations, effects, and visual feedback
 * Consumes game state to produce visuals - does not make decisions
 */

export class RenderingEngine {
    constructor(containerElement) {
        this.container = containerElement;
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        
        // Animation system
        this.animationFrameId = null;
        this.lastTime = 0;
        this.timeScale = 1.0;
        
        // Visual state
        this.state = {
            stars: [],
            shipSilhouette: null,
           窗外View: null,
            alertLevel: 'normal',
            lighting: { ambient: 0.8, accent: 0.2 }
        };
        
        // Particle system
        this.particles = [];
        
        // Initialize
        this.init();
    }
    
    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        
        // Setup context
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Set up event listeners
        window.addEventListener('resize', () => this.resize());
        
        // Initialize starscape
        this._generateStarscape(500);
        
        // Start animation loop
        this.animationLoop = this.animationLoop.bind(this);
        requestAnimationFrame(this.animationLoop);
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        // Handle high-DPI displays (iPad Retina)
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    }
    
    _generateStarscape(count) {
        this.state.stars = [];
        
        for (let i = 0; i < count; i++) {
            const star = {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.005
            };
            
            // Parallax layers based on distance
            if (i < count * 0.7) {
                star.layer = 'near'; // Closer stars move faster
                star.baseX = star.x;
            } else if (i < count * 0.9) {
                star.layer = 'middle';
                star.baseX = star.x;
            } else {
                star.layer = 'far';
            }
            
            this.state.stars.push(star);
        }
    }
    
    // Update rendering state based on game data
    updateState(gameState) {
        // Extract relevant state for visuals
        const voyageState = gameState.voyage;
        const shipState = gameState.ship;
        
        // Update alert level
        if (gameState.debug.paused) {
            this.state.alertLevel = 'paused';
        } else if (voyageState.status.morale < 40 || shipState.systems.lifeSupport.integrity < 60) {
            this.state.alertLevel = 'yellow';
        } else if (shipState.systems.engines.wear > 85 || voyageState.distanceRemainingAU < 0.1) {
            this.state.alertLevel = 'red';
        } else {
            this.state.alertLevel = 'normal';
        }
        
        // Update lighting based on alert level
        switch(this.state.alertLevel) {
            case 'paused':
                this.state.lighting.ambient = 0.6;
                this.state.lighting.accent = 0.15;
                break;
            case 'yellow':
                this.state.lighting.ambient = 0.7;
                this.state.lighting.accent = 0.35;
                break;
            case 'red':
                this.state.lighting.ambient = 0.5;
                this.state.lighting.accent = 0.45;
                break;
            default:
                this.state.lighting.ambient = 0.8;
                this.state.lighting.accent = 0.2;
        }
        
        // Add particles for special states
        if (this.state.alertLevel === 'red') {
            this._addAlertParticles();
        }
    }
    
    _addAlertParticles() {
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: -10,
                size: Math.random() * 3 + 2,
                speedY: Math.random() * 3 + 2,
                color: 'rgba(231, 76, 60, 0.8)',
                decay: 0.95
            });
        }
    }
    
    // Animation loop
    animationLoop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        if (!this.state.paused) {
            this.update(deltaTime);
            this.draw();
        }
        
        requestAnimationFrame(this.animationLoop);
    }
    
    update(deltaTime) {
        // Update starfield parallax
        const shipSpeed = Math.min(1, (this.width / 2000)); // Visual speed based on screen size
        
        for (const star of this.state.stars) {
            // Move stars based on layer and time
            if (star.layer !== 'far') {
                const speedAdjustment = star.layer === 'near' ? shipSpeed * 3 : shipSpeed * 1.5;
                star.x -= speedAdjustment * deltaTime * 60;
                
                // Reset to other side when off screen
                if (star.x < -20) {
                    star.x = this.width + 20;
                }
            }
            
            // Twinkle effect
            star.brightness += star.twinkleSpeed * deltaTime * 30;
            if (star.brightness > 1 || star.brightness < 0.3) {
                star.twinkleSpeed *= -1;
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.y += p.speedY * deltaTime * 60;
            
            if (p.y > this.height || Math.random() < p.decay) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0b14';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw starscape
        for (const star of this.state.stars) {
            const alpha = Math.max(0.3, Math.min(1, star.brightness));
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw particles
        for (const p of this.particles) {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = 0.8;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }
        
        // Draw ship silhouette
        this._drawShipSilhouette();
        
        // Draw alert indicators
        this._drawAlertOverlay();
    }
    
    _drawShipSilhouette() {
        const centerX = this.width / 2;
        const bottomY = this.height * 0.75;
        const scale = Math.min(this.width, this.height) / 800;
        
        // Main body
        this.ctx.fillStyle = '#1a1d2e';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 30 * scale, bottomY);
        this.ctx.lineTo(centerX - 45 * scale, bottomY - 60 * scale);
        this.ctx.lineTo(centerX + 45 * scale, bottomY - 60 * scale);
        this.ctx.lineTo(centerX + 30 * scale, bottomY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Engine glow
        const engineAlpha = this.state.alertLevel === 'red' ? 1.0 : 0.5;
        this.ctx.fillStyle = `rgba(61, 142, 255, ${engineAlpha})`;
        
        if (this.state.alertLevel === 'red') {
            // Pulsing effect for red alert
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            this.ctx.shadowColor = '#e74c3c';
            this.ctx.shadowBlur = 20 * scale * pulse;
        }
        
        // Draw engine nozzles
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 15 * scale, bottomY);
        this.ctx.lineTo(centerX - 18 * scale, bottomY + 35 * scale);
        this.ctx.lineTo(centerX - 12 * scale, bottomY + 35 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + 15 * scale, bottomY);
        this.ctx.lineTo(centerX + 18 * scale, bottomY + 35 * scale);
        this.ctx.lineTo(centerX + 12 * scale, bottomY + 35 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Reset shadow
        if (this.state.alertLevel === 'red') {
            this.ctx.shadowBlur = 0;
        }
    }
    
    _drawAlertOverlay() {
        // Red alert strobe effect
        if (this.state.alertLevel === 'red' && Math.random() < 0.05) {
            this.ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Draw window border effect
        const scale = Math.min(this.width, this.height) / 800;
        
        // Window glow
        const centerX = this.width / 2;
        const bottomY = this.height * 0.75;
        
        this.ctx.strokeStyle = `rgba(61, 142, 255, ${this.state.lighting.accent})`;
        this.ctx.lineWidth = 3 * scale;
        
        // Draw window frame
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 40 * scale, bottomY);
        this.ctx.lineTo(centerX - 60 * scale, bottomY - 80 * scale);
        this.ctx.lineTo(centerX + 60 * scale, bottomY - 80 * scale);
        this.ctx.lineTo(centerX + 40 * scale, bottomY);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    // Special effects methods
    
    triggerCinematicSequence(type) {
        switch(type) {
            case 'marsApproach':
                this._showMarsApproachEffect();
                break;
            case 'engineBurn':
                this._showEngineBurnEffect();
                break;
            case 'redAlert':
                this.state.alertLevel = 'red';
                this._addAlertParticles();
                break;
        }
    }
    
    _showMarsApproachEffect() {
        // Create Mars visualization
        const marsSize = Math.min(this.width, this.height) * 0.25;
        const centerX = this.width / 2;
        const bottomY = this.height * 0.6;
        
        // Draw Mars
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.shadowColor = '#f39c12';
        this.ctx.shadowBlur = 50;
        
        for (let r = 0; r < marsSize; r += 5) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, bottomY, r, 0, Math.PI * 2);
            
            if (r < 100) {
                this.ctx.fillStyle = `rgba(231, 76, 60, ${1 - r / 100})`;
            } else {
                this.ctx.fillStyle = '#c0392b';
            }
            
            this.ctx.fill();
        }
        
        // Dust plume
        for (let i = 0; i < 20; i++) {
            const dustX = centerX + (Math.random() - 0.5) * marsSize * 1.5;
            const dustY = bottomY + (Math.random() - 0.5) * marsSize;
            
            this.ctx.fillStyle = 'rgba(243, 156, 18, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(dustX, dustY, Math.random() * 5 + 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    _showEngineBurnEffect() {
        const centerX = this.width / 2;
        const bottomY = this.height * 0.75;
        const scale = Math.min(this.width, this.height) / 800;
        
        // Draw engine exhaust
        for (let i = 0; i < 30; i++) {
            const exhaustX = centerX + (Math.random() - 0.5) * 20 * scale;
            const exhaustY = bottomY + 35 * scale + Math.random() * 100;
            
            this.ctx.fillStyle = `rgba(61, 142, 255, ${Math.random()})`;
            this.ctx.beginPath();
            this.ctx.arc(exhaustX, exhaustY, Math.random() * 8 + 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // Pause methods
    
    pause() {
        this.state.paused = true;
    }
    
    resume() {
        this.state.paused = false;
    }
    
    setAlertLevel(level) {
        this.state.alertLevel = level;
        
        switch(level) {
            case 'normal':
                document.body.style.backgroundColor = '#0a0b14';
                break;
            case 'yellow':
                document.body.style.backgroundColor = '#1a1d2e';
                break;
            case 'red':
                document.body.style.backgroundColor = '#2c0f0f';
                break;
        }
    }
}
