import Link from "next/link";
import type { ProjectTypeId } from "@/lib/project/project-types";
import { getProjectTypeLabel } from "@/lib/project/project-types";
import { cbaiBtnPrimary, cbaiGlassCard } from "@/components/brand/brand-classes";

type RoleProjectEntryProps = {
  projectType: ProjectTypeId;
  description: string;
};

/**
 * The real primary action for a role workspace (Government/Investor/Citizen) — reuses the
 * existing Project Engine directly (CreateProjectForm, pre-selecting a real Project Type) rather
 * than a second, role-specific architecture. The coverage grids above already show what data
 * exists and what is limited; this is where that turns into real, saved, continuable work.
 */
export default function RoleProjectEntry({ projectType, description }: RoleProjectEntryProps) {
  const label = getProjectTypeLabel(projectType);
  return (
    <div className={`${cbaiGlassCard} flex flex-wrap items-center justify-between gap-4 p-5`}>
      <div>
        <p className="text-sm font-semibold text-zinc-100">Start a {label}</p>
        <p className="mt-1 max-w-xl text-sm text-zinc-500">{description}</p>
      </div>
      <Link href={`/my-work?projectType=${projectType}`} className={cbaiBtnPrimary}>
        Start {label} →
      </Link>
    </div>
  );
}
