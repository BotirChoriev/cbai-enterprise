"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { resolveAssistantContext, type AssistantContextEntity } from "@/lib/assistant/assistant-context";
import { getPrimaryEntity } from "@/lib/context";
import { loadProject } from "@/lib/project/project-store";
import { resolveProjectGuideStep } from "@/lib/project/project-guide";
import Avatar from "@/components/shared/Avatar";
import { profileSectionHref } from "@/components/shared/entity-profile-path";

type ContextualAction = { label: string; href: string };

/** For a project context, appends a real, live "Open Next Step" chip from the Intelligence Guide — the same resolver the Command Center and Project Home use, never a second suggestion engine. */
function projectGuideAction(context: AssistantContextEntity): ContextualAction | null {
  const id = new URLSearchParams(context.href.split("?")[1] ?? "").get("project");
  const project = id ? loadProject(id) : null;
  if (!project) return null;
  const step = resolveProjectGuideStep(project);
  return { label: step.id === "ready" ? "Ready when you are" : `Open Next Step: ${step.suggestion}`, href: step.href };
}

function resolveContextualActions(context: AssistantContextEntity): ContextualAction[] {
  switch (context.kind) {
    case "country":
      return [
        { label: "Open evidence", href: profileSectionHref(context.href, "evidence") },
        { label: "View reports", href: profileSectionHref(context.href, "reports") },
        { label: "Explore universities", href: "/universities" },
      ];
    case "company":
      return [
        { label: "Open evidence", href: profileSectionHref(context.href, "evidence") },
        { label: "View reports", href: profileSectionHref(context.href, "reports") },
        { label: "Related universities", href: "/universities" },
      ];
    case "university":
      return [
        { label: "Open evidence", href: profileSectionHref(context.href, "evidence") },
        { label: "View reports", href: profileSectionHref(context.href, "reports") },
        { label: "Related companies", href: "/companies" },
      ];
    case "research_topic":
      return [
        { label: "Continue workspace", href: "/research/workspace" },
        { label: "Open evidence", href: profileSectionHref(context.href, "evidence") },
        { label: "Review questions", href: "/research/review" },
      ];
    case "project": {
      const guideAction = projectGuideAction(context);
      return [
        ...(guideAction ? [guideAction] : []),
        { label: "Open notes", href: profileSectionHref(context.href, "project-notes") },
        { label: "Add evidence", href: profileSectionHref(context.href, "project-evidence") },
        { label: "Generate report", href: profileSectionHref(context.href, "project-report") },
      ];
    }
  }
}

/**
 * Contextual Operator (Release 5, Phase 10) — a visible "You are viewing X" statement with real,
 * page-relevant actions, reusing the same resolveAssistantContext derivation the Command Center
 * uses. Only rendered once a real context resolves; never guesses or asks the user where they are.
 *
 * `projectId` is optional and only ever passed by ProjectHome (which already has it from its own
 * `useSearchParams()` read) — this component itself never reads search params directly, so
 * mounting it on Country/Company/University/Research pages (which never pass projectId) carries
 * no Suspense-boundary risk.
 */
export default function ContextualOperatorBanner({ projectId }: { projectId?: string } = {}) {
  const pathname = usePathname();
  const { isActive, profile } = useAssistantProfile();
  const { context } = usePlatformContext();

  const assistantContext = resolveAssistantContext(pathname, getPrimaryEntity(context), projectId);

  if (!assistantContext) return null;

  const actions = resolveContextualActions(assistantContext);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-4 py-2.5 text-sm">
      {isActive ? <Avatar name={profile.name} avatar={profile.avatar} size="sm" /> : null}
      <p className="text-zinc-300">
        You are viewing <span className="font-medium text-zinc-100">{assistantContext.name}</span>.
      </p>
      <div className="ml-auto flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
