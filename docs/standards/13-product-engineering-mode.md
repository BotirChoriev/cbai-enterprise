# CBAI Product Engineering Mode

**Document:** 13 — Product Engineering Mode  
**Status:** Permanent development policy  
**Effective:** July 2026  
**Authority:** Governs all future tasks unless explicitly overridden

---

## Development ratio

Every future task follows this ratio:

| Share | Focus |
|-------|--------|
| **80%** | Product quality |
| **20%** | New capability |

Violation is forbidden unless explicitly approved.

---

## Product quality (80%)

Priority order:

| Priority | Share | Question |
|----------|-------|----------|
| 1. Usability | 30% | Can people solve problems faster, think less, click less, understand instantly? |
| 2. Consistency | 25% | Does everything behave identically — spacing, typography, buttons, cards, dialogs, loading, errors, motion, status, interaction, language? |
| 3. Polish | 15% | Does it feel premium — micro-interactions, hover, focus, animation, scrolling, density, timing? |
| 4. Performance | 10% | Less rendering, state, hydration, layout shift; faster interaction? |

Always improve product quality first.

---

## New capability (20%)

Only when it directly improves:

- Evidence
- Organization
- Discovery
- Collaboration
- Mission

Otherwise postpone.

---

## Pre-code gate (every pull request)

Before writing code, answer:

> **Will this simplify CBAI?**

If **no** — stop.

---

## Component gate

Ask:

> **Can this component disappear?**

If **yes** — merge, remove, simplify.

---

## Screen metrics

Measure and reduce all four:

1. Time to understand
2. Time to first action
3. Time to resume
4. Time to completion

---

## Click gate

Ask:

> **Was this click necessary?**

If **no** — remove it.

---

## Copy gate

Ask:

> **Can this be written shorter?**

If **yes** — rewrite.

---

## Empty states

Never show emptiness alone. Always explain:

- Why
- Next step
- Expected outcome

---

## Loading states

Reduce perceived waiting. Communicate progress. Never leave uncertainty.

---

## Errors

Explain:

- What happened
- Why
- What the user should do

---

## Motion and animation

**Purpose only. No decoration.**

Animation must communicate state, change, or feedback — never entertainment.

---

## Visual elements

Every element must answer:

> **What problem does this solve?**

If none — remove it.

---

## External review bar

Imagine Apple, Linear, Stripe, and Figma reviewing every component.

Would they approve? If uncertain — improve. Do not redesign; polish.

---

## CBAI review question

Never ask: *How do we make CBAI bigger?*

Always ask: *How do we make CBAI easier?*

---

## Final rule

**Complexity belongs inside the engine.**  
**Simplicity belongs inside the interface.**

Never reverse them.
