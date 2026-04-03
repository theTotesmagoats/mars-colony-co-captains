/**
 * Chaos Ship Game State Module for Mars Colony Co-Captains
 * 
 * Handles the alternate outlaw campaign with:
 * - Stealth raiders instead of colony ships
 * - AI personality system (Vex)
 * - Opportunistic resource acquisition
 * - Higher risk/reward tradeoffs
 */

export class ChaosGameState {
    constructor(gameState) {
        this.gameState = gameState;
        
        // Chaos-specific state
        this.chaosState = {
            aiPersonality: 'vex',
            campaignMode: null, // 'standard', 'black-market-access', 'data-theft-operation', etc.
            
            // Stealth systems status
            stealth: {
                active: false,
                radarCrossSection: 0.15, // Much smaller than normal ships
                emissionControl: true,
                jammingActive: false
            },
            
            // Hacking capabilities
            hacking: {
                signalSpoofingAvailable: true,
                breachToolsReady: true,
                deceptionSystemsEnabled: true,
                hackingAttempts: 0,
                successfulIntrusions: []
            },
            
            // Salvage/raid system
            salvage: {
                boardingDronesDeployed: false,
                extractionEquipmentActive: false,
                scavengingToolsAvailable: true,
                stolenResources: [],
                raidHistory: []
            },
            
            // Political status (will be lower than standard ships)
            legitimacy: 45, // Starts significantly lower
            factionRelations: {
                earth: -10, // Already suspicious
                moonColony: -5 // Seen as unpredictable
            }
        };
        
        // AI interaction system
        this.ai = {
            personality: null,
            comments: [],
            suggestions: [],
            warnings: []
        };
    }
    
    initializeChaosCampaign(campaignType) {
        this.chaosState.campaignMode = campaignType;
        
        // Set up campaign-specific bonuses/penalties
        switch(campaignType) {
            case 'black-market-access':
                this.chaosState.legitimacy = 40;
                this.gameState.voyage.resources.fuel.current += 1500; // Bonus stolen fuel
                break;
            case 'data-theft-operation':
                this.chaosState.hacking.successfulIntrusions.push('route_intel');
                this.chaosState.legitimacy = 42;
                break;
            case 'resource-harvesting-campaign':
                this.chaosState.legitimacy = 38;
                this.gameState.voyage.resources.water.current += 500; // Bonus stolen water
                break;
            case 'wild-card-gambit':
                this.chaosState.legitimacy = 35;
                this.chaosState.stealth.radarCrossSection = 0.2; // Higher risk, higher reward
                break;
        }
        
        return true;
    }
    
    activateStealth() {
        if (!this.chaosState.stealth.active) {
            this.chaosState.stealth.active = true;
            this.chaosState.stealth.radarCrossSection = 0.15;
            
            // Add AI comment
            this._addAIComment("Oh, finally. You're turning off the lights. Took you long enough.");
            
            return true;
        }
        
        return false;
    }
    
    deactivateStealth() {
        if (this.chaosState.stealth.active) {
            this.chaosState.stealth.active = false;
            this.chaosState.stealth.radarCrossSection = 0.8; // Normal ship signature
            
            this._addAIComment("Back to being a giant radar beacon. Your security team appreciates the consistency.");
            
            return true;
        }
        
        return false;
    }
    
    attemptHacking(target) {
        const successChance = 70 + (this.chaosState.hacking.hackingAttempts * 5);
        
        if (Math.random() * 100 < successChance) {
            this.chaosState.hacking.hackingAttempts++;
            
            // Success outcome
            const result = {
                target,
                timestamp: Date.now(),
                resourcesGained: Math.floor(Math.random() * 200) + 50,
                dataObtained: true,
                detectionRisk: 15 - (this.chaosState.hacking.successfulIntrusions.length * 3)
            };
            
            this.chaosState.hacking.successfulIntrusions.push(target);
            this._addAIComment(`That was embarrassingly easy. I hope you're proud of yourself.`);
            
            return result;
        } else {
            // Failure outcome
            const result = {
                target,
                timestamp: Date.now(),
                success: false,
                detectionRisk: 40,
                systemStress: 15
            };
            
            this._addAIComment("Well, that was impressive. You managed to fail at stealing data. Congratulations.");
            
            return result;
        }
    }
    
    deploySalvageOperation() {
        if (!this.chaosState.salvage.scavengingToolsAvailable) {
            this._addAIComment("You want to scavenge? Without tools? I'm starting to doubt your intelligence.");
            return null;
        }
        
        const operation = {
            timestamp: Date.now(),
            riskLevel: Math.random() * 100,
            potentialReward: Math.floor(Math.random() * 500) + 200
        };
        
        // AI commentary on the raid
        if (operation.riskLevel > 70) {
            this._addAIComment("This is getting dangerously close to brilliance. Or disaster. Hard to tell.");
        } else if (operation.riskLevel < 30) {
            this._addAIComment("Easy pickings. I hope you appreciate my superior planning.");
        }
        
        return operation;
    }
    
    // AI comment system
    _addAIComment(comment, type = 'general') {
        const aiComment = {
            text: comment,
            timestamp: Date.now(),
            type: type,
            mood: this._calculateAIMood()
        };
        
        this.ai.comments.push(aiComment);
        
        // Keep only last 20 comments
        if (this.ai.comments.length > 20) {
            this.ai.comments.shift();
        }
    }
    
    _addAIWarning(warning) {
        const aiWarning = {
            text: warning,
            timestamp: Date.now(),
            urgency: Math.random() * 100
        };
        
        this.ai.warnings.push(aiWarning);
    }
    
    _calculateAIMood() {
        // Calculate mood based on current state
        if (this.chaosState.stealth.active) return "satisfied";
        if (this.chaosState.legitimacy < 30) return "concerned";
        if (this.chaosState.hacking.successfulIntrusions.length > 3) return "amused";
        if (this.gameState.voyage.resources.fuel.current < this.gameState.voyage.resources.fuel.max * 0.3) return "nervous";
        
        return "sarcastic";
    }
    
    // Get AI response for current situation
    getAIResponse(situation, decisionContext = {}) {
        const personalityData = window.MarsColonyApp.gameState.aiPersonalities?.personalities?.find(p => p.id === this.chaosState.aiPersonality);
        
        if (!personalityData) return "System error. Please try being less stupid.";
        
        // Select quote based on mood and situation
        let quotePool = [];
        
        switch(situation) {
            case 'calm':
                quotePool = personalityData.sampleQuotes?.calm || [];
                break;
            case 'tension':
                quotePool = personalityData.sampleQuotes?.tension || [];
                break;
            case 'danger':
                quotePool = personalityData.sampleQuotes?.danger || [];
                break;
            case 'success':
                quotePool = personalityData.sampleQuotes?.success || [];
                break;
            case 'failure':
                quotePool = personalityData.sampleQuotes?.failure || [];
                break;
            default:
                quotePool = personalityData.sampleQuotes?.calm || [];
        }
        
        // If we have decision-specific quotes, use those
        if (decisionContext.decisionType && personalityData.decisionSupport) {
            const decisionQuotes = personalityData.decisionSupport[decisionContext.decisionType];
            if (decisionQuotes && decisionQuotes.length > 0) {
                return decisionQuotes[Math.floor(Math.random() * decisionQuotes.length)];
            }
        }
        
        // Otherwise use situation-based quotes
        if (quotePool.length > 0) {
            return quotePool[Math.floor(Math.random() * quotePool.length)];
        }
        
        return "Well, that was predictable. I expected better from you.";
    }
    
    // AI suggestion system
    getAISuggestion(decisionType) {
        const personalityData = window.MarsColonyApp.gameState.aiPersonalities?.personalities?.find(p => p.id === this.chaosState.aiPersonality);
        
        if (personalityData && personalityData.decisionSupport?.[decisionType]) {
            const suggestions = personalityData.decisionSupport[decisionType];
            
            if (suggestions.length > 0) {
                return {
                    text: suggestions[Math.floor(Math.random() * suggestions.length)],
                    riskLevel: Math.random() * 100,
                    potentialReward: Math.random() * 50 + 25
                };
            }
        }
        
        return null;
    }
    
    // Update system state
    updateChaosState() {
        // Check stealth status
        if (this.chaosState.stealth.active && this.gameState.voyage.distanceRemainingAU < 0.1) {
            // Approaching Mars, stealth is less effective
            this.chaosState.stealth.radarCrossSection = 0.5;
        }
        
        // Check system stress
        if (this.gameState.ship.systems.engines.wear > 80) {
            this._addAIWarning("Engines are about to fail spectacularly. You want to fix that.");
        }
        
        return true;
    }
    
    // Get Chaos-specific status report
    getStatusReport() {
        return {
            campaignMode: this.chaosState.campaignMode,
            legitimacy: this.chaosState.legitimacy,
            stealthStatus: this.chaosState.stealth.active ? "Active" : "Inactive",
            radarSignature: this.chaosState.stealth.radarCrossSection,
            hackingCapabilities: {
                attempts: this.chaosState.hacking.hackingAttempts,
                successes: this.chaosState.hacking.successfulIntrusions.length
            },
            salvageHistory: this.chaosState.salvage.raidHistory.length,
            aiMood: this._calculateAIMood(),
            factionRelations: this.chaosState.factionRelations
        };
    }
    
    // Reset Chaos state
    reset() {
        this.chaosState = {
            aiPersonality: 'vex',
            campaignMode: null,
            
            stealth: {
                active: false,
                radarCrossSection: 0.15,
                emissionControl: true,
                jammingActive: false
            },
            
            hacking: {
                signalSpoofingAvailable: true,
                breachToolsReady: true,
                deceptionSystemsEnabled: true,
                hackingAttempts: 0,
                successfulIntrusions: []
            },
            
            salvage: {
                boardingDronesDeployed: false,
                extractionEquipmentActive: false,
                scavengingToolsAvailable: true,
                stolenResources: [],
                raidHistory: []
            },
            
            legitimacy: 45,
            factionRelations: {
                earth: -10,
                moonColony: -5
            }
        };
        
        this.ai.comments = [];
        this.ai.suggestions = [];
        this.ai.warnings = [];
    }
}
