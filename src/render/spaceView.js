/**
 * Space View Module for Mars Colony Co-Captains
 * 
 * Manages exterior views, celestial bodies, starfields, and space phenomena
 */

export class SpaceView {
    constructor(renderingEngine) {
        this.engine = renderingEngine;
        
        // Celestial objects
        this.celestialObjects = [];
        
        // Phenomena
        this.phenomena = [];
        
        // View state
        this.state = {
            distanceToMars: 0,
            approachPhase: 'deepSpace', // deepSpace, approach, entry
            lighting: { ambient: 0.8, sunDirection: [1, -0.3] }
        };
        
        this.setupCelestialObjects();
    }
    
    setupCelestialObjects() {
        // Stars (handled by rendering engine)
        // Add planets and moons
        
        // Mars (distant initially)
        const mars = {
            id: 'mars',
            name: 'Mars',
            type: 'planet',
            distanceAU: 0.523, // Earth to Mars average
            size: 30,
            color: '#e74c3c',
            position: { x: this.engine.width / 2, y: this.engine.height * 0.6 },
            orbit: {
                angle: Math.PI / 4,
                radius: 150,
                speed: 0.005
            }
        };
        
        // Earth (seen from distance)
        const earth = {
            id: 'earth',
            name: 'Earth',
            type: 'planet',
            distanceAU: 1.0,
            size: 40,
            color: '#3d8eff',
            position: { x: this.engine.width * 0.2, y: this.engine.height * 0.3 },
            orbit: {
                angle: 0,
                radius: 200,
                speed: -0.003
            }
        };
        
        // Moon colony as a station
        const moonColony = {
            id: 'moon-colony',
            name: 'Moon Colony',
            type: 'station',
            distanceAU: 0.0026, // Earth-Moon distance in AU
            size: 15,
            color: '#c0c0c0',
            position: { x: this.engine.width * 0.8, y: this.engine.height * 0.4 },
            orbit: {
                angle: Math.PI / 2,
                radius: 50,
                speed: 0.01
            }
        };
        
        // Add some asteroids/debris for depth
        for (let i = 0; i < 20; i++) {
            this.celestialObjects.push({
                id: `asteroid-${i}`,
                name: `Asteroid ${i + 1}`,
                type: 'debris',
                distanceAU: Math.random() * 0.5,
                size: Math.random() * 3 + 1,
                color: '#7f8c8d',
                position: {
                    x: Math.random() * this.engine.width,
                    y: Math.random() * this.engine.height
                },
                velocity: {
                    dx: (Math.random() - 0.5) * 0.2,
                    dy: (Math.random() - 0.5) * 0.2
                }
            });
        }
        
        this.celestialObjects.push(mars, earth, moonColony);
    }
    
    update(deltaTime, gameState) {
        // Update celestial objects based on game state
        
        const voyageState = gameState.voyage;
        
        // Update Mars approach phase
        if (voyageState.distanceRemainingAU < 0.15) {
            this.state.approachPhase = 'approach';
        } else if (voyageState.distanceRemainingAU < 0.02) {
            this.state.approachPhase = 'entry';
        }
        
        // Update positions for orbiting objects
        for (const obj of this.celestialObjects) {
            if (obj.orbit) {
                obj.orbit.angle += obj.orbit.speed * deltaTime;
                
                // Convert polar to cartesian coordinates relative to center
                const centerX = this.engine.width / 2;
                const centerY = this.engine.height / 2;
                
                obj.position.x = centerX + Math.cos(obj.orbit.angle) * obj.orbit.radius;
                obj.position.y = centerY + Math.sin(obj.orbit.angle) * obj.orbit.radius;
            } else if (obj.velocity) {
                // Move debris
                obj.position.x += obj.velocity.dx;
                obj.position.y += obj.velocity.dy;
                
                // Wrap around screen
                if (obj.position.x < 0) obj.position.x = this.engine.width;
                if (obj.position.x > this.engine.width) obj.position.x = 0;
                if (obj.position.y < 0) obj.position.y = this.engine.height;
                if (obj.position.y > this.engine.height) obj.position.y = 0;
            }
        }
        
        // Update lighting based on approach phase
        switch(this.state.approachPhase) {
            case 'deepSpace':
                this.state.lighting.ambient = 0.8;
                break;
            case 'approach':
                this.state.lighting.ambient = 0.7;
                break;
            case 'entry':
                this.state.lighting.ambient = 0.6;
                break;
        }
    }
    
    draw(ctx, width, height) {
        // Draw celestial objects
        for (const obj of this.celestialObjects) {
            this._drawCelestialObject(ctx, obj);
        }
        
        // Draw Mars approach effects if close
        if (this.state.approachPhase === 'approach' || this.state.approachPhase === 'entry') {
            this._drawMarsEffects(ctx, width, height);
        }
    }
    
    _drawCelestialObject(ctx, obj) {
        const { x, y } = obj.position;
        
        // Draw based on type
        switch(obj.type) {
            case 'planet':
                this._drawPlanet(ctx, x, y, obj.size, obj.color);
                break;
            case 'debris':
                ctx.fillStyle = obj.color;
                ctx.beginPath();
                ctx.arc(x, y, obj.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'station':
                this._drawStation(ctx, x, y, obj.size);
                break;
        }
    }
    
    _drawPlanet(ctx, x, y, size, color) {
        // Planet body
        const gradient = ctx.createRadialGradient(x - size/3, y - size/3, size/10, x, y, size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.2, color);
        gradient.addColorStop(1, '#000000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, size, Math.PI / 2, Math.PI * 1.5);
        ctx.fill();
    }
    
    _drawStation(ctx, x, y, size) {
        // Draw simplified station shape
        ctx.fillStyle = '#c0c0c0';
        
        // Main ring
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Connectors
        ctx.fillRect(x - size/2, y - size/4, size/4, size/2);
        ctx.fillRect(x + size/4, y - size/4, size/4, size/2);
    }
    
    _drawMarsEffects(ctx, width, height) {
        // Draw dust plume effect
        const centerX = width / 2;
        const bottomY = height * 0.75;
        
        for (let i = 0; i < 15; i++) {
            const dustX = centerX + (Math.random() - 0.5) * 100;
            const dustY = bottomY + Math.random() * 50;
            
            ctx.fillStyle = `rgba(243, 156, 18, ${0.3 + Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.arc(dustX, dustY, Math.random() * 8 + 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw landing zone indicators if very close
        if (this.state.approachPhase === 'entry') {
            this._drawLandingZones(ctx, width, height);
        }
    }
    
    _drawLandingZones(ctx, width, height) {
        const centerX = width / 2;
        const bottomY = height * 0.75;
        
        // Draw zones as concentric circles
        for (let i = 1; i <= 3; i++) {
            ctx.strokeStyle = `rgba(61, 142, 255, ${0.3 + i * 0.2})`;
            ctx.lineWidth = i;
            
            ctx.beginPath();
            ctx.arc(centerX, bottomY, i * 30, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw zone labels
        const zones = ['PRIME', 'SECONDARY', 'ALTERNATE'];
        
        for (let i = 0; i < zones.length; i++) {
            ctx.fillStyle = '#3d8eff';
            ctx.font = `12px monospace`;
            ctx.textAlign = 'center';
            
            const angle = (i / zones.length) * Math.PI * 2;
            const labelX = centerX + Math.cos(angle) * 90;
            const labelY = bottomY + Math.sin(angle) * 90 - 15;
            
            ctx.fillText(zones[i], labelX, labelY);
        }
    }
    
    triggerApproachSequence() {
        console.log('Triggering Mars approach sequence...');
        
        // Add cinematic effects
        this.engine.triggerCinematicSequence('marsApproach');
        
        // Update game state for phase transition
        const gameState = window.MarsColonyApp.gameState;
        gameState.voyage.phase = 'approach';
    }
}
