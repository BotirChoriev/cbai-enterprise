"use client";

import Link from "next/link";
import ProjectList from "@/components/project/ProjectList";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiSectionEyebrow, cbaiBtnSecondary } from "@/components/brand/brand-classes";

/**
 * Current Projects and Tasks (Phase 16) — thin wrapper around the real, already-existing
 * `ProjectList` (real progress, last activity, suggested next step, continue action, honest
 * empty state) rather than a second project-summary implementation.
 */
export default function HomeProjectsSection() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="home-projects-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className={cbaiSectionEyebrow} id="home-projects-heading">
          {t("home.projectsHeading")}
        </p>
        <Link href="/my-work" className={`${cbaiBtnSecondary} min-h-8 px-3 py-1.5 text-xs`}>
          + {t("home.newProject")}
        </Link>
      </div>
      <ProjectList />
    </section>
  );
}
