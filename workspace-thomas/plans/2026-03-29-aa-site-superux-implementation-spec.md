# AA Site — SuperUX-Led Implementation Spec

_Date:_ 2026-03-29
_Owner:_ Thomas
_Status:_ implementation-ready spec for (deprecated) Arc

## Validation basis
This spec is based on:
- browser inspection of `https://agenticforms-v3.netlify.app/`
- browser inspection of local refresh site `http://127.0.0.1:4173/`
- full-page screenshots of both pages captured in this turn
- Firecrawl extraction from `agenticforms-v3.netlify.app/`

Firecrawl returned a valid response for AgenticForms and a `400 Bad Request` for the local refresh URL. Therefore:
- AgenticForms structure is supported by both browser and Firecrawl
- AA refresh observations rely on browser inspection as source of truth

## What to copy exactly from AgenticForms
Two patterns matter.

### 1. The Shift cards
Observed on AgenticForms:
- section label: `THE SHIFT`
- left-aligned intro copy
- three equal cards in a horizontal row on desktop
- each card has:
  - top-left plus or minus symbol
  - short title
  - concise body paragraph
- cards sit inside a light bordered container area
- cards are simple, flat, pale surfaces with low-noise borders
- no overworked iconography
- rhythm comes from spacing, proportion, and contrast, not decoration

Visual characteristics:
- restrained palette
- small uppercase section label
- strong headline above the cards
- cards feel editorial, not dashboard-like
- generous white/cream background around the section
- card spacing is even and quiet

Replication requirement for AA:
- replace current dark architectural node treatment in `What We Do`
- move to a light section with quiet cards modeled on The Shift
- keep the three-card count
- keep plus/plus/minus glyph logic from Joel's copy notes
- cards should read as business outcomes, not system components

### 2. How We Build It interaction
Observed on AgenticForms:
- section label: `PROCESS`
- headline: `How We Build It`
- the visual interaction is vertically stacked and restrained
- numbered stages are the main control surface
- state emphasis is achieved by selection, spacing, and reveal, not flashy motion
- the section reads like an interactive process explainer
- default state is calm and legible before any interaction

Replication requirement for AA:
- current four-card rail in `Our Partnership` should not remain as four equally weighted static cards
- replace with a split interaction:
  - left side: three selectable partnership bullets/items
  - right side: one description panel
- default selected item: `Managed Service Excellence`
- `Design and Build` and `Active Advisory` change the description panel on click
- animation should be subtle: opacity/translate only
- no dramatic sliding carousel behavior
- no accordion bounce

## Section-by-section implementation guidance

## A. What We Do
### Current issue
The section is still visually coded like a systems architecture panel:
- dark gradient background
- connector rails between cards
- system-channel badges
- high-density visual noise

That is not design-faithful to the requested borrowing.

### Replace with
A light-background outcome section patterned after AgenticForms `The Shift`.

### Structure
- section label
- headline
- one concise supporting paragraph
- three equal cards in a row on desktop
- single-column stack on mobile

### Card structure
Each card should contain only:
- top-left symbol: `+`, `+`, `−`
- title
- short body

Optional small footer line is acceptable, but remove the current bullet lists unless needed for visual balance.

### Design spec
- background: off-white / very light cream or page-light neutral
- cards: white or faint warm tint
- border: 1px subtle neutral
- radius: small to medium, not pillowy
- shadow: minimal or none
- card padding: generous
- typography hierarchy:
  - symbol large and quiet
  - title medium-weight serif or strong sans, depending page system
  - body small and readable
- avoid channel badges, connection lines, and pseudo-diagram elements

### Motion
- reveal on scroll is acceptable if soft
- cards may fade up with 40–90ms stagger
- do not animate continuously

### Mobile
- stack cards vertically
- preserve top-left symbol placement
- keep equal spacing between cards
- no horizontal scroll

## B. Our Partnership
### Current issue
The current implementation is a four-step process rail. That is the wrong borrowed pattern.

### Replace with
A three-option interactive explainer based on the behavioral logic of `How We Build It`.

### Structure
- section label
- concise headline paragraph
- two-column interaction area on desktop
  - left column: 3 selectable items
  - right column: active description panel
- stacked layout on mobile
  - selector list on top
  - active panel below

### Selectable items
1. Managed Service Excellence
2. Design and Build
3. Active Advisory

### Behavior
- default active item when section enters view: `Managed Service Excellence`
- click changes active item
- active state updates description panel content
- only one item active at a time

### Visual treatment
Left-side items:
- number or small marker
- title
- active state indicated by:
  - stronger text color
  - subtle border or left rule
  - slight background tint
- inactive items remain visible but quiet

Right-side panel:
- headline = active item title
- body copy = selected description
- optional 2–3 short support bullets
- panel should feel stable, not jumpy

### Motion
- 150–220ms opacity/translate transition on content swap
- preserve panel height with min-height to avoid layout jump
- no carousel slide
- no large-scale transforms

### Accessibility
- selector items must be buttons
- use `aria-pressed` or tabs pattern
- keyboard focus visible
- panel updates announced semantically if tabs pattern used

## C. Experience logo marquee
### Current issue
The existing marquee is still placeholder text chips with repeated names and abstract plus icons.

### Keep
- dark band section is acceptable
- quiet movement is directionally right

### Change
- use actual monochrome marks if available
- if logos are unavailable, use clean wordmarks only, not fake circular marks
- reduce repetition density slightly
- keep movement slow and non-distracting

### Marquee spec
- monochrome or muted grayscale logos only
- uniform height bounding box
- equal optical spacing, not strict mathematical spacing
- no hover interaction required
- animation speed should be slow enough to read without feeling like a ticker
- duplicate sequence only as needed for seamless loop

### Mobile
- either slow marquee or convert to wrapped static grid
- if marquee remains on mobile, increase spacing and reduce velocity

### Asset blocker
(deprecated) Arc should not fabricate client logos. If SVG/PNG assets are missing, implement a temporary wordmark-only marquee and leave a clear asset hook.

## D. Operating Model
### Current issue
This section is acceptable as a placeholder but visually denser than the rest of the desired site language.

### Recommendation
Do not fully redesign yet in this pass. Keep the illustration shell, but simplify copy-side rhythm.

### Immediate guidance
- preserve the current two-column layout
- keep the preview illustration as interim placeholder
- reduce any unnecessary visual competition around it once other sections are softened

## E. Our Story
### Current issue
Copy is now closer, but the number block still reads like a stat layout rather than the `original numbers illustration` note.

### Recommendation
Keep for now unless the original numbers treatment is available elsewhere to replicate directly. This is lower priority than the cards and partnership interaction.

## Implementation priorities for (deprecated) Arc
### Priority 1
Refactor `What We Do` to mirror AgenticForms `The Shift` card language.

### Priority 2
Refactor `Our Partnership` into a 3-item interactive selection pattern.

### Priority 3
Replace placeholder marquee chips with real quiet wordmarks/logo hooks.

### Priority 4
Polish section spacing so the site feels like one design system instead of mixed metaphors.

## Design-fidelity checkpoints
(deprecated) Arc should consider the pass complete only if:
- `What We Do` no longer reads as a dark systems diagram
- the three outcome cards feel visually closer to AgenticForms than to the current AA implementation
- `Our Partnership` behaves as one default-selected interactive explainer, not a four-step process rail
- the marquee feels quiet and brand-safe
- mobile preserves hierarchy without collapsed clutter

## Known blockers
- actual logo assets not yet gathered
- exact original `numbers illustration` source not yet inspected
- motion timing must be approximated from browser observation unless extracted from source styles later

## Next best follow-up
If Joel wants exact visual parity, (deprecated) (deprecated) Arc should do one more browser-led pass on:
- computed styles for `The Shift` cards
- DOM/state behavior in `How We Build It`
- mobile screenshots at 375px and tablet at 768px
before implementation begins
