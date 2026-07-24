# Safari Manual Checklist — Final Product Closure

Complete in Safari before approving production closure. Live Realtime audio remains **EXTERNAL_BLOCKED** until a valid project key is supplied.

## Shell & navigation
- [ ] Sidebar: CORE, INTELLIGENCE (incl. Knowledge Graph), OPERATIONS, OVERSIGHT, SYSTEM
- [ ] Active route visible without white pill / neon glow
- [ ] Mobile nav readable; no horizontal overflow at 390px
- [ ] Single mission ribbon; no duplicate Continue mission bars

## Home / Spatial World
- [ ] Hero title fully visible; Speak to CBAI readable contrast
- [ ] Globe fits panel; country inspector compact
- [ ] Reduced-motion / WebGL fallback shows country list

## Voice (internal — no live key required today)
- [ ] Main notice is user-friendly (no npm command dominant)
- [ ] Developer diagnostics expandable shows broker URL + classification
- [ ] invalid_api_key ≠ microphone denied
- [ ] Text chat always usable
- [ ] Stop / Close releases mic; no content obstruction

## Localization (UZ critical)
- [ ] No unexplained English UI on /knowledge, /my-work, /settings, /about
- [ ] Official entity names preserved with source labeling

## Operational Objects
- [ ] Command → draft card → confirm → single My Work entry

## Tomorrow — credential verification (not run today)
- [ ] Valid OPENAI_API_KEY in `.dev.vars`
- [ ] `npm run test:doctor-voice` PASS
- [ ] Safari live audio proof with audible response
