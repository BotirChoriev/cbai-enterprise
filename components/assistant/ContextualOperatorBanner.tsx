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
import { useTranslation } from "@/lib/i18n/use-translation";

type ContextualAction = { labelKey: string; href: string; params?: Record<string, string> };

function projectGuideAction(context: AssistantContextEntity, t: ReturnType<typeof useTranslation>["t"]): ContextualAction | null {
  const id = new URLSearchParams(context.href.split("?")[1] ?? "").get("project");
  const project = id ? loadProject(id) : null;
  if (!project) return null;
  const step = resolveProjectGuideStep(project, t);
  return {
    labelKey: step.id === "ready" ? "assistant.readyWhenYouAre" : "assistant.openNextStep",
    href: step.href,
    params: step.id === "ready" ? undefined : { suggestion: step.suggestion },
  };
}

function resolveContextualActions(context: AssistantContextEntity, t: ReturnType<typeof useTranslation>["t"]): ContextualAction[] {
  switch (context.kind) {
    case "country":
      return [
        { labelKey: "assistant.openEvidence", href: profileSectionHref(context.href, "evidence") },
        { labelKey: "assistant.viewReports", href: profileSectionHref(context.href, "reports") },
        { labelKey: "assistant.exploreUniversities", href: "/universities" },
      ];
    case "company":
      return [
        { labelKey: "assistant.openEvidence", href: profileSectionHref(context.href, "evidence") },
        { labelKey: "assistant.viewReports", href: profileSectionHref(context.href, "reports") },
        { labelKey: "assistant.relatedUniversities", href: "/universities" },
      ];
    case "university":
      return [
        { labelKey: "assistant.openEvidence", href: profileSectionHref(context.href, "evidence") },
        { labelKey: "assistant.viewReports", href: profileSectionHref(context.href, "reports") },
        { labelKey: "assistant.relatedCompanies", href: "/companies" },
      ];
    case "research_topic":
      return [
        { labelKey: "assistant.continueWorkspace", href: "/research/microbiology" },
        { labelKey: "assistant.openEvidence", href: profileSectionHref(context.href, "evidence") },
        { labelKey: "assistant.reviewQuestions", href: profileSectionHref(context.href, "review") },
      ];
    case "project": {
      const guideAction = projectGuideAction(context, t);
      return [
        ...(guideAction ? [guideAction] : []),
        { labelKey: "assistant.openNotes", href: profileSectionHref(context.href, "project-notes") },
        { labelKey: "assistant.addEvidence", href: profileSectionHref(context.href, "project-evidence") },
        { labelKey: "assistant.generateReport", href: profileSectionHref(context.href, "project-report") },
      ];
    }
  }
}

export default function ContextualOperatorBanner({ projectId }: { projectId?: string } = {}) {
  const pathname = usePathname();
  const { isActive, profile } = useAssistantProfile();
  const { context } = usePlatformContext();
  const { t } = useTranslation();

  const assistantContext = resolveAssistantContext(pathname, getPrimaryEntity(context), projectId);

  if (!assistantContext) return null;

  const actions = resolveContextualActions(assistantContext, t);
  const leadText =
    assistantContext.kind === "project"
      ? t("assistant.contextualProjectActions")
      : t("assistant.contextualViewingEntity", { name: assistantContext.name });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-4 py-2.5 text-sm">
      {isActive ? <Avatar name={profile.name} avatar={profile.avatar} size="sm" /> : null}
      <p className="text-zinc-300">{leadText}</p>
      <div className="ml-auto flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
          >
            {action.params
              ? t(action.labelKey as "assistant.openNextStep", action.params)
              : t(action.labelKey as "assistant.openEvidence")}
          </Link>
        ))}
      </div>
    </div>
  );
}
