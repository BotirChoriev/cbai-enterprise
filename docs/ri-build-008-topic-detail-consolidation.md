# RI-BUILD-008 — Topic Detail Consolidation

## Summary

Consolidates Research Topic Detail pages after RI-BUILD-005 through RI-BUILD-007 added separate publication, experiment, and laboratory readiness sections. Improves readability without new data or integrations.

## User flow

1. **What is this research topic?** — Hero with name, domain, description, overview
2. **What information is available today?** — Workspace status, methods, evidence types
3. **Which research evidence areas are not connected yet?** — Research evidence readiness + limitations
4. **What will the future workspace support?** — Future research workspace

## Consolidated sections

### Research evidence readiness

Replaces standalone Publication, Experiment, and Laboratory readiness sections with three compact cards:

- **Publications** — status, will support, current limitation, human review note
- **Experiments** — status, will support, current limitation, human review note
- **Laboratories** — status, will support, current limitation, human review note

Data sourced from existing publication, experiment, and laboratory readiness helpers.

### Future research workspace

Replaces the generic "Next steps" list with grouped future capabilities:

- Research literature
- Experiments and replication
- Laboratories and equipment
- Open questions
- Evidence discussions
- AI Notebook

Merged from topic catalog, publication, experiment, and laboratory future capability definitions.

## Kept sections

- Research entity model
- Methods
- Evidence types
- Limitations

## Removed from topic detail

- Standalone Publication readiness section
- Standalone Experiment readiness section
- Standalone Laboratory readiness section
- Standalone Next steps section

## Not included

- No new framework layers, fake data, live integrations, chat, or collaboration

## Copy rules

Plain language: available catalog information, not connected yet, future workspace, human review, research evidence.

Avoid: layer, registry, pipeline, connector, framework, AI conclusion, rank, score.
