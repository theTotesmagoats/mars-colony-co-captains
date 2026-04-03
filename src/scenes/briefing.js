/**
 * Briefing Scene Controller for Mars Colony Co-Captains
 * 
 * Manages the pre-launch mission planning phase where players:
 * - Choose ship loadout (data-driven from ships.json)
 * - Select route profile (data-driven from routes.json) 
 * - Balance passengers, fuel, supplies, and security
 * - Experience role-specific perspectives on tradeoffs
 */

export class BriefingScene {
    constructor(gameState, renderingEngine, uiManager) {
        this.gameState = gameState;
        this.renderingEngine = renderingEngine;
        this.uiManager = uiManager;
        
        // Planning state
        this.planningState = {
            activeTab: 'ship-config',
            selectedRoute: null,
            passengerCount: 20,
            resourceAllocation: {
                fuel: 6500,
                food: 480,
                water: 1200,
                medical: 120,
                parts: 80
            }
        };
        
        // Data from content files (will be populated in enter())
        this.availableRoutes = [];
        this.availableShips = [];
    }
    
    async enter() {
        console.log('Entering Briefing Scene (Pre-Launch Planning)');
        
        // Load content data if not already loaded
        await this._loadContentData();
        
        // Setup planning interface
        await this._setupPlanningInterface();
        
        // Initialize role perspectives
        this._setupRolePerspectives();
        
        return true;
    }
    
    exit() {
        console.log('Exiting Briefing Scene');
    }
    
    async _loadContentData() {
        try {
            const app = window.__app;
            
            // Use ships data from app if available, otherwise fallback
            this.availableShips = app?.shipsData?.ships || [
                {
                    id: 'ares-heavy',
                    name: 'Ares-Class Heavy Lifter',
                    class: 'heavy-lifter',
                    description: 'Large cargo capacity with balanced systems. Best all-rounder for Mars colonization missions.',
                    capacity: {
                        passengers: 24,
                        cargoMassKg: 15000,
                        fuelMassKg: 8000
                    }
                },
                {
                    id: 'luna-courier',
                    name: 'Luna Courier-class',
                    class: 'fast-transit', 
                    description: 'Agile vessel with enhanced engines but limited cargo space. Optimized for speed over capacity.',
                    capacity: {
                        passengers: 12,
                        cargoMassKg: 8000,
                        fuelMassKg: 6000
                    }
                },
                {
                    id: 'gaia-colony-ship',
                    name: 'Gaia-class Colony Ship', 
                    class: 'colonist-transit',
                    description: 'Specialized for long-duration transit with enhanced life support and passenger comfort.',
                    capacity: {
                        passengers: 40,
                        cargoMassKg: 12000,
                        fuelMassKg: 7500
                    }
                },
                {
                    id: 'chaos-stealth-raider',
                    name: 'Chaos-class Stealth Raider',
                    class: 'stealth-cutter',
                    description: 'A black stealth raider with room for only two human operators and one deeply unqualified but alarmingly effective ship AI.',
                    capacity: {
                        passengers: 2,
                        cargoMassKg: 3500,
                        fuelMassKg: 4000
                    }
                }
            ];
            
            // Use routes data from app if available, otherwise fallback
            this.availableRoutes = app?.routesData?.routes || [
                {
                    id: 'fast',
                    name: 'Fast Transit Route',
                    description: 'Direct trajectory with maximum engine output. Arrive significantly sooner but at higher system stress.',
                    transitDays: 105,
                    fuelCostFactor: 130,
                    riskLevel: 'high'
                },
                {
                    id: 'balanced', 
                    name: 'Standard Transit Route',
                    description: 'Optimized route with moderate engine output. Balanced risk/reward profile.',
                    transitDays: 135,
                    fuelCostFactor: 100,
                    riskLevel: 'medium'
                },
                {
                    id: 'economical', 
                    name: 'Economical Transit Route',
                    description: 'Extended route with minimal engine use. Conservative resource usage and system preservation.',
                    transitDays: 170,
                    fuelCostFactor: 85,
                    riskLevel: 'low'
                }
            ];
            
            console.log('Content data loaded:', {
                shipsCount: this.availableShips.length,
                routesCount: this.availableRoutes.length
            });
        } catch (error) {
            console.error('Failed to load content data:', error);
        }
    }
    
    async _setupPlanningInterface() {
        const sceneContainer = document.getElementById('main-scene');
        
        // Clear existing content
        while (sceneContainer.firstChild) {
            sceneContainer.removeChild(sceneContainer.firstChild);
        }
        
        // Create planning workspace
        const workspace = document.createElement('div');
        workspace.className = 'planning-workspace';
        
        // Header
        const header = document.createElement('h1');
        header.textContent = 'MISSION PLANNING BRIEFING';
        workspace.appendChild(header);
        
        // Subtitle for political context
        const subtitle = document.createElement('p');
        subtitle.textContent = 'Earth funding Moon for years and wants a return; Moon believes frontier sacrifice earned first rights to Mars.';
        subtitle.className = 'planning-subtitle';
        workspace.appendChild(subtitle);
        
        // Role perspective panels
        workspace.appendChild(this._createRolePanels());
        
        // Main planning sections
        const mainContent = document.createElement('div');
        mainContent.className = 'planning-content';
        
        // Ship configuration section
        mainContent.appendChild(this._createShipConfiguration());
        
        // Route selection section
        mainContent.appendChild(this._createRouteSelection());
        
        // Resource allocation section
        mainContent.appendChild(this._createResourceAllocation());
        
        // Summary and launch section
        workspace.appendChild(mainContent);
        workspace.appendChild(this._createLaunchSummary());
        
        sceneContainer.appendChild(workspace);
    }
    
    _createRolePanels() {
        const panels = document.createElement('div');
        panels.className = 'role-panels';
        
        // Captain perspective
        const captainPanel = document.createElement('div');
        captainPanel.className = 'role-panel captain-panel active';
        captainPanel.innerHTML = `
            <h3>CAPTAIN PERSPECTIVE</h3>
            <p>Focus: Mission priorities, diplomatic posture, route/risk tradeoffs, long-horizon strategy</p>
            <ul class="perspective-list">
                <li><strong>Arrival Timing:</strong> Critical for claiming prime landing sites</li>
                <li><strong>Political Consequences:</strong> How Earth and Moon perceive our choices</li>
                <li><strong>Landing Posture:</strong> Strength vs.appeasement balance</li>
            </ul>
        `;
        
        // XO perspective
        const xoPanel = document.createElement('div');
        xoPanel.className = 'role-panel xo-panel';
        xoPanel.innerHTML = `
            <h3>XO / NUMBER TWO PERSPECTIVE</h3>
            <p>Focus: Ship systems, tactical responses, emergency operations, crew readiness, security, repairs</p>
            <ul class="perspective-list">
                <li><strong>What Breaks First:</strong> System integrity under stress</li>
                <li><strong>Crew Tolerance:</strong> How much strain the crew can absorb</li>
                <li><strong>Hidden Damage:</strong> Potential failures we might miss</li>
            </ul>
        `;
        
        panels.appendChild(captainPanel);
        panels.appendChild(xoPanel);
        
        // Switch role button
        const switchBtn = document.createElement('button');
        switchBtn.className = 'role-switch-btn';
        switchBtn.textContent = 'SWITCH PERSPECTIVE';
        switchBtn.addEventListener('click', () => {
            captainPanel.classList.toggle('active');
            xoPanel.classList.toggle('active');
        });
        
        panels.appendChild(switchBtn);
        
        return panels;
    }
    
    _createShipConfiguration() {
        const section = document.createElement('div');
        section.className = 'planning-section';
        
        const title = document.createElement('h2');
        title.textContent = 'SHIP CONFIGURATION';
        section.appendChild(title);
        
        const configContainer = document.createElement('div');
        configContainer.className = 'config-container';
        
        // Ship card (data-driven from availableShips)
        const shipCard = document.createElement('div');
        shipCard.className = 'ship-card';
        shipCard.innerHTML = `
            <h3>Selected Vessel</h3>
            <h4 id="selected-ship-name">${this.availableShips[0]?.name || 'Ares-Class Heavy Lifter'}</h4>
            <p>${this.availableShips[0]?.description || 'Heavy-lifter class with optimal balance for Mars transit.'}</p>
            
            <div class="capacity-grid">
                <div class="capacity-item">
                    <span class="label">Passenger Capacity:</span>
                    <span class="value">${this.availableShips[0]?.capacity?.passengers || 24} crew</span>
                </div>
                <div class="capacity-item">
                    <span class="label">Cargo Mass:</span>
                    <span class="value">${this.availableShips[0]?.capacity?.cargoMassKg || 15000} kg</span>
                </div>
                <div class="capacity-item">
                    <span class="label">Fuel Capacity:</span>
                    <span class="value">${this.availableShips[0]?.capacity?.fuelMassKg || 8000} kg</span>
                </div>
            </div>
        `;
        
        configContainer.appendChild(shipCard);
        
        // Current loadout summary
        const currentLoad = this.gameState.getField('ship.currentLoad');
        const loadoutSummary = document.createElement('div');
        loadoutSummary.className = 'loadout-summary';
        loadoutSummary.innerHTML = `
            <h3>Current Loadout</h3>
            <ul class="loadout-list">
                <li><strong>Passengers:</strong> ${currentLoad.passengers} (Critical for workforce & legitimacy)</li>
                <li><strong>Cargo Mass:</strong> ${currentLoad.cargoMassKg} kg of supplies and equipment</li>
                <li><strong>Fuel Load:</strong> ${currentLoad.fuelMassKg} kg (Determines burn flexibility)</li>
            </ul>
            
            <div class="mass-budget">
                <h4>Mass Budget Analysis</h4>
                <p>Every kilogram allocated has immediate benefits and long-term costs. Consider:</p>
                <ul class="tradeoff-list">
                    <li><strong>More passengers:</strong> Larger workforce, but higher life-support burden</li>
                    <li><strong>More fuel:</strong> Better emergency margin, but less room for cargo</li>
                    <li><strong>More supplies:</strong> Safer voyage, but reduced agility</li>
                </ul>
            </div>
        `;
        
        configContainer.appendChild(loadoutSummary);
        
        section.appendChild(configContainer);
        return section;
    }
    
    _createRouteSelection() {
        const section = document.createElement('div');
        section.className = 'planning-section';
        
        const title = document.createElement('h2');
        title.textContent = 'TRAJECTORY SELECTION';
        section.appendChild(title);
        
        // Route selection grid
        const routeGrid = document.createElement('div');
        routeGrid.className = 'route-grid';
        
        this.availableRoutes.forEach((route, index) => {
            const routeCard = document.createElement('div');
            routeCard.className = `route-card ${this.planningState.selectedRoute?.id === route.id ? 'selected' : ''}`;
            
            // Visual indicator based on risk
            let riskColor = 'green';
            if (route.riskLevel === 'medium') riskColor = 'orange';
            else if (route.riskLevel === 'high') riskColor = 'red';
            
            routeCard.innerHTML = `
                <div class="route-header">
                    <h3>${route.name}</h3>
                    <span class="risk-indicator" style="background-color: ${riskColor}"></span>
                </div>
                
                <p class="route-description">${route.description}</p>
                
                <div class="route-stats">
                    <div class="stat-item">
                        <span class="label">Transit Time:</span>
                        <span class="value">${route.transitDays} days</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">Fuel Cost:</span>
                        <span class="value">${route.fuelCostFactor}% efficiency factor</span>
                    </div>
                </div>
                
                <div class="route-effects">
                    <h4>Expected Effects</h4>
                    <ul>
                        <li><strong>Arrival Position:</strong>${route.effects?.arrival_position ? ' ' + route.effects.arrival_position : ''}</li>
                        <li><strong>System Wear:</strong>${route.effects?.system_wear ? ' ' + route.effects.system_wear : ''}</li>
                        <li><strong>Morale Risk:</strong>${route.effects?.morale_risk ? ' ' + route.effects.morale_risk : ''}</li>
                    </ul>
                </div>
                
                <button class="select-route-btn" data-route="${route.id}">SELECT ROUTE</button>
            `;
            
            routeGrid.appendChild(routeCard);
        });
        
        section.appendChild(routeGrid);
        
        // Add event listeners for route selection
        document.querySelectorAll('.select-route-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedRouteId = btn.dataset.route;
                this._selectRoute(selectedRouteId);
            });
        });
        
        return section;
    }
    
    _createResourceAllocation() {
        const section = document.createElement('div');
        section.className = 'planning-section';
        
        const title = document.createElement('h2');
        title.textContent = 'RESOURCE ALLOCATION';
        section.appendChild(title);
        
        // Resource allocation interface
        const resourceContainer = document.createElement('div');
        resourceContainer.className = 'resource-container';
        
        // Passengers slider
        const passengersSection = this._createResourceSlider(
            'Passengers',
            this.planningState.passengerCount,
            16, // minimum
            24, // maximum
            'crew_count'
        );
        passengersSection.querySelector('.slider-value').textContent = `${this.planningState.passengerCount} crew`;
        
        // Fuel allocation
        const fuelSection = this._createResourceSlider(
            'Fuel Reserve',
            this.planningState.resourceAllocation.fuel,
            4000, // minimum
            8000, // maximum
            'fuel_mass'
        );
        
        // Food allocation
        const foodSection = this._createResourceSlider(
            'Food Supply',
            this.planningState.resourceAllocation.food,
            300, // minimum
            600, // maximum
            'food_days'
        );
        
        // Water allocation
        const waterSection = this._createResourceSlider(
            'Water Reserve',
            this.planningState.resourceAllocation.water,
            800, // minimum
            1500, // maximum
            'water_liters'
        );
        
        resourceContainer.appendChild(passengersSection);
        resourceContainer.appendChild(fuelSection);
        resourceContainer.appendChild(foodSection);
        resourceContainer.appendChild(waterSection);
        
        section.appendChild(resourceContainer);
        
        // Resource effects summary
        const resourceEffects = document.createElement('div');
        resourceEffects.className = 'resource-effects';
        resourceEffects.innerHTML = `
            <h3>Resource Allocation Effects</h3>
            
            <div class="effect-pair">
                <div class="effect-item">
                    <strong>More Passengers:</strong><br>
                    Positive: Larger workforce, stronger legitimacy<br>
                    Negative: Higher life-support burden, more morale risk
                </div>
                <div class="effect-item">
                    <strong>More Fuel Reserve:</strong><br>
                    Positive: Better emergency margin, landing flexibility<br>
                    Negative: Heavier ship, less cargo room
                </div>
            </div>
            
            <div class="effect-pair">
                <div class="effect-item">
                    <strong>More Food/Water:</strong><br>
                    Positive: Safer voyage, stronger opening buffer<br>
                    Negative: Reduced agility, fewer specialized systems
                </div>
                <div class="effect-item">
                    <strong>Security Hardware:</strong><br>
                    Positive: Better deterrence, crisis options<br>
                    Negative: Higher mass, political blowback risk
                </div>
            </div>
        `;
        
        section.appendChild(resourceEffects);
        
        // Add event listeners for resource sliders
        document.querySelectorAll('.resource-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                this._updateResourceAllocation(e.target.dataset.resourceType, parseInt(e.target.value));
            });
            
            // Also update display on change
            slider.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                const parent = e.target.parentElement;
                const display = parent.querySelector('.slider-value');
                
                let unit = '';
                if (e.target.dataset.resourceType === 'crew_count') unit = ' crew';
                else if (e.target.dataset.resourceType === 'fuel_mass') unit = ' kg';
                else if (e.target.dataset.resourceType === 'food_days') unit = ' days supply';
                else if (e.target.dataset.resourceType === 'water_liters') unit = ' liters';
                
                display.textContent = `${value}${unit}`;
            });
        });
        
        return section;
    }
    
    _createResourceSlider(label, value, min, max, resourceType) {
        const container = document.createElement('div');
        container.className = 'resource-slider';
        
        container.innerHTML = `
            <div class="slider-header">
                <span class="label">${label}</span>
                <span class="slider-value" data-resource="${resourceType}">${value}${this._getResourceUnit(resourceType)}</span>
            </div>
            <input type="range" 
                   class="resource-slider-input"
                   min="${min}" 
                   max="${max}" 
                   value="${value}"
                   data-resource-type="${resourceType}">
        `;
        
        return container;
    }
    
    _getResourceUnit(type) {
        const units = {
            'crew_count': ' crew',
            'fuel_mass': ' kg',
            'food_days': ' days supply',
            'water_liters': ' liters'
        };
        return units[type] || '';
    }
    
    _createLaunchSummary() {
        const summary = document.createElement('div');
        summary.className = 'launch-summary';
        
        // Current status
        const statusGrid = document.createElement('div');
        statusGrid.className = 'status-grid';
        
        // Calculate current state based on selections
        const fuelMargin = (this.planningState.resourceAllocation.fuel / 8000) * 100;
        const crewLoad = (this.planningState.passengerCount / 24) * 100;
        
        statusGrid.innerHTML = `
            <div class="status-item">
                <span class="label">Fuel Margin:</span>
                <span class="value ${fuelMargin > 75 ? 'good' : fuelMargin > 50 ? 'warning' : 'danger'}">${Math.round(fuelMargin)}%</span>
            </div>
            <div class="status-item">
                <span class="label">Crew Load:</span>
                <span class="value ${crewLoad < 85 ? 'good' : crewLoad < 100 ? 'warning' : 'danger'}">${Math.round(crewLoad)}%</span>
            </div>
            <div class="status-item">
                <span class="label">Est. Transit Time:</span>
                <span class="value">${this.planningState.selectedRoute?.transitDays || 135} days</span>
            </div>
        `;
        
        summary.appendChild(statusGrid);
        
        // Decision buttons
        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-container';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'action-btn launch-btn';
        confirmBtn.textContent = 'CONFIRM MISSION AND LAUNCH';
        confirmBtn.addEventListener('click', () => this._confirmMissionLaunch());
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'action-btn secondary-btn';
        resetBtn.textContent = 'RESET PLANS';
        resetBtn.addEventListener('click', () => this._resetPlanning());
        
        actionContainer.appendChild(confirmBtn);
        actionContainer.appendChild(resetBtn);
        
        summary.appendChild(actionContainer);
        
        return summary;
    }
    
    // Event handlers
    
    _selectRoute(routeId) {
        const route = this.availableRoutes.find(r => r.id === routeId);
        if (route) {
            this.planningState.selectedRoute = route;
            
            // Update game state with unified speed field
            this.gameState.selectRoute(route);
            
            console.log('Route selected:', route.name);
        }
    }
    
    _updateResourceAllocation(resourceType, value) {
        switch(resourceType) {
            case 'crew_count':
                this.planningState.passengerCount = value;
                break;
            case 'fuel_mass':
                this.planningState.resourceAllocation.fuel = value;
                break;
            case 'food_days':
                this.planningState.resourceAllocation.food = value;
                break;
            case 'water_liters':
                this.planningState.resourceAllocation.water = value;
                break;
        }
    }
    
    _confirmMissionLaunch() {
        if (!this.planningState.selectedRoute) {
            alert('Please select a trajectory route before launching.');
            return;
        }
        
        // Apply loadout to game state
        const loadout = {
            passengers: this.planningState.passengerCount,
            cargoMassKg: 12000, // Base cargo + resources
            fuelMassKg: this.planningState.resourceAllocation.fuel
        };
        
        this.gameState.setMissionLoadout(loadout);
        
        console.log('Mission confirmed. Launching to bridge scene...');
        
        // Transition to bridge scene using the app instance
        const app = window.__app;
        if (app && typeof app.switchScene === 'function') {
            app.switchScene('bridge');
        } else {
            alert('System error: Cannot switch to bridge scene');
        }
    }
    
    _resetPlanning() {
        this.planningState = {
            activeTab: 'ship-config',
            selectedRoute: null,
            passengerCount: 20,
            resourceAllocation: {
                fuel: 6500,
                food: 480,
                water: 1200,
                medical: 120,
                parts: 80
            }
        };
        
        // Refresh UI by re-rendering the scene
        this._setupPlanningInterface();
    }
    
    _setupRolePerspectives() {
        console.log('Setting up role perspectives');
        // This would load role-specific data and decision trees
    }
}
