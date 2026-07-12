"use client";

import Link from "next/link";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import { ROLE_WORK_CONTEXTS, type RoleWorkContext } from "@/lib/assistant/role-work-contexts";
import { getProjectTypeLabel } from "@/lib/project/project-types";
import { cbaiGlassCard, cbaiSectionEyebrow, cbaiBtnSecondary } from "@/components/brand/brand-classes";

/**
 * Role / Work-Context entry cards (Phase 11). Selecting a role never creates a separate data
 * model — it only sets the existing `AssistantProfile.workspaceRole` field and links to the real
 * Project Engine or an existing workspace route (see lib/assistant/role-work-contexts.ts).
 */
export default function RoleWorkContextCards() {
  const { profile, updateProfile } = useAssistantProfile();
  const { t } = useTranslation();

  return (
    <section aria-labelledby="home-role-contexts-heading" className="space-y-3">
      <p className={cbaiSectionEyebrow} id="home-role-contexts-heading">
        {t("home.workContextsHeading")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROLE_WORK_CONTEXTS.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isSelected={profile.workspaceRole === role.workspaceRole}
            onSelect={() => updateProfile({ workspaceRole: role.workspaceRole })}
          />
        ))}
      </div>
      <Link href="/dashboard" className="inline-flex text-xs font-medium text-cyan-400 hover:text-cyan-300">
        {t("common.viewAllCapabilities")} →
      </Link>
    </section>
  );
}

function RoleCard({
  role,
  isSelected,
  onSelect,
}: {
  role: RoleWorkContext;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const namespaceKey = `roles.${role.id}`;

  return (
    <div className={`${cbaiGlassCard} flex flex-col gap-2.5 p-4 ${isSelected ? "border-cyan-500/40" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-100">{t(`${namespaceKey}.title`)}</h3>
        {isSelected ? (
          <span className="shrink-0 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
            {t("common.yes")}
          </span>
        ) : null}
      </div>
      <p className="text-xs leading-relaxed text-zinc-500">{t(`${namespaceKey}.description`)}</p>
      <p className="text-[11px] text-zinc-600">{getProjectTypeLabel(role.primaryProjectType)}</p>
      <div className="mt-auto flex items-center gap-2 pt-1">
        <Link
          href={role.firstActionHref}
          onClick={onSelect}
          className={`${cbaiBtnSecondary} min-h-8 px-3 py-1.5 text-xs`}
        >
          {t(`${namespaceKey}.firstAction`)}
        </Link>
      </div>
    </div>
  );
}
