---
type: meeting-notes
contact: stephen-feng
account: eli-lilly
opportunity: lilly-feng-personal-enablement
date: 2026-02-28
tags: [eli-lilly, feng, architecture]
summary: "Stephen's three-plane architecture design for personal agent runtime."
---

# Architecture Notes — Stephen Feng

## Stacked Planes

1. **Lilly Stack** (Lilly-owned): Teams Bot, SharePoint Folder, Calendar, Service Account Email
2. **Controlled Gateway:** OAuth / Graph API
3. **Agent Runtime** (Stephen's personal device): Lilly Data Plane (NanoClaw Agent) + A&A Management Plane (skills, router config, performance data)

Stephen sketched this architecture. It's his design. A&A makes it real.

## Key Facts

- Work laptop: pharma-grade locked down (MDM, DLP, endpoint monitoring, zero-trust)
- Cannot approve external MDM connection himself — needs higher IT authority
- Lilly has Chief AI Officer (Thomas Fuchs), built pharma's most powerful AI supercomputer with NVIDIA, saved 1.4M hours through AI
- Price sensitivity low; control/compliance/reputation risk sensitivity high
