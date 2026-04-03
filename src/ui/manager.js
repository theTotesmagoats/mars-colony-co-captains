/**
 * Premium UI Manager for Mars Colony Co-Captains
 * 
 * Manages user interface state, updates status displays, and coordinates
 * between game state and visual presentation with premium tactile feedback
 */

import { StatusBar } from './statusBar.js';
import { StationRail } from './stationRail.js';

export class UIManager {
    constructor(gameState, renderingEngine) {
        this.gameState = gameState;
        this.renderingEngine = renderingEngine;
        
        // Premium UI components
        this.statusBar = new StatusBar(gameState);
        this.stationRail = new StationRail(gameState);
        
        // Current alert level
        this.currentAlertLevel = 'normal';
        
        // Initialize UI references
        this._cacheElements();
    }
    
    _cacheElements() {
        // Status bar elements
        this.elements = {
            statusBar: document.getElementById('status-bar'),
            missionTime: document.getElementById('mission-time'),
            shipVelocity: document.getElementById('ship-velocity'),
            fuelStatus: document.getElementById('fuel-status'),
            alertIndicator: document.getElementById('alert-indicator'),
            alertStatus: document.getElementById('alert-status')
        };
    }
    
    init() {
        // Initialize premium UI components
        this.statusBar.init();
        this.stationRail.init();
        
        console.log('Premium UI manager initialized');
    }
    
    update() {
        const gameState = this.gameState.getSnapshot();
        
        // Update premium status bar with real telemetry
        this.statusBar.update(gameState);
        
        // Update station rail based on system health
        this.stationRail.update(gameState);
        
        // Update alert level
        this._updateAlertLevel(gameState);
    }
    
    _updateAlertLevel(gameState) {
        let alertLevel = 'normal';
        
        // Check for red alert conditions
        if (gameState.voyage.status.morale < 40 || 
            gameState.ship.systems.lifeSupport.integrity < 60 ||
            gameState.ship.systems.engines.wear > 85) {
            alertLevel = 'yellow';
        } else if (gameState.voyage.distanceRemainingAU < 0.1 ||
                   gameState.voyage.racePosition.moonFactionDistanceAU < 0.02) {
            alertLevel = 'red';
        }
        
        // Update visual state
        if (alertLevel !== this.currentAlertLevel) {
            this._changeAlertLevel(alertLevel);
        }
    }
    
    _changeAlertLevel(level) {
        this.currentAlertLevel = level;
        
        // Trigger premium visual feedback
        this.statusBar.triggerAlertPulse();
        
        // Update DOM elements
        if (this.elements.alertIndicator) {
            this.elements.alertIndicator.dataset.alert = level;
        }
        
        const statusText = level === 'normal' ? 'Normal' :
                           level === 'yellow' ? 'Caution' : 'CRITICAL';
        
        if (this.elements.alertStatus) {
            this.elements.alertStatus.textContent = statusText;
            
            // Color coding
            const colors = {
                normal: '#2ecc71',
                yellow: '#f39c12', 
                red: '#e74c3c'
            };
            
            this.elements.alertStatus.style.color = colors[level] || '#2ecc71';
        }
        
        // Trigger station alerts if needed
        if (level === 'red' || level === 'yellow') {
            this.stationRail.triggerAlert('command');
        }
    }
    
    // UI interaction methods
    
    openConsole(stationId) {
        const consoleOverlay = document.getElementById('console-overlay');
        if (consoleOverlay && !consoleOverlay.classList.contains('active')) {
            consoleOverlay.classList.add('active');
            
            // Update title
            const titles = {
                'command': 'Command Console',
                'helm': 'Navigation Console',
                'tactical': 'Security Console',
                'engineering': 'Engineering Console',
                'comms': 'Communications Console',
                'science': 'Science Console'
            };
            
            document.getElementById('current-station-title').textContent = 
                titles[stationId] || 'Station';
        }
    }
    
    closeConsole() {
        const consoleOverlay = document.getElementById('console-overlay');
        if (consoleOverlay) {
            consoleOverlay.classList.remove('active');
        }
    }
    
    // Alert display methods
    
    showAlert(title, message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <h4>${title}</h4>
            <p>${message}</p>
            <button class="close-alert">✕</button>
        `;
        
        // Add close handler
        alertDiv.querySelector('.close-alert').addEventListener('click', () => {
            alertDiv.remove();
        });
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds for non-critical alerts
        if (type !== 'critical') {
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.style.opacity = '0';
                    setTimeout(() => alertDiv.remove(), 300);
                }
            }, 5000);
        }
    }
    
    showDecisionPrompt(captainText, xoText, callback) {
        const promptDiv = document.createElement('div');
        promptDiv.className = 'decision-prompt premium';
        promptDiv.innerHTML = `
            <h3>CRITICAL DECISION REQUIRED</h3>
            
            <div class="perspectives">
                <div class="perspective captain">
                    <h4>CAPTAIN PERSPECTIVE</h4>
                    <p>${captainText}</p>
                </div>
                
                <div class="perspective xo">
                    <h4>XO PERSPECTIVE</h4>
                    <p>${xoText}</p>
                </div>
            </div>
            
            <div class="decision-buttons premium">
                <button class="action-btn" data-role="captain">CAPTAIN DECISION</button>
                <button class="action-btn" data-role="xo">XO DECISION</button>
                <button class="action-btn secondary" onclick="this.parentNode.parentNode.remove()">CANCEL</button>
            </div>
        `;
        
        document.body.appendChild(promptDiv);
        
        // Add decision handlers
        promptDiv.querySelectorAll('.decision-buttons .action-btn').forEach(btn => {
            if (btn.dataset.role) {
                btn.addEventListener('click', () => {
                    callback(btn.dataset.role);
                    promptDiv.remove();
                });
            }
        });
    }
    
    showResourceWarning(resource, current, max) {
        const percent = Math.round((current / max) * 100);
        
        this.showAlert(
            `CRITICAL: ${resource.toUpperCase()} LOW`,
            `${percent}% remaining. Immediate action required.`,
            'critical'
        );
    }
    
    // Mission phase transitions
    
    showPhaseTransition(phase) {
        const transitionOverlay = document.createElement('div');
        transitionOverlay.className = 'phase-transition premium';
        
        let phaseTitle, phaseDescription;
        
        switch(phase) {
            case 'prelaunch':
                phaseTitle = 'MISSION PLANNING PHASE';
                phaseDescription = 'Prepare your ship and crew for the voyage to Mars';
                break;
            case 'voyage':
                phaseTitle = 'VOYAGE PHASE';
                phaseDescription = 'Navigate the ship through deep space toward Mars';
                break;
            case 'marsApproach':
                phaseTitle = 'MARS APPROACH PHASE';
                phaseDescription = 'Prepare for descent and landing on Mars';
                break;
        }
        
        transitionOverlay.innerHTML = `
            <h1>${phaseTitle}</h1>
            <p class="description">${phaseDescription}</p>
            <div class="progress-bar premium">
                <div class="progress-fill"></div>
            </div>
        `;
        
        document.body.appendChild(transitionOverlay);
        
        // Animate progress bar
        setTimeout(() => {
            transitionOverlay.querySelector('.progress-fill').style.width = '100%';
        }, 100);
        
        // Remove after animation
        setTimeout(() => {
            if (transitionOverlay.parentNode) {
                transitionOverlay.style.opacity = '0';
                setTimeout(() => transitionOverlay.remove(), 500);
            }
        }, 3000);
    }
}
