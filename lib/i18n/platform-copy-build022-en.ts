/** BUILD-022 — Product Excellence: mission home and research dashboard copy. */

export const MISSION_HOME_EN = {
  eyebrow: "Mission progress",
  stagesComplete: "{complete} of {total} stages complete",
  resumeProject: "Resume project",
  noMissionTitle: "No active mission yet",
  noMissionBody: "Name the problem on the home page — progress, evidence, and reports will follow here.",
  startMission: "Begin mission",
  lastActivity: "Last activity",
} as const;

export const RESEARCH_DASHBOARD_EN = {
  eyebrow: "Research summary",
  progress: "Progress",
  progressValue: "{complete}/{total} milestones",
  progressUnavailable: "Unavailable",
  evidenceConnected: "Evidence connected",
  missingEvidence: "Missing evidence",
  openTasks: "Open tasks",
  recentNotes: "Recent notes",
  noNotesYet: "No notes recorded yet.",
  relatedReports: "Related reports",
  reportAvailable: "1 report type available",
  savedStatus: "Saved status",
  savedToBookmarks: "Saved to your bookmarks",
  notSavedYet: "Not saved yet",
} as const;

export const SAVED_EVIDENCE_EN = {
  eyebrow: "Saved evidence",
  description:
    "Evidence bookmarked from research topics — separate from evidence added to a project.",
  empty: "No evidence saved for this mission yet. Bookmark evidence from a research topic to return here.",
  exploreAction: "Explore research topics",
  remove: "Remove",
  fromTopic: "From: {topic}",
  removeAria: 'Remove "{name}" from saved evidence',
} as const;

export const PROJECT_PANEL_EN = {
  evidenceEmpty: "No evidence for this mission yet. Add one verified source to continue.",
  evidenceAdded: "Evidence linked.",
  timelineEmpty: "No activity yet. Evidence, notes, and reports will appear here as you work.",
  timelineEyebrow: "Timeline",
  evidenceEyebrow: "Evidence",
  evidenceLead: "Sources you add for this project — never auto-discovered.",
  evidenceTitlePlaceholder: "Evidence title",
  evidenceUrlPlaceholder: "Source URL (optional)",
  linkEntityOptional: "Link to entity (optional)",
  addEvidence: "Add evidence",
} as const;
