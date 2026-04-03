/**
 * Chaos Bridge Scene Controller for Mars Colony Co-Captains
 * 
 * Manages the intimate, stealth-focused command environment of the Chaos-class raider
 * Features smaller bridge layout, AI core interface, and tactical emphasis
 */

export class ChaosBridgeScene {
    constructor(gameState, renderingEngine, uiManager) {
        this.gameState = gameState;
        this.renderingEngine = renderingEngine;
        this.uiManager = uiManager;
        
        // Scene components
        this.chaosState = null;
        this.aiInterface = null;
        
        // Bridge layout (smaller and more intimate)
        this.bridgeLayout = {
            seats: 2,
            stations: ['command', 'tactical', 'stealth', 'salvage'],
            aiCoreLocation: { x: 50, y: 80 }, // Percentages relative to bridge
            lightingTheme: 'low-light-bridge'
        };
        
        // Visual state for Chaos ship
        this.visualState = {
            lighting: { ambient: 0.6, accent: 0.4 },
            stealthActive: false,
            alertLevel: 'caution' // Always slightly more tense
        };
    }
    
    async enter() {
        console.log('Entering Chaos Bridge Scene (Stealth Raider)');
        
        // Initialize chaos state
        this.chaosState = new window.MarsColonyApp.gameState.chaosState;
        
        // Setup AI interface
        this._setupAIInterface();
        
        // Setup stealth-focused stations
        await this._setupChaosStations();
        
        // Configure low-light bridge environment
        this._configureLowLightEnvironment();
        
        // Start ambient animations with stealth focus
        this._startStealthAnimations();
        
        // Add AI presence indicator
        this._addAIPresenceIndicator();
        
        return true;
    }
    
    exit() {
        console.log('Exiting Chaos Bridge Scene');
        
        // Cleanup event listeners
        window.removeEventListener('resize', this.resizeHandler);
        
        // Stop animations
        if (this.stealthAnimationId) {
            cancelAnimationFrame(this.stealthAnimationId);
            this.stealthAnimationId = null;
        }
    }
    
    _setupAIInterface() {
        // Create AI core visual representation
        const aiCore = document.createElement('div');
        aiCore.className = 'ai-core-interface';
        aiCore.innerHTML = `
            <h3 class="ai-name">VEX</h3>
            <div class="ai-status">
                <span class="status-indicator active"></span>
                <span class="status-text">Ship AI Online</span>
            </div>
            <div class="ai-personality-bar">
                <div class="personality-trait" data-trait="snarky">Snarky</div>
                <div class="personality-trait" data-trait="dangerous">Dangerous</div>
                <div class="personality-trait" data-trait="useful">Useful</div>
            </div>
        `;
        
        document.getElementById('main-scene').appendChild(aiCore);
        
        // Setup AI comment display
        const aiComments = document.createElement('div');
        aiComments.className = 'ai-comment-display';
        aiComments.innerHTML = '<p class="initial-comment">I hope you have a plan. I really do.</p>';
        document.getElementById('main-scene').appendChild(aiComments);
        
        // Setup AI response buttons
        const aiResponses = document.createElement('div');
        aiResponses.className = 'ai-response-panel';
        aiResponses.innerHTML = `
            <button class="ai-btn" data-action="ask-advice">ASK FOR ADVICE</button>
            <button class="ai-btn" data-action="mock-me">MOCK ME</button>
            <button class="ai-btn" data-action="calm-down">CALM DOWN</button>
        `;
        
        // Add AI response handlers
        aiResponses.querySelectorAll('.ai-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleAIResponse(btn.dataset.action));
        });
        
        document.getElementById('main-scene').appendChild(aiResponses);
    }
    
    _setupChaosStations() {
        const stationConfig = {
            command: {
                name: 'Raider Command',
                description: 'Deception plans, target selection, political lies, raid approval',
                icon: 'R'
            },
            tactical: {
                name: 'Stealth Tactics', 
                description: 'Systems mastery, stealth discipline, precision timing, damage control',
                icon: 'T'
            },
            stealth: {
                name: 'Stealth/Sensors', 
                description: 'Evasion patterns, sensor spoofing, jamming, signature masking',
                icon: 'S'
            },
            salvage: {
                name: 'Cargo/Salvage', 
                description: 'Raid gear, boarding tools, extraction equipment, stolen goods storage',
                icon: 'L'
            }
        };
        
        const bridgeContainer = document.querySelector('.bridge-window');
        
        // Create smaller station displays for Chaos ship
        Object.entries(stationConfig).forEach(([id, config]) => {
            const stationElement = document.createElement('div');
            stationElement.className = `chaos-station-display ${id}`;
            stationElement.innerHTML = `
                <div class="station-icon">${config.icon}</div>
                <h4>${config.name}</h4>
                <p class="station-desc">${config.description}</p>
            `;
            
            // Add click handler to switch to this station
            stationElement.addEventListener('click', () => {
                const scene = window.MarsColonyApp.activeScene;
                if (scene) {
                    scene.switchStation(id);
                }
            });
            
            bridgeContainer.appendChild(stationElement);
        });
        
        // Setup console overlay with Chaos-specific content
        this._setupChaosConsoleOverlay();
    }
    
    _setupChaosConsoleOverlay() {
        const chaosConsoleMap = {
            command: `
                <div class="console-section">
                    <h3>RAIDER COMMAND</h3>
                    <p>Campaign Mode: ${this.chaosState.campaignMode || 'Standard Outlaw'}</p>
                    <div class="form-group">
                        <span class="form-label">Legitimacy Status</span>
                        <span class="form-value" style="color: #e74c3c;">${this.chaosState.legitimacy}%</span>
                    </div>
                </div>
                <div class="console-section">
                    <h3>DECEPTION PLANNING</h3>
                    <button class="action-btn" data-action="deploy-decoy">Deploy Decoy Signal</button>
                    <button class="action-btn" data-action="spoof-transmission">Spoof Transmission</button>
                </div>
            `,
            
            tactical: `
                <div class="console-section">
                    <h3>STEALTH SYSTEMS</h3>
                    <p>Radar Cross-Section: ${this.chaosState.stealth.radarCrossSection}</p>
                    <div class="form-group">
                        <span class="form-label">Stealth Status</span>
                        <span class="form-value">${this.chaosState.stealth.active ? 'ACTIVE' : 'INACTIVE'}</span>
                    </div>
                </div>
                <div class="console-section">
                    <h3>TACTICAL OPTIONS</h3>
                    <button class="action-btn" data-action="activate-stealth">Activate Stealth Mode</button>
                    <button class="action-btn" data-action="deactivate-stealth">Deactivate Stealth</button>
                </div>
            `,
            
            stealth: `
                <div class="console-section">
                    <h3>SENSOR SPOOFING</h3>
                    <p>SignalJamming: ${this.chaosState.stealth.jammingActive ? 'ON' : 'OFF'}</p>
                </div>
                <div class="console-section">
                    <h3>JAMMING TOOLS</h3>
                    <button class="action-btn" data-action="activate-jamming">Activate Signal Jamming</button>
                    <button class="action-btn" data-action="deactivate-jamming">Deactivate Jamming</button>
                </div>
            `,
            
            salvage: `
                <div class="console-section">
                    <h3>SALVAGE GEAR</h3>
                    <p>Extraction Equipment: ${this.chaosState.salvage.extractionEquipmentActive ? 'ACTIVE' : 'STANDBY'}</p>
                </div>
                <div class="console-section">
                    <h3>RAID PREPARATION</h3>
                    <button class="action-btn" data-action="deploy-board-drones">Deploy Boarding Drones</button>
                    <button class="action-btn" data-action="scavenge-area">Scavenge Nearest Area</button>
                </div>
            `
        };
        
        const consoleContent = document.getElementById('station-content');
        consoleContent.innerHTML = chaosConsoleMap[this.camera.currentStation] || '';
    }
    
    _configureLowLightEnvironment() {
        // Set up dark bridge aesthetic
        document.body.style.backgroundColor = '#05060a';
        
        // Configure window effects for stealth
        const windowElement = document.querySelector('.bridge-window');
        if (windowElement) {
            windowElement.innerHTML += `
                <div class="stealth-glass-overlay">
                    <span class="glass-text">STEALTH GLASS ACTIVE</span>
                </div>
            `;
        }
        
        // Configure alert indicator
        const alertIndicator = document.getElementById('alert-indicator');
        if (alertIndicator) {
            alertIndicator.dataset.alert = 'caution';
        }
    }
    
    _startStealthAnimations() {
        // Create subtle ambient animations for stealth environment
        const stealthParticles = [];
        
        for (let i = 0; i < 15; i++) {
            stealthParticles.push({
                x: Math.random() * this.renderingEngine.width,
                y: Math.random() * this.renderingEngine.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3
            });
        }
        
        this.stealthAnimationId = requestAnimationFrame(() => {
            // Animate stealth particles
            for (const particle of stealthParticles) {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                if (particle.x < 0 || particle.x > this.renderingEngine.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > this.renderingEngine.height) particle.speedY *= -1;
            }
            
            // Draw stealth particles (would be handled by rendering engine in full implementation)
            
            this._startStealthAnimations();
        });
    }
    
    _addAIPresenceIndicator() {
        const aiIndicator = document.createElement('div');
        aiIndicator.className = 'ai-presence-indicator';
        aiIndicator.innerHTML = `
            <span class="ai-name">VEX</span>
            <div class="ai-status-bubble"></div>
        `;
        
        document.getElementById('main-scene').appendChild(aiIndicator);
    }
    
    // AI interaction methods
    
    handleAIResponse(action) {
        switch(action) {
            case 'ask-advice':
                this._getAISuggestion();
                break;
            case 'mock-me':
                this._getAIMockComment();
                break;
            case 'calm-down':
                this._getCalmComment();
                break;
        }
    }
    
    _getAISuggestion() {
        const suggestion = this.chaosState.getAISuggestion('deception');
        
        if (suggestion) {
            this._addAIComment(suggestion.text, 'advice');
            console.log("Vex's advice:", suggestion.text);
        } else {
            this._addAIComment("I don't have any clever ideas for that. Try being less predictable.", 'general');
        }
    }
    
    _getAIMockComment() {
        const mockComments = [
            "You want me to mock you? That's like asking a shark to be polite.",
            "Oh, I'll mock you alright. Your decisions are practically self-mocking.",
            "Let me think of something worse than your usual mistakes... Actually, hard to top."
        ];
        
        this._addAIComment(mockComments[Math.floor(Math.random() * mockComments.length)], 'mock');
    }
    
    _getCalmComment() {
        const calmComments = [
            "Calm down? I'm not the one about to fly us into a sun.",
            "I'm already calm. You're just being dramatic as usual.",
            "Relax. The worst-case scenarios haven't happened yet. There's still time for optimism."
        ];
        
        this._addAIComment(calmComments[Math.floor(Math.random() * calmComments.length)], 'calm');
    }
    
    _addAIComment(comment, type = 'general') {
        // Add to AI comment display
        const aiComments = document.querySelector('.ai-comment-display');
        if (aiComments) {
            // Remove previous comment with fade out effect
            const oldComment = aiComments.querySelector('p');
            if (oldComment) {
                oldComment.style.opacity = 0;
                
                setTimeout(() => {
                    oldComment.textContent = comment;
                    oldComment.style.opacity = 1;
                }, 300);
            } else {
                aiComments.innerHTML = `<p class="comment">${comment}</p>`;
            }
        }
        
        // Add to chaos state
        this.chaosState._addAIComment(comment, type);
    }
    
    // Station switching
    
    switchStation(stationName) {
        console.log('Switching to Chaos station:', stationName);
        
        // Update active station
        this.camera.currentStation = stationName;
        
        // Update UI buttons (would be handled by base class in full implementation)
        document.querySelectorAll('.station-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.station === stationName) {
                btn.classList.add('active');
            }
        });
        
        // Update console content
        const titleElement = document.getElementById('current-station-title');
        titleElement.textContent = this._getStationTitle(stationName);
        
        this._setupChaosConsoleOverlay();
    }
    
    _getStationTitle(stationName) {
        const titles = {
            command: 'Raider Command Console',
            tactical: 'Stealth Tactics Console',
            stealth: 'Sensor/Jamming Console', 
            salvage: 'Salvage Operations Console'
        };
        return titles[stationName] || 'Chaos Station';
    }
}
