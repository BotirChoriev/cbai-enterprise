# CBAI Permission Matrix (evidence-backed, device-local)

| Role | view org | invite | edit org | add evidence | review | manage collaboration |
|------|----------|--------|----------|--------------|--------|----------------------|
| owner | yes | yes | yes | yes | yes | yes |
| administrator | yes | yes | yes | yes | yes | yes |
| mission_lead | yes | no | no | yes | yes | yes |
| researcher | yes | no | no | yes | no | no |
| reviewer | yes | no | no | no | yes | no |
| member | yes | no | no | no | no | no |
| guest | yes | no | no | no | no | no |
| non_member | no | no | no | no | no | no |

Enforced via `authorizeOrganizationAction` + `evaluateOrganizationPermission`.

Tests: `scripts/test-genesis-build029-033.ts` ORG-T002, ORG-T003.

Updated: BUILD-033 partial.
