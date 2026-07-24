# Multilingual Interpreter Mode — Architecture Specification

**Status:** Design-only (Phase K). No production UI claims in this pass.

---

## Purpose

Enable future multilingual scientific meetings where each participant receives speech and transcripts in their preferred language while preserving scientific meaning, attribution, and human authority.

---

## Core capabilities (phased)

| Phase | Capability | Delivery |
|-------|------------|----------|
| 1 | Bilingual text transcript with speaker attribution | Text-only side channel |
| 2 | Translated captions per participant | WebRTC data channel / UI overlay |
| 3 | Push-to-translate audio segments | Explicit user trigger |
| 4 | Participant-specific live audio channels | Routed Realtime sessions |
| 5 | Meeting summary with provenance | Post-session export |

---

## Architecture

```
Meeting room
  ├── Participant clients (locale + consent per user)
  ├── Session broker (ephemeral credentials only)
  ├── Realtime audio channels (one per participant language route)
  ├── Transcript service (original + translated, immutable segments)
  ├── Glossary service (domain terms — DOI, Crossref, entity names frozen)
  └── Human override panel (moderator corrects segment before persistence)
```

---

## Non-negotiable rules

1. **No silent alteration** of scientific meaning — uncertain segments flagged.
2. **Consent** required before recording or cross-language routing.
3. **Provenance** on every translated segment: source language, model, timestamp, glossary version.
4. **Human override** always available; automated translation never final for compliance decisions.
5. **Privacy:** retention policy explicit; no training on user content without opt-in.
6. **Accessibility:** captions, keyboard control, reduced-motion friendly transcript UI.

---

## Latency targets (design)

| Path | Target |
|------|--------|
| Caption after speech end | < 2s p95 |
| Push-to-translate audio | < 4s p95 |
| Live participant channel | < 500ms one-way (network dependent) |

---

## Integration with CBAI Voice Operator

- Reuse broker + ephemeral credential pattern (no long-lived keys in browser).
- Separate interpreter session type from standard Voice Operator dock.
- Mission/project locale provenance (`contentLocale`, `createdLocale`) attaches to exported transcripts.

---

## Out of scope (this pass)

- Production interpreter UI
- Multi-channel audio mixing in Safari without user gesture
- Automated meeting recording storage
