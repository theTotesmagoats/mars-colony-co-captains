/**
 * Station Manager for Mars Colony Co-Captains
 * 
 * Manages all bridge stations, their interfaces, and updates based on game state
 */

export class StationManager {
    constructor() {
        this.stations = {
            command: {
                id: 'command',
                name: 'Command Station',
                description: 'Mission priorities, diplomatic posture, route/risk tradeoffs, long-horizon strategy',
                icon: 'C',
                position: { x: 50, y: 40 } // Percentages relative to bridge
            },
            helm: {
                id: 'helm',
                name: 'Helm/Navigation Station',
                description: 'Burn windows, course changes, arrival timing, hazard avoidance',
                icon: 'N',
                position: { x: 30, y: 65 }
            },
            tactical: {
                id: 'tactical',
                name: 'Tactical/Security Station',
                description: 'Countermeasures, hardening, hostile contact response, patrol drones',
                icon: 'S',
                position: { x: 20, y: 35 }
            },
            engineering: {
                id: 'engineering',
                name: 'Engineering/Power Station',
                description: 'Reactor load, repairs, rerouting, shield draw, propulsion readiness',
                icon: 'E',
                position: { x: 70, y: 65 }
            },
            comms: {
                id: 'comms',
                name: 'Comms/Diplomacy Station',
                description: 'Earth transmissions, Moon contact, crew-facing messages',
                icon: 'R',
                position: { x: 80, y: 35 }
            },
            science: {
                id: 'science',
                name: 'Science/Sensors Station',
                description: 'Read anomalies, scan debris, map rival movement, identify approach windows',
                icon: 'I',
                position: { x: 50, y: 80 }
            }
        };
        
        this.activeStation = null;
    }
    
    setupStations(gameState) {
        // Create station UI elements
        const bridgeContainer = document.querySelector('.bridge-window');
        
        Object.values(this.stations).forEach(station => {
            const stationElement = document.createElement('div');
            stationElement.className = `station-display ${station.id}`;
            stationElement.innerHTML = `
                <div class="station-icon">${station.icon}</div>
                <h4>${station.name}</h4>
                <p class="station-desc">${station.description}</p>
            `;
            
            // Add click handler to switch to this station
            stationElement.addEventListener('click', () => {
                const scene = window.MarsColonyApp.activeScene;
                if (scene) {
                    scene.switchStation(station.id);
                }
            });
            
            bridgeContainer.appendChild(stationElement);
        });
    }
    
    updateDisplays(gameState) {
        // Update each station's display based on current state
        Object.values(this.stations).forEach(station => {
            const stationEl = document.querySelector(`.station-display.${station.id}`);
            
            if (stationEl) {
                this._updateStationData(station, gameState);
            }
        });
    }
    
    _updateStationData(station, gameState) {
        // Station-specific data updates
        
        switch(station.id) {
            case 'command':
                this._updateCommandDisplay(gameState);
                break;
            case 'helm':
                this._updateHelmDisplay(gameState);
                break;
            case 'tactical':
                this._updateTacticalDisplay(gameState);
                break;
            case 'engineering':
                this._updateEngineeringDisplay(gameState);
                break;
            case 'comms':
                this._updateCommsDisplay(gameState);
                break;
            case 'science':
                this._updateScienceDisplay(gameState);
                break;
        }
    }
    
    _updateCommandDisplay(gameState) {
        const status = gameState.voyage.status;
        const racePos = gameState.voyage.racePosition;
        
        console.log('Updating Command Station:', {
            missionIntegrity: status.legitimacy,
            arrivalPosition: racePos.moonFactionDistanceAU
        });
    }
    
    _updateHelmDisplay(gameState) {
        const stats = gameState.ship.stats;
        const voyage = gameState.voyage;
        
        console.log('Updating Helm Station:', {
            cruiseSpeed: stats.cruiseSpeed,
            fuelEfficiency: stats.fuelEfficiency,
            distanceRemaining: voyage.distanceRemainingAU
        });
    }
    
    _updateTacticalDisplay(gameState) {
        const security = gameState.ship.systems.security;
        const status = gameState.voyage.status;
        
        console.log('Updating Tactical Station:', {
            securityLevel: security.level,
            tension: security.tension,
            morale: status.morale
        });
    }
    
    _updateEngineeringDisplay(gameState) {
        const systems = gameState.ship.systems;
        const consequences = gameState.consequences;
        
        console.log('Updating Engineering Station:', {
            engineWear: systems.engines.wear,
            lifeSupportIntegrity: systems.lifeSupport.integrity,
            wearAccumulated: consequences.wearAccumulated
        });
    }
    
    _updateCommsDisplay(gameState) {
        const factions = gameState.factions;
        
        console.log('Updating Comms Station:', {
            earthSupport: factions.earth.supportLevel,
            moonStance: factions.moonColony.stance
        });
    }
    
    _updateScienceDisplay(gameState) {
        const voyage = gameState.voyage;
        
        console.log('Updating Science Station:', {
            distanceRemaining: voyage.distanceRemainingAU,
            currentSpeed: voyage.cruiseSpeed
        });
    }
}
