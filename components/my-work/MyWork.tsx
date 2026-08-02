"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import { cbaiGlassCard, cbaiLoadingLine, cbaiMineralPanel, cbaiPageStack, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useAuth } from "@/components/platform/context/AuthProvider";
import RecentEntities from "@/components/platform/context/RecentEntities";
import PinnedEntities from "@/components/platform/context/PinnedEntities";
import SavedEvidence from "@/components/my-work/SavedEvidence";
import Avatar from "@/components/shared/Avatar";
import MissionHomeSummary from "@/components/my-work/MissionHomeSummary";
import MissionLinkedEntitiesPanel from "@/components/my-work/MissionLinkedEntitiesPanel";
import OperationalObjectIndex from "@/components/operational-objects/OperationalObjectIndex";
import EngineRouteEntryStrip from "@/components/forward-deployed/EngineRouteEntryStrip";
import CreateProjectForm from "@/components/project/CreateProjectForm";
import ProjectList from "@/components/project/ProjectList";
import ProjectHome from "@/components/project/ProjectHome";
import LocalWorkMigrationPrompt from "@/components/account/LocalWorkMigrationPrompt";
import CloudProfileImportPrompt from "@/components/account/CloudProfileImportPrompt";
import PendingSyncNotice from "@/components/shared/PendingSyncNotice";
import CapabilityPassportPanel from "@/components/capability/CapabilityPassportPanel";
import CapabilityGalaxy from "@/components/capability/CapabilityGalaxy";
import PersonalCabinetPanel from "@/components/genesis/PersonalCabinetPanel";
import GenesisWorkflowPanel from "@/components/genesis/GenesisWorkflowPanel";
import CapabilityPassportGenesisPanel from "@/components/genesis/CapabilityPassportGenesisPanel";
import GenesisReportsPanel from "@/components/genesis/GenesisReportsPanel";
import { loadProject } from "@/lib/project/project-store";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { useTranslation } from "@/lib/i18n/use-translation";
import { PROJECT_TYPES, type ProjectTypeId } from "@/lib/project/project-types";
import type { ContextEntityRef } from "@/lib/context/context-types";
import { ACTIVATED_RESEARCH_TOPIC_PATH } from "@/lib/intelligence-os/mission-operating-context";
import { useContextualHref } from "@/lib/context/use-contextual-href";
import {
  ASSISTANT_LANGUAGES,
  resolveOperatorName,
} from "@/lib/assistant/assistant-profile";
import AgentRunWorkspace from "@/components/my-work/AgentRunWorkspace";

function MyWorkContent() {
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();
  const { moduleHref } = useContextualHref();

  const continueLinks = useMemo(
    () =>
      [
        {
          label: t("myWorkExt.continueResearchWorkspace"),
          href: moduleHref(ACTIVATED_RESEARCH_TOPIC_PATH),
          detail: t("myWorkExt.continueResearchWorkspaceDetail"),
        },
        {
          label: t("myWorkExt.continueResearchCatalog"),
          href: moduleHref("/research"),
          detail: t("myWorkExt.continueResearchCatalogDetail"),
        },
        {
          label: t("myWorkExt.continueEvidence"),
          href: moduleHref("/knowledge"),
          detail: t("myWorkExt.continueEvidenceDetail"),
        },
      ] as const,
    [moduleHref, t],
  );

  const onboardingLinks = useMemo(
    () =>
      [
        { label: t("myWorkExt.onboardingExploreResearch"), href: moduleHref("/research") },
        { label: t("myWorkExt.onboardingExploreCountries"), href: moduleHref("/countries") },
        { label: t("myWorkExt.onboardingSearchEvidence"), href: moduleHref("/knowledge") },
        { label: t("myWorkExt.onboardingConfigureOperator"), href: moduleHref("/settings") },
        { label: t("myWorkExt.onboardingOpenTrust"), href: moduleHref("/trust") },
      ] as const,
    [moduleHref, t],
  );
  const projectId = searchParams.get("project");
  // Real hydration-mismatch fix (found via actual browser testing): loadProject() is honestly
  // empty on the server (no window/localStorage), so reading it directly during render produced a
  // different DOM structure server-side (no real project) than client-side (the real project),
  // logged as a genuine React hydration error every time a user reopened a project — the single
  // most core "return to your work" step this platform has. Gating on useHydrated() guarantees the
  // server and the client's first render match exactly; the real project appears in the very next
  // commit, automatically, once useSyncExternalStore detects the real client snapshot.
  const hydrated = useHydrated();
  const project = hydrated && projectId ? loadProject(projectId) : null;

  // Real "Create Project from this entity" pre-fill, arriving from a Country/Company/
  // University/Research profile or a Search result — never a fabricated default. Only a real,
  // recognized entity kind is accepted; anything else is honestly ignored.
  const entityKind = searchParams.get("entityKind");
  const entityId = searchParams.get("entityId");
  const entityName = searchParams.get("entityName");
  const validKinds: readonly string[] = ["country", "company", "university", "research_topic"];
  const initialPrimaryEntity: ContextEntityRef | undefined =
    entityKind && entityId && entityName && validKinds.includes(entityKind)
      ? { kind: entityKind as ContextEntityRef["kind"], id: entityId, name: entityName }
      : undefined;

  // Real "Start a [role] Project" pre-fill, arriving from a Government/Investor/Citizen entry
  // surface — only a real, recognized Project Type id is accepted; anything else is honestly
  // ignored, falling back to CreateProjectForm's own default.
  const projectTypeParam = searchParams.get("projectType");
  const initialType = PROJECT_TYPES.some((t) => t.id === projectTypeParam)
    ? (projectTypeParam as ProjectTypeId)
    : undefined;

  const evidence = buildEvidenceExplorerModel();
  const { profile, isActive } = useAssistantProfile();
  const { context } = usePlatformContext();
  const { user, isSignedIn, cloudUser, accountMode, cloudSessionRestoring } = useAuth();
  const preferredLanguage = ASSISTANT_LANGUAGES.find((l) => l.code === profile.preferredLanguage);
  const disclosure = useProgressiveDisclosure();

  // Real loading state — avoids a flash of "not signed in" while a real cloud session is still
  // being restored from storage (Phase 10). Never shown when cloud accounts aren't configured, so
  // Local Mode's first paint is unaffected.
  //
  // Hydration-safety (found via real browser testing on /my-work): `cloudSessionRestoring`
  // initializes from `isSupabaseConfigured()`. Gating on useHydrated() guarantees the server and
  // the client's first render match exactly; the real restoring state (when cloud is configured)
  // appears in the next commit, once the client is hydrated.
  if (hydrated && cloudSessionRestoring) {
    return <div className={`${cbaiGlassCard} p-5 text-sm text-zinc-500`}>{t("myWork.restoringSession")}</div>;
  }

  if (projectId && project) {
    return <ProjectHome project={project} />;
  }

  // Real "still hydrating" state — distinct from "genuinely not found" below. Without this,
  // reopening a real project would flash a misleading "This project isn't available" message for
  // the brief window before useHydrated() flips true, since `project` is honestly null in both
  // cases until then.
  if (projectId && !hydrated) {
    return <div className={`${cbaiMineralPanel} ${cbaiLoadingLine}`}>{t("common.loadingProjects")}</div>;
  }

  if (projectId && !project) {
    return (
      <div className={`${cbaiGlassCard} space-y-2 p-5`}>
        <p className="text-sm text-zinc-300">{t("myWork.projectUnavailable")}</p>
        <p className="text-xs text-zinc-500">{t("myWork.projectUnavailableBody")}</p>
        <Link href="/my-work" className="text-xs text-teal-400 hover:text-teal-300">
          {t("myWork.backToMyWork")}
        </Link>
      </div>
    );
  }

  const projectCreatePrefill = Boolean(initialPrimaryEntity || initialType);
  const showProjectCreateExpanded =
    projectCreatePrefill || disclosure.level === "expert" || disclosure.showMyWorkCapabilityPanels;

  return (
    <div className={cbaiPageStack}>
      <AgentRunWorkspace />
      <details className={`${cbaiGlassCard} group px-4 py-3`}>
        <summary className="cursor-pointer list-none text-xs text-zinc-500 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="text-teal-400/90">{t("myWorkExt.advancedEngineSummary")}</span>
          <span className="mt-0.5 block text-[11px] text-zinc-600">{t("myWorkExt.advancedEngineHint")}</span>
        </summary>
        <div className="mt-3 border-t border-zinc-800/80 pt-3">
          <EngineRouteEntryStrip />
        </div>
      </details>
      {isActive || isSignedIn ? (
        <div className={`${cbaiGlassCard} border-teal-500/15 px-6 py-5`}>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar name={user?.displayName || profile.name} avatar={profile.avatar} />
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                {t("myWork.yourWork", { name: user?.displayName || profile.name })}
              </h2>
              <p className="text-xs text-zinc-500">
                {isActive
                  ? `${resolveOperatorName(profile)} · ${t(`workspaceRoles.${profile.workspaceRole}`)} · ${preferredLanguage?.label ?? profile.preferredLanguage}`
                  : t("myWork.localProfileNotSetUp")}
              </p>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-xs text-zinc-500">
            {accountMode === "cloud"
              ? t("myWork.signedInCloud", { email: cloudUser!.email })
              : isSignedIn
                ? t("myWork.signedInLocal", { email: user!.email })
                : t("myWork.savedToBrowser")}
            {!isSignedIn && accountMode !== "cloud" ? (
              <>
                {" "}
                <Link href="/account" className="text-teal-400 hover:text-teal-300">
                  {t("myWork.signInPrompt")}
                </Link>{" "}
                {t("myWorkExt.signInBrowserHint")}
              </>
            ) : null}
          </p>
          {accountMode === "cloud" ? <PendingSyncNotice cloudUserId={cloudUser!.id} /> : null}
        </div>
      ) : (
        <div className={`${cbaiGlassCard} border-teal-500/15 px-6 py-5`}>
          <p className="max-w-2xl text-sm text-zinc-400">
            {t("myWork.savedToBrowser")}{" "}
            <Link href="/account" className="text-teal-400 hover:text-teal-300">
              {t("myWork.signInOrCreate")}
            </Link>{" "}
            {t("myWorkExt.signInAccountHint")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(disclosure.showGatewayGoalChips ? onboardingLinks : onboardingLinks.slice(0, 2)).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-teal-500/30 hover:text-teal-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {accountMode === "cloud" ? <CloudProfileImportPrompt /> : null}
      {accountMode === "cloud" ? <LocalWorkMigrationPrompt /> : null}

      <section className="space-y-3" aria-labelledby="my-work-now-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={cbaiSectionEyebrow}>
              {language === "uz" ? "HOZIR" : "NOW"}
            </p>
            <h2 id="my-work-now-heading" className="mt-1 text-lg font-semibold text-[var(--cbai-text-primary)]">
              {language === "uz" ? "E’tibor talab qiladigan ish" : "Work that needs attention"}
            </h2>
          </div>
          <p className="max-w-xl text-xs text-[var(--cbai-text-secondary)]">
            {language === "uz"
              ? "Avval inson tekshiruvi, keyin davom etayotgan ish va monitoring."
              : "Human reviews first, followed by active work and monitoring."}
          </p>
        </div>
        <OperationalObjectIndex />
      </section>

      <section className="space-y-3" aria-labelledby="my-work-context-heading">
        <div>
          <p className={cbaiSectionEyebrow}>
            {language === "uz" ? "ISH KONTEKSTI" : "WORK CONTEXT"}
          </p>
          <h2 id="my-work-context-heading" className="mt-1 text-lg font-semibold text-[var(--cbai-text-primary)]">
            {language === "uz" ? "Maqsad, kabinet va bog‘langan obyektlar" : "Mission, cabinet, and linked entities"}
          </h2>
        </div>
        <div className="grid items-start gap-4 xl:grid-cols-2">
          <MissionHomeSummary />
          <PersonalCabinetPanel />
        </div>
        <MissionLinkedEntitiesPanel />
      </section>

      {showProjectCreateExpanded ? (
        <CreateProjectForm initialPrimaryEntity={initialPrimaryEntity} initialType={initialType} />
      ) : (
        <details className={`${cbaiGlassCard} px-4 py-3`}>
          <summary className="cursor-pointer list-none text-sm text-teal-400 marker:content-none [&::-webkit-details-marker]:hidden">
            {t("myWorkExt.createProjectSummary")}
          </summary>
          <div className="mt-3 border-t border-zinc-800/80 pt-3">
            <CreateProjectForm initialPrimaryEntity={initialPrimaryEntity} initialType={initialType} />
          </div>
        </details>
      )}

      <section className="space-y-3" aria-labelledby="my-work-projects-heading">
        <div>
          <p className={cbaiSectionEyebrow}>
            {language === "uz" ? "FAOL JARAYON" : "ACTIVE WORK"}
          </p>
          <h2 id="my-work-projects-heading" className="mt-1 text-lg font-semibold text-[var(--cbai-text-primary)]">
            {language === "uz" ? "Davom ettiriladigan loyihalar" : "Projects to continue"}
          </h2>
        </div>
        <ProjectList />
      </section>

      {disclosure.showMyWorkCapabilityPanels ? (
        <>
          <CapabilityPassportPanel />
          <CapabilityPassportGenesisPanel />
          <CapabilityGalaxy />
          <GenesisWorkflowPanel />
          <GenesisReportsPanel />
        </>
      ) : null}

      <nav
        aria-labelledby="my-work-secondary-heading"
        className={`${cbaiGlassCard} flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3`}
      >
        <p className={`${cbaiSectionEyebrow} mr-1`} id="my-work-secondary-heading">
          {t("myWorkExt.secondaryExplore")}
        </p>
        {continueLinks.map((link, index) => (
          <span key={link.href} className="inline-flex items-baseline gap-3">
            {index > 0 ? <span className="text-zinc-700" aria-hidden="true">·</span> : null}
            <Link
              href={link.href}
              className="text-xs text-teal-400/90 hover:text-teal-300"
              title={link.detail}
            >
              {link.label}
            </Link>
          </span>
        ))}
        <span className="text-zinc-700" aria-hidden="true">
          ·
        </span>
        <Link href={moduleHref("/reports")} className="text-xs text-teal-400/90 hover:text-teal-300">
          {t("myWorkExt.reportsCenterLink")}
        </Link>
      </nav>

      <section className="space-y-3" aria-labelledby="my-work-reference-heading">
        <div>
          <p className={cbaiSectionEyebrow}>
            {language === "uz" ? "SAQLANGAN KONTEKST" : "SAVED CONTEXT"}
          </p>
          <h2 id="my-work-reference-heading" className="mt-1 text-lg font-semibold text-[var(--cbai-text-primary)]">
            {language === "uz" ? "Yaqinda ko‘rilgan va saqlangan materiallar" : "Recent and saved material"}
          </h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <section aria-labelledby="my-work-recent-heading" className={`${cbaiGlassCard} space-y-2 p-5`}>
            <p className={cbaiSectionEyebrow} id="my-work-recent-heading">
              {t("myWorkExt.recentlyViewed")}
            </p>
            <RecentEntities entities={context.recentEntities} />
          </section>
        <section
          aria-labelledby="my-work-evidence-reviews-heading"
          className={`${cbaiGlassCard} space-y-2 p-5`}
        >
          <p className={cbaiSectionEyebrow} id="my-work-evidence-reviews-heading">
            {t("myWorkExt.evidenceReviews")}
          </p>
          <p className="text-xs text-zinc-500">
            {t("myWorkExt.evidenceReviewsEmpty", {
              connected: String(evidence.summary.connectedSources),
              total: String(evidence.summary.totalSources),
            })}{" "}
            <Link href={moduleHref("/knowledge")} className="text-teal-400 hover:text-teal-300">
              {t("myWorkExt.evidenceLink")}
            </Link>{" "}
            {t("myWorkExt.evidenceReviewsSuffix")}
          </p>
        </section>

        <section aria-labelledby="my-work-saved-heading" className={`${cbaiGlassCard} space-y-2 p-5`}>
          <p className={cbaiSectionEyebrow} id="my-work-saved-heading">
            {t("myWorkExt.savedWork")}
          </p>
          <PinnedEntities entities={context.pinnedEntities.filter((entity) => entity.kind !== "evidence")} />
        </section>

        <SavedEvidence entities={context.pinnedEntities.filter((entity) => entity.kind === "evidence")} />
        </div>
      </section>
    </div>
  );
}

export default function MyWork() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">{t("myWorkExt.loading")}</div>}>
      <MyWorkContent />
    </Suspense>
  );
}
