# Plan — AA Site Logos + AgenticForms Animation Study

_Date:_ 2026-03-29
_Owner:_ Thomas
_Status:_ revised plan only

## Objective
Use a SuperUX-led workflow, with browser automation and Firecrawl support, to:
1. extract the right visual/logo references for the Arthur & Archie site refresh
2. study the interaction patterns on `https://agenticforms-v3.netlify.app/`
3. translate both into an implementation-ready spec for (deprecated) Arc

## Why this plan changed
Plain browser inspection is not enough for design-faithful replication. The work needs a design-analysis frame so the interaction, spacing, hierarchy, and responsive behavior are interpreted correctly instead of approximated.

SuperUX is therefore the lead method for this task.

## Lead method
### SuperUX-led analysis
Use the `superux` skill in design extraction / replication mode.

SuperUX will anchor the work around:
- visual hierarchy
- component structure
- state changes
- motion behavior
- responsive behavior
- spacing and typography cues
- design-faithful replication criteria

## Supporting tools
### Browser automation
Use browser tooling for:
- visual inspection
- responsive snapshots
- DOM/state inspection
- screenshot capture
- interaction verification

### Firecrawl
Use Firecrawl in main only as a support tool for:
- structured content extraction from the reference pages
- page markdown / DOM summary capture
- possible link/asset discovery where useful

Firecrawl is not the primary judge of design fidelity.

## Scope
### Logos
- Review candidate logos/marks currently referenced or implied on the AA site
- Capture quiet marquee requirements: density, pace, contrast, spacing, hover/no-hover behavior, mobile treatment
- Verify which client/company marks should be shown and in what exact textual order if artwork is missing

### Animations and interactions
Study `agenticforms-v3.netlify.app` and inspect:
- `The Shift` cards
- `How we built it` interaction pattern

Document:
- layout structure
- responsive behavior
- motion timing
- trigger behavior
- default state
- active/inactive state styling
- accessibility implications

## Method
### Phase 1 — Baseline inspection
- Open current AA refresh site locally
- Open `agenticforms-v3.netlify.app`
- Capture desktop and mobile screenshots
- Identify target sections precisely

### Phase 2 — SuperUX design extraction
- Inspect the relevant sections through a design lens
- Record:
  - visual rhythm
  - card proportions
  - spacing system
  - type scale
  - state styling
  - motion cues
  - mobile adaptation

### Phase 3 — Interaction mapping
- Reproduce each intended interaction with browser automation
- Record:
  - initial render state
  - scroll-triggered state
  - click-triggered state
  - mobile behavior
  - fallback behavior

### Phase 4 — Structural extraction support
- Use Firecrawl to pull structured page content for both target sections
- Compare extracted structure with browser-observed DOM and behavior
- Resolve mismatches in favor of browser-observed behavior

### Phase 5 — Implementation spec
Produce an implementation memo for (deprecated) Arc containing:
- logo marquee spec
- three-card outcome block spec
- partnership interaction spec
- motion tokens and timing estimates
- mobile constraints
- accessibility notes
- required assets / blockers
- design-fidelity checkpoints for QA

## Deliverables
1. `plans/2026-03-29-aa-site-v3-copy-update.md` — copy source of truth
2. `plans/2026-03-29-aa-site-browser-firecrawl-plan.md` — revised plan
3. future: implementation spec after inspection

## Validation
The implementation spec is only complete if it includes:
- section-by-section behavior notes
- at least one desktop and one mobile observation per borrowed pattern
- concrete implementation guidance, not just screenshots
- explicit unknowns/blockers for missing logo assets
- design-fidelity notes grounded in SuperUX analysis, not guesswork
