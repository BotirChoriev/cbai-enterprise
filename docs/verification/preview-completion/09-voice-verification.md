# Voice verification — Preview Completion Program

**Branch:** `preview/spatial-world-intelligence`
**Updated:** 2026-07-22 (implementation pass)

---

## Voice platform gates

| Check | Status | Evidence |
|-------|--------|----------|
| Platform action registry allowlist | **PROVEN_AUTOMATED** | `test:voice-command-orchestrator` |
| Protocol-relative `//` rejection | **PROVEN_AUTOMATED** | `test:preview-completion` |
| UZ command fixtures (research, evidence, my-work, countries, teams, files, voice.stop) | **PROVEN_AUTOMATED** | `test:preview-completion` |
| Vague “sahifani och” clarifies | **PROVEN_AUTOMATED** | `test:preview-completion` |
| Auth-collab voice policy | **PROVEN_AUTOMATED** | `test:auth-collaboration-voice-os` 20/20 |
| Session survives client navigation | **PROVEN_AUTOMATED** | orchestrator + provider `void pathname` |
| Stop/Close/unmount + logout/pagehide release | **PROVEN_AUTOMATED** / **PROVEN_LOCAL** | webrtc + provider listeners; Safari indicator **MANUAL_REQUIRED** |
| Duplicate mic prevention | **PROVEN_AUTOMATED** | `test:voice-realtime-webrtc` |
| Broker Origin header required | **PROVEN_AUTOMATED** | `test:voice-session-broker` + preview-completion |
| Soft rate limit 429 | **PROVEN_AUTOMATED** | `test:preview-completion` |
| doctor:voice local broker | **PROVEN_LOCAL** | PASS (local keys present; not exposed in docs) |
| Live Preview Safari Realtime audio | **EXTERNAL_BLOCKED** / **MANUAL_REQUIRED** | Needs human Safari + Preview deploy auth |
| SF-1 end-user mint auth | **EXTERNAL_BLOCKED** | Still `productionBlocker: true` |

---

## Screenshots

See `screenshots/README.md` — reference prior matrix only; fresh PC voice captures **MANUAL_REQUIRED**.
