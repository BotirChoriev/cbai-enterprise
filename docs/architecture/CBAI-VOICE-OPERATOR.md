# CBAI Voice Operator

Persistent conversational interface for natural Uzbek (and EN/RU/TR) workspace assistance with evidence tools, honest browser fallback, and secure Realtime when configured.

## Architecture overview

```
User (browser)
  │
  ├─ VoiceOperatorDock (fixed bottom UI, permission UX, transcript)
  │
  ├─ MODE B — Browser fallback (default without broker)
  │     SpeechRecognitionSession → editable transcript → conversation-engine → typed voice-tools
  │
  └─ MODE A — Realtime (BACKEND REQUIRED)
        requestRealtimeSessionCredential(broker) → ephemeral client secret only
        → RealtimeVoiceProvider (WebRTC) → OpenAI /v1/realtime/calls
        → tool calls → same voice-tools layer
```

## Security boundary

| Layer | Holds secrets? | Notes |
|-------|----------------|-------|
| Browser bundle | **Never** long-lived `sk-*` keys | Only `NEXT_PUBLIC_VOICE_BROKER_URL` (broker endpoint, not API key) |
| Session broker (Cloudflare Pages Function or Supabase Edge Function) | `OPENAI_API_KEY` server-side | Creates short-lived credentials via `/v1/realtime/client_secrets` |
| Voice tools | No direct network/router access | Typed, audited, risk-classified |

Example broker: `lib/voice-operator/session-broker/cloudflare-pages-function.example.ts`

## Deployment choice

This repository is a **Next.js static export** (`output: "export"`). It cannot host the broker internally.

**Preferred:** Cloudflare Pages Function on the same Pages project as the static export.

**Alternative:** Supabase Edge Function if Cloudflare Functions are unavailable.

The broker contract:

- `POST /session` with `{ language, origin, sessionHint? }`
- Returns `{ clientSecret, expiresAt, sessionId, model }` or `{ error, code }`
- Validates `Origin` against allowlist
- Rate limits session creation
- Never logs raw audio

## Environment variables (names only — no values)

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_VOICE_BROKER_URL` | Browser (public URL of broker) | Enables Realtime mode discovery |
| `OPENAI_API_KEY` | Broker server only | Creates ephemeral Realtime credentials |
| `VOICE_BROKER_ALLOWED_ORIGINS` | Broker server | Comma-separated origin allowlist |
| `VOICE_BROKER_RATE_LIMIT_PER_HOUR` | Broker server | Optional rate limit |

Do **not** add `NEXT_PUBLIC_OPENAI_*` or any `sk-*` value to client env or source.

## Two modes (honest labeling)

### MODE A — Realtime conversation

- Status: **BACKEND REQUIRED** until broker + `OPENAI_API_KEY` are configured
- Low-latency speech-to-speech, VAD turn detection, barge-in, tool calls
- Uzbek-first instructions in `lib/voice-operator/instructions.ts`

### MODE B — Browser fallback

- Status: **BROWSER-DEPENDENT**
- One-turn transcription, editable text, deterministic conversation engine
- No claim of reliable Uzbek STT (especially Safari)
- No automatic navigation from uncertain speech

## Tool risk classes

Defined in `lib/voice-operator/tool-policy.ts`:

| Class | Examples | Policy |
|-------|----------|--------|
| `read_only` | context, list evidence, navigate internal | May run on clear intent |
| `external_read` | Crossref/OpenAlex search | Session consent + sanitized query display |
| `draft_write` | draft mission/task | Draft only; human confirms save |
| `consequential` | publish, delete, permissions | Always requires visual confirmation |

Every tool call emits an audit event (`lib/voice-operator/tool-audit.ts`) with session ID, tool, scope, sanitized parameters — **no raw audio**.

## Voice Dock UX

- Fixed bottom-center (`components/voice-operator/VoiceOperatorDock.tsx`)
- Sidebar offset `md:pl-64`, main content `pb-24`
- Permission errors stay **inside** the dock (`VoiceOperatorPermissionCard`)
- Evidence results drawer opens in-context (`EvidenceResultsDrawer`)
- Topbar command bar is text-only (`AssistantCommandCenter textOnly`)

## Conversation memory

Session-scoped (`lib/voice-operator/session-memory.ts`):

- Language, turns, active context summary
- Last confirmed query, presented evidence IDs
- External search consent scope
- Cleared on end session; refresh does not replay commands

## Privacy

- Sanitized queries only (`privacy-boundary`, `prepare_external_evidence_search`)
- No private artifact transmission to external providers
- Spoken summaries; detailed sources shown visually
- Raw audio not persisted by default

## VAD / interruption

Conservative settings in `lib/voice-operator/vad-config.ts` (900ms silence for longer Uzbek sentences). Realtime provider supports `interrupt()` to stop assistant audio.

## Local testing

```bash
npm run test:voice-operator
npm run test:voice-safety
npm run test:locale-completeness
npm run lint
npm run build
```

Mock broker for tests: `setMockSessionBrokerHandler()` in `session-broker/client.ts`.

Without credentials:

1. Open `http://localhost:3000`
2. Use bottom Voice Operator dock
3. Deny microphone → compact permission card inside dock
4. Dismiss → layout restores
5. Text fallback works; no fake live conversation states

## Cost controls

- Broker rate limiting (`VOICE_BROKER_RATE_LIMIT_PER_HOUR`)
- Short-lived ephemeral credentials
- External search limited (`limit: 5` in voice tools)
- Session-scoped consent (revocable in dock)

## Rollout / rollback

1. **Phase 1:** Ship Voice Dock + browser fallback + evidence drawer (no broker)
2. **Phase 2:** Deploy broker to Cloudflare/Supabase staging; set `NEXT_PUBLIC_VOICE_BROKER_URL`
3. **Phase 3:** Enable Realtime for allowlisted origins; monitor audit log volume
4. **Rollback:** Unset `NEXT_PUBLIC_VOICE_BROKER_URL` — app reverts to MODE B only

## Related files

- `lib/voice-operator/` — core types, tools, conversation engine, broker client
- `components/voice-operator/` — dock, provider, evidence drawer
- `lib/i18n/platform-copy-voice-operator.ts` — EN/UZ/RU/TR copy
- `scripts/test-voice-operator.ts` — deterministic architecture tests
