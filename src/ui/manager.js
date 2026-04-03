/**
 * UI Manager for Mars Colony Co-Captains
 * 
 * Manages user interface state, updates status displays, and coordinates
 * between game state and visual presentation
 */

export class UIManager {
    constructor(gameState, renderingEngine) {
        this.gameState = gameState;
        this.renderingEngine = renderingEngine;
        
        // UI elements cache
        this.elements = {};
        
        // Current alert level
        this.currentAlertLevel = 'normal';
        
        // Initialize UI references
        this._cacheElements();
    }
    
    _cacheElements() {
        // Status bar elements
        this.elements.statusBar = document.getElementById('status-bar');
        this.elements.missionTime = document.getElementById('mission-time');
        this.elements.shipVelocity = document.getElementById('ship-velocity');
        this.elements.fuelStatus = document.getElementById('fuel-status');
        this.elements.alertIndicator = document.getElementById('alert-indicator');
        this.elements.alertStatus = document.getElementById('alert-status');
        
        // Console elements
        this.elements.consoleOverlay = document.getElementById('console-overlay');
        this.elements.stationContent = document.getElementById('station-content');
        
        // Scene container
        this.elements.sceneContainer = document.getElementById('main-scene');
    }
    
    update() {
        const gameState = this.gameState.getSnapshot();
        
        // Update status bar
        this._updateStatusBar(gameState);
        
        // Update alert level
        this._updateAlertLevel(gameState);
        
        // Update console if open
        if (this.elements.consoleOverlay.classList.contains('active')) {
            this._updateOpenConsole(gameState);
        }
    }
    
    _updateStatusBar(gameState) {
        const voyage = gameState.voyage;
        
        // Mission time
        this.elements.missionTime.textContent = `Day ${voyage.daysElapsed}`;
        
        // Ship velocity
        const velocity = (voyage.cruiseSpeed * 100).toFixed(2);
        this.elements.shipVelocity.textContent = `${velocity} km/s`;
        
        // Fuel status
        const fuelPercent = Math.round(
            (voyage.resources.fuel.current / voyage.resources.fuel.max) * 100
        );
        this.elements.fuelStatus.textContent = `${fuelPercent}%`;
        this._setFuelStatusColor(fuelPercent);
    }
    
    _setFuelStatusColor(percent) {
        if (percent < 20) {
            this.elements.fuelStatus.style.color = '#e74c3c';
        } else if (percent < 50) {
            this.elements.fuelStatus.style.color = '#f39c12';
        } else {
            this.elements.fuelStatus.style.color = '#2ecc71';
        }
    }
    
    _updateAlertLevel(gameState) {
        let alertLevel = 'normal';
        
        // Check for red alert conditions
        if (gameState.voyage.status.morale < 40 || 
            gameState.ship.systems.lifeSupport.integrity < 60 ||
            gameState.ship.systems.engines.wear > 85) {
            alertLevel = 'red';
        } else if (gameState.voyage.distanceRemainingAU < 0.1 ||
                   gameState.voyage.racePosition.moonFactionDistanceAU < 0.02) {
            alertLevel = 'yellow';
        }
        
        // Update visual state
        if (alertLevel !== this.currentAlertLevel) {
            this._changeAlertLevel(alertLevel);
        }
    }
    
    _changeAlertLevel(level) {
        this.currentAlertLevel = level;
        
        // Update DOM elements
        this.elements.alertIndicator.dataset.alert = level;
        this.elements.alertStatus.textContent = level === 'normal' ? 'Normal' :
                                               level === 'yellow' ? 'Caution' : 'RED ALERT';
        
        // Trigger rendering engine effects
        if (level === 'red') {
            this.renderingEngine.setAlertLevel('red');
        } else if (level === 'yellow') {
            this.renderingEngine.setAlertLevel('yellow');
        } else {
            this.renderingEngine.setAlertLevel('normal');
        }
    }
    
    _updateOpenConsole(gameState) {
        // This would update the currently open station console with fresh data
        // For now, just log that we have new data
        console.log('Updating console with latest game state...');
        
        // In a full implementation, this would refresh the active station's content
        // based on the current game state
    }
    
    // UI interaction methods
    
    openConsole(stationId) {
        const overlay = this.elements.consoleOverlay;
        if (!overlay.classList.contains('active')) {
            overlay.classList.add('active');
            
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
        this.elements.consoleOverlay.classList.remove('active');
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
        promptDiv.className = 'decision-prompt';
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
            
            <div class="decision-buttons">
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
        transitionOverlay.className = 'phase-transition';
        
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
            <div class="progress-bar">
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
