# Information Architecture

## Primary navigation (`lib/navigation.ts`, `primaryNavSections`)

Flat, 7-item structure (Global Language Foundation + Multilingual Voice Commands mission, Phase 15):

1. **Home** (`/`)
2. **My Work** (`/my-work`)
3. **Search** (`/search`)
4. **Explore** — group: Countries, Companies, Universities, Research, Evidence
5. **Reports** (`/analytics`, aliased at `/reports`)
6. **Trust** (`/trust`)
7. **Settings** (`/settings`)

## Secondary navigation (`secondaryNavSections`)

Real, fully working modules — kept out of the primary 7 so they don't compete for attention, not removed or hidden. Rendered in a collapsed "More" `<details>` at the bottom of the desktop Sidebar and the mobile drawer.

- **Ecosystems**: Government, Investor, Citizen
- **Intelligence**: Dashboard, Reasoning, Knowledge Graph, Governance, Research Workspace

`mainNav`/`platformModules` (used by `/core`'s full route grid) combine both lists, so nothing becomes undiscoverable.

## Not in either nav list (real, reachable by direct link only)

`/account`, `/settings` (now in primary), `/reset-password`, `/agents`, `/core`, `/workflows` — the last three are marked `noindex` and honestly described as not part of the primary journey.

## Global shell

- **Desktop**: `Sidebar` (persistent, left) + `Topbar` (persistent, top) — `app/(dashboard)/layout.tsx`.
- **Mobile** (`< md`): `Sidebar` hidden; `Topbar`'s hamburger opens `MobileNavDrawer`, a real slide-in panel using the exact same nav data.
- **Topbar contents** (Phase 3): hamburger (mobile only) → CBAI mark (mobile only) → Command Center → Search link → New Project → Trust → Language Selector → Account menu.

## First page (`/`) structure (Phase 1)

1. Language selector (top strip, in addition to the header)
2. Personalized greeting (`HomeAssistantGreeting`) — real name + real next step, or a neutral welcome when signed out
3. Prominent voice/text command bar (`HomeCommandBar`)
4. Role/Work-Context cards (`RoleWorkContextCards`) — 11 personas
5. Projects panel (`HomeProjectsSection`, reuses `ProjectList`) + Intelligence Feed (`HomeIntelligenceFeed`), side by side
6. Existing marketing/trust content (`HomeHero`'s Ecosystems, World Intelligence Map, Capability Flow, Audience, Trust sections) — unchanged, positioned below the activation-focused sections above
7. Footer

## Reuse discipline

No new Project Engine, Command Center, Search, My Work, Reports, or profile system was created. Every new home-page section is a thin composition over an existing engine: `HomeCommandBar` wraps the existing `AssistantCommandCenter`; `HomeProjectsSection` wraps the existing `ProjectList`; `HomeIntelligenceFeed` reads the existing `project-store`/`reports-store`; `RoleWorkContextCards` sets the existing `AssistantProfile.workspaceRole` field and links into the existing Project Engine.
