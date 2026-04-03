/**
 * Premium Station Rail Component for Mars Colony Co-Captains
 * 
 * Embedded bridge selectors with depth, active locks, status strips, and touch animations
 */

export class StationRail {
    constructor(gameState) {
        this.gameState = gameState;
        
        // DOM elements cache
        this.elements = {
            stationNav: null,
            buttons: [],
            activeStation: 'command'
        };
        
        // Station configuration with premium styling
        this.stations = {
            command: {
                id: 'command',
                name: 'COMMAND',
                description: 'Mission priorities, diplomatic posture, route/risk tradeoffs',
                icon: 'C',
                status: 'active',
                lockable: true,
                activeColor: '#3d8eff'
            },
            helm: {
                id: 'helm', 
                name: 'HELM',
                description: 'Burn timing, ETA, route windows, acceleration profile, intercepts',
                icon: 'H',
                status: 'idle',
                lockable: true,
                activeColor: '#f39c12'
            },
            tactical: {
                id: 'tactical',
                name: 'TACTICAL',
                description: 'Countermeasures, hardening, hostile contact response, patrol drones',
                icon: 'T',
                status: 'idle',
                lockable: true,
                activeColor: '#e74c3c'
            },
            engineering: {
                id: 'engineering',
                name: 'ENGINEERING', 
                description: 'Reactor load, repairs, rerouting, shield draw, propulsion readiness',
                icon: 'E',
                status: 'idle',
                lockable: true,
                activeColor: '#2ecc71'
            },
            comms: {
                id: 'comms',
                name: 'COMMS',
                description: 'Earth transmissions, Moon contact, crew-facing messages',
                icon: 'R',
                status: 'idle',
                lockable: true,
                activeColor: '#9b59b6'
            },
            science: {
                id: 'science',
                name: 'SCIENCE', 
                description: 'Read anomalies, scan debris, map rival movement, identify approach windows',
                icon: 'S',
                status: 'idle',
                lockable: true,
                activeColor: '#3498db'
            }
        };
    }
    
    init() {
        // Cache DOM elements
        this.elements.stationNav = document.getElementById('station-nav');
        
        if (this.elements.stationNav) {
            this._createPremiumStationButtons();
            this._setupEventListeners();
        }
    }
    
    _createPremiumStationButtons() {
        const fragment = document.createDocumentFragment();
        
        Object.values(this.stations).forEach(station => {
            // Create premium station button
            const button = document.createElement('button');
            button.className = `station-btn ${station.id}`;
            button.dataset.station = station.id;
            
            button.innerHTML = `
                <div class="station-icon">
                    <span>${station.icon}</span>
                </div>
                <div class="station-info">
                    <h4 class="station-name">${station.name}</h4>
                    <p class="station-desc">${station.description.substring(0, 30)}...</p>
                </div>
                <div class="station-status ${station.status}">
                    <span></span>
                </div>
            `;
            
            fragment.appendChild(button);
        });
        
        this.elements.stationNav.innerHTML = '';
        this.elements.stationNav.appendChild(fragment);
        
        // Cache button references
        this.elements.buttons = Array.from(this.elements.stationNav.querySelectorAll('.station-btn'));
    }
    
    _setupEventListeners() {
        this.elements.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const stationId = e.target.closest('.station-btn').dataset.station;
                this.selectStation(stationId);
            });
            
            // Add touch animation for premium feel
            button.addEventListener('touchstart', () => {
                button.classList.add('pressed');
            });
            
            button.addEventListener('touchend', () => {
                setTimeout(() => button.classList.remove('pressed'), 200);
            });
        });
    }
    
    selectStation(stationId) {
        // Update active station
        this.elements.activeStation = stationId;
        
        // Remove active class from all buttons
        this.elements.buttons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected button with premium styling
        const selectedButton = document.querySelector(`.station-btn[data-station="${stationId}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
            
            // Add active color accent
            const station = this.stations[stationId];
            if (station && station.activeColor) {
                selectedButton.style.borderTopColor = station.activeColor;
            }
            
            // Update console title
            const titleElement = document.getElementById('current-station-title');
            if (titleElement) {
                titleElement.textContent = `${this._getStationTitle(stationId)} CONSOLE`;
            }
            
            // Trigger premium visual feedback
            this._triggerStationTransition(stationId);
        }
    }
    
    _getStationTitle(stationId) {
        const titles = {
            command: 'COMMAND',
            helm: 'NAVIGATION',
            tactical: 'SECURITY', 
            engineering: 'ENGINEERING',
            comms: 'COMMUNICATIONS',
            science: 'SCIENCE'
        };
        
        return titles[stationId] || stationId.toUpperCase();
    }
    
    _triggerStationTransition(stationId) {
        const consoleOverlay = document.getElementById('console-overlay');
        if (consoleOverlay && !consoleOverlay.classList.contains('active')) {
            consoleOverlay.classList.add('active');
        }
        
        // Update status indicators
        this._updateStationStatus(stationId);
    }
    
    _updateStationStatus(stationId) {
        // Update station button status indicators based on game state
        const stations = this.gameState.ship.systems;
        
        Object.entries(stations).forEach(([key, system]) => {
            let status = 'idle';
            
            if (system.status === 'damaged') {
                status = 'critical';
            } else if (system.status === 'degraded') {
                status = 'warning';
            }
            
            const stationBtn = document.querySelector(`.station-btn.${key}`);
            if (stationBtn) {
                const statusIndicator = stationBtn.querySelector('.station-status');
                if (statusIndicator) {
                    statusIndicator.className = `station-status ${status}`;
                    
                    // Add blinking animation for critical/warning
                    if (status !== 'idle') {
                        statusIndicator.classList.add('pulse');
                    }
                }
            }
        });
    }
    
    update(gameState) {
        // Update station statuses based on system health
        this._updateStationStatus(gameState);
    }
    
    // Premium visual effects
    triggerLockAnimation(stationId, locked) {
        const button = document.querySelector(`.station-btn.${stationId}`);
        if (button) {
            if (locked) {
                button.classList.add('locked');
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.classList.remove('locked');
                button.removeAttribute('aria-pressed');
            }
        }
    }
    
    triggerAlert(stationId) {
        const button = document.querySelector(`.station-btn.${stationId}`);
        if (button) {
            button.classList.add('alerted');
            
            // Remove after animation
            setTimeout(() => {
                button.classList.remove('alerted');
            }, 1000);
        }
    }
}
