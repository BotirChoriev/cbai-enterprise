/**
 * Human-Centered Workspace Kernel — Phase 1 contracts only.
 *
 * These contracts do not select a persona, create a workspace, persist data,
 * or execute an action. They define the seam through which existing CBAI
 * capabilities can be composed around confirmed human context without adding
 * a second command engine or replacing current domain schemas.
 */

import type { PlatformActionId } from "@/lib/platform-actions/types";

export type ContextValueState =
  | "known"
  | "unknown"
  | "inferred"
  | "awaiting_confirmation";

export type ContextSourceKind = "human" | "import" | "system";

export type ContextSource = {
  readonly kind: ContextSourceKind;
  readonly ref?: string;
};

/** An unknown value is represented explicitly, never as an invented default. */
export type ContextValue<T> = {
  readonly value: T | null;
  readonly state: ContextValueState;
  readonly source: ContextSource;
  readonly observedAt: string;
};

export type HumanContextScope =
  | { readonly kind: "person"; readonly personId: string }
  | { readonly kind: "organization"; readonly organizationId: string }
  | { readonly kind: "workspace"; readonly workspaceId: string }
  | { readonly kind: "session"; readonly sessionId: string };

export type ResourceRef = {
  readonly resourceId: string;
  readonly resourceKind: string;
  readonly label: string;
};

export type Constraint = {
  readonly constraintId: string;
  readonly statement: string;
  readonly kind: "time" | "budget" | "safety" | "legal" | "privacy" | "technical" | "other";
};

export type StakeholderRef = {
  readonly stakeholderId: string;
  readonly label: string;
  readonly relationship: string;
};

export type AuthorityBoundary = {
  readonly actionLevel: 0 | 1 | 2 | 3;
  readonly requiresHumanConfirmation: boolean;
  readonly humanDecisionOwnerId?: string;
};

export type AuthorityPolicy = {
  readonly boundaries: readonly AuthorityBoundary[];
  readonly finalDecisionRemainsHuman: true;
};

export type ConsentGrantRef = {
  readonly grantId: string;
  readonly integrationId: string;
  readonly scopes: readonly string[];
  readonly expiresAt?: string;
};

export type MissingContextItem = {
  readonly id: string;
  readonly label: string;
  readonly reason: string;
  readonly requiredFor: readonly string[];
};

/** Capability-specific context without forcing domain fields into the person profile. */
export type ContextAttribute = {
  readonly key: string;
  readonly schema: SchemaRef;
  readonly value: ContextValue<unknown>;
  readonly sensitivity: "public" | "internal" | "personal" | "sensitive";
};

export type HumanContext = {
  readonly contextId: string;
  readonly version: number;
  readonly scope: HumanContextScope;
  readonly selfDescription: ContextValue<string>;
  readonly languages: ContextValue<readonly string[]>;
  readonly currentOutcome: ContextValue<string>;
  readonly resources: ContextValue<readonly ResourceRef[]>;
  readonly constraints: ContextValue<readonly Constraint[]>;
  readonly stakeholders: ContextValue<readonly StakeholderRef[]>;
  readonly authorityPolicy: AuthorityPolicy;
  readonly consentGrants: readonly ConsentGrantRef[];
  readonly openQuestions: readonly MissingContextItem[];
  readonly attributes: readonly ContextAttribute[];
};

export type SchemaRef = {
  readonly schemaId: string;
  readonly version: number;
};

export type ContextRequirement = {
  readonly key: string;
  readonly reason: string;
};

export type UiBlockRef = {
  readonly blockId: string;
  readonly version: number;
};

export type PermissionRequirement = {
  readonly permission: string;
  readonly reason: string;
};

export type IntegrationRequirement = {
  readonly integrationId: string;
  readonly scopes: readonly string[];
  readonly optional: boolean;
};

export type EvidencePolicy = {
  readonly evidenceRequiredForConclusion: boolean;
  readonly limitationsMustRemainVisible: boolean;
  readonly provenanceRequiredForImports: boolean;
};

export type LifecycleContract = {
  readonly initialState: string;
  readonly states: readonly string[];
  readonly terminalStates: readonly string[];
};

/** A capability is reusable behavior, never a user identity or persona page. */
export type CapabilityManifest = {
  readonly capabilityId: string;
  readonly version: string;
  readonly purpose: string;
  readonly requiredContext: readonly ContextRequirement[];
  readonly optionalContext: readonly ContextRequirement[];
  readonly inputs: readonly SchemaRef[];
  readonly outputs: readonly SchemaRef[];
  readonly uiBlocks: readonly UiBlockRef[];
  readonly actions: readonly PlatformActionId[];
  readonly evidencePolicy: EvidencePolicy;
  readonly permissions: readonly PermissionRequirement[];
  readonly integrations: readonly IntegrationRequirement[];
  readonly lifecycle: LifecycleContract;
};

export type CompositionReason = {
  readonly capabilityId: string;
  readonly statement: string;
  readonly contextKeys: readonly string[];
};

export type ConfirmationGate = {
  readonly gateId: string;
  readonly reason: string;
  readonly actionLevel: 2 | 3;
  readonly decisionOwnerId?: string;
};

export type WorkspaceModuleInstance = {
  readonly moduleId: string;
  readonly capabilityId: string;
  readonly capabilityVersion: string;
  readonly state: "proposed" | "active" | "blocked" | "completed";
  readonly blockRefs: readonly UiBlockRef[];
};

export type AvailableCommand = {
  readonly actionId: PlatformActionId;
  readonly enabled: boolean;
  readonly blockedReason?: string;
};

export type LayoutIntent = {
  readonly primaryModuleId?: string;
  readonly orderedModuleIds: readonly string[];
};

/** The renderer consumes this manifest; it does not generate arbitrary UI code. */
export type WorkspaceManifest = {
  readonly workspaceId: string;
  readonly version: number;
  readonly contextId: string;
  readonly contextVersion: number;
  readonly title: string;
  readonly objective: string;
  readonly modules: readonly WorkspaceModuleInstance[];
  readonly layout: LayoutIntent;
  readonly commands: readonly AvailableCommand[];
  readonly missingItems: readonly MissingContextItem[];
  readonly requiredConfirmations: readonly ConfirmationGate[];
  readonly compositionReasons: readonly CompositionReason[];
};

export type ActorRef = {
  readonly actorId: string;
  readonly actorKind: "human" | "system" | "integration";
};

/** Shared event grammar for local outbox and future cloud event persistence. */
export type EventEnvelope<TPayload> = {
  readonly eventId: string;
  readonly eventType: string;
  readonly schemaVersion: number;
  readonly aggregateId: string;
  readonly aggregateVersion: number;
  readonly actor: ActorRef;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly idempotencyKey?: string;
  readonly consentGrantId?: string;
  readonly payload: TPayload;
};

export type WorkObjectEnvelope<TType extends string = string> = {
  readonly objectId: string;
  readonly objectType: TType;
  readonly schemaVersion: number;
  readonly tenantId?: string;
  readonly ownerId: string;
  readonly lifecycleState: string;
  readonly version: number;
  readonly evidenceIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export const HUMAN_CENTERED_KERNEL_RULES = {
  roleIsNeverWorkspaceIdentity: true,
  inferredContextRequiresVisibleProvenance: true,
  unknownContextMustRemainExplicit: true,
  arbitraryRuntimeUiCodeIsForbidden: true,
  platformActionsRemainCommandAuthority: true,
  consequentialActionsRequireHumanBoundary: true,
} as const;
