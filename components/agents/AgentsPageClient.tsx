"use client";

import AgentStats from "@/components/agents/AgentStats";
import AgentCard from "@/components/agents/AgentCard";
import AgentActivity from "@/components/agents/AgentActivity";
import PreviewInDevelopmentPage from "@/components/preview/PreviewInDevelopmentPage";
import { useTranslation } from "@/lib/i18n/use-translation";
import { agents } from "@/lib/agents";

export default function AgentsPageClient() {
  const { t } = useTranslation();

  return (
    <PreviewInDevelopmentPage variant="agents">
      <AgentStats />

      <div>
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">{t("previewPages.agentsCapabilities")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      <AgentActivity />
    </PreviewInDevelopmentPage>
  );
}
