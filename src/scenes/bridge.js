/**
 * Bridge Scene Controller for Mars Colony Co-Captains
 * 
 * Manages the bridge environment, stations, and player interactions
 * Implements the cinematic "inhabited command deck" experience from the brief
 */

import { StationManager } from '../stations/manager.js';
import { SpaceView } from '../render/spaceView.js';

export class BridgeScene {
    constructor(gameState, renderingEngine, uiManager) {
        this.gameState = gameState;
        this.renderingEngine = renderingEngine;
        this.uiManager = uiManager;
        
        // Scene components
        this.stations = new StationManager();
        this.spaceView = null;
        
        // Camera/view state  
        this.camera = {
            currentStation: 'command',
            transitions: []
        };
        
        // Visual states
        this.visualStates = {
            normal: { lighting: 0.8, stars: 'calm' },
            redAlert: { lighting: 0.5, stars: 'rapid', alert: true },
            stealth: { lighting: 0.3, stars: 'dim', alert: false },
            solarStorm: { lighting: 0.6, stars: 'flickering', alert: true }
        };
        
        this.currentVisualState = 'normal';
    }
    
    async enter() {
        console.log('Entering Bridge Scene');
        
        // Initialize space view
        this.spaceView = new SpaceView(this.renderingEngine);
        
        // Setup station navigation  
        this._setupStationNavigation();
        
        // Load bridge UI
        await this._loadBridgeUI();
        
        // Start ambient animations
        this._startAmbientAnimations();
        
        return true;
    }
    
    exit() {
        console.log('Exiting Bridge Scene');
        
        // Cleanup event listeners
        window.removeEventListener('resize', this.resizeHandler);
        
        // Stop animations
        if (this.ambientAnimationId) {
            cancelAnimationFrame(this.ambientAnimationId);
            this.ambientAnimationId = null;
        }
    }
    
    update(deltaTime) {
        // Update space view based on game state
        if (this.spaceView && this.gameState) {
            const gameStateSnapshot = this.gameState.getSnapshot();
            this.spaceView.update(deltaTime, gameStateSnapshot);
        }
        
        // Update rendering engine with current state
        if (this.renderingEngine && this.gameState) {
            const gameStateSnapshot = this.gameState.getSnapshot();
            this.renderingEngine.updateState(gameStateSnapshot);
        }
        
        // Update status bar through UI manager
        if (this.uiManager) {
            this.uiManager.update();
        }
    }
    
    _setupStationNavigation() {
        const stationButtons = document.querySelectorAll('.station-btn');
        
        stationButtons.forEach(button => {
            button.addEventListener('click', () => {
                const stationName = button.dataset.station;
                this.switchStation(stationName);
            });
        });
        
        // Close console overlay
        const closeBtn = document.getElementById('close-console');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeConsole();
            });
        }
    }
    
    async _loadBridgeUI() {
        try {
            // Load bridge background and elements
            const sceneContainer = document.getElementById('main-scene');
            
            // Create panoramic view container
            const viewContainer = document.createElement('div');
            viewContainer.className = 'panoramic-view';
            
            // Add window element with starscape
            const windowElement = document.createElement('div');
            windowElement.className = 'bridge-window';
            windowElement.innerHTML = `
                <canvas id="space-canvas" class="starscape"></canvas>
                <div class="window-overlay">
                    <div class="hull-integrity">HULL INTEGRITY: 98%</div>
                    <div class="velocity-readout">VELOCITY: ${this.gameState.getField('ship.stats.cruiseSpeed') || '0.04'} AU/DAY</div>
                    <div class="course-indicator">COURSE: PROGRADE</div>
                </div>
            `;
            
            viewContainer.appendChild(windowElement);
            sceneContainer.appendChild(viewContainer);
            
            // Setup station displays
            this.stations.setupStations(this.gameState.getSnapshot());
            
            // Create status panels
            const statusPanels = document.createElement('div');
            statusPanels.className = 'status-panels';
            
            // Player status cards
            const captainPanel = this._createStatusCard(
                'CAPTAIN', 
                'MISSION PRIORITIES',
                ['Mission Integrity: 82%', 'Arrival Position: Strong', 'Political Support: High']
            );
            
            const xoPanel = this._createStatusCard(
                'XO / NUMBER TWO', 
                'SHIP SYSTEMS',
                ['Engine Wear: 12%', 'Life Support: Optimal', 'Crew Morale: Good']
            );
            
            statusPanels.appendChild(captainPanel);
            statusPanels.appendChild(xoPanel);
            sceneContainer.appendChild(statusPanels);
            
            // Setup console overlay
            this._setupConsoleOverlay();
            
        } catch (error) {
            console.error('Failed to load bridge UI:', error);
        }
    }
    
    _createStatusCard(title, subtitle, items) {
        const card = document.createElement('div');
        card.className = 'status-card';
        
        let html = `<h3>${title}</h3><p class="subtitle">${subtitle}</p>`;
        html += '<ul>';
        for (const item of items) {
            html += `<li class="${this._getStatusClass(item)}">${item}</li>`;
        }
        html += '</ul>';
        
        card.innerHTML = html;
        return card;
    }
    
    _getStatusClass(text) {
        if (text.includes('Optimal') || text.includes('High') || text.includes('Strong')) {
            return 'status-good';
        } else if (text.includes('Warning') || text.includes('Low') || text.includes('Degraded')) {
            return 'status-warning';
        } else {
            return 'status-normal';
        }
    }
    
    _setupConsoleOverlay() {
        const consoleOverlay = document.getElementById('console-overlay');
        
        // Station-specific content
        const stationContentMap = {
            command: `
                <div class="console-section">
                    <h3>MISSION PLANNER</h3>
                    <p>Current Route Profile: ${this.gameState.getField('voyage.routeProfile').toUpperCase()}</p>
                    <p>Distance to Mars: ${this.gameState.getField('voyage.distanceRemainingAU').toFixed(3)} AU</p>
                    <div class="form-group">
                        <span class="form-label">Arrival Priority</span>
                        <span class="form-value">Optimize for Position</span>
                    </div>
                </div>
                <div class="console-section">
                    <h3>DIPLOMATIC POSTURE</h3>
                    <p>Earth Support: ${this.gameState.getField('factions.earth.supportLevel')}%</p>
                    <p>Moon Relationship: ${this.gameState.getField('factions.moonColony.stance')}</p>
                </div>
            `,
            
            helm: `
                <div class="console-section">
                    <h3>NAVIGATION</h3>
                    <div class="form-group">
                        <span class="form-label">Current Velocity</span>
                        <span class="form-value">${this.gameState.getField('ship.stats.cruiseSpeed')} AU/day</span>
                    </div>
                    <div class="form-group">
                        <span class="form-label">Fuel Efficiency</span>
                        <span class="form-value">${(100 - this.gameState.getField('voyage.status.legitimacy')).toFixed(1)}%</span>
                    </div>
                </div>
                <div class="console-section">
                    <h3>COURSE ADJUSTMENTS</h3>
                    <button class="action-btn" data-action="increase-velocity">Increase Velocity (+10%)</button>
                    <button class="action-btn" data-action="course-stabilize">Stabilize Course</button>
                </div>
            `,
            
            tactical: `
                <div class="console-section">
                    <h3>SECURITY STATUS</h3>
                    <p>Security Level: ${this.gameState.getField('ship.systems.security.level')}</p>
                    <p>Moral Tension: ${this.gameState.getField('ship.systems.security.tension')}%</p>
                </div>
                <div class="console-section">
                    <h3>COUNTERMEASURES</h3>
                    <button class="action-btn" data-action="increase-security">Increase Security (Tension +5)</button>
                    <button class="action-btn" data-action="reduce-tension">Reduce Tension (-8)</button>
                </div>
            `,
            
            engineering: `
                <div class="console-section">
                    <h3>SYSTEM INTEGRITY</h3>
                    ${this._createSystemStatusRow('Engines', this.gameState.getField('ship.systems.engines'))}
                    ${this._createSystemStatusRow('Life Support', this.gameState.getField('ship.systems.lifeSupport'))}
                    ${this._createSystemStatusRow('Power Grid', this.gameState.getField('ship.systems.power'))}
                </div>
                <div class="console-section">
                    <h3>POWER MANAGEMENT</h3>
                    <button class="action-btn" data-action="reroute-power">Reroute Power (Emergency)</button>
                </div>
            `,
            
            comms: `
                <div class="console-section">
                    <h3>CURRENT TRANSMISSIONS</h3>
                    <p>Earth Net: Active</p>
                    <p>Lunar Relay: Monitoring</p>
                </div>
                <div class="console-section">
                    <h3>PUBLIC AFFAIRS</h3>
                    <button class="action-btn" data-action="broadcast-normal">Broadcast Normal Updates</button>
                    <button class="action-btn" data-action="broadcast-concerns">Address Concerns</button>
                </div>
            `,
            
            science: `
                <div class="console-section">
                    <h3>SENSOR READINGS</h3>
                    <p>External Temperature: -270°C (Space)</p>
                    <p>Radiation Levels: Normal</p>
                    <p>Debris Field Detection: Active</p>
                </div>
                <div class="console-section">
                    <h3>ANOMALY SCAN</h3>
                    <button class="action-btn" data-action="scan-nearest">Scan Nearest Object</button>
                </div>
            `
        };
        
        // Add event listeners for console buttons
        const consoleContent = document.getElementById('station-content');
        consoleContent.innerHTML = stationContentMap[this.camera.currentStation] || '';
        
        const buttons = consoleContent.querySelectorAll('.action-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleConsoleAction(e.target.dataset.action);
            });
        });
    }
    
    _createSystemStatusRow(name, systemData) {
        return `
            <div class="form-group">
                <span class="form-label">${name}</span>
                <span class="form-value ${systemData.status === 'optimal' ? 'status-good' : 'status-warning'}">
                    ${Math.round(systemData.integrity)}% (${systemData.status})
                </span>
            </div>
        `;
    }
    
    _startAmbientAnimations() {
        // Crew movement simulation
        const crewPositions = [];
        
        // Create simulated crew members
        for (let i = 0; i < 3; i++) {
            crewPositions.push({
                x: Math.random(),
                y: Math.random(),
                dx: (Math.random() - 0.5) * 0.1,
                dy: (Math.random() - 0.5) * 0.1
            });
        }
        
        this.ambientAnimationId = requestAnimationFrame(() => {
            // Animate crew movement
            for (const position of crewPositions) {
                position.x += position.dx;
                position.y += position.dy;
                
                // Boundary checks
                if (position.x < 0 || position.x > 1) position.dx *= -1;
                if (position.y < 0.3 || position.y > 0.7) position.dy *= -1;
            }
            
            this._drawCrew(crewPositions);
            this._startAmbientAnimations();
        });
    }
    
    _drawCrew(positions) {
        // This would draw crew silhouettes in the appropriate positions
        // For now, just update status bar
        const crewStatus = document.getElementById('crew-status');
        if (crewStatus) {
            crewStatus.innerHTML = `CREW READINESS: ${this.gameState.getField('voyage.status.crewReadiness')}%`;
        }
    }
    
    switchStation(stationName) {
        // Update active station
        this.camera.currentStation = stationName;
        
        // Update UI buttons
        document.querySelectorAll('.station-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.station === stationName) {
                btn.classList.add('active');
            }
        });
        
        // Update console content
        const titleElement = document.getElementById('current-station-title');
        titleElement.textContent = this._getStationTitle(stationName);
        
        this._setupConsoleOverlay();
    }
    
    closeConsole() {
        document.getElementById('console-overlay').classList.remove('active');
    }
    
    _getStationTitle(stationName) {
        const titles = {
            command: 'Command Console',
            helm: 'Navigation Console',
            tactical: 'Security Console',
            engineering: 'Engineering Console',
            comms: 'Communications Console',
            science: 'Science Console'
        };
        return titles[stationName] || 'Station';
    }
    
    handleConsoleAction(action) {
        console.log('Console action:', action);
        
        switch(action) {
            case 'increase-velocity':
                this._makeDecision('captain', 'increase_velocity', 
                    { effect: 'short_term_gain', long_term_cost: true });
                break;
            case 'course-stabilize':
                this._makeDecision('xo', 'course_stabilize',
                    { effect: 'system_stability', crew_impact: true });
                break;
            case 'increase-security':
                this._makeDecision('xo', 'increase_security',
                    { effect: 'immediate_safety', morale_cost: true });
                break;
            case 'reduce-tension':
                this._makeDecision('captain', 'reduce_tension',
                    { effect: 'morale_boost', security_cost: true });
                break;
        }
    }
    
    _makeDecision(role, choice, consequences) {
        const decision = {
            role,
            choice,
            context: 'bridge_station_interaction',
            consequence: {
                effects: {}
            }
        };
        
        // Apply specific effects based on action
        if (consequences.effect === 'short_term_gain') {
            decision.consequence.effects.racePosition = -0.01;
            decision.consequence.effects.fuel = -50;
        } else if (consequences.effect === 'system_stability') {
            decision.consequence.effects.wear_reduction = 0.5;
        } else if (consequences.effect === 'immediate_safety') {
            decision.consequence.effects.security = 2;
        }
        
        // Add secondary effects
        if (consequences.long_term_cost) {
            decision.consequence.effects.morale_impact = -3;
            decision.consequence.effects.fuel_margin_reduction = true;
        } else if (consequences.crew_impact) {
            decision.consequence.effects.crew_readiness = 2;
        }
        
        // Record the decision
        this.gameState.recordDecision(decision);
    }
    
    _setVisualState(stateName) {
        this.currentVisualState = stateName;
        const stateConfig = this.visualStates[stateName];
        
        if (stateConfig.alert) {
            this.renderingEngine.setAlertLevel('red');
        } else {
            this.renderingEngine.setAlertLevel('normal');
        }
    }
}
