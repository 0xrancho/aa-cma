# Arthur & Archie — Brand Identity

## Colors
| Token | Hex | Usage |
|---|---|---|
| `--ci-blue` | #1DA1D4 | Primary accent, links, labels, highlights |
| `--ci-blue-dark` | #1789B5 | Hover/active states |
| `--ci-amber` | #F2B35E | Secondary accent, tags, warm highlights, CTA emphasis |
| `--ci-charcoal` | #3A4A54 | Headers, dark backgrounds, primary text |
| `--ci-charcoal-deep` | #2E3C44 | Deeper dark backgrounds (tab nav, footer) |
| `--ci-white` | #ffffff | Card backgrounds |
| `--ci-light` | #f5f7f8 | Light backgrounds, cards |
| `--ci-border` | #e2e7ea | Borders, dividers |
| `--ci-text` | #3A4A54 | Body text |
| `--ci-text-light` | #6B7D88 | Secondary/muted text |

## Typography
| Role | Font | Notes |
|---|---|---|
| Display / Headlines | `Fraunces` (ital, opsz 9-144, wght 400/600) | Georgia as fallback. Serif display face. |
| Body / UI | `Inter` (wght 300-700) | System sans-serif stack as fallback. |

### Font Import
```
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,600&display=swap");
```

### CSS Variables
```css
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Fraunces', Georgia, serif;
```

## Design Patterns
- Document max-width: 8.5in
- Page padding: 0.75in
- Border-radius: 8px (cards)
- Header: charcoal background with blue accent border-bottom (3px)
- Footer: charcoal background, display font for logo, italic tagline
- Cards: light background (#f5f7f8), 8px radius, left border accent (blue or amber)
- Theme cards: left border 3px, blue default, amber for secondary
- Action items: flex layout with owner (blue), description, timeline
- Approach cards: primary (charcoal gradient, white text, amber label) and secondary (light bg, blue label)
- Confidential strip: deep charcoal, uppercase, small tracking
- Tagline: "Growth engineering for professional services."

## Document Types
- What We Heard (WWH): Post-meeting synthesis with tabs
- Discovery Brief: Get-to-know-us doc for prospects
- Meeting Brief: Co-branded prep artifact
- Show and Tell: Personalized demo artifacts

## Gate Pattern
- Confidential docs use a password gate overlay
- Dark charcoal background, centered input
- Brand display font for logo
- Amber for labels
