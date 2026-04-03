/**
 * Game State Manager for Mars Colony Co-Captains
 * 
 * Manages all game state, simulation data, and persistence
 * Follows clean architecture principles - no DOM manipulation
 */

export class GameStateManager {
    constructor() {
        // Game state structure matching the brief requirements
        this.state = {
            phase: 'prelaunch', // prelaunch, voyage, marsApproach, colony
            
            // Mission identity
            mission: {
                id: 'MISSION-01',
                name: 'Ares I - First Human Outpost',
                description: 'Establish the first permanent human settlement on Mars'
            },
            
            // Player roles and status
            players: {
                captain: {
                    name: 'Captain',
                    role: 'captain',
                    authority: {
                        missionPriorities: true,
                        diplomaticPosture: true,
                        routeRiskTradeoffs: true,
                        longHorizonStrategy: true,
                        finalCalls: true
                    },
                    decisions: []
                },
                xo: {
                    name: 'XO / Number Two',
                    role: 'xo',
                    authority: {
                        shipSystems: true,
                        tacticalResponses: true,
                        emergencyOperations: true,
                        crewReadiness: true,
                        securityCountermeasures: true,
                        repairs: true
                    },
                    decisions: []
                }
            },
            
            // Ship state (from prelaunch planning)
            ship: {
                name: 'Ares-Class Heavy Lifter',
                class: 'heavy-lifter',
                capacity: {
                    passengers: 24,
                    cargoMassKg: 15000,
                    fuelMassKg: 8000
                },
                currentLoad: {
                    passengers: 20,
                    cargoMassKg: 12000,
                    fuelMassKg: 6500
                },
                systems: {
                    engines: { status: 'optimal', integrity: 100, wear: 0 },
                    lifeSupport: { status: 'optimal', integrity: 100, efficiency: 100 },
                    power: { status: 'optimal', integrity: 100, output: 100 },
                    shields: { status: 'optimal', integrity: 100, draw: 5 },
                    security: { status: 'normal', level: 2, tension: 0 }
                },
                stats: {
                    maxSpeed: 0.08, // AU/day
                    cruiseSpeed: 0.04,
                    fuelEfficiency: 0.15, // % per day at cruise
                    wearRate: 0.02 // % per day at cruise
                }
            },
            
            // Voyage state
            voyage: {
                phase: 'preLaunch', // preLaunch, inTransit, approach
                daysElapsed: 0,
                distanceRemainingAU: 0.523, // Earth to Mars average
                currentSpeed: 0,
                routeProfile: 'balanced', // fast, balanced, economical
                
                resources: {
                    fuel: { current: 6500, max: 8000 },
                    food: { current: 480, max: 600 }, // days supply
                    water: { current: 1200, max: 1500 }, // liters
                    medical: { current: 120, max: 150 },
                    spareParts: { current: 80, max: 100 }
                },
                
                status: {
                    morale: 78,
                    trust: 65,
                    crewReadiness: 85,
                    legitimacy: 70
                },
                
                // Race against Moon faction
                racePosition: {
                    moonFactionDistanceAU: 0.12, // How far ahead/behind the Moon faction is
                    missionDaysRemaining: 145 // Days until map hardens
                }
            },
            
            // Political context from the brief
            factions: {
                earth: { supportLevel: 78, funding: 'active' },
                moonColony: { supportLevel: 62, stance: 'cautious', relationship: 'tense' }
            },
            
            // Event history and pending events
            events: {
                completed: [],
                active: []
            },
            
            // Second-order effect tracking
            consequences: {
                wearAccumulated: 0,
                fuelMarginUsed: 0,
                moraleImpact: 0,
                legitimacyChanges: []
            }
        };
        
        // Debug state for local AI development
        this.debug = {
            paused: false,
            singleStep: false,
            fastForward: false,
            forceEvent: null,
            inspectState: true
        };
    }
    
    // Core state management methods
    
    updateField(path, value) {
        // Navigate to the target object and update
        const keys = path.split('.');
        let current = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) return false;
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return true;
    }
    
    getField(path) {
        const keys = path.split('.');
        let current = this.state;
        
        for (let key of keys) {
            if (!current[key]) return undefined;
            current = current[key];
        }
        
        return current;
    }
    
    // Pre-launch planning methods
    
    setMissionLoadout(loadout) {
        this.state.ship.currentLoad = loadout;
        
        // Update ship stats based on load
        const totalMass = 
            this.state.ship.capacity.cargoMassKg + 
            this.state.ship.currentLoad.cargoMassKg +
            this.state.ship.currentLoad.passengers * 100; // avg passenger mass
        
        // Adjust efficiency based on mass
        const massFactor = totalMass / (this.state.ship.capacity.cargoMassKg + 2400);
        this.state.ship.stats.fuelEfficiency *= massFactor;
    }
    
    selectRoute(route) {
        this.state.voyage.routeProfile = route.id;
        
        // Apply route effects
        switch(route.id) {
            case 'fast':
                this.state.ship.stats.cruiseSpeed = 0.06;
                this.state.ship.stats.fuelEfficiency *= 1.35; // More fuel consumption
                this.state.voyage.distanceRemainingAU -= 0.02; // Slightly shorter path
                break;
            case 'balanced':
                this.state.ship.stats.cruiseSpeed = 0.04;
                this.state.ship.stats.fuelEfficiency *= 1.0;
                break;
            case 'economical':
                this.state.ship.stats.cruiseSpeed = 0.03;
                this.state.ship.stats.fuelEfficiency *= 0.85; // Less fuel consumption
                this.state.voyage.distanceRemainingAU += 0.02; // Slightly longer path
                break;
        }
    }
    
    // Voyage simulation methods
    
    advanceTime(days) {
        const voyage = this.state.voyage;
        
        // Calculate resource consumption
        const dailyConsumption = {
            fuel: this.state.ship.stats.fuelEfficiency * (this.state.ship.currentLoad.passengers + 12), // Crew + passengers
            food: this.state.ship.currentLoad.passengers * 0.8,
            water: this.state.ship.currentLoad.passengers * 3.5,
            medical: this.state.ship.currentLoad.passengers * 0.02
        };
        
        // Apply consumption over time
        for (const [resource, amount] of Object.entries(dailyConsumption)) {
            voyage.resources[resource].current -= amount * days;
            
            // Check for critical levels
            if (voyage.resources[resource].current < 0) {
                voyage.resources[resource].current = 0;
                this._handleResourceCritical(resource);
            }
        }
        
        // Calculate wear and damage
        const dailyWear = this.state.ship.stats.wearRate * days;
        this._applySystemWear(dailyWear);
        
        // Update voyage progress
        const distanceTraveled = voyage.cruiseSpeed * days;
        voyage.distanceRemainingAU -= distanceTraveled;
        voyage.daysElapsed += days;
        
        // Check for phase transitions
        if (voyage.distanceRemainingAU <= 0) {
            this.state.phase = 'marsApproach';
            voyage.phase = 'approach';
            voyage.distanceRemainingAU = 0;
        } else if (days > 1 && !this._isEventActive('travel')) {
            this.triggerEvent('travel');
        }
        
        return {
            daysAdvanced: days,
            distanceTraveled,
            resourceConsumption: dailyConsumption,
            wearAccumulated: dailyWear
        };
    }
    
    _applySystemWear(wearAmount) {
        const systems = this.state.ship.systems;
        
        // Apply wear to all systems
        Object.keys(systems).forEach(key => {
            if (key === 'security') return; // Security doesn't wear like other systems
            
            const system = systems[key];
            system.wear += wearAmount * 5;
            
            // Check for failures
            if (system.wear >= 100) {
                system.status = 'damaged';
                system.integrity -= Math.floor(wearAmount);
                this.triggerEvent(`system_${key}_failure`);
            } else if (system.wear > 70) {
                system.status = 'degraded';
            }
        });
        
        // Update total wear counter
        this.state.consequences.wearAccumulated += wearAmount;
    }
    
    _handleResourceCritical(resource) {
        const moraleImpact = Math.floor(Math.random() * 15) + 5;
        this.state.voyage.status.morale -= moraleImpact;
        
        // Log consequence
        this.state.consequences.impact.push({
            type: 'resource_critical',
            resource,
            daysToZero: 0,
            moraleImpact,
            timestamp: Date.now()
        });
    }
    
    // Decision making system
    
    recordDecision(decision) {
        const { role, choice, context, consequence } = decision;
        
        // Add to player's decision history
        if (this.state.players[role]) {
            this.state.players[role].decisions.push({
                ...decision,
                timestamp: Date.now()
            });
        }
        
        // Record as active event if it has consequences
        if (consequence) {
            this.state.events.active.push({
                id: `decision-${Date.now()}`,
                type: 'player_decision',
                role,
                choice,
                consequence,
                status: 'active'
            });
        }
        
        // Apply immediate effects
        if (consequence?.effects) {
            this._applyEffects(consequence.effects);
        }
    }
    
    _applyEffects(effects) {
        // Apply each effect to game state
        Object.entries(effects).forEach(([effectType, value]) => {
            switch(effectType) {
                case 'morale':
                    this.state.voyage.status.morale += value;
                    break;
                case 'legitimacy':
                    this.state.voyage.status.legitimacy += value;
                    break;
                case 'racePosition':
                    this.state.voyage.racePosition.moonFactionDistanceAU += value;
                    break;
                case 'fuel':
                    this.state.voyage.resources.fuel.current += value;
                    break;
            }
        });
    }
    
    // Event system
    
    triggerEvent(eventId) {
        if (this._isEventActive(eventId)) return false;
        
        const event = this.gameEvents[eventId];
        if (!event) return false;
        
        this.state.events.active.push({
            id: eventId,
            ...event,
            timestamp: Date.now(),
            status: 'active'
        });
        
        // Apply immediate effects
        if (event.effects) {
            this._applyEffects(event.effects);
        }
        
        return true;
    }
    
    _isEventActive(eventId) {
        return this.state.events.active.some(e => e.id === eventId);
    }
    
    // Debug utilities
    
    setDebugMode(options = {}) {
        Object.assign(this.debug, options);
        console.log('Debug mode updated:', this.debug);
    }
    
    resetToState(stateData) {
        this.state = { ...this.state, ...stateData };
    }
    
    getSnapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }
}

// Game events configuration
GameStateManager.prototype.gameEvents = {
    'travel': {
        name: 'Cruise Phase',
        description: 'The ship is in stable cruise mode. Stars drift slowly past the viewport.',
        duration: null, // Ongoing state
        effects: {
            morale: 1,
            wearAccumulation: true
        }
    },
    
    'system_engines_failure': {
        name: 'Engine Degradation',
        description: 'Engines showing signs of excessive wear. Performance may be affected.',
        duration: 'indefinite',
        effects: {
            engines_integrity: -15,
            maxSpeed_reduction: 0.02
        }
    },
    
    'system_lifeSupport_failure': {
        name: 'Life Support Fluctuation',
        description: 'Oxygen levels temporarily unstable. Crew reporting minor dizziness.',
        duration: '7d',
        effects: {
            morale: -10,
            crewReadiness: -20
        }
    },
    
    'system_power_failure': {
        name: 'Power Grid Instability',
        description: 'Voltage fluctuations detected in main power grid.',
        duration: '3d',
        effects: {
            systems_reliability: -5,
            shields_draw: 10 // Increased draw to compensate
        }
    },
    
    'solar_storm': {
        name: 'Solar Storm Alert',
        description: 'Major solar flare detected on collision course. Radiation levels rising.',
        duration: '3d',
        effects: {
            radiationExposure: true,
            shielding_required: true,
            morale: -5
        }
    },
    
    'debris_field': {
        name: 'Asteroid Debris Field',
        description: 'Scanner detects dense debris field ahead. Course adjustment required.',
        duration: null,
        effects: {
            fuel: -200,
            hullIntegrity: -5,
            delay_days: 1
        }
    },
    
    'rival_encounter': {
        name: 'Moon Faction Vessel',
        description: 'Unmarked vessel approaches from lunar orbital plane. No response to hails.',
        duration: null,
        effects: {
            tension: 15,
            legitimacy: -3,
            security_required: true
        }
    },
    
    'derelict_ship': {
        name: 'Derelict Vessel',
        description: 'Large derelict vessel adrift in empty space. Life signs undetectable.',
        duration: null,
        effects: {
            salvage_opportunity: true,
            contamination_risk: true
        }
    },
    
    'resource_cloud': {
        name: 'Water-Ice Cloud',
        description: 'Scanner detects rich water-ice cloud that could be harvested.',
        duration: null,
        effects: {
            fuel_water: 1500, // Convert to usable resources
            delay_days: 2
        }
    }
};
