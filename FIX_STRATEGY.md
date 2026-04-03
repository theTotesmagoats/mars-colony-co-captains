# Fix Strategy - Mars Colony Phase One Repair + UI Iteration

## Priority Order from PDF v1.2

### Pass 0 — Deployment Repair (CRITICAL)
**Goal**: Make GitHub Pages serve the actual app, not README

**Current Issue**: Public URL shows repository overview/README content instead of playable app

**Solution**: 
- Create proper build output structure in `/docs` directory
- Configure GitHub Pages to publish from `/docs` folder
- Ensure `index.html` is at the root of published output

**Implementation Steps**:
1. Move all public assets to `/docs/public/`
2. Create `/docs/index.html` as entrypoint
3. Update repository settings to publish from `/docs` branch/folder
4. Verify GitHub Pages URL serves actual app shell

### Pass 1 — Bootstrap Repair (CRITICAL)
**Goal**: Fix module loading and app instance ownership

**Current Issues**:
- `index.html` loads script as classic `<script>` instead of module
- Global class pattern breaks scene/station handoff
- `window.MarsColonyApp` points at class, not instance

**Solutions**:
1. Change to `<script type="module" src="./assets/scripts/main.js"></script>`
2. Create proper app controller with explicit instance management
3. Inject callbacks into scenes instead of global dependency
4. Remove all `window.MarsColonyApp` references

### Pass 2 — State Repair (HIGH)
**Goal**: Unify speed model and fix state schema bugs

**Current Issues**:
- Route selection writes to different fields than UI reads
- `consequences.impact` vs `legitimacyChanges` mismatch
- System wear only initialized on engines, not lifeSupport/power/shields

**Solutions**:
1. Create one authoritative field: `voyage.currentSpeedAUPerDay`
2. Standardize consequences schema across all code
3. Initialize `wear: 0` for ALL degradable systems
4. Audit all property paths before adding new features

### Pass 3 — Prototype Stabilization (HIGH)
**Goal**: Make planning → bridge transition work reliably

**Current Issues**:
- Resource warnings crash due to schema mismatch
- Station switching fails with global-class hacks
- Console state goes stale without real update loop

**Solutions**:
1. Fix all state initialization bugs from Pass 2
2. Implement proper scene controller interface
3. Add real game loop with tick management
4. Validate JSON content at startup

### Pass 4 — UI Foundation (MEDIUM)
**Goal**: Rebuild as premium tactile bridge control surface

**Current Issues**:
- Status bar is flat label/value strip
- Station rail feels like text buttons
- Console overlay leaves ship for menu
- No visual hierarchy or premium feel

**Solutions**:
1. **Status Bar**: Structured readouts with telemetry
2. **Station Rail**: Embedded bridge selectors with depth, locks, status strips
3. **Console Overlay**: Focused station views while staying on bridge
4. **UI Language**: Graphite, matte-black, smoked glass + cool white/cyan accents

### Pass 5 — Helm Showcase (MEDIUM)
**Goal**: Implement tactile speed/burn/navigation as flagship station

**Requirements**:
- Travel states: drift, cruise, high burn, advanced/warp-like transit
- Visible reaction chain: star motion, engine bloom, control lighting, velocity animation
- Controls: burn/thrust control, speed mode selector, vector/course arc, ETA ring
- Fuel draw and engine strain indicators tied to live speed model

### Pass 6 — Phase-One Completion (MEDIUM)
**Goal**: Add remaining station content and linked decisions

**Requirements**:
- Complete all station overlays (command, tactical, engineering, comms, science)
- Linked Captain/XO decision architecture
- Route/resource planning loop with second-order effects
- Optional stopovers framework

### Pass 7 — Polish and Truth Pass (MEDIUM)
**Goal**: Add motion, audio, alert language without breaking architecture

**Requirements**:
- Motion feedback for controls
- Audio vocabulary per station/speed state  
- Alert language that reflects severity
- State-driven visuals without violating modular boundaries

## Implementation Order

```
1. Fix Deployment (Pass 0)
   → Ensure public GitHub Pages serves actual app shell
   
2. Fix Bootstrap (Pass 1) 
   → Module loading, remove broken globals
   
3. Fix State Model (Pass 2)
   → Unified speed, fix consequences schema, initialize wear fields
   
4. Stabilize Prototype (Pass 3)
   → Planning→bridge transition, station switching, update loops
   
5. Rebuild UI Foundation (Pass 4)
   → Status bar, station rail, console overlay as premium interface
   
6. Make Helm Showpiece (Pass 5)
   → Tactile speed controls with real visual feedback
   
7. Complete Phase One (Pass 6)
   → Full stations, Captain/XO decisions, planning loop
   
8. Polish (Pass 7)
   → Motion, audio, alert language, state-driven visuals
```

## Critical Acceptance Tests

Before moving to next pass:
- [ ] GitHub Pages URL opens game shell, not README
- [ ] No script/module errors in console
- [ ] Loading screen transitions properly
- [ ] Planning selections come from JSON content files
- [ ] Route selection updates one authoritative live speed model  
- [ ] Status bar, bridge window, renderer all agree on speed/alert level
- [ ] Station selection works without global-class hacks
- [ ] Resource warnings don't crash due to schema mismatch
- [ ] Helm feels materially better than prototype

## Repository Structure to Keep

```
/docs (published output)
  index.html
  assets/
    content/        # JSON data files
    styles/         # CSS with premium theme
    scripts/        # Built JS (if bundling later)
  docs/             # Additional documentation
/src/
  main.js           # Entry point, not global class
  app/
    appController.js # Instance management
    state.js         # Unified speed model
    consequences.js  # Error handling
  scenes/
    briefing.js      # Data-driven planning
    bridge.js        # Premium command deck
    chaosBridge.js   # Alternate experience
  stations/          # Station-specific logic
    manager.js
    helm.js          # Flagship station
    command.js
    tactical.js
    engineering.js
    comms.js
    science.js
  simulation/
    voyage.js        # Time advancement
    resources.js     # Consumption logic
    shipSystems.js   # System wear models
  rendering/
    engine.js        # Canvas with state-driven visuals
    spaceView.js
    bridgeEffects.js # Premium feedback systems
  ui/
    manager.js       # No global dependency
    statusBar.js     # Structured readouts  
    stationRail.js   # Embedded selectors
    overlays.js      # Focused station views
    prompts.js       # Captain/XO decisions
  services/
    contentLoader.js # JSON validation
    saveLoad.js
  utils/
    formatters.js    # Unit conversions
    events.js        # Event bus
```

## Next Steps

1. Execute Pass 0 (Deployment) first - no feature work before this
2. Test each pass locally before proceeding
3. Keep modular boundaries intact - never collapse into one file
4. Use JSON content as single source of truth
5. Implement in small passes with clear acceptance tests
