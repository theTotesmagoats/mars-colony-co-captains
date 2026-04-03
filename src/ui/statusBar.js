/**
 * Premium Status Bar Component for Mars Colony Co-Captains
 * 
 * Structured readouts with real telemetry, not flat label/value strips
 */

export class StatusBar {
    constructor(gameState) {
        this.gameState = gameState;
        
        // DOM elements cache
        this.elements = {
            missionTime: null,
            shipVelocity: null,
            fuelStatus: null,
            alertIndicator: null,
            alertStatus: null,
            hullIntegrity: null,
            systemStatus: null
        };
        
        this.alertLevels = ['normal', 'yellow', 'red'];
    }
    
    init() {
        // Cache DOM elements
        this.elements.missionTime = document.getElementById('mission-time');
        this.elements.shipVelocity = document.getElementById('ship-velocity');
        this.elements.fuelStatus = document.getElementById('fuel-status');
        this.elements.alertIndicator = document.getElementById('alert-indicator');
        this.elements.alertStatus = document.getElementById('alert-status');
        
        // Create premium status indicators if they don't exist
        this._createPremiumIndicators();
    }
    
    _createPremiumIndicators() {
        const statusBar = document.querySelector('.status-bar');
        if (!statusBar) return;
        
        // Add hull integrity indicator (premium feel)
        if (!document.getElementById('hull-integrity')) {
            const hullSection = document.createElement('div');
            hullSection.className = 'status-section hull';
            hullSection.id = 'hull-indicator';
            hullSection.innerHTML = `
                <span class="label">HULL INTEGRITY</span>
                <span class="value" id="hull-integrity">100%</span>
                <div class="status-bar-filler">
                    <div class="fill-fill"></div>
                </div>
            `;
            statusBar.appendChild(hullSection);
        }
        
        // Add system status indicator
        if (!document.getElementById('system-status')) {
            const sysSection = document.createElement('div');
            sysSection.className = 'status-section system';
            sysSection.id = 'system-indicator';
            sysSection.innerHTML = `
                <span class="label">SYSTEM STATUS</span>
                <span class="value" id="system-status">OPTIMAL</span>
            `;
            statusBar.appendChild(sysSection);
        }
    }
    
    update(gameState) {
        // Update mission time
        if (this.elements.missionTime) {
            this.elements.missionTime.textContent = `Day ${gameState.voyage.daysElapsed}`;
        }
        
        // Update velocity with real telemetry - FIXED: Uses unified speed model
        if (this.elements.shipVelocity && gameState.voyage.currentSpeedAUPerDay !== undefined) {
            const kmPerDay = (gameState.voyage.currentSpeedAUPerDay * 149597870.7).toFixed(2); // AU to km
            this.elements.shipVelocity.textContent = `${kmPerDay} km/day`;
        }
        
        // Update fuel status with real telemetry
        if (this.elements.fuelStatus) {
            const fuelPercent = Math.round(
                (gameState.voyage.resources.fuel.current / gameState.voyage.resources.fuel.max) * 100
            );
            this.elements.fuelStatus.textContent = `${fuelPercent}%`;
            
            // Update color based on fuel level
            if (fuelPercent < 20) {
                this.elements.fuelStatus.style.color = '#e74c3c';
                this.elements.fuelStatus.classList.add('critical');
            } else if (fuelPercent < 50) {
                this.elements.fuelStatus.style.color = '#f39c12';
                this.elements.fuelStatus.classList.remove('critical');
            } else {
                this.elements.fuelStatus.style.color = '#2ecc71';
                this.elements.fuelStatus.classList.remove('critical');
            }
        }
        
        // Update alert level
        this._updateAlertLevel(gameState);
        
        // Update hull integrity
        const hullIntegrity = gameState.ship.systems.engines.integrity;
        if (this.elements.hullIntegrity) {
            this.elements.hullIntegrity.textContent = `${hullIntegrity}%`;
            
            // Update fill bar
            const fillFill = document.querySelector('#hull-indicator .fill-fill');
            if (fillFill) {
                fillFill.style.width = `${hullIntegrity}%`;
                
                if (hullIntegrity < 60) {
                    fillFill.style.backgroundColor = '#e74c3c';
                } else if (hullIntegrity < 85) {
                    fillFill.style.backgroundColor = '#f39c12';
                } else {
                    fillFill.style.backgroundColor = '#3d8eff';
                }
            }
        }
        
        // Update system status
        const systemStatus = this._calculateSystemStatus(gameState);
        if (this.elements.systemStatus) {
            this.elements.systemStatus.textContent = systemStatus;
            
            if (systemStatus === 'CRITICAL') {
                this.elements.systemStatus.style.color = '#e74c3c';
                document.body.classList.add('system-critical');
            } else if (systemStatus === 'DEGRADED') {
                this.elements.systemStatus.style.color = '#f39c12';
                document.body.classList.remove('system-critical');
            } else {
                this.elements.systemStatus.style.color = '#2ecc71';
                document.body.classList.remove('system-critical');
            }
        }
    }
    
    _updateAlertLevel(gameState) {
        // Calculate alert level based on unified state
        let alertLevel = 'normal';
        
        if (gameState.debug.paused) {
            alertLevel = 'paused';
        } else if (
            gameState.voyage.status.morale < 40 || 
            gameState.ship.systems.lifeSupport.integrity < 60 ||
            gameState.ship.systems.engines.wear > 85
        ) {
            alertLevel = 'yellow';
        } else if (
            gameState.voyage.distanceRemainingAU < 0.1 ||
            gameState.voyage.racePosition.moonFactionDistanceAU < 0.02
        ) {
            alertLevel = 'red';
        }
        
        // Update DOM elements
        if (this.elements.alertIndicator) {
            this.elements.alertIndicator.dataset.alert = alertLevel;
        }
        
        const statusText = {
            normal: 'NORMAL',
            yellow: 'CAUTION', 
            red: 'CRITICAL',
            paused: 'PAUSED'
        }[alertLevel] || 'NORMAL';
        
        if (this.elements.alertStatus) {
            this.elements.alertStatus.textContent = statusText;
            
            // Color coding
            const colors = {
                normal: '#2ecc71',
                yellow: '#f39c12', 
                red: '#e74c3c',
                paused: '#3d8eff'
            };
            
            this.elements.alertStatus.style.color = colors[alertLevel] || '#2ecc71';
        }
    }
    
    _calculateSystemStatus(gameState) {
        const systems = gameState.ship.systems;
        
        // Check for critical failures
        if (systems.engines.status === 'damaged' || 
            systems.lifeSupport.status === 'damaged') {
            return 'CRITICAL';
        }
        
        // Check for degraded systems
        const degradedSystems = Object.values(systems).filter(
            s => s.status === 'degraded'
        ).length;
        
        if (degradedSystems > 0) {
            return 'DEGRADED';
        }
        
        // All systems optimal
        return 'OPTIMAL';
    }
    
    // Premium visual effects
    triggerAlertPulse() {
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            statusBar.classList.add('alert-pulse');
            setTimeout(() => statusBar.classList.remove('alert-pulse'), 500);
        }
    }
}
