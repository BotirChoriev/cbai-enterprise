/**
 * Canonical platform capability registry — single source of truth for Voice + UI.
 * Readiness is derived from real implementation/configuration, never optimistic marketing.
 */

import { isAllowedNavigationHref } from "@/lib/platform-actions/registry";
import { OBJECT_STORAGE_RULES } from "@/lib/object-storage/contracts";

export type CapabilityReadiness = "available" | "degraded" | "planned" | "unavailable";

export type CapabilityId =
  | "open_home"
  | "open_my_work"
  | "open_search"
  | "open_global_activity"
  | "open_world_intelligence"
  | "open_research"
  | "open_evidence"
  | "open_reports"
  | "open_live_rooms"
  | "open_settings"
  | "open_about"
  | "create_personal_workspace"
  | "create_role_workspace"
  | "create_research_project"
  | "upload_research_document"
  | "attach_document_to_workspace"
  | "inspect_uploaded_document"
  | "continue_active_work";

export type PlatformCapability = {
  readonly id: CapabilityId;
  readonly aliases: readonly string[];
  readonly destinationRoute: string | null;
  readonly readiness: CapabilityReadiness;
  readonly requiredInputs: readonly string[];
  readonly requiresConfirmation: boolean;
  readonly allowedRoles: readonly string[];
  readonly fallbackCapabilityId: CapabilityId | null;
  readonly explanationKey: string;
  readonly voiceExecutable: boolean;
  readonly createsData: boolean;
  readonly requiresAuthentication: boolean;
  readonly requiresExternalConnector: boolean;
};

function navCapability(
  id: CapabilityId,
  route: string,
  aliases: readonly string[],
  explanationKey: string,
): PlatformCapability {
  const routeAllowed = isAllowedNavigationHref(route);
  return {
    id,
    aliases,
    destinationRoute: route,
    readiness: routeAllowed ? "available" : "unavailable",
    requiredInputs: [],
    requiresConfirmation: false,
    allowedRoles: ["*"],
    fallbackCapabilityId: null,
    explanationKey,
    voiceExecutable: routeAllowed,
    createsData: false,
    requiresAuthentication: false,
    requiresExternalConnector: false,
  };
}

/** Object-storage / virus-scan readiness for thesis upload — honest, not optimistic. */
export function deriveDocumentUploadReadiness(): CapabilityReadiness {
  // Production blob storage + malware scan are not wired; metadata intake remains available.
  if (OBJECT_STORAGE_RULES.virusScanRequiredForProduction) {
    return "degraded";
  }
  return "unavailable";
}

export function listPlatformCapabilities(): readonly PlatformCapability[] {
  const uploadReadiness = deriveDocumentUploadReadiness();
  return [
    navCapability("open_home", "/", ["open home", "bosh sahifa", "главная", "ana sayfa"], "capability.openHome"),
    navCapability(
      "open_my_work",
      "/my-work",
      [
        "open my work",
        "open my workspace",
        "open my personal cabinet",
        "show my projects",
        "shaxsiy kabinetimni och",
        "kabinetimni och",
        "mening ishlarimni och",
        "ish maydonimni och",
        "loyihalarimni ko'rsat",
        "открой мой кабинет",
        "моя работа",
        "kişisel kabinimi aç",
        "çalışmalarım",
      ],
      "capability.openMyWork",
    ),
    navCapability("open_search", "/search", ["open search", "qidiruvni och", "поиск", "aramayı aç"], "capability.openSearch"),
    navCapability(
      "open_global_activity",
      "/discover",
      ["global activity", "global faoliyat", "глобальная активность", "küresel etkinlik"],
      "capability.openGlobalActivity",
    ),
    navCapability(
      "open_world_intelligence",
      "/countries",
      ["world intelligence", "davlatlar", "страны", "ülkeler"],
      "capability.openWorldIntelligence",
    ),
    navCapability("open_research", "/research", ["open research", "tadqiqotni och", "исследования", "araştırmayı aç"], "capability.openResearch"),
    navCapability("open_evidence", "/evidence", ["open evidence", "dalillarni och", "доказательства", "kanıtları aç"], "capability.openEvidence"),
    navCapability("open_reports", "/reports", ["open reports", "hisobotlar", "отчёты", "raporlar"], "capability.openReports"),
    navCapability("open_live_rooms", "/rooms", ["live rooms", "jonli xonalar", "комнаты", "odalar"], "capability.openLiveRooms"),
    navCapability("open_settings", "/settings", ["open settings", "sozlamalar", "настройки", "ayarlar"], "capability.openSettings"),
    navCapability("open_about", "/about", ["open about", "cbai haqida", "о cbai", "cbai hakkında"], "capability.openAbout"),
    {
      id: "create_personal_workspace",
      aliases: ["create workspace", "ish maydoni yarat", "создать пространство", "alan oluştur"],
      destinationRoute: "/my-work",
      readiness: "available",
      requiredInputs: ["title", "objective"],
      requiresConfirmation: true,
      allowedRoles: ["*"],
      fallbackCapabilityId: "open_my_work",
      explanationKey: "capability.createPersonalWorkspace",
      voiceExecutable: true,
      createsData: true,
      requiresAuthentication: false,
      requiresExternalConnector: false,
    },
    {
      id: "create_role_workspace",
      aliases: ["chemist workspace", "kimyogar ish maydoni", "role workspace", "men kimyogarman"],
      destinationRoute: "/my-work",
      readiness: "available",
      requiredInputs: ["role", "field", "objective"],
      requiresConfirmation: true,
      allowedRoles: ["*"],
      fallbackCapabilityId: "create_personal_workspace",
      explanationKey: "capability.createRoleWorkspace",
      voiceExecutable: true,
      createsData: true,
      requiresAuthentication: false,
      requiresExternalConnector: false,
    },
    {
      id: "create_research_project",
      aliases: ["create research project", "tadqiqot loyihasi yarat"],
      destinationRoute: "/my-work",
      readiness: "available",
      requiredInputs: ["title", "objective", "domain"],
      requiresConfirmation: true,
      allowedRoles: ["*"],
      fallbackCapabilityId: "open_research",
      explanationKey: "capability.createResearchProject",
      voiceExecutable: true,
      createsData: true,
      requiresAuthentication: false,
      requiresExternalConnector: false,
    },
    {
      id: "upload_research_document",
      aliases: [
        "upload phd",
        "upload thesis",
        "400 sahifalik phd",
        "phd ishimni yukla",
        "dissertatsiya yukla",
        "загрузить диссертацию",
        "doktora yükle",
      ],
      destinationRoute: "/scientific-documents",
      readiness: uploadReadiness,
      requiredInputs: ["file", "privacy", "workspace"],
      requiresConfirmation: true,
      allowedRoles: ["*"],
      fallbackCapabilityId: "create_research_project",
      explanationKey: "capability.uploadResearchDocument",
      voiceExecutable: true,
      createsData: true,
      requiresAuthentication: true,
      requiresExternalConnector: true,
    },
    {
      id: "attach_document_to_workspace",
      aliases: ["attach document", "hujjatni biriktir"],
      destinationRoute: "/scientific-documents",
      readiness: uploadReadiness,
      requiredInputs: ["documentId", "workspaceId"],
      requiresConfirmation: true,
      allowedRoles: ["*"],
      fallbackCapabilityId: "open_my_work",
      explanationKey: "capability.attachDocument",
      voiceExecutable: true,
      createsData: true,
      requiresAuthentication: true,
      requiresExternalConnector: true,
    },
    {
      id: "inspect_uploaded_document",
      aliases: ["open document", "hujjatni och", "inspect thesis"],
      destinationRoute: "/scientific-documents",
      readiness: "degraded",
      requiredInputs: ["documentId"],
      requiresConfirmation: false,
      allowedRoles: ["*"],
      fallbackCapabilityId: "open_my_work",
      explanationKey: "capability.inspectDocument",
      voiceExecutable: true,
      createsData: false,
      requiresAuthentication: false,
      requiresExternalConnector: false,
    },
    {
      id: "continue_active_work",
      aliases: ["continue work", "davom et", "resume work"],
      destinationRoute: "/my-work",
      readiness: "available",
      requiredInputs: [],
      requiresConfirmation: false,
      allowedRoles: ["*"],
      fallbackCapabilityId: "open_my_work",
      explanationKey: "capability.continueActiveWork",
      voiceExecutable: true,
      createsData: false,
      requiresAuthentication: false,
      requiresExternalConnector: false,
    },
  ];
}

export function getCapability(id: CapabilityId): PlatformCapability | null {
  return listPlatformCapabilities().find((item) => item.id === id) ?? null;
}

export function matchCapabilityFromText(text: string): PlatformCapability | null {
  const normalized = text.trim().toLowerCase().replace(/[''`ʻʼ]/g, "'");
  if (!normalized) return null;
  for (const capability of listPlatformCapabilities()) {
    for (const alias of capability.aliases) {
      const needle = alias.toLowerCase().replace(/[''`ʻʼ']/g, "'");
      if (normalized.includes(needle) || needle.includes(normalized)) {
        return capability;
      }
    }
  }
  return null;
}

export type VoiceActionOutcomeKind =
  | "understood_and_executed"
  | "understood_confirmation_required"
  | "understood_missing_information"
  | "understood_capability_degraded"
  | "understood_capability_unavailable"
  | "unsupported_command"
  | "navigation_failed"
  | "creation_failed"
  | "upload_failed";

export type VoiceActionOutcome = {
  readonly kind: VoiceActionOutcomeKind;
  readonly capabilityId: CapabilityId | null;
  readonly understood: string;
  readonly action: string;
  readonly resultKey: string;
  readonly currentLocation: string;
  readonly nextStepKey: string;
  readonly navigatedHref: string | null;
};
