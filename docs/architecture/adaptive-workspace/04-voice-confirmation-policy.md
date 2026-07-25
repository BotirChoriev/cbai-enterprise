# Voice Operator action and confirmation policy

**Instructions:** `lib/voice-operator/instructions.ts`  
**Levels:** `lib/voice-operator/identity/action-levels.ts`

- Brand facts come from `lib/brand/canonical-identity.ts`.
- Safe navigation may execute immediately when unambiguous.
- Creating/saving/publishing/sharing/joining/uploading/deleting/privacy/recording/export require explicit confirmation; show what will happen.
- Role discovery prompt comes from the brand registry; profile persistence requires confirmation.
- Microphone teardown remains required on Stop, Close, End, unmount, unload, and route change (existing Voice Operator lifecycle).
