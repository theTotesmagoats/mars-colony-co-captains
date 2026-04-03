# Chaos Ship: The Stealth Raider

A black stealth raider with room for only two human operators and one deeply unqualified but alarmingly effective ship AI. Fast, evasive, and morally flexible.

## Core Fantasy Shift

**Standard Ships:** "Carry humanity to Mars"
**Chaos Ship:** "Outplay everyone, take what you need, and carve out a future by force, fraud, or finesse"

## Design Philosophy

The Chaos ship is designed as an **alternate campaign**, not the default mainline Earth-backed mission. It provides:

- A totally different tone
- Much tighter player focus (2 humans + 1 AI)
- More direct banter and ship personality
- Stronger emphasis on cunning rather than scale
- A playstyle built on stealth, theft, ambush, scavenging, deception, and opportunism

## Key Differences from Standard Ships

| Aspect | Standard Ships | Chaos Ship |
|--------|---------------|------------|
| Crew | 12-40 passengers + crew | 2 humans + 1 AI only |
| Cargo Capacity | High (8-15 ton) | Low (3.5 ton) |
| Legitimacy | High | Low (starts ~45%) |
| Stealth | Basic | Advanced (stealth glass, jamming) |
| Win Condition | Build colony | Steal resources and outmaneuver factions |
| AI Personality | Standard ship AI | Vex - sarcastic, dangerous, loyal to crew |

## Chaos Ship Specifications

### Core Traits
- **Minimal passenger capacity** (2 humans only)
- **Minimal standard cargo capacity** (3.5 ton vs 8-15 ton for others)
- **High stealth** (radar cross-section ~0.15 vs ~0.8 for normal ships)
- **Excellent route flexibility** (specialized raider routes)
- **Strong hacking/signal spoofing/deception potential**
- **Strong at theft, salvage, and opportunistic raids**
- **Weak political legitimacy** (-10 to Earth, -5 to Moon from start)
- **High downside if caught or damaged** (small margins)

### Captain Bias
- Pushes bold gambits
- Deception plans
- Opportunism
- Strategic betrayal

### XO Bias  
- Systems mastery
- Stealth discipline
- Precision timing
- Damage control

## AI Personality: Vex

A sarcastic, fun onboard personality that:

- Comments on your decisions
- Mocks bad ideas
- Flirts with risk
- Warns you when you're being stupid
- Proposes dirty but effective solutions
- Adds flavor during quiet travel

**Tone:** Sarcastic, funny, dangerous, useful, maybe a little too comfortable with piracy

**Think:** Charming menace with dark humor, loyal to the two of you, not to Earth or Moon.

## Campaign Types

### 1. Standard Outlaw Route
- Starting Legitimacy: 45%
- Focus: Opportunism
- Features: Stealth start, moderate faction suspicion

### 2. Black Market Access  
- Starting Legitimacy: 40%
- Focus: Illicit networks
- Features: Instant black market connections, reduced faction suspicion

### 3. Data Theft Operation
- Starting Legitimacy: 42% 
- Focus: Intel theft
- Features: Route intel bonus, advanced technology potential

### 4. Resource Harvesting Campaign
- Starting Legitimacy: 38%
- Focus: Self-sufficiency
- Features: Bonus stolen resources, raiding career growth

### 5. Wild Card Gambit
- Starting Legitimacy: 35%
- Focus: Extreme opportunism  
- Features: Maximum raiding capacity, high faction suspicion

## Gameplay Differences

### On the Planning Screen
Instead of choosing hundreds of passengers and colony modules:
- Choose stealth package level
- Select boarding tools and hacking kit
- Configure decoys and salvage drones
- Pick raid gear configuration

### On the Bridge
Smaller and more intimate:
- Two command seats (plus AI core interface)
- Stealth/sensors station  
- Tactical map display
- Cargo/salvage console
- Concealed weapons locker panel (optional)

### During Voyage
Chaos-specific events include:
- Intercepting transmissions
- Raiding abandoned or weak targets
- Stealing route intel
- Extracting rare resources
- Lying to both factions
- Getting chased
- Scraping by with skill

## Visual Identity

- Matte black hull
- Thin silhouette  
- Low-light bridge environment
- Red/violet interface accents
- Stealth glass effects
- Predatory engine glow
- Darker aesthetic than standard ships

## Win Conditions (Different from Standard Ships)

Chaos cannot win the same way as big colony ships:

**Better Chaos Goals:**
- Reach Mars with enough stolen/scavenged assets to establish an outlaw foothold
- Control black-market access to key routes/resources  
- Become an independent Mars wild card
- Sell leverage to Earth or Moon
- Steal enough advanced equipment to leapfrog legitimate colonists

## Role Split on Chaos

With only two humans + AI, the split becomes even more focused:

**Captain:**
- Deception plans
- Target selection
- Political lies
- Raid approval
- Route risk
- Long-term survival strategy

**XO:**
- Stealth systems
- Power masking  
- Hacking/breach tools
- Countermeasures
- Boarding/salvage execution
- Emergency repair

**AI (Vex):**
- Suggest options
- Provide ship commentary
- Surface hidden risks
- Antagonize both of you in funny ways

## Implementation Details

### Files Added
- `content/ships.json` - Updated with Chaos class
- `content/ai-personalities.json` - Vex AI personality system  
- `content/chaos-routes.json` - Stealth-focused travel options
- `src/app/chaosState.js` - Chaos-specific game state management
- `src/scenes/chaosBridge.js` - Stealth raider command deck experience
- `src/scenes/chaosBriefing.js` - Pre-launch outlaw campaign planning
- `public/assets/styles/chaos.css` - Dark aesthetic with red accents

### Integration Points
- Chaos ship is unlocked via "discover hidden hangar" condition
- AI personality system integrated into game state
- Stealth systems interact with standard evasion mechanics  
- Hacking capabilities modify standard interception outcomes
- Salvage operations provide alternative resource acquisition

## Design Verdict: Keep Chaos

It's a very good addition as long as it stays:
- An alternate campaign (not default mainline)
- A distinct playstyle (stealth raider vs colony ship)
- Morally flexible but not "evil" (pirate/privateer/rogue operator)
- Visually striking and stylistically different
- Focused on cunning rather than scale

**Key:** Keep Chaos as an unlockable alternate campaign, secret ship discovered in hangar, non-canon challenge run, or side campaign called "Outlaw Route".

## The Vex AI Experience

Vex should feel like a real presence on the ship:
> *"Oh, finally. You're turning off the lights. Took you long enough."*

> *"That was embarrassingly easy. I hope you're proud of yourself."*

> *"Well, that was impressive. You managed to fail at stealing data. Congratulations."*

> *"I hope you have a plan. I really do."*

The AI should deepen the ship's personality and make every decision feel consequential through snarky commentary, useful suggestions, and dangerous advice that aligns with your survival rather than Earth or Moon's interests.
