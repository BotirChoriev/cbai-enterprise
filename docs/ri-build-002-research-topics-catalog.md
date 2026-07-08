# RI-BUILD-002 — Research Topics Catalog

**Build:** Structured read-only research topics catalog  
**Route:** `/research` (catalog section on Research Home)

---

## Purpose

Extend Research Intelligence with a browsable catalog of research domains and topics — honest static data only, foundation for future Research Topic Pages (RI-BUILD-003).

---

## Files created

| File | Role |
|------|------|
| `lib/research/research-topics.ts` | 10 domains, 67 topics, filter helpers |
| `components/research/ResearchTopicCatalog.tsx` | Catalog shell with filter input + domain filter |
| `components/research/ResearchTopicCard.tsx` | Topic card with status, methods, evidence types |
| `components/research/ResearchDomainFilter.tsx` | Domain pill filter with topic counts |

---

## Catalog structure

**10 domains** × **5–7 topics each** = **67 topics**

1. Life Sciences  
2. Medicine  
3. Agriculture  
4. Climate & Environment  
5. Energy  
6. Materials Science  
7. Engineering  
8. Computer Science  
9. Economics & Policy  
10. Social Sciences  

---

## Topic model

Each topic includes:

- `topicId`, `topicName`, `domain`, `domainId`
- `description`
- `relatedMethods`, `relatedEvidenceTypes`
- `status`: `catalog_available` | `workspace_not_available` | `evidence_not_connected`
- `futureWorkspace`

---

## UI behavior

- Domain filter pills with topic counts
- Client-side filter/search input
- Topic cards with honest status badges
- **Open topic →** disabled with note: “Topic page coming in RI-BUILD-003”
- Hero search query pre-fills catalog filter

---

## Honest constraints

- No fake researchers, experiments, publications, or metrics
- No live database connections
- No collaboration or chat
- Topic pages not implemented

---

## Verification

- `npm run lint` — pass
- `npm run build` — pass
