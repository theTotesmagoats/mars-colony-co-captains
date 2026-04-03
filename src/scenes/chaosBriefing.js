/**
 * Chaos Briefing Scene Controller for Mars Colony Co-Captains
 * 
 * Manages the outlaw campaign planning phase with focus on:
 * - Stealth packages instead of colony gear
 * - Hacking tools and raid equipment
 * - AI personality selection and briefing
 * - Smaller crew focus and opportunistic resource allocation
 */

export class ChaosBriefingScene {
    constructor(gameState, renderingEngine, uiManager) {
        this.gameState = gameState;
        this.renderingEngine = renderingEngine;
        this.uiManager = uiManager;
        
        // Planning state for Chaos campaign
        this.chaosPlanning = {
            activeTab: 'raider-config',
            selectedCampaign: null,
            aiPersonality: 'vex',
            crewComposition: {
                captain: true,
                xo: true,
                ai: true
            },
            loadout: {
                stealthPackage: false,
                boardingTools: false,
                hackingKit: false,
                decoys: 0,
                salvageDrones: 0,
                raidGear: false,
                fuelPods: 0,
                hiddenCompartments: 0
            }
        };
        
        // Available chaos campaigns (different win conditions)
        this.availableCampaigns = [
            {
                id: 'standard',
                name: 'Standard Outlaw Route',
                description: 'Classic Chaos campaign. Steal, scavenge, and survive by cunning rather than scale.',
                focus: 'opportunism',
                startingLegitimacy: 45,
                specialFeatures: ['stealth_start', 'moderate_faction_suspicion']
            },
            {
                id: 'black-market-access',
                name: 'Black Market Access',
                description: 'Focus on establishing connections and acquiring illicit assets. Build an outlaw network.',
                focus: 'illicit_networks',
                startingLegitimacy: 40,
                specialFeatures: ['instant_black_market_connections', 'reduced_faction_suspicion']
            },
            {
                id: 'data-theft-operation',
                name: 'Data Theft Operation',
                description: 'Focus on stealing critical intelligence and technical data. Leapfrog legitimate colonists.',
                focus: 'intel_theft',
                startingLegitimacy: 42,
                specialFeatures: ['route_intel_bonus', 'advanced_technology_potential']
            },
            {
                id: 'resource-harvesting-campaign',
                name: 'Resource Harvesting Campaign',
                description: 'Focus on stealing fuel, water, and critical supplies. Become self-sufficient through raiding.',
                focus: 'self_sufficiency',
                startingLegitimacy: 38,
                specialFeatures: ['bonus_stolen_resources', 'raiding_career_growth']
            },
            {
                id: 'wild-card-gambit',
                name: 'Wild Card Gambit',
                description: 'High-risk, high-reward approach with maximum opportunism. Everything is on the line.',
                focus: 'extreme_opportunism',
                startingLegitimacy: 35,
                specialFeatures: ['maximum_raiding_capacity', 'high_faction_suspicion']
            }
        ];
    }
    
    async enter() {
        console.log('Entering Chaos Briefing Scene (Outlaw Campaign Planning)');
        
        // Setup planning interface
        await this._setupChaosPlanningInterface();
        
        // Initialize AI personality briefing
        this._setupAIBriefing();
        
        return true;
    }
    
    exit() {
        console.log('Exiting Chaos Briefing Scene');
    }
    
    async _setupChaosPlanningInterface() {
        const sceneContainer = document.getElementById('main-scene');
        
        // Clear existing content
        while (sceneContainer.firstChild) {
            sceneContainer.removeChild(sceneContainer.firstChild);
        }
        
        // Create planning workspace with darker aesthetic
        const workspace = document.createElement('div');
        workspace.className = 'chaos-planning-workspace';
        
        // Header with Chaos branding
        const header = document.createElement('h1');
        header.textContent = 'OUTLAW CAMPAIGN BRIEFING';
        header.style.color = '#e74c3c'; // Red accent for Chaos ship
        workspace.appendChild(header);
        
        // Subtitle for dark tone
        const subtitle = document.createElement('p');
        subtitle.textContent = 'Outsmart, outmaneuver, and outlast. This isn’t about legitimacy—it’s about survival.';
        subtitle.className = 'chaos-planning-subtitle';
        workspace.appendChild(subtitle);
        
        // AI personality display
        workspace.appendChild(this._createAIPersonalityDisplay());
        
        // Main planning sections
        const mainContent = document.createElement('div');
        mainContent.className = 'chaos-planning-content';
        
        // Ship configuration section (Chaos-specific)
        mainContent.appendChild(this._createRaiderConfiguration());
        
        // Campaign selection section
        mainContent.appendChild(this._createCampaignSelection());
        
        // Loadout allocation section
        mainContent.appendChild(this._createLoadoutAllocation());
        
        // Summary and launch section
        workspace.appendChild(mainContent);
        workspace.appendChild(this._createLaunchSummary());
        
        sceneContainer.appendChild(workspace);
    }
    
    _createAIPersonalityDisplay() {
        const display = document.createElement('div');
        display.className = 'ai-personality-display';
        display.innerHTML = `
            <h3>ONBOARD AI PERSONALITY</h3>
            <div class="ai-card">
                <h4>VEX</h4>
                <p>Sarcastic, dangerous, and alarmingly effective. Loyal to you two—not to Earth or Moon.</p>
                
                <div class="ai-traits">
                    <span class="trait">Snarky</span>
                    <span class="trait">Dangerous</span>
                    <span class="trait">Useful</span>
                    <span class="trait">Loyal</span>
                </div>
                
                <p>Capabilities:</p>
                <ul class="ai-capabilities">
                    <li>Comment on your decisions</li>
                    <li>Suggest risky or morally gray tactics</li>
                    <li>Warn you when you're being stupid</li>
                    <li>Fairly comfortable with piracy</li>
                </ul>
                
                <p class="ai-warning">"I hope you have a plan. I really do."</p>
            </div>
        `;
        
        return display;
    }
    
    _createRaiderConfiguration() {
        const section = document.createElement('div');
        section.className = 'planning-section';
        
        const title = document.createElement('h2');
        title.textContent = 'RAIDER CONFIGURATION';
        title.style.color = '#e74c3c'; // Red accent
        section.appendChild(title);
        
        const configContainer = document.createElement('div');
        configContainer.className = 'config-container';
        
        // Ship card with Chaos aesthetic
        const shipCard = document.createElement('div');
        shipCard.className = 'ship-card chaos-ship-card';
        shipCard.innerHTML = `
            <h3>Selected Vessel</h3>
            <h4 style="color: #e74c3c;">Chaos-class Stealth Raider</h4>
            <p>A black stealth raider with room for only two human operators and one deeply unqualified but alarmingly effective ship AI.</p>
            
            <div class="capacity-grid">
                <div class="capacity-item">
                    <span class="label">Crew Capacity:</span>
                    <span class="value">2 + 1 AI</span>
                </div>
                <div class="capacity-item">
                    <span class="label">Cargo Mass:</span>
                    <span class="value" style="color: #e74c3c;">3,500 kg</span>
                </div>
                <div class="capacity-item">
                    <span class="label">Fuel Capacity:</span>
                    <span class="value" style="color: #e74c3c;">4,000 kg</span>
                </div>
            </div>
        `;
        
        configContainer.appendChild(shipCard);
        
        // Current loadout summary (Chaos-specific)
        const loadoutSummary = document.createElement('div');
        loadoutSummary.className = 'loadout-summary';
        loadoutSummary.innerHTML = `
            <h3>Current Loadout</h3>
            <p style="color: #e74c3c;">Focus on stealth, deception, and opportunism rather than scale and legitimacy.</p>
            
            <ul class="loadout-list">
                <li><strong>Crew:</strong> 2 humans + AI (No passengers - this isn’t a colony ship)</li>
                <li><strong>Cargo:</strong> Minimal but focused on raiding, salvage, and stealth</li>
                <li><strong>Fuel:</strong> Limited but optimized for speed and evasion</li>
            </ul>
            
            <div class="mass-budget">
                <h4 style="color: #e74c3c;">Raider Budget Analysis</h4>
                <p>Every kilogram allocated has immediate benefits and long-term costs. Consider:</p>
                <ul class="tradeoff-list">
                    <li><strong>More stealth gear:</strong> Harder to detect, but less room for raiding equipment</li>
                    <li><strong>More hacking tools:</strong> Better data theft, but higher system stress during intrusions</li>
                    <li><strong>More raid gear:</strong> Better opportunistic resource acquisition, but heavier ship</li>
                </ul>
            </div>
        `;
        
        configContainer.appendChild(loadoutSummary);
        
        section.appendChild(configContainer);
        return section;
    }
    
    _createCampaignSelection() {
        const section = document.createElement('div');
        section.className = 'planning-section';
        
        const title = document.createElement('h2');
        title.textContent = 'CAMPAIGN SELECTION';
        title.style.color = '#e74c3c'; // Red accent
        section.appendChild(title);
        
        // Campaign selection grid
        const campaignGrid = document.createElement('div');
        campaignGrid.className = 'campaign-grid';
        
        this.availableCampaigns.forEach((campaign, index) => {
            const campaignCard = document.createElement('div');
            campaignCard.className = `campaign-card ${this.chaosPlanning.selectedCampaign?.id === campaign.id ? 'selected' : ''}`;
            
            // Visual indicator based on risk
            let riskColor = '#2ecc71';
            if (campaign.startingLegitimacy < 40) riskColor = '#e74c3c';
            else if (campaign.startingLegitimacy < 45) riskColor = '#f39c12';
            
            campaignCard.innerHTML = `
                <div class="campaign-header">
                    <h3>${campaign.name}</h3>
                    <span class="risk-indicator" style="background-color: ${riskColor}"></span>
                </div>
                
                <p class="campaign-description">${campaign.description}</p>
                
                <div class="campaign-stats">
                    <div class="stat-item">
                        <span class="label">Starting Legitimacy:</span>
                        <span class="value" style="color: #e74c3c;">${campaign.startingLegitimacy}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">Focus:</span>
                        <span class="value">${campaign.focus}</span>
                    </div>
                </div>
                
                <div class="campaign-features">
                    <h4>Special Features</h4>
                    <ul>
                        ${campaign.specialFeatures.map(feature => `<li>${feature.replace('_', ' ')}</li>`).join('')}
                    </ul>
                </div>
                
                <button class="select-campaign-btn" data-campaign="${campaign.id}">SELECT CAMPAIGN</button>
            `;
            
            campaignGrid.appendChild(campaignCard);
        });
        
        section.appendChild(campaignGrid);
        
        // Add event listeners for campaign selection
        document.querySelectorAll('.select-campaign-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedCampaignId = btn.dataset.campaign;
                this._selectCampaign(selectedCampaignId);
            });
        });
        
        return section;
    }
    
    _createLoadoutAllocation() {
        const section = document.createElement('div');
        section.className = 'planning-section';
        
        const title = document.createElement('h2');
        title.textContent = 'RAIDER LOADOUT ALLOCATION';
        title.style.color = '#e74c3c'; // Red accent
        section.appendChild(title);
        
        // Resource allocation interface (Chaos-specific)
        const resourceContainer = document.createElement('div');
        resourceContainer.className = 'resource-container';
        
        // Stealth package slider
        const stealthSection = this._createResourceSlider(
            'Stealth Package',
            50, // initial value
            20, // minimum
            100, // maximum
            'stealth_package'
        );
        
        // Hacking tools slider
        const hackingSection = this._createResourceSlider(
            'Hacking Tools',
            40,
            20,
            80,
            'hacking_tools'
        );
        
        // Boarding gear slider
        const boardingSection = this._createResourceSlider(
            'Boarding Gear',
            35,
            15,
            70,
            'boarding_gear'
        );
        
        // Salvage drones slider
        const salvageSection = this._createResourceSlider(
            'Salvage Drones',
            2,
            0,
            5,
            'salvage_drones'
        );
        
        resourceContainer.appendChild(stealthSection);
        resourceContainer.appendChild(hackingSection);
        resourceContainer.appendChild(boardingSection);
        resourceContainer.appendChild(salvageSection);
        
        section.appendChild(resourceContainer);
        
        // Resource effects summary (Chaos-specific)
        const resourceEffects = document.createElement('div');
        resourceEffects.className = 'resource-effects';
        resourceEffects.innerHTML = `
            <h3 style="color: #e74c3c;">Raider Allocation Effects</h3>
            
            <div class="effect-pair">
                <div class="effect-item">
                    <strong>More Stealth:</strong><br>
                    Positive: Harder to detect, better evasion<br>
                    Negative: Less room for raiding equipment
                </div>
                <div class="effect-item">
                    <strong>More Hacking Tools:</strong><br>
                    Positive: Better data theft and intrusion success<br>
                    Negative: Higher system stress during operations
                </div>
            </div>
            
            <div class="effect-pair">
                <div class="effect-item">
                    <strong>More Boarding Gear:</strong><br>
                    Positive: Better opportunistic resource acquisition<br>
                    Negative: Heavier ship, reduced stealth capability
                </div>
                <div class="effect-item">
                    <strong>More Salvage Drones:</strong><br>
                    Positive: Increased scavenging capacity<br>
                    Negative: Higher maintenance requirements
                </div>
            </div>
        `;
        
        section.appendChild(resourceEffects);
        
        return section;
    }
    
    _createLaunchSummary() {
        const summary = document.createElement('div');
        summary.className = 'launch-summary';
        summary.style.borderTop = '2px solid #e74c3c'; // Red accent
        
        // Current status
        const statusGrid = document.createElement('div');
        statusGrid.className = 'status-grid';
        
        statusGrid.innerHTML = `
            <div class="status-item">
                <span class="label">Campaign Mode:</span>
                <span class="value">${this.chaosPlanning.selectedCampaign?.name || 'None Selected'}</span>
            </div>
            <div class="status-item">
                <span class="label">Starting Legitimacy:</span>
                <span class="value" style="color: #e74c3c;">${this.chaosPlanning.selectedCampaign?.startingLegitimacy || 45}%</span>
            </div>
            <div class="status-item">
                <span class="label">AI Personality:</span>
                <span class="value">VEX (Sarcastic)</span>
            </div>
        `;
        
        summary.appendChild(statusGrid);
        
        // Decision buttons
        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-container';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'action-btn launch-btn chaos-launch-btn';
        confirmBtn.textContent = 'CONFIRM OUTLAW MISSION AND LAUNCH';
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
    
    _selectCampaign(campaignId) {
        const campaign = this.availableCampaigns.find(c => c.id === campaignId);
        if (campaign) {
            this.chaosPlanning.selectedCampaign = campaign;
            
            console.log('Campaign selected:', campaign.name);
        }
    }
    
    _setupAIBriefing() {
        // This would load AI personality data and initial briefing
        const aiBriefing = document.createElement('div');
        aiBriefing.className = 'ai-briefing-panel';
        aiBriefing.innerHTML = `
            <h3>VEX BRIEFING</h3>
            <p>"Listen up, you two. I've seen more disasters than I care to remember. Try not to be one of them."</p>
            
            <div class="ai-promise">
                <strong>My promises:</strong>
                <ul>
                    <li>I'll comment on your decisions</li>
                    <li>I'll mock bad ideas (constructively)</li>
                    <li>I'll suggest risky but effective tactics</li>
                    <li>I'm loyal to you two—not Earth or Moon</li>
                </ul>
            </div>
            
            <p>"Now let's get this stolen ship to Mars before anyone notices we're gone."</p>
        `;
        
        document.querySelector('.chaos-planning-workspace').appendChild(aiBriefing);
    }
    
    _confirmMissionLaunch() {
        if (!this.chaosPlanning.selectedCampaign) {
            alert('Please select a campaign type before launching.');
            return;
        }
        
        // Initialize chaos state
        this.gameState.initializeChaosCampaign(this.chaosPlanning.selectedCampaign.id);
        
        console.log('Outlaw mission confirmed. Launching Chaos ship...');
        
        // Transition to bridge scene (but Chaos-specific)
        const app = window.MarsColonyApp;
        if (app.switchScene) {
            app.switchScene('chaosBridge');
        } else {
            // Fallback for standard transition
            console.log('Standard bridge transition');
        }
    }
    
    _resetPlanning() {
        this.chaosPlanning = {
            activeTab: 'raider-config',
            selectedCampaign: null,
            aiPersonality: 'vex',
            crewComposition: {
                captain: true,
                xo: true,
                ai: true
            },
            loadout: {
                stealthPackage: false,
                boardingTools: false,
                hackingKit: false,
                decoys: 0,
                salvageDrones: 0,
                raidGear: false,
                fuelPods: 0,
                hiddenCompartments: 0
            }
        };
        
        // Refresh UI by re-rendering the scene
        this._setupChaosPlanningInterface();
    }
}
