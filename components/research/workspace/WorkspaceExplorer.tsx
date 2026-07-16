"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  buildWorkspaceExplorerContext,
  filterWorkspaceTopics,
  getDefaultWorkspaceTopic,
} from "@/lib/research/workspace/workspace-explorer";
import {
  RESEARCH_WORKSPACE,
  WORKSPACE_AVAILABLE_TODAY,
  WORKSPACE_HUMAN_REVIEW_NOTICE,
  WORKSPACE_NOT_AVAILABLE_YET,
  WORKSPACE_SHELL_NOTICE,
  WORKSPACE_STATUS_LABELS,
} from "@/lib/research/workspace";
import WorkspaceSidebar from "@/components/research/workspace/WorkspaceSidebar";
import WorkspaceContent from "@/components/research/workspace/WorkspaceContent";
import EvidenceNavigationExplorer from "@/components/research/evidence-navigation/EvidenceNavigationExplorer";
import ResearchGapExplorer from "@/components/research/gaps/ResearchGapExplorer";
import ResearchLandscape from "@/components/research/landscape/ResearchLandscape";
import MethodComparisonPanel from "@/components/research/method-comparison/MethodComparisonPanel";
import { cbaiGlassCard, cbaiHeroGlow, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type WorkspaceExplorerProps = {
  initialTopicId?: string;
  showTopicNotFoundNotice?: boolean;
  deepLinkTopicId?: string;
};

export default function WorkspaceExplorer({
  initialTopicId,
  showTopicNotFoundNotice = false,
  deepLinkTopicId,
}: WorkspaceExplorerProps) {
  const defaultTopic = getDefaultWorkspaceTopic();
  const [selectedTopicId, setSelectedTopicId] = useState(
    initialTopicId ?? defaultTopic.topicId,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = useMemo(
    () => filterWorkspaceTopics(searchQuery),
    [searchQuery],
  );

  const context = useMemo(() => {
    const topic =
      filteredTopics.find((entry) => entry.topicId === selectedTopicId) ??
      filteredTopics[0] ??
      defaultTopic;
    return buildWorkspaceExplorerContext(topic);
  }, [filteredTopics, selectedTopicId, defaultTopic]);

  return (
    <div className={`mx-auto max-w-[1600px] px-3 py-6 sm:px-4 sm:py-8 ${cbaiHeroGlow}`}>
      <header className="mb-6 space-y-3">
        <Link
          href="/research"
          className="inline-flex text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
        >
          ← Back to Research Intelligence
        </Link>
        <div>
          <p className={cbaiSectionEyebrow}>Research Workspace</p>
          <h1 className="cbai-display text-2xl text-zinc-100">
            Research Workspace
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-500">{WORKSPACE_SHELL_NOTICE}</p>
          {showTopicNotFoundNotice ? (
            <p className="mt-2 rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-500">
              {`"${deepLinkTopicId}" is not a topic in the research catalog — check the link, or `}
              <Link href="/research" className="text-teal-400 hover:text-teal-300">
                browse all research topics
              </Link>
              .
            </p>
          ) : null}
          {deepLinkTopicId && !showTopicNotFoundNotice ? (
            <p className="mt-2 text-xs text-zinc-500">
              Selected research topic:{" "}
              <span className="text-zinc-300">{context.topic.topicName}</span> — continue research
              review.
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_240px] xl:grid-cols-[260px_minmax(0,1fr)_260px]">
        <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-6rem)]">
          <WorkspaceSidebar
            topics={filteredTopics}
            selectedTopicId={context.topic.topicId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectTopic={setSelectedTopicId}
          />
        </div>

        <main className="min-w-0 space-y-6">
          <EvidenceNavigationExplorer topic={context.topic} />
          <ResearchLandscape
            topic={context.topic}
            variant="workspace"
            onSelectTopic={setSelectedTopicId}
          />
          <WorkspaceContent context={context} onSelectTopic={setSelectedTopicId} />
        </main>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start" aria-label="Workspace status">
          <section className={`${cbaiGlassCard} space-y-3 p-4`}>
            <p className={cbaiSectionEyebrow}>Workspace status</p>
            <h2 className="text-sm font-semibold text-zinc-100">Research Workspace</h2>
            <p className="text-xs text-zinc-500">
              {WORKSPACE_STATUS_LABELS[RESEARCH_WORKSPACE.status]}
            </p>
            <dl className="space-y-2 text-[11px]">
              <div>
                <dt className="font-medium uppercase tracking-wider text-zinc-600">Version</dt>
                <dd className="mt-0.5 text-zinc-400">{RESEARCH_WORKSPACE.version}</dd>
              </div>
              <div>
                <dt className="font-medium uppercase tracking-wider text-zinc-600">
                  Research objects
                </dt>
                <dd className="mt-0.5 text-zinc-500">
                  {RESEARCH_WORKSPACE.supportedObjects.slice(0, 6).join(" · ")}
                </dd>
              </div>
            </dl>
          </section>

          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Human review
            </p>
            <p className="text-xs leading-relaxed text-zinc-500">{WORKSPACE_HUMAN_REVIEW_NOTICE}</p>
          </section>

          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/90">
              Available today
            </p>
            <ul className="space-y-1">
              {WORKSPACE_AVAILABLE_TODAY.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-zinc-400">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400/80" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <ResearchGapExplorer topic={context.topic} variant="workspace" />

          <MethodComparisonPanel topic={context.topic} variant="workspace" />

          <section className={`${cbaiGlassCard} space-y-2 p-4`}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-teal-400/90">
              Future workspace
            </p>
            <ul className="space-y-1">
              {WORKSPACE_NOT_AVAILABLE_YET.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-zinc-500">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="border-t border-zinc-800/80 pt-2 text-[10px] text-zinc-600">
              Future modules: {RESEARCH_WORKSPACE.futureModules.slice(0, 5).join(" · ")}…
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
