// Add this at the top of the file after existing class definition

    // Chaos ship initialization
    async initializeChaosCampaign(campaignType) {
        const chaosState = new window.MarsColonyApp.gameState.chaosState;
        
        if (!chaosState) {
            console.error('Chaos state system not loaded');
            return false;
        }
        
        // Initialize with campaign type
        chaosState.initializeChaosCampaign(campaignType);
        
        // Update ship configuration for Chaos
        this.state.ship.id = 'chaos-stealth-raider';
        this.state.ship.name = 'Chaos-class Stealth Raider';
        
        // Set up Chaos-specific resources and status
        this.state.voyage.resources.fuel.current += 1500; // Bonus stolen fuel
        this.state.voyage.status.legitimacy = chaosState.chaosState.legitimacy;
        
        // Initialize AI personality
        this.state.aiPersonality = 'vex';
        
        return true;
    }
    
    // Get Chaos status report
    getChaosStatus() {
        if (this.state.ship.id === 'chaos-stealth-raider') {
            const chaosState = new window.MarsColonyApp.gameState.chaosState;
            return chaosState.getStatusReport();
        }
        
        return null;
    }
