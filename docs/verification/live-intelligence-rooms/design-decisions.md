# Live Intelligence Rooms — Design Decisions

## DD-01 Architecture pattern
**Options:** A SFU multi-party · B Canonical store + host VO · C MissionRoom chat  
**Selected:** B  
**Why:** Feasible on Cloudflare static export + existing voice broker; honest about unavailable multi-party; strongest OS identity.

## DD-02 Routing
**Selected:** `/rooms` list+create, `/rooms/session?id=` for live shell (static-export safe; no empty `generateStaticParams` trap).

## DD-03 Translation
**Selected:** Deterministic router + glossary preservation; production MT via future adapter. Uncertain/do-not-translate → clarification, not silent guess.

## DD-04 Voice
**Selected:** Reuse global Voice Operator; do not embed a second WebRTC stack in rooms.

## DD-05 Operational Objects
**Selected:** Propose drafts only; confirm via existing composer.

## DD-06 Navigation placement
**Selected:** Collaboration secondary nav — “Live Rooms”.
