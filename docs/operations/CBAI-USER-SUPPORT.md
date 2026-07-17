# CBAI Alpha User Support (BUILD-038)

## Known limitations to communicate

- Organization and collaboration are **device-local** until Supabase env is configured.
- Invitation links work on the same device/browser namespace only in local mode.
- Crossref search requires network; failures show provider-unavailable state.

## Support workflow

1. Ask user for locale, route, persistence banner text.
2. Check organization audit (same device) for membership events.
3. Never request raw invitation tokens — ask for organization name and invitee email only.

## Escalation

Infrastructure (Supabase, RLS): apply migrations 0005–0006 and verify two-user journey.
