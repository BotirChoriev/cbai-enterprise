"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buildEvidenceExplorerModel } from "@/lib/evidence-explorer";
import { buildReportsCenterModel } from "@/lib/reports-center";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useAuth } from "@/components/platform/context/AuthProvider";
import RecentEntities from "@/components/platform/context/RecentEntities";
import PinnedEntities from "@/components/platform/context/PinnedEntities";
import SavedEvidence from "@/components/my-work/SavedEvidence";
import StatusBadge from "@/components/shared/StatusBadge";
import Avatar from "@/components/shared/Avatar";
import CreateProjectForm from "@/components/project/CreateProjectForm";
import ProjectList from "@/components/project/ProjectList";
import ProjectHome from "@/components/project/ProjectHome";
import LocalWorkMigrationPrompt from "@/components/account/LocalWorkMigrationPrompt";
import CloudProfileImportPrompt from "@/components/account/CloudProfileImportPrompt";
import PendingSyncNotice from "@/components/shared/PendingSyncNotice";
import { loadProject } from "@/lib/project/project-store";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { PROJECT_TYPES, type ProjectTypeId } from "@/lib/project/project-types";
import type { ContextEntityRef } from "@/lib/context/context-types";
import {
  ASSISTANT_LANGUAGES,
  WORKSPACE_ROLE_LABELS,
  resolveOperatorName,
} from "@/lib/assistant/assistant-profile";

const continueLinks = [
  {
    label: "Research Workspace",
    href: "/research/workspace",
    detail: "Open the structured workspace for evidence review and knowledge organization.",
  },
  {
    label: "Research Catalog",
    href: "/research",
    detail: "Browse research topics, missions, and evidence status.",
  },
  {
    label: "Evidence",
    href: "/knowledge",
    detail: "Review official source status across profiles.",
  },
] as const;

const ONBOARDING_LINKS = [
  { label: "Explore Research", href: "/research" },
  { label: "Explore Countries", href: "/countries" },
  { label: "Search Evidence", href: "/knowledge" },
  { label: "Configure Personal Operator", href: "/settings" },
  { label: "Open Trust Center", href: "/trust" },
] as const;

function MyWorkContent() {
  const searchParams = useSearchParams();
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
  const reports = buildReportsCenterModel();
  const { profile, isActive } = useAssistantProfile();
  const { context } = usePlatformContext();
  const { user, isSignedIn, cloudUser, accountMode, cloudSessionRestoring } = useAuth();
  const preferredLanguage = ASSISTANT_LANGUAGES.find((l) => l.code === profile.preferredLanguage);

  // Real loading state — avoids a flash of "not signed in" while a real cloud session is still
  // being restored from storage (Phase 10). Never shown when cloud accounts aren't configured, so
  // Local Mode's first paint is unaffected.
  if (cloudSessionRestoring) {
    return <div className={`${cbaiGlassCard} p-5 text-sm text-zinc-500`}>Restoring your session…</div>;
  }

  if (projectId && project) {
    return <ProjectHome project={project} />;
  }

  // Real "still hydrating" state — distinct from "genuinely not found" below. Without this,
  // reopening a real project would flash a misleading "This project isn't available" message for
  // the brief window before useHydrated() flips true, since `project` is honestly null in both
  // cases until then.
  if (projectId && !hydrated) {
    return null;
  }

  if (projectId && !project) {
    return (
      <div className={`${cbaiGlassCard} space-y-2 p-5`}>
        <p className="text-sm text-zinc-300">This project isn&apos;t available.</p>
        <p className="text-xs text-zinc-500">
          Projects are saved to this browser only, so this link may be from another device, or
          the project may have been removed here. Your real projects are listed below.
        </p>
        <Link href="/my-work" className="text-xs text-cyan-400 hover:text-cyan-300">
          ← Back to My Work
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isActive || isSignedIn ? (
        <div className={`${cbaiGlassCard} border-cyan-500/15 px-6 py-5`}>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar name={user?.displayName || profile.name} avatar={profile.avatar} />
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                {user?.displayName || profile.name}&apos;s Work
              </h2>
              <p className="text-xs text-zinc-500">
                {isActive
                  ? `${resolveOperatorName(profile)} · ${WORKSPACE_ROLE_LABELS[profile.workspaceRole]} workspace · ${preferredLanguage?.label ?? profile.preferredLanguage}`
                  : "Local Assistant profile not set up yet"}
              </p>
            </div>
            <StatusBadge status="live" className="ml-auto" />
          </div>
          <p className="mt-3 max-w-2xl text-xs text-zinc-500">
            {accountMode === "cloud"
              ? `Signed in with a cloud account as ${cloudUser!.email} — Projects and Bookmarks below sync across every device you sign into.`
              : isSignedIn
                ? `Signed in as ${user!.email} — Projects and Bookmarks below belong to your account, saved to this device only.`
                : "Saved to this browser — real projects, research, and evidence entry points below, never fabricated activity or recommendations."}
            {!isSignedIn && accountMode !== "cloud" ? (
              <>
                {" "}
                <Link href="/account" className="text-cyan-400 hover:text-cyan-300">
                  Sign in
                </Link>{" "}
                to keep your work separate from others using this browser.
              </>
            ) : null}
          </p>
          {accountMode === "cloud" ? <PendingSyncNotice cloudUserId={cloudUser!.id} /> : null}
        </div>
      ) : (
        <div className={`${cbaiGlassCard} border-cyan-500/15 px-6 py-5`}>
          <h2 className="text-lg font-semibold text-zinc-100">My Work</h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Nothing below is personalized to you yet. Projects, and the real, working entry points
            into research and evidence review across the platform, are saved to this browser only
            — never a fabricated history.{" "}
            <Link href="/account" className="text-cyan-400 hover:text-cyan-300">
              Sign in or create a local account
            </Link>{" "}
            to keep your own Projects and Bookmarks separate from anyone else using this browser.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ONBOARDING_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-cyan-500/30 hover:text-cyan-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {accountMode === "cloud" ? <CloudProfileImportPrompt /> : null}
      {accountMode === "cloud" ? <LocalWorkMigrationPrompt /> : null}

      <CreateProjectForm initialPrimaryEntity={initialPrimaryEntity} initialType={initialType} />

      <ProjectList />

      <section aria-labelledby="my-work-continue-heading" className="space-y-3">
        <p className={cbaiSectionEyebrow} id="my-work-continue-heading">
          Continue Working
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {continueLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${cbaiGlassCard} flex flex-col px-5 py-4 transition-colors hover:border-cyan-500/25`}
            >
              <span className="text-sm font-semibold text-cyan-400">{link.label}</span>
              <span className="mt-1 text-xs text-zinc-500">{link.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="my-work-recent-heading" className={`${cbaiGlassCard} space-y-2 p-5`}>
        <p className={cbaiSectionEyebrow} id="my-work-recent-heading">
          Recently Viewed
        </p>
        <RecentEntities entities={context.recentEntities} />
      </section>

      <section aria-labelledby="my-work-reports-heading" className="space-y-3">
        <p className={cbaiSectionEyebrow} id="my-work-reports-heading">
          Reports
        </p>
        <Link
          href="/analytics"
          className={`${cbaiGlassCard} flex flex-col px-5 py-4 transition-colors hover:border-cyan-500/25 sm:max-w-sm`}
        >
          <span className="text-sm font-semibold text-cyan-400">Reports Center</span>
          <span className="mt-1 text-xs text-zinc-500">
            {reports.summary.reportTypes} report types defined for profile and comparison review.
          </span>
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section
          aria-labelledby="my-work-evidence-reviews-heading"
          className={`${cbaiGlassCard} space-y-2 p-5`}
        >
          <p className={cbaiSectionEyebrow} id="my-work-evidence-reviews-heading">
            Evidence Reviews
          </p>
          <p className="text-xs text-zinc-500">
            No personal review history is connected yet. Platform-wide, {evidence.summary.connectedSources}{" "}
            of {evidence.summary.totalSources} evidence sources are connected — open{" "}
            <Link href="/knowledge" className="text-cyan-400 hover:text-cyan-300">
              Evidence
            </Link>{" "}
            to review current status.
          </p>
        </section>

        <section aria-labelledby="my-work-saved-heading" className={`${cbaiGlassCard} space-y-2 p-5`}>
          <p className={cbaiSectionEyebrow} id="my-work-saved-heading">
            Saved Work
          </p>
          <PinnedEntities entities={context.pinnedEntities.filter((entity) => entity.kind !== "evidence")} />
        </section>

        <SavedEvidence entities={context.pinnedEntities.filter((entity) => entity.kind === "evidence")} />
      </div>
    </div>
  );
}

export default function MyWork() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Loading…</div>}>
      <MyWorkContent />
    </Suspense>
  );
}
