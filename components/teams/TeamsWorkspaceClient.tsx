"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import { useAuth } from "@/components/platform/context/AuthProvider";
import { useTranslation } from "@/lib/i18n/use-translation";

type TeamRecord = {
  id: string;
  name: string;
  purpose: string;
  createdAt: string;
  createdLocale: string;
};

const KEY = "cbai-team-drafts";

function readTeams(): TeamRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TeamRecord[]) : [];
  } catch {
    return [];
  }
}

export default function TeamsWorkspaceClient() {
  const { t, language } = useTranslation();
  const { isSignedIn } = useAuth();
  const prepare = useSearchParams().get("prepare") === "1";
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [teams, setTeams] = useState<TeamRecord[]>(() => readTeams());
  const [status, setStatus] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <OperatingPageShell title={t("authCollab.teamsTitle")} description={t("authCollab.guestNeedsSignInTeam")}>
        <Link href="/account?resume=pending" className="inline-flex min-h-11 items-center rounded-lg bg-[var(--cbai-accent-primary)] px-4 text-sm text-[var(--cbai-on-accent)]">
          {t("authCollab.consentOpenAccount")}
        </Link>
      </OperatingPageShell>
    );
  }

  return (
    <OperatingPageShell title={t("authCollab.teamsTitle")} description={t("authCollab.teamsIntro")}>
      <p className="text-sm text-[var(--muted)]">{t("authCollab.teamRoles")}</p>
      <div aria-live="polite" className="sr-only">
        {status}
      </div>
      {(prepare || true) && (
        <form
          className="mt-4 grid max-w-lg gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const next: TeamRecord = {
              id: `team_${Date.now().toString(36)}`,
              name: name.trim(),
              purpose: purpose.trim(),
              createdAt: new Date().toISOString(),
              createdLocale: language,
            };
            const all = [next, ...readTeams()];
            window.localStorage.setItem(KEY, JSON.stringify(all));
            setTeams(all);
            setName("");
            setPurpose("");
            setStatus(t("authCollab.teamDraftConfirm"));
          }}
        >
          <label className="grid gap-1 text-sm">
            {t("authCollab.teamDraftName")}
            <input
              className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            {t("authCollab.teamDraftPurpose")}
            <input
              className="min-h-11 rounded-md border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-raised)] px-3"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </label>
          <button type="submit" className="min-h-11 rounded-lg bg-[var(--cbai-accent-primary)] px-4 text-sm text-[var(--cbai-on-accent)]">
            {t("authCollab.teamDraftConfirm")}
          </button>
        </form>
      )}
      <ul className="mt-6 space-y-2 text-sm">
        {teams.length === 0 ? (
          <li className="text-[var(--muted)]">{t("authCollab.emptyNoItems")}</li>
        ) : (
          teams.map((team) => (
            <li key={team.id} className="rounded-md border border-[var(--cbai-border-default)] px-3 py-2">
              {team.name}
              {team.purpose ? <span className="text-[var(--muted)]"> — {team.purpose}</span> : null}
            </li>
          ))
        )}
      </ul>
      <p className="mt-3 text-sm text-[var(--muted)]">{t("authCollab.emptyHonest")}</p>
    </OperatingPageShell>
  );
}
