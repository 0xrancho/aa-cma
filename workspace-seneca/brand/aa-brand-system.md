# Arthur & Archie Brand System

## Status: CONFIRMED — Blue/amber palette adopted 2026-02-27

## Colors (from meeting prep artifacts, 2026-02-27)

| Token | Hex | Name | Usage |
|---|---|---|---|
| --aa-blue | #1DA1D4 | A&A Blue | Primary accent, links, highlights |
| --aa-blue-dark | #1789B5 | A&A Blue Dark | Hover states, depth |
| --aa-amber | #F2B35E | A&A Amber | Secondary accent, warmth, active states |
| --aa-charcoal | #3A4A54 | A&A Charcoal | Primary text, headers, dark backgrounds |
| --aa-charcoal-deep | #2E3C44 | A&A Charcoal Deep | Nav, footer, deepest backgrounds |
| --aa-light | #f5f7f8 | Light | Card backgrounds, alternating sections |
| --aa-border | #e2e7ea | Border | Dividers, card borders |
| --aa-text-light | #6B7D88 | Text Light | Secondary text, captions |
| --aa-white | #ffffff | White | Page background |

### Retired palette (from current live site — being replaced)
| Hex | Name | Notes |
|---|---|---|
| #1C3B59 | Navy | Old primary — heritage feel |
| #D5755D | Terracotta | Old CTA accent |
| #FAF8F4 | Cream | Old background |

Joel confirmed: adopt blue/amber system. Navy/terracotta retired with the Growth Intelligence positioning.

## Typography

| Font | Role | Source |
|---|---|---|
| Fraunces | Display/headlines | Google Fonts — variable optical size, old-style serifs, distinctive & ampersand |
| IBM Plex Sans | Body text | Google Fonts — structured, professional |
| Inter | Utility/UI | Google Fonts — tabs, labels, small text, fallback |

### Font notes
- Fraunces is the signature. The ampersand is calligraphic and personality-forward. Use for all h1/h2, document titles, brand name display.
- IBM Plex Sans replaces Inter as primary body font. Joel specifically requested IBM Plex.
- Inter remains for UI elements, data labels, small functional text.

### Current live site fonts
- IBM Plex Serif — brand name (keep for wordmark only?)
- Crimson Pro — headlines (replaced by Fraunces)
- Inter — body (replaced by IBM Plex Sans)

## Site Architecture Direction (Joel-approved concept)

### arthurandarchie.com — "Professional Business Card"
Not a GTM page. The site someone finds when they look you up.

Sections:
1. Hero — name + firm + one-liner
2. About — seven generations, Commit→A&A story, AI Enablement + Growth Engineering
3. What We Do — simple cards, links to Agentic Forms
4. Work — portfolio of Netlify artifacts
5. Thomas — agentic form / AI chief of staff (replaces GABI)
6. Connect — calendar, email, LinkedIn

### agenticforms.io — "The Wedge Product"
The site you promote. Stays as-is. Currently at agenticforms.vercel.app.

### joelaustin.xyz — "Decision Pending"
Retire and redirect, or retool as personal thought leadership. Current layout is the template for A&A's new structure.

## V2 Site (First Pass)
- Deployed: https://aa-site-v2.netlify.app (no password)
- Source: /workspace/group/output/aa-site/index.html
- Hero: "Arthur & Archie" with eyebrow "AI Enablement & Growth Engineering" and tag "Encoding methodology for service-centric firms"
- 6 portfolio cards: CMT, Restored Leader, RetroFit, GadellNet, ONOW ASCENT, Eli Lilly
- Thomas section with chat mockup
- Ampersand treatment: Fraunces italic in amber, full heading size
