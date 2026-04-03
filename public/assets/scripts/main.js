/**
 * Mars Colony Co-Captains - Main Application Entry Point
 * 
 * Architecture:
 * - main.js: Application bootstrap, game loop, and lifecycle management
 * - simulation/: Core game state and logic  
 * - rendering/: Visual presentation layer
 * - ui/: User interface components
 * - scenes/: Scene-specific functionality (bridge, briefing)
 */

import { GameStateManager } from './app/state.js';
import { RenderingEngine } from './rendering/engine.js';
import { UIManager } from './ui/manager.js';
import { BridgeScene } from '../scenes/bridge.js';
import { BriefingScene } from '../scenes/briefing.js';

// Create global app instance for scene references
window.__app = null;

class MarsColonyApp {
    constructor() {
        // Game systems
        this.gameState = null;
        this.renderingEngine = null;
        this.uiManager = null;
        
        // Scene references
        this.scenes = {};
        
        // Current active scene
        this.activeScene = null;
        
        // Game loop state
        this.animationFrameId = null;
        this.lastTime = 0;
        this.isRunning = false;
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
            
            // Register scenes with game state reference
            this.scenes.briefing = new BriefingScene(this.gameState, this.renderingEngine, this.uiManager);
            this.scenes.bridge = new BridgeScene(this.gameState, this.renderingEngine, this.uiManager);
            this.scenes.chaosBridge = null; // Will be initialized when Chaos is unlocked
            
            // Expose app instance to scenes
            window.__app = this;
            
            // Load external content
            await this._loadContent();
            
            // Show loading screen briefly for effect
            await this._showLoadingSequence();
            
            // Switch to briefing scene (pre-launch planning)
            this.activeScene = this.scenes.briefing;
            await this.activeScene.enter();
            
            // Start the game loop
            this.startGameLoop();
            
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Initialization failed:', error);
            this._handleError(error);
        }
    }
    
    async _loadContent() {
        try {
            // Load ships content
            const shipsResponse = await fetch('./assets/content/ships.json');
            if (shipsResponse.ok) {
                this.shipsData = await shipsResponse.json();
                console.log('Ships content loaded:', Object.keys(this.shipsData));
            }
            
            // Load routes content  
            const routesResponse = await fetch('./assets/content/routes.json');
            if (routesResponse.ok) {
                this.routesData = await routesResponse.json();
                console.log('Routes content loaded:', Object.keys(this.routesData));
            }
            
            // Load events content
            const eventsResponse = await fetch('./assets/content/events.json');
            if (eventsResponse.ok) {
                this.eventsData = await eventsResponse.json();
                console.log('Events content loaded:', Object.keys(this.eventsData));
            }
        } catch (error) {
            console.warn('Content loading warning:', error);
            // Continue with defaults if content fails
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
    
    startGameLoop() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        
        const gameLoop = (timestamp) => {
            const deltaTime = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;
            
            // Update game systems
            if (!this.gameState.debug.paused) {
                this._update(deltaTime);
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        this.animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    stopGameLoop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
    
    _update(deltaTime) {
        // Update game state
        this.gameState.updateChaosState();
        
        // Update UI manager  
        this.uiManager.update();
        
        // Update active scene
        if (this.activeScene && typeof this.activeScene.update === 'function') {
            this.activeScene.update(deltaTime);
        }
    }
    
    switchScene(sceneName) {
        console.log('Switching from', this.activeScene?.constructor.name || 'none', 'to', sceneName);
        
        if (this.activeScene) {
            this.activeScene.exit();
        }
        
        // Handle Chaos bridge specially
        if (sceneName === 'chaosBridge') {
            if (!this.scenes.chaosBridge) {
                import('../scenes/chaosBridge.js').then(ChaosModule => {
                    this.scenes.chaosBridge = new ChaosModule.ChaosBridgeScene(
                        this.gameState, 
                        this.renderingEngine, 
                        this.uiManager
                    );
                    this.activeScene = this.scenes.chaosBridge;
                    this.activeScene.enter();
                });
            } else {
                this.activeScene = this.scenes.chaosBridge;
                this.activeScene.enter();
            }
        } else if (this.scenes[sceneName]) {
            this.activeScene = this.scenes[sceneName];
            this.activeScene.enter();
        } else {
            console.error('Unknown scene:', sceneName);
            return false;
        }
        
        return true;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new MarsColonyApp();
    
    // Expose for debugging and scene access
    window.__app = app;
    
    // Start initialization
    app.init().catch(error => console.error('Failed to start game:', error));
});

// Export for potential external use
export { MarsColonyApp };
