# Mars Colony Co-Captains

A cooperative browser game/simulator for iPad Safari, hosted through GitHub Pages. Players take on the roles of Captain and Executive Officer (XO) aboard a voyage to Mars during a tense political conflict between Earth and the Moon colony.

## Overview

**Phase One**: Pre-launch planning → Voyage command → Mars arrival/colony foothold

In this game, two players must balance:
- Keeping people alive
- Reaching Mars before the "map hardens" 
- Making choices that shape legitimacy, trust, and future control

The best decisions create tension where one player is right in the short term while the other is right in the long term.

## Architecture

This project follows clean architecture principles with clear separation of concerns:

```
public/                  # Static assets
  index.html            # Main HTML entry point
  assets/               # Images, sounds, and styles

content/                # Data-driven content (JSON files)
  ships.json           # Prebuilt ship configurations
  routes.json          # Travel options with tradeoffs
  resources.json       # Cargo categories and effects
  factions.json        # Political entities
  events.json          # Crisis and opportunity events
  destinations.json    # Optional stopovers
  landing-zones.json   # Mars colonization sites

src/
  main.js              # Application bootstrap and lifecycle
  app/                 # Core application logic
    state.js           # Game state management
  simulation/          # Core game rules and simulation
    voyage.js          # Space travel mechanics
    systems.js         # Ship system interactions
    factions.js        # Political relationship modeling
  rendering/           # Visual presentation layer
    engine.js          # Canvas rendering and animations
    spaceView.js       # Exterior view effects
  ui/                  # User interface components
    manager.js         # UI state coordination
    panels/            # Interface panels
  scenes/              # Scene-specific functionality
    bridge.js          # Command deck experience
    briefing.js        # Pre-launch planning phase
  stations/            # Station-specific modules
    manager.js         # Station management system
  services/            # External service integration
    saveLoad.js        # Persistence support
    sync.js            # Multi-device synchronization
  utils/               # Utility functions
    math.js            # Mathematical helpers
    random.js          # Probabilistic systems
    validation.js      # Data integrity checks
```

## Player Roles

### Captain (Mission Focus)
- Mission priorities and diplomatic posture
- Route/risk tradeoffs and timing decisions  
- Long-horizon strategy and final calls
- What matters several moves from now

### XO / Number Two (Systems Focus)  
- Ship systems, tactical responses, emergency operations
- Crew readiness, security, countermeasures, repairs
- Immediate survival and implementation details
- What breaks first and what the crew can tolerate

## Key Design Principles

1. **Visible Consequences**: Every major decision has immediate effects and delayed costs
2. **Second-Order Effects**: Decisions should ripple through multiple systems
3. **Cinematic UI**: Beautiful visuals on iPad Safari, not dry spreadsheets
4. **Role Asymmetry**: Both players have unique information and responsibilities
5. **Productive Tension**: Players should disagree for good reasons

## Political Context

Earth funded the Moon colony for years and expects a return. The Moon colony believes their frontier sacrifice earned them first rights to Mars. This creates intense political pressure on your mission.

## Getting Started

1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Access the game at `https://your-username.github.io/mars-colony-co-captains/`

For local development:
```bash
# Clone the repository
git clone https://github.com/your-username/mars-colony-co-captains.git

# Start a local web server (requires Python)
cd mars-colony-co-captains
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/public/
```

## Development Status

**Current**: Phase One implementation with:
- Pre-launch mission planning system
- Bridge command experience with station navigation  
- Voyage simulation with resource management
- Captain/XO decision architecture
- Visual feedback and alert states

**Planned Extensions**:
- Mars arrival and landing sequence
- Colony establishment phase
- Away-mission system for stopovers
- Multi-device synchronization for separate iPads
- Save/load functionality

## Testing the Design

Try these scenarios:

1. **The Fast Route Dilemma**: Choose the fast transit route (Captain advantage) but risk higher system wear (XO concern)

2. **Security vs. Morale**: Increase security hardware (XO preference for safety) while morale drops and political tension rises

3. **Solar Storm Response**: Captain chooses schedule posture while XO selects systems posture - outcomes combine based on both decisions

4. **Resource Tradeoffs**: More passengers mean stronger colony potential but higher life-support burden and more stress responses

## License

This project is licensed under the MIT License.
