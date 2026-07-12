"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { resolveAssistantContext, type AssistantContextEntity } from "@/lib/assistant/assistant-context";
import { getPrimaryEntity } from "@/lib/context";
import Avatar from "@/components/shared/Avatar";
import { profileSectionHref } from "@/components/shared/entity-profile-path";

type ContextualAction = { label: string; href: string };

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
    case "project":
      return [
        { label: "Open notes", href: profileSectionHref(context.href, "project-notes") },
        { label: "Add evidence", href: profileSectionHref(context.href, "project-evidence") },
        { label: "Generate report", href: profileSectionHref(context.href, "project-report") },
      ];
  }
}

/**
 * Contextual Operator (Release 5, Phase 10) — a visible "You are viewing X" statement with real,
 * page-relevant actions, reusing the same resolveAssistantContext derivation the Command Center
 * uses. Only rendered once a real context resolves; never guesses or asks the user where they are.
 */
export default function ContextualOperatorBanner() {
  const pathname = usePathname();
  const { isActive, profile } = useAssistantProfile();
  const { context } = usePlatformContext();

  const assistantContext = resolveAssistantContext(pathname, getPrimaryEntity(context));

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
