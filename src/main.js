/**
 * Mars Colony Co-Captains - Main Application Entry Point
 * 
 * Architecture:
 * - main.js: Application bootstrap and lifecycle management
 * - simulation/: Core game state and logic
 * - rendering/: Visual presentation layer
 * - ui/: User interface components
 * - scenes/: Scene-specific functionality (bridge, briefing)
 */

import { GameStateManager } from './app/state.js';
import { RenderingEngine } from './rendering/engine.js';
import { UIManager } from './ui/manager.js';
import { BridgeScene } from './scenes/bridge.js';
import { BriefingScene } from './scenes/briefing.js';

// Initialize the game
class MarsColonyApp {
    constructor() {
        this.gameState = null;
        this.renderingEngine = null;
        this.uiManager = null;
        
        // Scene references
        this.scenes = {};
        
        // Current active scene
        this.activeScene = null;
    }
    
    async init() {
        try {
            console.log('Initializing Mars Colony Co-Captains...');
            
            // Create state manager
            this.gameState = new GameStateManager();
            
            // Initialize rendering engine
            this.renderingEngine = new RenderingEngine(document.getElementById('main-scene'));
            
            // Initialize UI manager
            this.uiManager = new UIManager(this.gameState, this.renderingEngine);
            
            // Register scenes
            this.scenes.briefing = new BriefingScene(this.gameState, this.renderingEngine, this.uiManager);
            this.scenes.bridge = new BridgeScene(this.gameState, this.renderingEngine, this.uiManager);
            
            // Show loading screen briefly for effect
            await this._showLoadingSequence();
            
            // Switch to briefing scene (pre-launch planning)
            this.activeScene = this.scenes.briefing;
            await this.activeScene.enter();
            
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Initialization failed:', error);
            this._handleError(error);
        }
    }
    
    async _showLoadingSequence() {
        return new Promise(resolve => {
            const loadingScreen = document.getElementById('loading-screen');
            const progressBar = loadingScreen.querySelector('.progress-fill');
            
            // Simulate loading assets
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    
                    progressBar.style.width = '100%';
                    
                    // Wait a moment for visual effect
                    setTimeout(() => {
                        loadingScreen.classList.remove('active');
                        document.getElementById('game-container').classList.remove('hidden');
                        resolve();
                    }, 500);
                } else {
                    progressBar.style.width = `${progress}%`;
                }
            }, 100);
        });
    }
    
    _handleError(error) {
        console.error('Application error:', error);
        
        // Create error overlay
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'screen active';
        errorOverlay.style.zIndex = '100';
        errorOverlay.innerHTML = `
            <h1>SYSTEM ERROR</h1>
            <p>${error.message}</p>
            <button class="action-btn" onclick="location.reload()">REBOOT SYSTEMS</button>
        `;
        
        document.body.appendChild(errorOverlay);
    }
    
    switchScene(sceneName) {
        if (this.activeScene) {
            this.activeScene.exit();
        }
        
        this.activeScene = this.scenes[sceneName];
        return this.activeScene.enter();
    }
}

// Export for external use
if (typeof window !== 'undefined') {
    window.MarsColonyApp = MarsColonyApp;
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const app = new MarsColonyApp();
        app.init().catch(error => console.error('Failed to start game:', error));
    });
}

// Export for module use
export { MarsColonyApp };
