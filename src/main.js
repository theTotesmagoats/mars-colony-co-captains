/**
 * Mars Colony Co-Captains - Main Application Entry Point
 * 
 * Architecture:
 * - main.js: Module exports only, no globals
 * - app/appController.js: Single application instance management  
 * - Scenes receive controller reference via constructor, not global access
 */

// Export modules for use in app initialization
export { AppController } from './app/appController.js';
export { GameStateManager } from './app/state.js';
export { RenderingEngine } from './rendering/engine.js';
export { UIManager } from './ui/manager.js';

// Scene exports
export { BriefingScene } from './scenes/briefing.js';
export { BridgeScene } from './scenes/bridge.js';
export { ChaosBridgeScene } from './scenes/chaosBridge.js';

// Make modules available for appController initialization
window.__appModules = {
    gameState: { GameStateManager },
    rendering: { RenderingEngine },
    ui: { UIManager }
};

// Initialize when DOM is ready - creates single instance, no global class references
document.addEventListener('DOMContentLoaded', () => {
    const { AppController } = window.__appModules;
    
    // Create single application instance
    const app = new AppController();
    
    // Start initialization
    app.init().catch(error => console.error('Failed to start game:', error));
});
