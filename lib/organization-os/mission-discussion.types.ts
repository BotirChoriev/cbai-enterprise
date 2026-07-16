/**
 * EPIC-05 — Mission Discussion: always attached to context, never standalone messaging.
 */

export type MissionDiscussionAnchorType =
  | "evidence"
  | "question"
  | "decision"
  | "mission_stage"
  | "report";

export type MissionDiscussionAnchor = {
  readonly type: MissionDiscussionAnchorType;
  readonly anchorId: string;
  readonly label: string;
};

export type MissionDiscussionEntry = {
  readonly id: string;
  readonly missionId: string;
  readonly anchor: MissionDiscussionAnchor;
  readonly body: string;
  readonly authorRef: string | null;
  readonly createdAt: string;
  readonly limitation: string;
};

export const MISSION_DISCUSSION_RULES = {
  standaloneMessaging: false,
  genericChatRooms: false,
  requiredAnchor: true,
  limitation:
    "Discussion entries require a mission anchor. Messaging infrastructure is not connected in EPIC-05 foundation.",
} as const;
