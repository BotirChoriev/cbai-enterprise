# Route inventory

Discovered from `app/**/page.tsx` on branch `preview/spatial-world-intelligence`.

## Canonical audited routes

| Route | Page | Shell pattern |
|-------|------|---------------|
| `/` | PlatformHome / SpatialWorld | spatial chrome |
| `/my-work` | MyWorkPageClient | OperatingPageShell |
| `/search` | SearchGatewayClient | OperatingPageShell |
| `/countries` | countries | EntityExploreShell |
| `/companies` | companies | EntityExploreShell |
| `/universities` | universities | EntityExploreShell |
| `/research` | ResearchPageClient | OperatingPageShell |
| `/research/[topicId]` | topic | research |
| `/research/workspace` | ResearchWorkspacePageClient | OperatingPageShell |
| `/research/canvas` | ResearchCanvasPageClient | OperatingPageShell |
| `/knowledge` | EvidenceExplorer | OperatingPageShell (nav label Evidence) |
| `/graph` | GraphPageClient | OperatingPageShell |
| `/reports` | ReportsCenter | OperatingPageShell |
| `/investor` | InvestorWorkspace | workspace lens |
| `/government` | GovernmentPageClient | workspace lens |
| `/governance` | GovernancePageClient | OperatingPageShell |
| `/ai-control` | alias → governance | OperatingPageShell |
| `/trust` | TrustPageClient | OperatingPageShell |
| `/settings` | SettingsPageClient | OperatingPageShell |
| `/about` | AboutPageClient | OperatingPageShell |
| `/workspace` | PersonalWorkspaceHome | OperatingPageShell |
| `/scientific-documents` | ScientificDocumentIntakeClient | OperatingPageShell |
| `/files` | SimpleEmptyWorkspace | OperatingPageShell |
| `/teams` | TeamsWorkspaceClient | OperatingPageShell |
| `/messages` | SimpleEmptyWorkspace | OperatingPageShell |
| `/notifications` | SimpleEmptyWorkspace | OperatingPageShell |
| `/publications` | PublicationReadinessClient | OperatingPageShell |
| `/account` | AccountPageClient | OperatingPageShell |
| `/organization` | OrganizationPageClient | OperatingPageShell |
| `/reasoning` | ReasoningExplorer | OperatingPageShell |
| `/citizen` | citizen workspace | lens |
| `/agents` | AgentsPageClient (noindex) | stub |
| `/dashboard` `/core` `/workflows` `/analytics` | legacy/preview | varied |

See also `route-inventory-raw.txt`.
