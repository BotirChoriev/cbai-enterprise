/** BUILD-023 — System Integration: research notes and evidence lifecycle copy. */

export const RESEARCH_NOTES_EN = {
  notesEyebrow: "Research notes",
  findingsEyebrow: "Findings",
  notePlaceholder: "Write a research note…",
  findingPlaceholder: "Record a finding…",
  linkEvidenceOptional: "Link to evidence (optional)",
  linkEntityOptional: "Link to entity (optional)",
  addNote: "Add note",
  addFinding: "Add finding",
  notesEmpty: "No notes yet. Write the first one below.",
  findingsEmpty: "No findings yet. Record one below.",
  findingSaved: "Finding saved.",
  evidenceLinked: "Evidence: {label}",
  entityLinked: "Entity: {name}",
} as const;

export const EVIDENCE_LIFECYCLE_COPY_EN = {
  eyebrow: "Evidence lifecycle",
  empty: "No evidence catalogued for this topic yet.",
  description:
    "Collected → Reviewed → Linked → Compared → Referenced → Included in Report → Archived. Advances one stage at a time — never marked complete automatically.",
  markAs: "Mark as {stage}",
  stageCollected: "Collected",
  stageReviewed: "Reviewed",
  stageLinked: "Linked",
  stageCompared: "Compared",
  stageReferenced: "Referenced",
  stageIncludedInReport: "Included in report",
  stageArchived: "Archived",
  activityMarked: "Evidence marked {stage}",
  activityNoteAdded: "Note added",
  activityFindingRecorded: "Finding recorded",
  activityEyebrow: "Workspace activity",
  activityEmpty: "No workspace activity recorded yet.",
} as const;
