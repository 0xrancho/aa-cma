# AA site faithful refresh report

## Outcome
Rebuilt `/home/rancho/aa-cma/workspace-arc/site-refresh/index.html` by starting from the actual HTML/CSS structure of the reference site at `https://aa-site-v3.netlify.app/` and then swapping in the newly agreed homepage copy/section structure. I preserved the reference site's core visual system: sticky nav, Fraunces + IBM Plex Sans typography, blue/amber/charcoal palette, hero grid treatment, section spacing, border language, and footer shell.

## Brand-guideline source used
Primary repo source cited for Arthur & Archie brand guidance:
- `/home/rancho/aa-cma/workspace-seneca/brand/aa-brand-system.md`

Secondary token reference checked:
- `/home/rancho/aa-cma/workspace-seneca/brand/aa-brand-tokens.md`

What I specifically carried forward from those files:
- Blue/amber/charcoal palette (`#1DA1D4`, `#1789B5`, `#F2B35E`, `#3A4A54`, `#2E3C44`, light/border neutrals)
- `Fraunces` for display/headlines
- `IBM Plex Sans` for body text, matching the v3 reference implementation

## Files created / edited
- Edited: `/home/rancho/aa-cma/workspace-arc/site-refresh/index.html`
- Created local reference snapshot: `/home/rancho/aa-cma/workspace-arc/site-refresh/reference/reference.html`
- Created this report: `/home/rancho/aa-cma/workspace-thomas/plans/2026-03-28-aa-site-design-faithful-refresh-report.md`

## What changed
Using the reference site's actual layout/styling as the base, I updated the homepage to the requested copy structure:
- Hero eyebrow: `Agentic Services Partner`
- Hero headline: `Arthur & Archie`
- Hero tagline: `For firms that grow on trust`
- Primary CTA: `Explore a partnership`
- `What We Do`
- `Our Partnership`
- `Experience across trust-driven firms` with muted placeholder logo cards
- `The Operating Model` with a placeholder illustration inside the reference site's preview shell
- Reworked `Our Story`
- Updated footer CTA section and footer line

## Self-validation
- Confirmed the local page contains all requested section labels/copy anchors.
- Confirmed the preview responds over HTTP.
- Compared the refreshed file's CSS against the reference snapshot: the refreshed page retains a large majority of the reference style rules verbatim, with targeted additions for placeholder logo cards and the operating-model illustration.
  - Reference style lines: 444
  - Refreshed style lines: 392
  - Exact shared style lines: 294

## Working preview link
- `http://127.0.0.1:4173/`

## Notes
- The local preview server is serving the refreshed page from the `site-refresh` directory root, so the working URL is `/` on port `4173`, not `/site-refresh/`.
- I intentionally replaced the rejected standalone redesign approach with a reference-faithful reconstruction: same shell, same type stack, same colors, same hero treatment, similar section rhythm, only changing copy/content blocks where needed for review.
