"use client";

import Link from "next/link";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useTranslation } from "@/lib/i18n/use-translation";

const LINKS = [
  { href: "/account", key: "linkProfile" },
  { href: "/my-work", key: "linkMyWork" },
  { href: "/my-work", key: "linkProjects" },
  { href: "/scientific-documents", key: "linkScientific" },
  { href: "/files", key: "linkFiles" },
  { href: "/teams", key: "linkTeams" },
  { href: "/messages", key: "linkMessages" },
  { href: "/notifications", key: "linkNotifications" },
  { href: "/trust", key: "linkPrivacy" },
  { href: "/publications", key: "linkPublications" },
] as const;

export default function PersonalWorkspaceHome() {
  const { t } = useTranslation();
  return (
    <OperatingPageShell title={t("authCollab.workspaceTitle")} description={t("authCollab.workspaceIntro")}>
      <nav aria-label={t("authCollab.workspaceTitle")} className="grid gap-2 sm:grid-cols-2">
        {LINKS.map((link) => (
          <Link
            key={`${link.href}-${link.key}`}
            href={link.href}
            className="rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-4 py-3 text-sm text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--cbai-accent-primary)]"
          >
            {t(`authCollab.${link.key}`)}
          </Link>
        ))}
      </nav>
      <p className="mt-4 text-sm text-[var(--muted)]">{t("authCollab.emptyHonest")}</p>
    </OperatingPageShell>
  );
}
